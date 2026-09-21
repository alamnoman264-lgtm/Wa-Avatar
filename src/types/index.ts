/**
 * WA Avatar - Type Definitions (Stage 2)
 */

export type AvatarState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'happy'
  | 'excited'
  | 'confused'
  | 'sad'
  | 'empathetic'
  | 'sleepy'
  | 'error';

export type AvatarExpression =
  | 'neutral'
  | 'smile'
  | 'happy'
  | 'thinking'
  | 'confused'
  | 'sad'
  | 'empathetic'
  | 'excited'
  | 'sleepy';

export type LipSyncViseme =
  | 'sil'
  | 'aa'
  | 'oh'
  | 'ee'
  | 'ih'
  | 'ou'
  | 'mbp';

export type VoiceProviderType = 'browser' | 'neural' | 'custom_owner';

export interface VoiceProfile {
  id: string;
  name: string;
  provider: VoiceProviderType;
  gender: 'male' | 'female';
  language: string;
  isAuthorizedOwnerVoice: boolean;
  description: string;
  previewSampleUrl?: string;
  isFallback?: boolean;
}

export interface Avatar3DModelConfig {
  modelUrl?: string;
  format: 'glb' | 'gltf' | 'procedural';
  hasMorphTargets: boolean;
  loaded: boolean;
  error?: string;
  scale?: number;
  position?: [number, number, number];
  reducedMotion?: boolean;
}

export type ViewMode = 'home' | 'chat' | 'voice' | 'avatar_immersive';

export type UserMode = 'normal' | 'girlfriend';

export type MemoryCategory =
  | 'profile'
  | 'preference'
  | 'fact'
  | 'interest'
  | 'date'
  | 'context'
  | 'other';

export interface MemoryItem {
  id: string;
  userId: string;
  category: MemoryCategory;
  key: string;
  value: string;
  createdAt: number;
  updatedAt: number;
  label?: string;
  confidence?: number;
}

export interface MemoryConfirmationPrompt {
  id?: string;
  key: string;
  value: string;
  category: MemoryCategory;
  label: string;
  question: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  avatarState?: AvatarState;
  status?: 'sent' | 'thinking' | 'error';
  errorMessage?: string;
  memoryConfirmation?: MemoryConfirmationPrompt;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  summary?: string;
  conversationSummary?: string;
  userMode?: UserMode;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type LanguagePreference = 'auto' | 'en' | 'hi' | 'hinglish';

export interface VoiceSettings {
  voiceInputEnabled: boolean;
  voiceResponseEnabled: boolean;
  autoSpeak: boolean;
  speechSpeed: number; // 0.8 - 1.4
  speechVolume: number; // 0.0 - 1.0
  selectedVoiceProfile: string;
}

export interface UserSettings {
  theme: ThemeMode;
  language: LanguagePreference;
  memoryEnabled: boolean;
  soundEnabled: boolean;
  userMode: UserMode;
  specialAccessVerified: boolean;
  voice: VoiceSettings;
  reducedMotion?: boolean;
  avatarQuality?: 'high' | 'medium' | 'low';
}

export interface SendMessageRequest {
  message: string;
  history: { role: 'user' | 'assistant' | 'system'; content: string }[];
  relevantMemories?: string[];
  languagePreference?: LanguagePreference;
  userMode?: UserMode;
  specialSessionToken?: string;
  conversationSummary?: string;
  clientTimeContext?: {
    formattedDate: string;
    formattedTime: string;
    dayOfWeek: string;
    isBirthdayToday: boolean;
    daysUntilBirthday: number;
  };
}

export interface SendMessageResponse {
  reply: string;
  avatarState?: AvatarState;
  detectedMemories?: {
    category: MemoryCategory;
    key: string;
    label: string;
    value: string;
    needsConfirmation?: boolean;
  }[];
  newConversationSummary?: string;
}

export interface BirthdayInfo {
  isToday: boolean;
  daysUntil: number;
  day: number;
  month: number;
  year: number;
  greetingDeliveredForYear?: number;
}

// =========================================================================
// STAGE 3B TYPES: FREEMIUM, USAGE, ADMOB, PREMIUM, AUTH & ANALYTICS
// =========================================================================

export interface DailyUsageState {
  date: string; // YYYY-MM-DD in Asia/Kolkata
  chatMessagesUsed: number;
  chatFreeLimit: number; // default 30
  voiceSecondsUsed: number;
  voiceFreeLimitSeconds: number; // default 300 (5 minutes)
  rewardChatBonus: number;
  rewardVoiceBonusSeconds: number;
  isPremium: boolean;
}

export type PlanTier = 'free' | 'premium';

export interface PlanFeature {
  title: string;
  freeValue: string;
  premiumValue: string;
  highlight?: boolean;
}

export interface SubscriptionState {
  tier: PlanTier;
  status: 'active' | 'inactive' | 'pending';
  expiresAt?: number;
  provider?: 'play_store' | 'stripe' | 'test';
  autoRenew?: boolean;
}

export type AdType = 'banner' | 'interstitial' | 'rewarded';

export interface AdConfig {
  appId: string;
  bannerUnitId: string;
  interstitialUnitId: string;
  rewardedUnitId: string;
  isTestMode: boolean;
}

export interface RewardedAdReward {
  type: 'chat_messages' | 'voice_seconds';
  amount: number;
  label: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  isGuest: boolean;
  createdAt: number;
  lastLoginAt: number;
  provider: 'guest' | 'google' | 'email';
}

export type AnalyticsEventType =
  | 'app_open'
  | 'chat_started'
  | 'voice_started'
  | 'voice_completed'
  | 'avatar_mode_opened'
  | 'premium_screen_opened'
  | 'ad_reward_completed'
  | 'usage_limit_reached';

export interface CrashReportMeta {
  timestamp: number;
  message: string;
  stack?: string;
  userMode: UserMode;
  isGuest: boolean;
  platform: string;
}

