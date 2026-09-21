/**
 * WA Avatar - HomeScreen (Stage 2)
 * Welcome screen featuring live IST clock, avatar states, conversation starters,
 * and userMode awareness (Normal vs. Girlfriend Mode).
 */

import React, { useState, useEffect } from 'react';
import {
  MessageSquarePlus,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Clock,
  Heart,
  Lock,
  Calendar,
  Mic,
  Maximize2,
  Crown,
  Shield,
  Cpu,
} from 'lucide-react';
import { Avatar3DView } from '../avatar/Avatar3DView';
import { UserMode, AvatarState, UserProfile } from '../../types';
import { TimeService } from '../../services/time_service';
import { BirthdayService } from '../../services/birthday_service';

interface HomeScreenProps {
  onStartChat: (initialPrompt?: string) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onOpenAuthModal: () => void;
  userMode: UserMode;
  onOpenSpecialAccess: () => void;
  onOpenVoiceChat?: () => void;
  onOpenImmersiveAvatar?: () => void;
  onOpenPremium?: () => void;
  onOpenPrivacy?: () => void;
  onOpenDiagnostics?: () => void;
  userProfile?: UserProfile;
  avatarState?: AvatarState;
  reducedMotion?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartChat,
  onNewChat,
  onOpenSettings,
  onOpenAuthModal,
  userMode,
  onOpenSpecialAccess,
  onOpenVoiceChat,
  onOpenImmersiveAvatar,
  onOpenPremium,
  onOpenPrivacy,
  onOpenDiagnostics,
  userProfile,
  avatarState = 'idle',
  reducedMotion = false,
}) => {
  const [istTime, setIstTime] = useState(TimeService.getIndiaTime());
  const isGirlfriend = userMode === 'girlfriend';
  const birthdayStatus = BirthdayService.getBirthdayStatus();

  useEffect(() => {
    const timer = setInterval(() => {
      setIstTime(TimeService.getIndiaTime());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const normalPrompts = [
    'Hey Wasim, kaise ho?',
    'Tell me about yourself',
    'Future projects ke baare mein sochte ho?',
    'Help me with something',
  ];

  const girlfriendPrompts = [
    'Wasim, aaj din kaisa tha tumhara? ❤️',
    'Future ke baare mein kya plan kar rahe ho?',
    'Thoda busy ho kya aaj?',
    'Kuch achhi baat batao 🙂',
  ];

  const currentPrompts = isGirlfriend ? girlfriendPrompts : normalPrompts;

  return (
    <div
      id="home-screen"
      className="flex-1 flex flex-col items-center justify-between p-4 sm:p-8 max-w-4xl mx-auto w-full min-h-[calc(100vh-4rem)]"
    >
      {/* Top Banner & Status Controls */}
      <div className="w-full flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            WA Avatar
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            Stage 3B &bull; Production
          </span>
          {isGirlfriend && (
            <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
              <Heart size={11} className="fill-rose-500 text-rose-500" />
              <span>Ashiya</span>
            </span>
          )}
        </div>

        {/* Live IST clock & Access Controls */}
        <div className="flex items-center gap-2">
          {/* IST Time Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-300">
            <Clock size={13} className="text-blue-500" />
            <span>IST: {istTime.formattedTime}</span>
          </div>

          {/* Premium Plan Button */}
          {onOpenPremium && !isGirlfriend && (
            <button
              onClick={onOpenPremium}
              title="View Plans"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 transition-all"
            >
              <Crown size={12} />
              <span className="hidden sm:inline">Plans</span>
            </button>
          )}

          {/* Discreet Special Access Lock Button */}
          <button
            onClick={onOpenSpecialAccess}
            title={isGirlfriend ? 'Special Access Active' : 'Special Access Verification'}
            className={`p-1.5 rounded-lg border transition-colors ${
              isGirlfriend
                ? 'border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/30'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {isGirlfriend ? <Heart size={16} className="fill-rose-500 text-rose-500" /> : <Lock size={16} />}
          </button>

          {/* Account/Profile Button */}
          <button
            id="login-placeholder-button"
            onClick={onOpenAuthModal}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            {userProfile?.isGuest ? 'Guest' : userProfile?.name || 'Account'}
          </button>
        </div>
      </div>

      {/* Hero Content Section */}
      <div className="flex flex-col items-center text-center my-auto py-6 max-w-xl">
        {/* Large Wasim Akram Realistic 3D Avatar Representation */}
        <div className="relative mb-5 flex flex-col items-center">
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 rounded-full blur-xl animate-pulse" />
          <Avatar3DView
            size="lg"
            state={avatarState !== 'idle' ? avatarState : isGirlfriend ? 'empathetic' : 'idle'}
            showStatusBadge
            showControls={Boolean(onOpenImmersiveAvatar)}
            onToggleImmersive={onOpenImmersiveAvatar}
            reducedMotion={reducedMotion}
            className="relative shadow-2xl ring-1 ring-zinc-200/80 dark:ring-zinc-800"
          />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 mb-3 text-xs text-zinc-600 dark:text-zinc-300">
          <Sparkles size={13} className="text-blue-500" />
          <span>
            {isGirlfriend
              ? 'Personal 3D AI Avatar of Wasim Akram (Special Mode Active)'
              : 'Personal 3D AI Avatar of Wasim Akram'}
          </span>
        </div>

        {/* Headings */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
          {isGirlfriend ? 'Welcome back, Ashiya ❤️' : "Meet Wasim Akram's AI Avatar"}
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-6 max-w-md">
          {isGirlfriend
            ? 'Wasim ka personal AI avatar ready hai. 3D avatar, realistic expressions aur voice chat ke saath baat karein.'
            : 'Interactive 3D avatar with real-time facial expressions, gaze tracking, voice chat, and long-term memory.'}
        </p>

        {/* Birthday Indicator for Ashiya */}
        {isGirlfriend && birthdayStatus.isToday && (
          <div className="mb-6 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2 animate-bounce">
            <span className="text-base">🎂</span>
            <span className="font-semibold">
              Today is 25 September! Happy Birthday Ashiya!
            </span>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto mb-8">
          <button
            id="start-chat-primary"
            onClick={() => onStartChat()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Start Chat</span>
            <ArrowRight size={16} />
          </button>

          {onOpenVoiceChat && (
            <button
              id="start-voice-mode"
              onClick={onOpenVoiceChat}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Mic size={16} />
              <span>Voice Mode</span>
            </button>
          )}

          {onOpenImmersiveAvatar && (
            <button
              id="open-3d-stage"
              onClick={onOpenImmersiveAvatar}
              className="px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-medium text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              <Maximize2 size={15} />
              <span>3D Stage</span>
            </button>
          )}

          <button
            id="new-chat-secondary"
            onClick={onNewChat}
            className="px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-medium text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <MessageSquarePlus size={16} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Suggested Prompts Section */}
        <div className="w-full">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
            Suggested Conversation Starters
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
            {currentPrompts.map((prompt, index) => (
              <button
                key={index}
                id={`suggested-prompt-${index}`}
                onClick={() => onStartChat(prompt)}
                className="p-3 text-left rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-all group flex items-center justify-between"
              >
                <span>&ldquo;{prompt}&rdquo;</span>
                <span className="text-zinc-400 group-hover:text-blue-500 transition-colors">
                  &rarr;
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Identity & Privacy Disclosure */}
      <div className="w-full pt-6 border-t border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
          <span>
            AI Disclosure: This is an AI avatar representing Wasim Akram, not the physical person.
          </span>
        </div>
        <div className="flex items-center gap-3">
          {onOpenPrivacy && (
            <button
              onClick={onOpenPrivacy}
              className="hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-2 transition-colors"
            >
              Privacy &amp; Data
            </button>
          )}
          {onOpenDiagnostics && (
            <button
              onClick={onOpenDiagnostics}
              className="hover:text-violet-600 dark:hover:text-violet-400 underline underline-offset-2 transition-colors"
            >
              Diagnostics
            </button>
          )}
          <button
            onClick={onOpenSettings}
            className="hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-2 transition-colors"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};
