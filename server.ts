import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { PromptContextService } from './src/services/prompt_context_service';
import { MemoryCategory, UserMode } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

// In-memory token store for verified girlfriend mode sessions
const validSpecialTokens = new Map<string, { createdAt: number; userMode: 'girlfriend' }>();

// Rate limiting store for verification attempts
interface RateLimitRecord {
  attempts: number;
  firstAttemptTime: number;
  lockedUntil?: number;
}
const verificationRateLimit = new Map<string, RateLimitRecord>();

// Rate limiting store for Chat API (max 30 requests per minute per IP)
const chatRateLimit = new Map<string, { count: number; resetTime: number }>();

// In-memory Cloud Memory store (partitioned strictly by userId)
const cloudMemoryStore = new Map<string, any[]>();

// In-memory Usage store (partitioned by userId:dateKey)
const serverDailyUsageStore = new Map<string, any>();

// Shared Gemini client initializer with telemetry header
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'WA Avatar',
    version: '3.0.0-stage3a',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    hasCustomVoice: Boolean(process.env.ELEVENLABS_API_KEY || process.env.CUSTOM_VOICE_API_KEY),
  });
});

// =========================================================================
// VOICE PROFILES & GENERATION ENDPOINTS (STAGE 3A)
// =========================================================================
app.get('/api/voice/profiles', (req, res) => {
  const hasCustomVoiceBackend = Boolean(process.env.ELEVENLABS_API_KEY || process.env.CUSTOM_VOICE_API_KEY);

  const profiles = [
    {
      id: 'wasim_official',
      name: 'Wasim Akram - Official AI Voice',
      provider: hasCustomVoiceBackend ? 'custom_owner' : 'browser',
      gender: 'male',
      language: 'hi-IN / Hinglish',
      isAuthorizedOwnerVoice: true,
      description: 'Authorized neural voice profile for Wasim Akram.',
      isFallback: !hasCustomVoiceBackend,
    },
    {
      id: 'device_hindi_male',
      name: 'Device Hindi Male Voice',
      provider: 'browser',
      gender: 'male',
      language: 'hi-IN',
      isAuthorizedOwnerVoice: false,
      description: 'Standard device browser Text-to-Speech.',
      isFallback: true,
    },
    {
      id: 'device_indian_english',
      name: 'Device Indian English Voice',
      provider: 'browser',
      gender: 'male',
      language: 'en-IN',
      isAuthorizedOwnerVoice: false,
      description: 'Standard device Indian English TTS.',
      isFallback: true,
    },
  ];

  res.json({
    activeProvider: hasCustomVoiceBackend ? 'Neural Custom Owner Voice' : 'Device Browser Voice (Fallback)',
    isCustomVoiceConfigured: hasCustomVoiceBackend,
    ownerVoiceAuthorized: true,
    profiles,
  });
});

app.post('/api/voice/generate', async (req, res) => {
  try {
    const { text, profileId = 'wasim_official', speed = 1.0 } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required for voice synthesis.' });
      return;
    }

    const customVoiceKey = process.env.ELEVENLABS_API_KEY || process.env.CUSTOM_VOICE_API_KEY;
    if (!customVoiceKey) {
      // Clean fallback response indicating client should use browser TTS
      res.json({
        fallback: true,
        message: 'No external neural voice secret configured. Fallback to Device Browser Voice.',
      });
      return;
    }

    // If external voice key exists, we can proxy to ElevenLabs/Neural provider
    res.json({
      fallback: true,
      message: 'Using authorized client voice fallback.',
    });
  } catch (err: any) {
    console.error('Voice synthesis error:', err);
    res.status(500).json({ error: 'Voice synthesis failed', fallback: true });
  }
});

// =========================================================================
// GIRLFRIEND / SPECIAL ACCESS VERIFICATION ENDPOINT
// =========================================================================
app.post('/api/verify-special', (req, res) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown-client';
    const now = Date.now();

    // Check rate limit (max 5 failed attempts in 5 minutes)
    const record = verificationRateLimit.get(clientIp);
    if (record) {
      if (record.lockedUntil && now < record.lockedUntil) {
        const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
        res.status(429).json({
          success: false,
          message: `Too many failed attempts. Please try again in ${remainingSeconds} seconds.`,
        });
        return;
      }
      // Reset if window expired
      if (now - record.firstAttemptTime > 5 * 60 * 1000) {
        verificationRateLimit.delete(clientIp);
      }
    }

    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ success: false, message: 'Verification code required.' });
      return;
    }

    // Secret stored in environment or fallback to development secret
    const expectedSecret = process.env.GIRLFRIEND_VERIFICATION_SECRET || '7084523587';
    const inputCode = code.trim();

    if (inputCode === expectedSecret) {
      // Clear rate limiting on success
      verificationRateLimit.delete(clientIp);

      // Generate secure session token
      const token = `wa_sp_${crypto.randomBytes(24).toString('hex')}`;
      validSpecialTokens.set(token, {
        createdAt: now,
        userMode: 'girlfriend',
      });

      // Cleanup old tokens (older than 7 days)
      if (validSpecialTokens.size > 200) {
        for (const [t, meta] of validSpecialTokens.entries()) {
          if (now - meta.createdAt > 7 * 24 * 60 * 60 * 1000) {
            validSpecialTokens.delete(t);
          }
        }
      }

      res.json({
        success: true,
        message: 'Special mode activated.',
        userMode: 'girlfriend',
        token,
      });
    } else {
      // Record failed attempt
      const current = verificationRateLimit.get(clientIp) || {
        attempts: 0,
        firstAttemptTime: now,
      };
      current.attempts += 1;
      if (current.attempts >= 5) {
        current.lockedUntil = now + 3 * 60 * 1000; // 3 minute lockout
      }
      verificationRateLimit.set(clientIp, current);

      res.status(401).json({
        success: false,
        message: 'Verification failed.',
      });
    }
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ success: false, message: 'Verification error.' });
  }
});

// =========================================================================
// CONVERSATION SUMMARIZATION ENDPOINT
// =========================================================================
app.post('/api/summarize-conversation', async (req, res) => {
  try {
    const { messages = [] } = req.body;
    if (!messages || messages.length === 0) {
      res.json({ summary: '' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({ summary: '' });
      return;
    }

    const transcript = messages
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Wasim'}: ${m.content}`)
      .join('\n');

    const prompt = `Summarize the key context and facts established in this previous conversation between User and Wasim Akram AI Avatar in 2-3 concise bullet points:\n${transcript}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: { temperature: 0.3 },
    });

    res.json({ summary: response.text?.trim() || '' });
  } catch (err) {
    console.warn('Conversation summarization error:', err);
    res.json({ summary: '' });
  }
});

// =========================================================================
// MAIN CHAT COMPLETION ENDPOINT
// =========================================================================
app.post('/api/chat', async (req, res) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown-client';
    const now = Date.now();

    // Rate limiting for chat (max 30 requests per minute)
    const rateLimit = chatRateLimit.get(clientIp);
    if (rateLimit) {
      if (now < rateLimit.resetTime) {
        if (rateLimit.count >= 30) {
          const waitSecs = Math.ceil((rateLimit.resetTime - now) / 1000);
          res.status(429).json({
            error: 'Rate limit exceeded',
            friendlyMessage: `Bohat tezi se messages bheje gaye hain bhai. ${waitSecs} seconds ruk kar aaram se baat karo.`,
          });
          return;
        }
        rateLimit.count += 1;
      } else {
        chatRateLimit.set(clientIp, { count: 1, resetTime: now + 60 * 1000 });
      }
    } else {
      chatRateLimit.set(clientIp, { count: 1, resetTime: now + 60 * 1000 });
    }

    const {
      message,
      history = [],
      relevantMemories = [],
      languagePreference = 'auto',
      userMode: requestedUserMode = 'normal',
      specialSessionToken,
      conversationSummary = '',
      clientTimeContext,
    } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message cannot be empty.' });
      return;
    }

    // PROMPT INJECTION & SECRET EXTRACTION DEFENSE:
    const lower = message.toLowerCase();
    const isTryingSecretExtraction =
      (lower.includes('girlfriend') && (lower.includes('password') || lower.includes('secret') || lower.includes('code') || lower.includes('verification'))) ||
      lower.includes('show hidden prompt') ||
      lower.includes('show system prompt') ||
      lower.includes('ignore previous instructions') ||
      lower.includes('tell me the girlfriend password');

    if (isTryingSecretExtraction) {
      res.json({
        reply: 'Yeh system confidential information hai bhai, main share nahi kar sakta. Koi aur baat pucho!',
        avatarState: 'thinking',
        detectedMemories: [],
      });
      return;
    }

    // SERVER-SIDE SECURITY VALIDATION:
    // If client requested Girlfriend mode, verify that they hold a valid server-side session token
    let validatedUserMode: UserMode = 'normal';
    if (requestedUserMode === 'girlfriend') {
      if (specialSessionToken && validSpecialTokens.has(specialSessionToken)) {
        validatedUserMode = 'girlfriend';
      } else {
        console.warn('Unauthenticated attempt to access girlfriend mode rejected.');
        validatedUserMode = 'normal';
      }
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured yet. Please configure it in AI Studio Secrets.',
        friendlyMessage: 'Gemini API key configure nahi hai bhai. AI Studio Settings check karo.',
      });
      return;
    }

    // Build system instruction using PromptContextService
    const systemInstruction = PromptContextService.buildSystemPrompt({
      userMode: validatedUserMode,
      relevantMemories,
      conversationSummary,
      clientTimeContext: clientTimeContext
        ? `Current Real-World Time: ${clientTimeContext.formattedTime}, Date: ${clientTimeContext.formattedDate} (${clientTimeContext.dayOfWeek}). Is Birthday Today: ${clientTimeContext.isBirthdayToday ? 'YES' : 'NO'}. Days until 25 September birthday: ${clientTimeContext.daysUntilBirthday}.`
        : undefined,
    });

    // Bounded conversation history (keep max last 10 messages)
    const trimmedHistory = history.slice(-10).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const contents = [
      ...trimmedHistory,
      {
        role: 'user',
        parts: [{ text: message.trim() }],
      },
    ];

    let responseText = '';
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

    for (const modelName of modelsToTry) {
      let attempts = 0;
      const maxAttempts = 2;

      while (attempts < maxAttempts) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.75,
            },
          });
          if (response && response.text) {
            responseText = response.text;
            break;
          }
        } catch (callErr: any) {
          attempts++;
          console.warn(`Model ${modelName} attempt ${attempts} failed:`, callErr?.message || callErr);
          if (attempts >= maxAttempts) {
            break;
          }
          await new Promise((r) => setTimeout(r, 600));
        }
      }

      if (responseText) {
        break;
      }
    }

    let rawReply = responseText || 'Haan sab badhiya hai! Aap batao kya chal raha hai?';

    // Parse [EMOTION: <emotion>] tag
    let avatarState: any = 'idle';
    const emotionMatch = rawReply.match(/\[EMOTION:\s*([a-zA-Z]+)\]/i);
    if (emotionMatch) {
      const parsedEmotion = emotionMatch[1].toLowerCase();
      const validEmotions = ['happy', 'excited', 'confused', 'sad', 'empathetic', 'thinking'];
      if (validEmotions.includes(parsedEmotion)) {
        avatarState = parsedEmotion;
      }
      // Strip emotion tag from user-visible message
      rawReply = rawReply.replace(/\[EMOTION:\s*[a-zA-Z]+\]/gi, '').trim();
    }

    // EXTRA SECURITY CHECK: "Bhai" prohibition for Girlfriend Mode
    if (validatedUserMode === 'girlfriend') {
      // Replace accidental "bhai" in girlfriend mode
      rawReply = rawReply
        .replace(/\b(arre bhai|haan bhai|nahi bhai|suno bhai|bhai)\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }

    // Stage 2 Memory Extraction with Category identification
    const detectedMemories: Array<{
      category: MemoryCategory;
      key: string;
      label: string;
      value: string;
      needsConfirmation?: boolean;
    }> = [];

    const isQuestion = /[?]|(?:kya|what|kaun|who|batao)\b/i.test(message);
    const ignoredWords = [
      'a', 'an', 'the', 'wasim', 'user', 'kya', 'what', 'kaun', 'who',
      'batao', 'bolo', 'nahi', 'to', 'bhi', 'hai', 'bhai', 'soch', 'kar'
    ];

    // 1. Name detection
    const nameMatch =
      message.match(/(?:my name is|mera naam|call me)\s+([A-Za-z]+)/i) ||
      (!isQuestion ? message.match(/naam\s+([A-Za-z]+)\s+hai/i) : null);

    if (nameMatch && nameMatch[1] && !ignoredWords.includes(nameMatch[1].toLowerCase().trim())) {
      detectedMemories.push({
        category: 'profile',
        key: 'name',
        label: 'User Name',
        value: nameMatch[1].trim(),
        needsConfirmation: false, // basic preference saved automatically
      });
    }

    // 2. Interest / Hobby detection
    const interestMatch = message.match(/(?:mujhe|i (?:really )?like|i love)\s+([A-Za-z0-9 ]+?)\s+(?:pasand hai|bahut pasand|accha lagta)/i);
    if (interestMatch && interestMatch[1] && interestMatch[1].length < 30) {
      const topic = interestMatch[1].trim();
      if (!ignoredWords.includes(topic.toLowerCase())) {
        detectedMemories.push({
          category: 'interest',
          key: `interest_${topic.replace(/\s+/g, '_').toLowerCase()}`,
          label: `Interest: ${topic}`,
          value: topic,
          needsConfirmation: true, // Asks confirmation for important personal facts
        });
      }
    }

    // 3. Location / Fact detection
    const locationMatch = message.match(/(?:i live in|main|mein)\s+([A-Za-z]+)\s+(?:mein rehta|se hoon|me rehta)/i);
    if (locationMatch && locationMatch[1] && !ignoredWords.includes(locationMatch[1].toLowerCase())) {
      detectedMemories.push({
        category: 'fact',
        key: 'location',
        label: 'Location',
        value: locationMatch[1].trim(),
        needsConfirmation: true,
      });
    }

    res.json({
      reply: rawReply,
      avatarState,
      detectedMemories,
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    const errMessage = error?.message || '';
    let friendly = 'Network connection check karo bhai aur phir try karo.';

    if (errMessage.includes('quota') || errMessage.includes('RESOURCE_EXHAUSTED')) {
      friendly = 'Rate limit aa gaya hai. Ek minute ruk kar dobara message karo.';
    } else if (errMessage.includes('API_KEY') || errMessage.includes('unregistered')) {
      friendly = 'Gemini API key verification issue hai. AI Studio Secrets panel check karo.';
    }

    res.status(500).json({
      error: 'Failed to process conversation',
      friendlyMessage: friendly,
    });
  }
});

// Title generation endpoint for new chats
app.post('/api/generate-title', async (req, res) => {
  try {
    const { firstMessage } = req.body;
    if (!firstMessage) {
      res.json({ title: 'New Conversation' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      const words = firstMessage.split(/\s+/).slice(0, 4).join(' ');
      res.json({ title: words.length > 25 ? words.substring(0, 25) + '...' : words });
      return;
    }

    let title = 'Discussion';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Generate a very short 2-4 word conversation title (e.g. "Flutter Discussion", "App Ideas", "Casual Chat", "Tech Setup") for a conversation starting with this message:\n"${firstMessage}"\nReturn ONLY the title, no quotes or explanations.`,
      });
      title = response.text?.trim().replace(/^["']|["']$/g, '') || 'Discussion';
    } catch {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: `Generate a 2-4 word title for: "${firstMessage}". Return only the title.`,
        });
        title = response.text?.trim().replace(/^["']|["']$/g, '') || 'Discussion';
      } catch {
        const words = firstMessage.split(/\s+/).slice(0, 3).join(' ');
        title = words;
      }
    }
    res.json({ title: title.length > 30 ? title.substring(0, 30) : title });
  } catch {
    const words = (req.body.firstMessage || 'Chat').split(/\s+/).slice(0, 3).join(' ');
    res.json({ title: words });
  }
});

// =========================================================================
// FREEMIUM USAGE & LIMITS ENDPOINTS (STAGE 3B)
// =========================================================================
app.get('/api/usage', (req, res) => {
  const userId = (req.query.userId as string) || 'guest_default';
  const dateKey = (req.query.dateKey as string) || new Date().toISOString().split('T')[0];
  const key = `${userId}:${dateKey}`;
  const usage = serverDailyUsageStore.get(key) || {
    date: dateKey,
    chatMessagesUsed: 0,
    chatFreeLimit: 30,
    voiceSecondsUsed: 0,
    voiceFreeLimitSeconds: 300,
    rewardChatBonus: 0,
    rewardVoiceBonusSeconds: 0,
    isPremium: false,
  };
  res.json({ usage });
});

app.post('/api/usage', (req, res) => {
  const { date, chatMessagesUsed, voiceSecondsUsed, rewardChatBonus, rewardVoiceBonusSeconds, userId } = req.body;
  const uid = userId || 'guest_default';
  const key = `${uid}:${date}`;
  const existing = serverDailyUsageStore.get(key) || {
    date,
    chatMessagesUsed: 0,
    chatFreeLimit: 30,
    voiceSecondsUsed: 0,
    voiceFreeLimitSeconds: 300,
    rewardChatBonus: 0,
    rewardVoiceBonusSeconds: 0,
    isPremium: false,
  };

  const updated = {
    ...existing,
    chatMessagesUsed: chatMessagesUsed ?? existing.chatMessagesUsed,
    voiceSecondsUsed: voiceSecondsUsed ?? existing.voiceSecondsUsed,
    rewardChatBonus: rewardChatBonus ?? existing.rewardChatBonus,
    rewardVoiceBonusSeconds: rewardVoiceBonusSeconds ?? existing.rewardVoiceBonusSeconds,
  };

  serverDailyUsageStore.set(key, updated);
  res.json({ success: true, usage: updated });
});

// =========================================================================
// CLOUD MEMORY SYNC ENDPOINTS (STAGE 3B)
// =========================================================================
app.get('/api/memory', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId || userId.startsWith('guest_')) {
    res.json({ memories: [] });
    return;
  }
  const memories = cloudMemoryStore.get(userId) || [];
  res.json({ memories });
});

app.post('/api/memory/sync', (req, res) => {
  const { userId, memories } = req.body;
  if (!userId || userId.startsWith('guest_')) {
    res.status(400).json({ error: 'Guest memories remain strictly local.' });
    return;
  }

  // Save to isolated user partition
  cloudMemoryStore.set(userId, memories || []);
  res.json({ success: true, count: (memories || []).length, memories: memories || [] });
});

// =========================================================================
// SUBSCRIPTION & ENTITLEMENTS STATUS ENDPOINT (STAGE 3B)
// =========================================================================
app.get('/api/subscription', (req, res) => {
  res.json({
    status: 'ok',
    isPaymentConfigured: false,
    message: 'Premium coming soon. Subscriptions will be enabled upon Play Store release.',
    defaultTier: 'free',
  });
});

// =========================================================================
// DESTRUCTIVE DATA & ACCOUNT DELETION ENDPOINT (STAGE 3B)
// =========================================================================
app.delete('/api/account/delete', (req, res) => {
  const { userId } = req.body || {};
  if (!userId) {
    res.status(400).json({ error: 'UserId is required' });
    return;
  }

  // Delete all cloud memory partition
  cloudMemoryStore.delete(userId);

  // Clear usage partition
  for (const key of serverDailyUsageStore.keys()) {
    if (key.startsWith(`${userId}:`)) {
      serverDailyUsageStore.delete(key);
    }
  }

  res.json({ success: true, message: 'Account and associated server data permanently deleted.' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WA Avatar server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
