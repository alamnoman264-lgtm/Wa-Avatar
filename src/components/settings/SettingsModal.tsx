/**
 * WA Avatar - SettingsModal (Stage 2)
 * Comprehensive settings modal for General, Voice & Audio, Memory, Personality, Special Access, and Privacy.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Moon,
  Sun,
  Laptop,
  Brain,
  Trash2,
  ShieldCheck,
  Info,
  Globe,
  User,
  Sparkles,
  Volume2,
  Mic,
  Clock,
  Heart,
  Lock,
  Check,
  Calendar,
  Sliders,
  Crown,
  Shield,
  Cpu,
} from 'lucide-react';
import {
  UserSettings,
  ThemeMode,
  LanguagePreference,
  MemoryItem,
  UserMode,
  UserProfile,
  DailyUsageState,
} from '../../types';
import {
  DEFAULT_PERSONALITY_PROFILE,
  INITIAL_STYLE_EXAMPLES,
  OWNER_PROFILE,
} from '../../config/personality_config';
import { TimeService } from '../../services/time_service';
import { VoiceService } from '../../services/voice_service';
import { BirthdayService } from '../../services/birthday_service';
import { SubscriptionService } from '../../services/subscription_service';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  memories: MemoryItem[];
  onDeleteMemory: (id: string) => void;
  onClearMemories: () => void;
  onClearChats: () => void;
  userMode: UserMode;
  userProfile?: UserProfile;
  dailyUsage?: DailyUsageState;
  onOpenSpecialAccess: () => void;
  onExitSpecialMode: () => void;
  onOpenPremium?: () => void;
  onOpenPrivacyModal?: () => void;
  onOpenAuthModal?: () => void;
  onOpenDiagnostics?: () => void;
}

type TabType = 'general' | 'voice' | 'memory' | 'personality' | 'special' | 'about' | 'privacy';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  memories,
  onDeleteMemory,
  onClearMemories,
  onClearChats,
  userMode,
  userProfile,
  dailyUsage,
  onOpenSpecialAccess,
  onExitSpecialMode,
  onOpenPremium,
  onOpenPrivacyModal,
  onOpenAuthModal,
  onOpenDiagnostics,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [memoryClearConfirm, setMemoryClearConfirm] = useState(false);
  const [chatClearConfirm, setChatClearConfirm] = useState(false);
  const [istTime, setIstTime] = useState(TimeService.getIndiaTime());

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setIstTime(TimeService.getIndiaTime());
    }, 10000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const isGirlfriend = userMode === 'girlfriend';
  const birthdayStatus = BirthdayService.getBirthdayStatus();

  return (
    <div
      id="settings-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="settings-modal-card"
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
              Settings &amp; Configuration
            </h2>
            {isGirlfriend && (
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-1">
                <Heart size={11} className="fill-rose-500 text-rose-500" />
                <span>Special Mode</span>
              </span>
            )}
          </div>
          <button
            id="close-settings-button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-4 bg-zinc-50/50 dark:bg-zinc-950/30 overflow-x-auto no-scrollbar">
          {[
            { id: 'general', label: 'General', icon: Globe },
            { id: 'voice', label: 'Voice & Audio', icon: Volume2 },
            { id: 'memory', label: 'Memory', icon: Brain },
            { id: 'personality', label: 'Personality', icon: User },
            { id: 'special', label: 'Special Access', icon: isGirlfriend ? Heart : Lock },
            { id: 'about', label: 'About', icon: Info },
            { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`settings-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Account & Subscription Card */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                      {userProfile?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {userProfile?.isGuest ? 'Guest User' : userProfile?.name || 'Registered Account'}
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        {userProfile?.email || 'Temporary guest session'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenAuthModal && (
                      <button
                        onClick={onOpenAuthModal}
                        className="px-2.5 py-1 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        {userProfile?.isGuest ? 'Sign In / Register' : 'Switch Account'}
                      </button>
                    )}
                    {onOpenPremium && !isGirlfriend && (
                      <button
                        onClick={onOpenPremium}
                        className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 font-medium flex items-center gap-1 transition-colors"
                      >
                        <Crown size={12} />
                        <span>Plans</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Daily Quota Summary */}
                {!isGirlfriend && dailyUsage && (
                  <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span>Messages: </span>
                      <strong className="text-zinc-800 dark:text-zinc-200">
                        {dailyUsage.chatMessagesUsed} / {dailyUsage.chatFreeLimit + dailyUsage.rewardChatBonus}
                      </strong>
                    </div>
                    <div>
                      <span>Voice: </span>
                      <strong className="text-zinc-800 dark:text-zinc-200">
                        {Math.floor(dailyUsage.voiceSecondsUsed / 60)}m / {Math.floor((dailyUsage.voiceFreeLimitSeconds + dailyUsage.rewardVoiceBonusSeconds) / 60)}m
                      </strong>
                    </div>
                    <div className="text-zinc-400">
                      Reset: 12:00 AM IST
                    </div>
                  </div>
                )}
              </div>

              {/* Appearance Section */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                  Appearance Theme
                </h3>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { mode: 'light', label: 'Light', icon: Sun },
                    { mode: 'dark', label: 'Dark', icon: Moon },
                    { mode: 'system', label: 'System', icon: Laptop },
                  ].map(({ mode, label, icon: ModeIcon }) => {
                    const isSelected = settings.theme === mode;
                    return (
                      <button
                        key={mode}
                        id={`theme-btn-${mode}`}
                        onClick={() =>
                          onUpdateSettings({ theme: mode as ThemeMode })
                        }
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                            : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <ModeIcon size={20} className="mb-1.5" />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language Section */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                  AI Language Preference
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'auto', label: 'Auto Detect' },
                    { key: 'hinglish', label: 'Hinglish (Default)' },
                    { key: 'hi', label: 'Hindi' },
                    { key: 'en', label: 'English' },
                  ].map(({ key, label }) => {
                    const isSelected = settings.language === key;
                    return (
                      <button
                        key={key}
                        id={`lang-btn-${key}`}
                        onClick={() =>
                          onUpdateSettings({
                            language: key as LanguagePreference,
                          })
                        }
                        className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                            : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{label}</span>
                          {isSelected && <Check size={14} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-2">
                  Wasim naturally defaults to Roman Hindi / Hinglish.
                </p>
              </div>

              {/* Reduced Motion Accessibility Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Reduced Motion (Accessibility)
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Dampens 3D avatar micro-movements and camera drift for motion sensitivity.
                  </p>
                </div>
                <button
                  onClick={() =>
                    onUpdateSettings({
                      reducedMotion: !settings.reducedMotion,
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    settings.reducedMotion ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      settings.reducedMotion ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* IST Time Status */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                  <div>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Current India Standard Time (IST):
                    </span>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {istTime.formattedTime} • {istTime.formattedDate} ({istTime.dayOfWeek})
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Actions */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                  Chat Data
                </h3>
                {chatClearConfirm ? (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center justify-between gap-3">
                    <span className="text-xs text-rose-700 dark:text-rose-300">
                      Clear all conversation history?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onClearChats();
                          setChatClearConfirm(false);
                        }}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg"
                      >
                        Yes, Delete All
                      </button>
                      <button
                        onClick={() => setChatClearConfirm(false)}
                        className="px-2.5 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setChatClearConfirm(true)}
                    className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    <span>Clear All Chat History</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB: VOICE & AUDIO */}
          {activeTab === 'voice' && (
            <div className="space-y-5">
              {/* Voice Provider Status Card */}
              <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <Volume2 size={16} className="text-blue-600 dark:text-blue-400" />
                    <span>Voice Engine &amp; Provider (Stage 3A)</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Connected</span>
                  </span>
                </div>
                <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                  <p>
                    <strong className="font-semibold">Active Provider:</strong> Device Browser Voice (Fallback Voice)
                  </p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Owner Authorization: Custom neural voice model is exclusively authorized for Wasim Akram. Standard device TTS operates seamlessly as the default zero-latency fallback.
                  </p>
                </div>
              </div>

              {/* Voice Profile Selection */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 block">
                  Voice Profile
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: 'wasim_official',
                      name: 'Wasim Akram (Official)',
                      tag: 'Owner Authorized',
                      sub: 'Hindi / Hinglish tone',
                    },
                    {
                      id: 'device_hindi_male',
                      name: 'Hindi Voice',
                      tag: 'Device Fallback',
                      sub: 'Native browser TTS',
                    },
                    {
                      id: 'device_indian_english',
                      name: 'Indian English',
                      tag: 'Device Fallback',
                      sub: 'Clear neutral diction',
                    },
                  ].map((profile) => {
                    const isSelected = (settings.voice.selectedVoiceProfile || 'wasim_official') === profile.id;
                    return (
                      <button
                        key={profile.id}
                        onClick={() =>
                          onUpdateSettings({
                            voice: {
                              ...settings.voice,
                              selectedVoiceProfile: profile.id,
                            },
                          })
                        }
                        className={`p-3 text-left rounded-xl border transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{profile.name}</span>
                          {isSelected && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
                        </div>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">{profile.tag}</span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-1">{profile.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Voice Input Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Voice Input (Speech-to-Text)
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Enables microphone button for voice typing in Hindi &amp; English.
                  </p>
                </div>
                <button
                  onClick={() =>
                    onUpdateSettings({
                      voice: {
                        ...settings.voice,
                        voiceInputEnabled: !settings.voice.voiceInputEnabled,
                      },
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    settings.voice.voiceInputEnabled ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      settings.voice.voiceInputEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Voice Response (TTS) Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Voice Responses (TTS)
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Enables audio playback for Wasim&apos;s responses.
                  </p>
                </div>
                <button
                  onClick={() =>
                    onUpdateSettings({
                      voice: {
                        ...settings.voice,
                        voiceResponseEnabled: !settings.voice.voiceResponseEnabled,
                      },
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    settings.voice.voiceResponseEnabled ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      settings.voice.voiceResponseEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Auto Speak Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Auto-Speak Responses
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Automatically reads new incoming messages out loud.
                  </p>
                </div>
                <button
                  onClick={() =>
                    onUpdateSettings({
                      voice: {
                        ...settings.voice,
                        autoSpeak: !settings.voice.autoSpeak,
                      },
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    settings.voice.autoSpeak ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      settings.voice.autoSpeak ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Speech Speed Slider */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  <span className="flex items-center gap-1.5">
                    <Sliders size={14} />
                    <span>Speech Speed ({settings.voice.speechSpeed.toFixed(1)}x)</span>
                  </span>
                  <span className="text-zinc-500 font-normal">Normal: 1.0x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={settings.voice.speechSpeed}
                  onChange={(e) =>
                    onUpdateSettings({
                      voice: {
                        ...settings.voice,
                        speechSpeed: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Voice Volume Slider */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  <span className="flex items-center gap-1.5">
                    <Volume2 size={14} />
                    <span>Voice Volume ({Math.round((settings.voice.speechVolume ?? 1.0) * 100)}%)</span>
                  </span>
                  <span className="text-zinc-500 font-normal">Max: 100%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={settings.voice.speechVolume ?? 1.0}
                  onChange={(e) =>
                    onUpdateSettings({
                      voice: {
                        ...settings.voice,
                        speechVolume: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Voice Test & Replay Controls */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => VoiceService.previewVoice(settings.voice)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Volume2 size={15} />
                  <span>Preview Voice</span>
                </button>
                <button
                  onClick={() => VoiceService.replayLast(settings.voice)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-medium text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Replay Last Message</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: MEMORY */}
          {activeTab === 'memory' && (
            <div className="space-y-5">
              {/* Memory Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Long-Term Memory System (Stage 2)
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Allows Wasim to remember preferences, facts, interests, and dates.
                  </p>
                </div>
                <button
                  id="toggle-memory-btn"
                  onClick={() =>
                    onUpdateSettings({ memoryEnabled: !settings.memoryEnabled })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    settings.memoryEnabled ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      settings.memoryEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Memory Items List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Stored Memories ({memories.length})
                  </h4>
                  {memories.length > 0 && (
                    <button
                      onClick={() => setMemoryClearConfirm(true)}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Clear Memory
                    </button>
                  )}
                </div>

                {memoryClearConfirm && (
                  <div className="p-3 mb-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center justify-between gap-3">
                    <span className="text-xs text-rose-700 dark:text-rose-300">
                      Wipe all saved memories?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onClearMemories();
                          setMemoryClearConfirm(false);
                        }}
                        className="px-3 py-1 bg-rose-600 text-white text-xs font-medium rounded-lg"
                      >
                        Wipe
                      </button>
                      <button
                        onClick={() => setMemoryClearConfirm(false)}
                        className="px-2 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {memories.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <Brain size={24} className="mx-auto text-zinc-400 mb-1.5 opacity-60" />
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      No memory saved yet
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
                      Tell Wasim your name, interests, or preferences to store categorized memory facts.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {memories.map((mem) => (
                      <div
                        key={mem.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-xs"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 mr-2">
                            {mem.category || 'fact'}
                          </span>
                          <span className="font-semibold text-zinc-500 dark:text-zinc-400 mr-2">
                            {mem.label || mem.key}:
                          </span>
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {mem.value}
                          </span>
                        </div>
                        <button
                          onClick={() => onDeleteMemory(mem.id)}
                          className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                          title="Delete memory"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SPECIAL ACCESS (GIRLFRIEND MODE) */}
          {activeTab === 'special' && (
            <div className="space-y-5">
              <div
                className={`p-4 rounded-xl border ${
                  isGirlfriend
                    ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-100'
                    : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Heart
                    size={18}
                    className={isGirlfriend ? 'text-rose-600 fill-rose-600' : 'text-zinc-400'}
                  />
                  <h4 className="font-semibold text-sm">
                    {isGirlfriend ? 'Special Access Activated' : 'Authorized Access Area'}
                  </h4>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {isGirlfriend
                    ? 'Special relationship mode (Ashiya) is currently active. Wasim communicates with personal affection, emotional context, and synchronized memory.'
                    : 'Dedicated private access for authorized personal interactions. Requires passcode verification.'}
                </p>

                {isGirlfriend && (
                  <div className="mt-3 p-3 bg-white dark:bg-zinc-900 rounded-lg border border-rose-200 dark:border-rose-900/40 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800 dark:text-rose-300">
                      <Calendar size={13} />
                      <span>Ashiya&apos;s Birthday: 25 September</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {birthdayStatus.isToday
                        ? '🎉 Today is 25 September! Birthday greeting mode is live.'
                        : `Next birthday in ${birthdayStatus.daysUntil} days.`}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
                  {isGirlfriend ? (
                    <button
                      type="button"
                      onClick={() => {
                        onExitSpecialMode();
                      }}
                      className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Lock size={13} />
                      <span>Exit Special Mode &amp; Lock</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSpecialAccess();
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Lock size={13} />
                      <span>Enter Passcode</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PERSONALITY */}
          {activeTab === 'personality' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5 mb-1">
                  <Sparkles size={15} />
                  <span>Configured Personality Engine</span>
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  WA Avatar is configured to embody Wasim Akram&apos;s real-world perspective, communication style, and background.
                </p>
              </div>

              {/* Profile details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block mb-1 font-medium">Owner &amp; Avatar</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {OWNER_PROFILE.name}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block mb-1 font-medium">Location</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {OWNER_PROFILE.village}, {OWNER_PROFILE.district}, {OWNER_PROFILE.state}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block mb-1 font-medium">Default Tone</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {DEFAULT_PERSONALITY_PROFILE.tone}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block mb-1 font-medium">Common Address</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    &ldquo;{DEFAULT_PERSONALITY_PROFILE.commonAddress}&rdquo; (Normal users only)
                  </span>
                </div>
              </div>

              {/* Style Examples */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                  Style Guidance Examples
                </h4>
                <div className="space-y-2">
                  {INITIAL_STYLE_EXAMPLES.slice(0, 3).map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5"
                    >
                      <p className="text-zinc-500 font-medium">User: &ldquo;{ex.userMessage}&rdquo;</p>
                      <p className="text-zinc-900 dark:text-zinc-100 font-medium bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
                        AI: &ldquo;{ex.ownerStyleResponse}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base flex-shrink-0">
                  WA
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    WA Avatar (Stage 3B • Production Ready)
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Personal AI Avatar representation of Wasim Akram. Features 3D realistic avatar rendering with real-time expressions and lip sync, AdMob monetization, freemium daily quotas (Asia/Kolkata), cloud memory sync, and girlfriend-safe mode.
                  </p>
                  <p className="text-zinc-400 mt-2 font-mono text-[11px]">
                    Version: 3.2.0-production • Engine: Gemini 3.8 Flash • IST Calibrated
                  </p>
                </div>
              </div>

              {onOpenDiagnostics && (
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Developer &amp; QA Diagnostics
                    </h5>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                      Test quotas, AdMob safety, Cloud sync, and prompt defenses.
                    </p>
                  </div>
                  <button
                    onClick={onOpenDiagnostics}
                    className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Cpu size={14} />
                    <span>Run Diagnostics</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 mb-2 text-sm">
                  <ShieldCheck size={16} />
                  <span>Official AI Disclosure</span>
                </h4>
                <p className="text-emerald-800 dark:text-emerald-300">
                  This application uses an AI avatar representing Wasim Akram. It is not the real physical person. The avatar embodies communication style, personality, and digital perspectives.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                <h5 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Data Processing &amp; Privacy Protection
                </h5>
                <p>
                  Messages are securely processed by Google Gemini models through private backend server routes. Secret API keys are never exposed to client browsers.
                </p>
                <p>
                  Private relationship data and girlfriend context are strictly separated. Normal users cannot access private relationship details or bypass authorization.
                </p>
              </div>

              {onOpenPrivacyModal && (
                <div className="pt-2 flex justify-start">
                  <button
                    onClick={onOpenPrivacyModal}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center gap-2"
                  >
                    <Shield size={15} />
                    <span>Open Privacy &amp; Data Deletion Center</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
