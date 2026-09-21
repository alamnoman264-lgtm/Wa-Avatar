/**
 * WA Avatar - ChatScreen (Stage 2)
 * Full conversation interface with Avatar State visualization, Voice controls,
 * Mode indicator (Normal vs. Girlfriend), and Memory Confirmation Prompts.
 */

import React, { useRef, useEffect } from 'react';
import {
  Settings,
  History,
  Plus,
  Trash2,
  Home,
  Heart,
  Volume2,
  VolumeX,
  Headphones,
  Maximize2,
  Crown,
  Sparkles,
  Award,
} from 'lucide-react';
import {
  ChatMessage,
  AvatarState,
  UserMode,
  MemoryConfirmationPrompt,
  VoiceSettings,
  DailyUsageState,
  UserProfile,
} from '../../types';
import { Avatar3DView } from '../avatar/Avatar3DView';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
import { MessageInput } from './MessageInput';
import { BirthdayService } from '../../services/birthday_service';
import { VoiceService } from '../../services/voice_service';
import { AdMobBanner } from '../ads/AdMobBanner';
import { SubscriptionService } from '../../services/subscription_service';

interface ChatScreenProps {
  messages: ChatMessage[];
  currentTitle: string;
  isThinking: boolean;
  avatarState: AvatarState;
  userMode: UserMode;
  voiceSettings: VoiceSettings;
  dailyUsage?: DailyUsageState;
  userProfile?: UserProfile;
  onSendMessage: (text: string) => void;
  onRegenerate: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onClearConversation: () => void;
  onNewConversation: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onGoHome: () => void;
  onConfirmMemory: (prompt: MemoryConfirmationPrompt) => void;
  onDismissMemory: (messageId: string) => void;
  onExitSpecialMode: () => void;
  onAvatarStateChange?: (state: AvatarState) => void;
  onOpenVoiceChat?: () => void;
  onOpenImmersiveAvatar?: () => void;
  onOpenRewardedAd?: (type: 'chat_messages' | 'voice_seconds') => void;
  onOpenPremium?: () => void;
  onOpenPrivacy?: () => void;
  onOpenAuth?: () => void;
  onOpenDiagnostics?: () => void;
  reducedMotion?: boolean;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  currentTitle,
  isThinking,
  avatarState,
  userMode,
  voiceSettings,
  dailyUsage,
  userProfile,
  onSendMessage,
  onRegenerate,
  onDeleteMessage,
  onClearConversation,
  onNewConversation,
  onOpenHistory,
  onOpenSettings,
  onGoHome,
  onConfirmMemory,
  onDismissMemory,
  onExitSpecialMode,
  onAvatarStateChange,
  onOpenVoiceChat,
  onOpenImmersiveAvatar,
  onOpenRewardedAd,
  onOpenPremium,
  onOpenPrivacy,
  onOpenAuth,
  onOpenDiagnostics,
  reducedMotion = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isGirlfriend = userMode === 'girlfriend';
  const isPremium = SubscriptionService.isPremium();
  const birthdayStatus = BirthdayService.getBirthdayStatus();

  // Usage limits calculation
  const chatLimit = (dailyUsage?.chatFreeLimit || 30) + (dailyUsage?.rewardChatBonus || 0);
  const chatUsed = dailyUsage?.chatMessagesUsed || 0;
  const chatRemaining = Math.max(0, chatLimit - chatUsed);
  const isLimitReached = !isGirlfriend && !isPremium && chatRemaining === 0;

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isThinking]);

  // Find index of last assistant message
  const lastAssistantIndex = messages.map((m) => m.role).lastIndexOf('assistant');

  return (
    <div
      id="chat-screen"
      className="flex-1 flex flex-col w-full h-[100dvh] max-w-4xl mx-auto bg-white dark:bg-zinc-950 shadow-sm sm:border-x border-zinc-200 dark:border-zinc-800 transition-colors"
    >
      {/* Top Bar */}
      <header
        id="chat-topbar"
        className="w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-3 py-2.5 sm:px-4 flex items-center justify-between z-20 transition-colors"
      >
        {/* Left: Avatar & Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            id="go-home-button"
            onClick={onGoHome}
            title="Go to Home"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mr-0.5"
          >
            <Home size={18} />
          </button>

          <div
            onClick={onOpenImmersiveAvatar || onOpenSettings}
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
            title="Click to view 3D Avatar Stage"
          >
            <Avatar3DView
              size="sm"
              state={avatarState}
              showStatusBadge
              reducedMotion={reducedMotion}
            />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-none truncate">
                Wasim Akram
              </h1>
              {isGirlfriend ? (
                <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1">
                  <Heart size={9} className="fill-rose-500 text-rose-500" />
                  <span>Ashiya</span>
                </span>
              ) : (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                  AI Avatar
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              {isThinking ? (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  Wasim is thinking...
                </span>
              ) : avatarState === 'speaking' ? (
                <span className="text-violet-600 dark:text-violet-400 font-medium animate-pulse">
                  Speaking...
                </span>
              ) : avatarState === 'listening' ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
                  Listening to you...
                </span>
              ) : (
                currentTitle || 'WA Avatar • Hinglish'
              )}
            </p>
          </div>
        </div>

        {/* Right: Action Controls */}
        <div className="flex items-center gap-1">
          {/* Daily Limit Pill / Premium Trigger */}
          {!isGirlfriend && (
            <button
              id="topbar-usage-quota"
              onClick={onOpenPremium || (() => onOpenRewardedAd?.('chat_messages'))}
              title={
                isPremium
                  ? 'Premium Active - Unlimited Messages'
                  : `Daily Free Limit: ${chatRemaining}/${chatLimit} remaining. Click to expand`
              }
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                isPremium
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : chatRemaining <= 5
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              {isPremium ? (
                <>
                  <Crown size={12} className="text-amber-400" />
                  <span>Premium</span>
                </>
              ) : (
                <>
                  <Sparkles
                    size={11}
                    className={chatRemaining <= 5 ? 'text-rose-400' : 'text-blue-500'}
                  />
                  <span>{chatRemaining}/{chatLimit} free</span>
                </>
              )}
            </button>
          )}

          {/* Voice Chat Mode Button */}
          {onOpenVoiceChat && (
            <button
              id="topbar-voice-mode"
              onClick={onOpenVoiceChat}
              title="Switch to Voice Chat Mode"
              className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
            >
              <Headphones size={18} />
            </button>
          )}

          {/* 3D Immersive Stage Button */}
          {onOpenImmersiveAvatar && (
            <button
              id="topbar-3d-stage"
              onClick={onOpenImmersiveAvatar}
              title="Open 3D Avatar Stage"
              className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
            >
              <Maximize2 size={17} />
            </button>
          )}

          {/* TTS Stop button if speaking */}
          {avatarState === 'speaking' && (
            <button
              onClick={() => VoiceService.stopSpeaking()}
              title="Stop voice playback"
              className="p-2 rounded-xl text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors animate-pulse"
            >
              <VolumeX size={18} />
            </button>
          )}

          {/* New Chat */}
          <button
            id="topbar-new-chat"
            onClick={onNewConversation}
            title="New Conversation"
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Plus size={18} />
          </button>

          {/* Chat History */}
          <button
            id="topbar-history"
            onClick={onOpenHistory}
            title="Chat History"
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <History size={18} />
          </button>

          {/* Clear Current Conversation */}
          {messages.length > 0 && (
            <button
              id="topbar-clear-chat"
              onClick={onClearConversation}
              title="Clear Current Conversation"
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Trash2 size={17} />
            </button>
          )}

          {/* Settings */}
          <button
            id="topbar-settings"
            onClick={onOpenSettings}
            title="Settings"
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Birthday Alert Banner for Girlfriend Mode */}
      {isGirlfriend && birthdayStatus.isToday && (
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white px-4 py-2 flex items-center justify-between text-xs font-medium shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">🎂</span>
            <span>Happy Birthday Ashiya ❤️ Aaj tumhara special din hai!</span>
          </div>
          <button
            onClick={() => {
              onSendMessage('Happy Birthday Ashiya! Aaj kya plans hain?');
            }}
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-[11px] font-semibold transition-colors"
          >
            Celebrate 🎉
          </button>
        </div>
      )}

      {/* Main Conversation Messages Area */}
      <main
        id="chat-messages-container"
        className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-2 overscroll-contain"
      >
        {messages.length === 0 ? (
          /* Empty Chat State with Starter Suggestions */
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 py-8 my-auto">
            <div className="mb-4">
              <Avatar3DView
                size="md"
                state={avatarState !== 'idle' ? avatarState : isGirlfriend ? 'empathetic' : 'idle'}
                showStatusBadge
                reducedMotion={reducedMotion}
                className="shadow-xl ring-1 ring-zinc-200/80 dark:ring-zinc-800"
              />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              {isGirlfriend ? 'Hey Ashiya ❤️' : 'Hey bhai, main Wasim Akram hoon!'}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
              {isGirlfriend
                ? 'Main Wasim ka AI avatar hoon. Kaise ho aap? Kuch bhi share karna ho ya baat karni ho, main yahin hoon.'
                : 'Main Wasim Akram ka personal AI avatar hoon. Kuch bhi pucho ya explore karo — tech, online projects, career ideas ya casual baat-cheet.'}
            </p>

            <div className="w-full max-w-md space-y-2">
              {(isGirlfriend
                ? [
                    'Wasim, aaj din kaisa tha tumhara?',
                    'Tum future ke baare mein kya plan kar rahe ho?',
                    'Mujhe kuch achha sunao ya baat karo ❤️',
                    'Wasim, thoda busy ho kya?',
                  ]
                : [
                    'Bhai apne baare mein batao',
                    'Future online projects ke baare mein kya sochte ho?',
                    'Who are you?',
                    'Bhai mujhe ek basic problem mein guidance chahiye',
                  ]
              ).map((prompt, i) => (
                <button
                  key={i}
                  id={`starter-prompt-${i}`}
                  onClick={() => onSendMessage(prompt)}
                  className="w-full p-3 text-left rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-600 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-all flex items-center justify-between group"
                >
                  <span>&ldquo;{prompt}&rdquo;</span>
                  <span className="text-zinc-400 group-hover:text-blue-500 transition-colors">
                    &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatBubble
              key={message.id}
              message={message}
              isLastAssistantMessage={index === lastAssistantIndex}
              voiceSettings={voiceSettings}
              onRegenerate={onRegenerate}
              onDelete={onDeleteMessage}
              onConfirmMemory={onConfirmMemory}
              onDismissMemory={onDismissMemory}
            />
          ))
        )}

        {/* Thinking Indicator when AI is generating response */}
        {isThinking && <TypingIndicator />}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-1" />
      </main>

      {/* Bottom Message Input Bar */}
      <footer className="w-full">
        {/* Limit Reached Notification Banner */}
        {isLimitReached && (
          <div className="w-full max-w-xl mx-auto px-4 py-2.5 mb-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-amber-400 shrink-0" />
              <span>Aaj ke 30 free messages limit poori ho gayi (resets midnight IST).</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onOpenRewardedAd && (
                <button
                  onClick={() => onOpenRewardedAd('chat_messages')}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] shadow-sm transition-all"
                >
                  Watch Video (+5)
                </button>
              )}
              {onOpenPremium && (
                <button
                  onClick={onOpenPremium}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium text-[11px] transition-all"
                >
                  View Plans
                </button>
              )}
            </div>
          </div>
        )}

        {/* AdMob Banner (Strictly excluded from Girlfriend Mode & Premium) */}
        <AdMobBanner userMode={userMode} onOpenPremium={onOpenPremium} />

        <MessageInput
          onSendMessage={onSendMessage}
          disabled={isThinking || isLimitReached}
          placeholder={
            isLimitReached
              ? 'Daily free message limit reached. Watch an ad or upgrade to continue...'
              : isGirlfriend
              ? 'Wasim se baat karo...'
              : 'Wasim se baat karo (Hinglish/English)...'
          }
          onListeningStateChange={(isListening) => {
            if (onAvatarStateChange) {
              onAvatarStateChange(isListening ? 'listening' : 'idle');
            }
          }}
        />
      </footer>
    </div>
  );
};
