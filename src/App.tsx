/**
 * WA Avatar - Main Application Component (Stage 3B)
 * Coordinates Home, Chat, History, Settings, Special Access (Girlfriend Mode),
 * Memory Confirmation, Voice/TTS, 3D Avatar, AdMob, Freemium Limits, and Cloud Sync.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChatMessage,
  ChatSession,
  MemoryItem,
  UserSettings,
  AvatarState,
  UserMode,
  MemoryConfirmationPrompt,
  UserProfile,
  DailyUsageState,
  RewardedAdReward,
} from './types';
import { StorageService } from './services/storage_service';
import { MemoryService } from './services/memory_service';
import { GeminiService } from './services/gemini_service';
import { VoiceService } from './services/voice_service';
import { TimeService } from './services/time_service';
import { BirthdayService } from './services/birthday_service';
import { AuthService } from './services/auth_service';
import { UsageService } from './services/usage_service';
import { SubscriptionService } from './services/subscription_service';
import { CloudMemoryRepository } from './services/memory/cloud_memory_repository';
import { AnalyticsService } from './services/analytics_service';
import { CrashReportingService } from './services/crash_reporting_service';
import { HomeScreen } from './components/home/HomeScreen';
import { ChatScreen } from './components/chat/ChatScreen';
import { HistoryDrawer } from './components/history/HistoryDrawer';
import { SettingsModal } from './components/settings/SettingsModal';
import { SpecialAccessModal } from './components/modals/SpecialAccessModal';
import { AuthModal } from './components/auth/AuthModal';
import { VoiceChatModal } from './components/voice/VoiceChatModal';
import { AvatarImmersiveModal } from './components/avatar/AvatarImmersiveModal';
import { RewardedAdModal } from './components/ads/RewardedAdModal';
import { PremiumModal } from './components/premium/PremiumModal';
import { PrivacyModal } from './components/privacy/PrivacyModal';
import { DiagnosticsModal } from './components/developer/DiagnosticsModal';

export default function App() {
  // Navigation View: 'home' | 'chat'
  const [currentView, setCurrentView] = useState<'home' | 'chat'>('home');

  // User Mode: 'normal' | 'girlfriend'
  const [userMode, setUserMode] = useState<UserMode>('normal');
  const [specialToken, setSpecialToken] = useState<string | null>(null);

  // User Authentication & Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(AuthService.getCurrentUser());

  // Daily Usage & Freemium Limits
  const [dailyUsage, setDailyUsage] = useState<DailyUsageState>(UsageService.getUsage());

  // Sessions & Messages State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');

  // Settings & Memories State
  const [settings, setSettings] = useState<UserSettings>(StorageService.getSettings());
  const [memories, setMemories] = useState<MemoryItem[]>([]);

  // Modals / Drawers State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSpecialAccessOpen, setIsSpecialAccessOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);
  const [isImmersiveAvatarOpen, setIsImmersiveAvatarOpen] = useState(false);
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState(false);
  const [rewardType, setRewardType] = useState<'chat_messages' | 'voice_seconds'>('chat_messages');
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  // Derive current isolated User ID
  const currentUserId =
    userMode === 'girlfriend' ? 'girlfriend_ashiya' : userProfile.id;

  // Initialize data on mount
  useEffect(() => {
    // Initialize crash reporting and analytics
    CrashReportingService.initialize();
    AnalyticsService.logEvent('app_open', { userMode });

    const savedSessions = StorageService.getSessions();
    const activeId = StorageService.getActiveSessionId();
    const savedSettings = StorageService.getSettings();
    const savedToken = StorageService.getSpecialSessionToken();

    // Determine initial userMode
    const initialMode =
      savedSettings.userMode === 'girlfriend' && savedToken ? 'girlfriend' : 'normal';
    setUserMode(initialMode);
    setSpecialToken(savedToken);
    setSettings(savedSettings);

    const initialUser = AuthService.getCurrentUser();
    setUserProfile(initialUser);
    setDailyUsage(UsageService.getUsage());

    const initialUserId =
      initialMode === 'girlfriend' ? 'girlfriend_ashiya' : initialUser.id;
    const userMems = MemoryService.getMemoriesForUser(initialUserId);
    setMemories(userMems);

    // Sync cloud memories if logged in
    if (!initialUser.isGuest) {
      CloudMemoryRepository.fetchMemories(initialUser.id).then((cloudMems: MemoryItem[]) => {
        if (cloudMems && cloudMems.length > 0) {
          setMemories(cloudMems);
        }
      }).catch((err: unknown) => {
        console.warn('Cloud memory sync notice:', err);
      });
    }

    setSessions(savedSessions);

    if (activeId) {
      const active = savedSessions.find((s) => s.id === activeId);
      if (active) {
        setActiveSessionId(active.id);
        setMessages(active.messages);
      }
    }

    // Register VoiceService callback to update avatar visual state
    VoiceService.registerStateCallback((newState) => {
      setAvatarState(newState);
    });

    // Check birthday trigger for Girlfriend mode
    if (BirthdayService.shouldTriggerGreeting(initialMode)) {
      const greeting = BirthdayService.generateBirthdayGreeting();
      BirthdayService.markGreetingDelivered(TimeService.getIndiaTime().year);
      console.log('Birthday greeting triggered for Ashiya:', greeting);
    }
  }, []);

  // Sync theme changes to <html> class
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Active session helper
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Create a new session
  const createNewSession = useCallback(
    (initialTitle: string = 'New Conversation'): ChatSession => {
      const newSession: ChatSession = {
        id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: initialTitle,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userMode,
        messages: [],
      };
      const updated = [newSession, ...sessions];
      setSessions(updated);
      StorageService.saveSessions(updated);
      setActiveSessionId(newSession.id);
      StorageService.setActiveSessionId(newSession.id);
      setMessages([]);
      return newSession;
    },
    [sessions, userMode]
  );

  // Start chat handler (from Home screen)
  const handleStartChat = (initialPrompt?: string) => {
    let targetSessionId = activeSessionId;
    if (!targetSessionId || !sessions.find((s) => s.id === targetSessionId)) {
      const newSession = createNewSession();
      targetSessionId = newSession.id;
    }
    setCurrentView('chat');

    if (initialPrompt) {
      setTimeout(() => {
        handleSendMessage(initialPrompt, targetSessionId);
      }, 100);
    }
  };

  // Switch chat session
  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setActiveSessionId(session.id);
      StorageService.setActiveSessionId(session.id);
      setMessages(session.messages);
      setCurrentView('chat');
    }
  };

  // Send message
  const handleSendMessage = async (text: string, overrideSessionId?: string) => {
    // Check Freemium Chat Quota (Strictly excluded in Girlfriend Mode or for Premium users)
    if (userMode !== 'girlfriend' && !SubscriptionService.isPremium()) {
      if (!UsageService.canSendChatMessage()) {
        setRewardType('chat_messages');
        setIsRewardedAdOpen(true);
        return;
      }
    }

    const targetSessionId = overrideSessionId || activeSessionId;
    let currentSess = sessions.find((s) => s.id === targetSessionId);

    if (!currentSess) {
      currentSess = createNewSession();
    }

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      status: 'sent',
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsThinking(true);
    setAvatarState('thinking');

    // Retrieve relevant memories for the isolated current user
    const relevantMemories = MemoryService.getRelevantMemoriesForPrompt(
      currentUserId,
      text,
      userMode
    );

    const clientTimeContext = TimeService.getPromptTimeContext();

    try {
      const response = await GeminiService.sendMessage({
        message: text,
        history: newMessages,
        relevantMemories,
        languagePreference: settings.language,
        userMode,
        specialSessionToken: specialToken || undefined,
        conversationSummary: currentSess.conversationSummary,
        clientTimeContext: {
          formattedTime: clientTimeContext,
          formattedDate: TimeService.getIndiaTime().formattedDate,
          dayOfWeek: TimeService.getIndiaTime().dayOfWeek,
          isBirthdayToday: BirthdayService.getBirthdayStatus().isToday,
          daysUntilBirthday: BirthdayService.getBirthdayStatus().daysUntil,
        },
      });

      // Record chat message usage
      if (userMode !== 'girlfriend' && !SubscriptionService.isPremium()) {
        const updatedUsage = UsageService.incrementChatUsage();
        setDailyUsage(updatedUsage);
      }

      // Check if any detected memory needs user confirmation
      let pendingConfirmation: MemoryConfirmationPrompt | undefined = undefined;
      if (settings.memoryEnabled && response.detectedMemories?.length) {
        for (const item of response.detectedMemories) {
          if (item.needsConfirmation) {
            pendingConfirmation = {
              key: item.key,
              label: item.label,
              value: item.value,
              category: item.category,
              question: 'Is information ko yaad rakhu?',
            };
          } else {
            // Auto-save basic non-sensitive preferences (e.g. name)
            const updatedMems = MemoryService.addOrUpdateMemory(
              currentUserId,
              item.category,
              item.key,
              item.value,
              item.label
            );
            setMemories(updatedMems);
          }
        }
      }

      const aiMessage: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
        avatarState: response.avatarState || 'idle',
        memoryConfirmation: pendingConfirmation,
        status: 'sent',
      };

      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);

      // Audio TTS Auto-Speak if enabled
      if (settings.voice?.autoSpeak && settings.voice?.voiceResponseEnabled) {
        VoiceService.speak(response.reply, settings.voice);
      }

      // If this was the first message in the session, generate a title
      let newTitle = currentSess.title;
      if (
        currentSess.messages.length === 0 ||
        currentSess.title === 'New Conversation'
      ) {
        newTitle = await GeminiService.generateTitle(text);
      }

      // Check if conversation summary should be computed (if > 8 messages)
      let updatedSummary = currentSess.conversationSummary;
      if (finalMessages.length > 8 && !updatedSummary) {
        GeminiService.summarizeConversation(finalMessages).then((summary) => {
          if (summary) {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === currentSess!.id ? { ...s, conversationSummary: summary } : s
              )
            );
          }
        });
      }

      // Update session in storage
      const updatedSessions = sessions.map((s) => {
        if (s.id === currentSess!.id) {
          return {
            ...s,
            title: newTitle,
            updatedAt: Date.now(),
            messages: finalMessages,
            conversationSummary: updatedSummary,
          };
        }
        return s;
      });

      setSessions(updatedSessions);
      StorageService.saveSessions(updatedSessions);
      return response.reply;
    } catch (err: any) {
      console.error('Send message error:', err);
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content:
          err?.message || 'Network connection check karo bhai aur phir try karo.',
        timestamp: Date.now(),
        avatarState: 'error',
        status: 'error',
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);

      const updatedSessions = sessions.map((s) => {
        if (s.id === currentSess!.id) {
          return {
            ...s,
            updatedAt: Date.now(),
            messages: finalMessages,
          };
        }
        return s;
      });
      setSessions(updatedSessions);
      StorageService.saveSessions(updatedSessions);
    } finally {
      setIsThinking(false);
      setAvatarState('idle');
    }
  };

  // Memory Confirmation: User clicked "Yes"
  const handleConfirmMemory = (prompt: MemoryConfirmationPrompt) => {
    const updated = MemoryService.addOrUpdateMemory(
      currentUserId,
      prompt.category,
      prompt.key,
      prompt.value,
      prompt.label
    );
    setMemories(updated);

    // Remove memoryConfirmation card from messages
    const updatedMessages = messages.map((m) => {
      if (m.memoryConfirmation?.key === prompt.key) {
        const { memoryConfirmation, ...rest } = m;
        return rest;
      }
      return m;
    });
    setMessages(updatedMessages);

    if (activeSessionId) {
      const updatedSessions = sessions.map((s) =>
        s.id === activeSessionId ? { ...s, messages: updatedMessages } : s
      );
      setSessions(updatedSessions);
      StorageService.saveSessions(updatedSessions);
    }
  };

  // Memory Confirmation: User clicked "No"
  const handleDismissMemory = (messageId: string) => {
    const updatedMessages = messages.map((m) => {
      if (m.id === messageId) {
        const { memoryConfirmation, ...rest } = m;
        return rest;
      }
      return m;
    });
    setMessages(updatedMessages);

    if (activeSessionId) {
      const updatedSessions = sessions.map((s) =>
        s.id === activeSessionId ? { ...s, messages: updatedMessages } : s
      );
      setSessions(updatedSessions);
      StorageService.saveSessions(updatedSessions);
    }
  };

  // Regenerate response
  const handleRegenerate = async (messageId: string) => {
    if (isThinking) return;

    const msgIndex = messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    const precedingUserMessage = messages
      .slice(0, msgIndex)
      .reverse()
      .find((m) => m.role === 'user');

    if (!precedingUserMessage) return;

    setIsThinking(true);
    setAvatarState('thinking');

    const historyUpToUser = messages.slice(0, msgIndex);
    const relevantMemories = MemoryService.getRelevantMemoriesForPrompt(
      currentUserId,
      precedingUserMessage.content,
      userMode
    );

    try {
      const response = await GeminiService.sendMessage({
        message: precedingUserMessage.content,
        history: historyUpToUser.slice(0, -1),
        relevantMemories,
        languagePreference: settings.language,
        userMode,
        specialSessionToken: specialToken || undefined,
      });

      const updatedMessages = [...messages];
      updatedMessages[msgIndex] = {
        ...updatedMessages[msgIndex],
        content: response.reply,
        timestamp: Date.now(),
        avatarState: response.avatarState || 'idle',
        status: 'sent',
      };

      setMessages(updatedMessages);

      if (activeSessionId) {
        const updated = sessions.map((s) =>
          s.id === activeSessionId
            ? { ...s, updatedAt: Date.now(), messages: updatedMessages }
            : s
        );
        setSessions(updated);
        StorageService.saveSessions(updated);
      }
    } catch (err: any) {
      console.error('Regenerate error:', err);
    } finally {
      setIsThinking(false);
      setAvatarState('idle');
    }
  };

  // Delete single message
  const handleDeleteMessage = (messageId: string) => {
    const updated = messages.filter((m) => m.id !== messageId);
    setMessages(updated);
    if (activeSessionId) {
      const updatedSessions = sessions.map((s) =>
        s.id === activeSessionId ? { ...s, messages: updated } : s
      );
      setSessions(updatedSessions);
      StorageService.saveSessions(updatedSessions);
    }
  };

  // Clear current conversation
  const handleClearConversation = () => {
    setMessages([]);
    if (activeSessionId) {
      const updatedSessions = sessions.map((s) =>
        s.id === activeSessionId ? { ...s, messages: [] } : s
      );
      setSessions(updatedSessions);
      StorageService.saveSessions(updatedSessions);
    }
  };

  // Rename session
  const handleRenameSession = (sessionId: string, newTitle: string) => {
    const updated = sessions.map((s) =>
      s.id === sessionId ? { ...s, title: newTitle } : s
    );
    setSessions(updated);
    StorageService.saveSessions(updated);
  };

  // Delete session
  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    StorageService.saveSessions(updated);

    if (activeSessionId === sessionId) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
        StorageService.setActiveSessionId(updated[0].id);
        setMessages(updated[0].messages);
      } else {
        setActiveSessionId(null);
        StorageService.setActiveSessionId(null);
        setMessages([]);
        setCurrentView('home');
      }
    }
  };

  // Clear all chats
  const handleClearAllSessions = () => {
    StorageService.clearAllChats();
    setSessions([]);
    setActiveSessionId(null);
    setMessages([]);
    setCurrentView('home');
  };

  // Update Settings
  const handleUpdateSettings = (newPartial: Partial<UserSettings>) => {
    const updated = { ...settings, ...newPartial };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  // Delete specific memory
  const handleDeleteMemory = (id: string) => {
    const updated = MemoryService.deleteMemory(id, currentUserId);
    setMemories(updated);
  };

  // Clear all memories for current user
  const handleClearMemories = () => {
    MemoryService.clearUserMemories(currentUserId);
    setMemories([]);
  };

  // Special Access / Girlfriend Mode Handlers
  const handleSpecialVerificationSuccess = (token: string) => {
    setUserMode('girlfriend');
    setSpecialToken(token);
    StorageService.setSpecialSessionToken(token);
    handleUpdateSettings({ userMode: 'girlfriend', specialAccessVerified: true });

    // Switch to Ashiya's isolated memories
    const ashiyaMems = MemoryService.getMemoriesForUser('girlfriend_ashiya');
    setMemories(ashiyaMems);
  };

  const handleExitSpecialMode = () => {
    setUserMode('normal');
    setSpecialToken(null);
    StorageService.setSpecialSessionToken(null);
    handleUpdateSettings({ userMode: 'normal', specialAccessVerified: false });

    // Switch back to guest memories
    const guestMems = MemoryService.getMemoriesForUser(StorageService.getGuestUserId());
    setMemories(guestMems);
  };

  // Authentication Handlers
  const handleAuthSuccess = async (user: UserProfile) => {
    setUserProfile(user);
    const freshUsage = UsageService.getUsage();
    setDailyUsage(freshUsage);

    if (!user.isGuest) {
      try {
        const cloudMems = await CloudMemoryRepository.fetchMemories(user.id);
        if (cloudMems && cloudMems.length > 0) {
          setMemories(cloudMems);
        }
      } catch (e) {
        console.warn('Memory sync error on login:', e);
      }
    }
  };

  const handleAuthLogout = async () => {
    const guestUser = await AuthService.signOut();
    setUserProfile(guestUser);
    setDailyUsage(UsageService.getUsage());
    setMemories(MemoryService.getMemoriesForUser(guestUser.id));
  };

  // Rewarded Ad completion
  const handleRewardedAdComplete = (reward: RewardedAdReward) => {
    const updated = UsageService.addRewardBonus(reward);
    setDailyUsage(updated);
    setIsRewardedAdOpen(false);
  };

  // Voice Interaction Time Tracker
  const handleRecordVoiceTime = (seconds: number) => {
    if (userMode !== 'girlfriend' && !SubscriptionService.isPremium()) {
      const updated = UsageService.addVoiceUsage(seconds);
      setDailyUsage(updated);
    }
  };

  return (
    <div
      id="app-root"
      className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200 selection:bg-blue-200 dark:selection:bg-blue-900"
    >
      {currentView === 'home' ? (
        <HomeScreen
          onStartChat={handleStartChat}
          onNewChat={() => {
            createNewSession();
            setCurrentView('chat');
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          userMode={userMode}
          userProfile={userProfile}
          onOpenSpecialAccess={() => setIsSpecialAccessOpen(true)}
          onOpenVoiceChat={() => setIsVoiceChatOpen(true)}
          onOpenImmersiveAvatar={() => setIsImmersiveAvatarOpen(true)}
          onOpenPremium={() => setIsPremiumOpen(true)}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
          avatarState={avatarState}
          reducedMotion={settings.reducedMotion}
        />
      ) : (
        <ChatScreen
          messages={messages}
          currentTitle={activeSession?.title || 'WA Avatar'}
          isThinking={isThinking}
          avatarState={avatarState}
          userMode={userMode}
          userProfile={userProfile}
          dailyUsage={dailyUsage}
          voiceSettings={settings.voice}
          onSendMessage={(text) => handleSendMessage(text)}
          onRegenerate={handleRegenerate}
          onDeleteMessage={handleDeleteMessage}
          onClearConversation={handleClearConversation}
          onNewConversation={() => {
            createNewSession();
          }}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onGoHome={() => setCurrentView('home')}
          onConfirmMemory={handleConfirmMemory}
          onDismissMemory={handleDismissMemory}
          onExitSpecialMode={handleExitSpecialMode}
          onAvatarStateChange={(st) => setAvatarState(st)}
          onOpenVoiceChat={() => setIsVoiceChatOpen(true)}
          onOpenImmersiveAvatar={() => setIsImmersiveAvatarOpen(true)}
          onOpenRewardedAd={(type) => {
            setRewardType(type);
            setIsRewardedAdOpen(true);
          }}
          onOpenPremium={() => setIsPremiumOpen(true)}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
          reducedMotion={settings.reducedMotion}
        />
      )}

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={() => {
          createNewSession();
          setCurrentView('chat');
        }}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
        onClearAllSessions={handleClearAllSessions}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        memories={memories}
        onDeleteMemory={handleDeleteMemory}
        onClearMemories={handleClearMemories}
        onClearChats={handleClearAllSessions}
        userMode={userMode}
        userProfile={userProfile}
        dailyUsage={dailyUsage}
        onOpenSpecialAccess={() => setIsSpecialAccessOpen(true)}
        onExitSpecialMode={handleExitSpecialMode}
        onOpenPremium={() => setIsPremiumOpen(true)}
        onOpenPrivacyModal={() => setIsPrivacyOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
      />

      {/* Special Access / Girlfriend Verification Modal */}
      <SpecialAccessModal
        isOpen={isSpecialAccessOpen}
        onClose={() => setIsSpecialAccessOpen(false)}
        currentUserMode={userMode}
        onVerificationSuccess={handleSpecialVerificationSuccess}
        onExitSpecialMode={handleExitSpecialMode}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={userProfile}
        onUserChanged={handleAuthSuccess}
      />

      {/* Stage 3A/3B Voice Chat Modal */}
      <VoiceChatModal
        isOpen={isVoiceChatOpen}
        onClose={() => setIsVoiceChatOpen(false)}
        avatarState={avatarState}
        messages={messages}
        isThinking={isThinking}
        voiceSettings={settings.voice}
        userMode={userMode}
        dailyUsage={dailyUsage}
        onSendMessage={(text) => handleSendMessage(text)}
        onInterruptSpeech={() => VoiceService.interruptSpeech()}
        onRecordVoiceTime={handleRecordVoiceTime}
        onOpenRewardedAd={(type) => {
          setRewardType(type);
          setIsRewardedAdOpen(true);
        }}
        onOpenPremium={() => setIsPremiumOpen(true)}
        onSwitchToText={() => {
          setCurrentView('chat');
        }}
        reducedMotion={settings.reducedMotion}
      />

      {/* Stage 3A Immersive 3D Avatar Modal */}
      <AvatarImmersiveModal
        isOpen={isImmersiveAvatarOpen}
        onClose={() => setIsImmersiveAvatarOpen(false)}
        avatarState={avatarState}
        userMode={userMode}
        voiceSettings={settings.voice}
        onTriggerVoiceSpeak={(text) => {
          VoiceService.speak(text, settings.voice);
        }}
        onInterruptSpeech={() => VoiceService.interruptSpeech()}
        reducedMotion={settings.reducedMotion}
      />

      {/* Stage 3B Rewarded Ad Modal */}
      <RewardedAdModal
        isOpen={isRewardedAdOpen}
        onClose={() => setIsRewardedAdOpen(false)}
        rewardType={rewardType}
        onRewardGranted={handleRewardedAdComplete}
      />

      {/* Stage 3B Premium Subscription Modal */}
      <PremiumModal
        isOpen={isPremiumOpen}
        onClose={() => setIsPremiumOpen(false)}
        onOpenPrivacy={() => {
          setIsPremiumOpen(false);
          setIsPrivacyOpen(true);
        }}
      />

      {/* Stage 3B Privacy & Data Deletion Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        onDataCleared={() => {
          handleClearAllSessions();
          handleClearMemories();
        }}
      />

      {/* Stage 3B Diagnostics Modal */}
      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        userMode={userMode}
        usage={dailyUsage}
        onRefreshUsage={() => setDailyUsage(UsageService.getUsage())}
        onOpenRewardedAd={(type) => {
          setRewardType(type);
          setIsRewardedAdOpen(true);
        }}
      />
    </div>
  );
}
