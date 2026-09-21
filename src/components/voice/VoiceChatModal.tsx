/**
 * WA Avatar - VoiceChatModal (Stage 3A)
 * Immersive voice-first conversation interface featuring the 3D avatar of Wasim Akram,
 * live audio visualizer, real-time speech recognition, interruptible response playback, and live captions.
 */

import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  VolumeX,
  MessageSquare,
  Sparkles,
  RotateCcw,
  Square,
  Radio,
  Subtitles,
  Crown,
  Award,
} from 'lucide-react';
import { AvatarState, UserSettings, VoiceSettings, UserMode, ChatMessage, DailyUsageState } from '../../types';
import { Avatar3DView } from '../avatar/Avatar3DView';
import { VoiceService } from '../../services/voice_service';
import { SubscriptionService } from '../../services/subscription_service';

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarState: AvatarState;
  messages?: ChatMessage[];
  isThinking?: boolean;
  voiceSettings?: VoiceSettings;
  settings?: UserSettings;
  userMode?: UserMode;
  dailyUsage?: DailyUsageState;
  onSendMessage: (text: string) => Promise<any> | void;
  onSwitchToText?: () => void;
  onInterruptSpeech?: () => void;
  onRecordVoiceTime?: (seconds: number) => void;
  onOpenRewardedAd?: (type: 'chat_messages' | 'voice_seconds') => void;
  onOpenPremium?: () => void;
  reducedMotion?: boolean;
}

export const VoiceChatModal: React.FC<VoiceChatModalProps> = ({
  isOpen,
  onClose,
  avatarState,
  messages,
  isThinking = false,
  voiceSettings,
  settings,
  userMode = 'normal',
  dailyUsage,
  onSendMessage,
  onSwitchToText,
  onInterruptSpeech,
  onRecordVoiceTime,
  onOpenRewardedAd,
  onOpenPremium,
  reducedMotion = false,
}) => {
  const effectiveVoiceSettings = voiceSettings || settings?.voice || {
    voiceInputEnabled: true,
    voiceResponseEnabled: true,
    autoSpeak: true,
    speechSpeed: 1.0,
    speechVolume: 1.0,
    selectedVoiceProfile: 'wasim_official',
  };
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastAiResponse, setLastAiResponse] = useState('');
  const [showCaptions, setShowCaptions] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSpeaking = avatarState === 'speaking';

  const isGirlfriend = userMode === 'girlfriend';
  const isPremium = SubscriptionService.isPremium();

  // Calculate remaining voice seconds
  const totalVoiceSec = (dailyUsage?.voiceFreeLimitSeconds || 300) + (dailyUsage?.rewardVoiceBonusSeconds || 0);
  const usedVoiceSec = dailyUsage?.voiceSecondsUsed || 0;
  const remainingVoiceSec = Math.max(0, totalVoiceSec - usedVoiceSec);
  const isVoiceLimitReached = !isGirlfriend && !isPremium && remainingVoiceSec <= 0;

  // Format remaining voice mm:ss
  const formatVoiceTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Track active voice time while listening or speaking
  useEffect(() => {
    let timer: any = null;
    if (isOpen && (isListening || isSpeaking) && !isGirlfriend && !isPremium) {
      timer = setInterval(() => {
        onRecordVoiceTime?.(1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isListening, isSpeaking, isGirlfriend, isPremium, onRecordVoiceTime]);

  // If limit is hit while speaking/listening, stop gracefully
  useEffect(() => {
    if (isVoiceLimitReached && (isListening || isSpeaking)) {
      VoiceService.stopListening();
      VoiceService.stopSpeaking();
      setIsListening(false);
    }
  }, [isVoiceLimitReached, isListening, isSpeaking]);

  // Interrupt speech when modal opens
  useEffect(() => {
    if (!isOpen) {
      VoiceService.stopSpeaking();
      VoiceService.stopListening();
      setIsListening(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle voice recognition
  const handleToggleMic = async () => {
    // If voice limit reached, prompt for rewarded ad or upgrade
    if (isVoiceLimitReached) {
      if (onOpenRewardedAd) {
        onOpenRewardedAd('voice_seconds');
      } else if (onOpenPremium) {
        onOpenPremium();
      }
      return;
    }

    // If avatar is currently speaking, interrupt it immediately!
    if (isSpeaking) {
      VoiceService.interruptSpeech();
    }

    if (isListening) {
      VoiceService.stopListening();
      setIsListening(false);
      return;
    }

    setErrorMessage(null);
    setTranscript('');

    const started = await VoiceService.startListening({
      onStart: () => {
        setIsListening(true);
      },
      onResult: (currentText, isFinal) => {
        setTranscript(currentText);
        if (isFinal && currentText.trim()) {
          setIsListening(false);
          handleProcessVoiceMessage(currentText.trim());
        }
      },
      onError: (err) => {
        setIsListening(false);
        setErrorMessage(err);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (!started) {
      setIsListening(false);
    }
  };

  const handleProcessVoiceMessage = async (userText: string) => {
    if (!userText || isProcessing) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const reply = await onSendMessage(userText);
      if (reply) {
        setLastAiResponse(reply);
        // Automatically speak response in Voice Mode
        VoiceService.speak(reply, effectiveVoiceSettings);
      }
    } catch (err: any) {
      setErrorMessage('Kuch gadbad hui. Kripya dobara koshish karein.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopSpeaking = () => {
    VoiceService.stopSpeaking();
  };

  const handleReplay = () => {
    if (lastAiResponse) {
      VoiceService.speak(lastAiResponse, effectiveVoiceSettings);
    }
  };

  // Status text for the UI
  const getStatusText = () => {
    if (isListening) return 'Listening... bolo, sun raha hoon';
    if (isProcessing || avatarState === 'thinking') return 'Wasim sooch raha hai...';
    if (isSpeaking) return 'Wasim bol raha hai...';
    return 'Tap mic button to speak';
  };

  return (
    <div
      id="voice-chat-modal"
      className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-fade-in"
    >
      {/* Top Bar Navigation */}
      <div className="w-full max-w-xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-sm tracking-wide text-zinc-300">
            Voice Mode &bull; Wasim Akram
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isGirlfriend && (
            <button
              onClick={onOpenPremium || (() => onOpenRewardedAd?.('voice_seconds'))}
              title={
                isPremium
                  ? 'Premium Active - Unlimited Voice Interaction'
                  : `Daily Free Voice Time Remaining: ${formatVoiceTime(remainingVoiceSec)}`
              }
              className={`px-2.5 py-1 rounded-full text-xs font-mono border flex items-center gap-1.5 transition-all ${
                isPremium
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : isVoiceLimitReached
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700'
              }`}
            >
              {isPremium ? (
                <Crown size={12} className="text-amber-400" />
              ) : (
                <Sparkles size={11} className={isVoiceLimitReached ? 'text-rose-400' : 'text-emerald-400'} />
              )}
              <span>{isPremium ? 'Unlimited' : formatVoiceTime(remainingVoiceSec)}</span>
            </button>
          )}

          <button
            onClick={() => setShowCaptions(!showCaptions)}
            title="Toggle Live Captions"
            className={`p-2 rounded-xl border transition-all ${
              showCaptions
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
            }`}
          >
            <Subtitles size={18} />
          </button>

          {onSwitchToText && (
            <button
              onClick={() => {
                onClose();
                onSwitchToText();
              }}
              title="Switch to Text Chat"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-medium transition-all"
            >
              <MessageSquare size={14} />
              <span>Text Chat</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Center Stage with 3D Avatar */}
      <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center my-2 sm:my-4 relative">
        <div className="relative flex items-center justify-center">
          {/* Animated Radial Voice Ripples */}
          {(isListening || isSpeaking) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`w-72 h-72 sm:w-88 sm:h-88 rounded-full border border-blue-500/20 animate-ping opacity-40`}
              />
              <div
                className={`w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-blue-500/10 blur-xl animate-pulse`}
              />
            </div>
          )}

          {/* 3D Avatar Canvas */}
          <Avatar3DView
            state={avatarState}
            size="lg"
            showStatusBadge={false}
            reducedMotion={reducedMotion || settings?.reducedMotion}
            className="shadow-2xl ring-1 ring-white/10"
          />
        </div>

        {/* Live Status Pill */}
        <div className="mt-4 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md bg-zinc-900/80 border border-zinc-800 text-zinc-300 flex items-center gap-2 shadow-lg">
          <Radio
            size={13}
            className={
              isListening
                ? 'text-emerald-400 animate-pulse'
                : isSpeaking
                ? 'text-violet-400 animate-bounce'
                : isProcessing
                ? 'text-blue-400 animate-spin'
                : 'text-zinc-500'
            }
          />
          <span>{getStatusText()}</span>
        </div>

        {/* Voice Limit Reached Alert Card */}
        {isVoiceLimitReached && (
          <div className="mt-4 w-full max-w-md bg-amber-950/40 border border-amber-800/60 rounded-2xl p-4 backdrop-blur-md text-xs text-amber-200 text-center shadow-lg animate-fade-in flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 font-medium">
              <Award size={18} className="text-amber-400" />
              <span>Daily free voice time limit (5m) reached for today.</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Daily quota resets at 12:00 AM IST. Watch a short video to add 2 minutes or switch to text chat.
            </p>
            <div className="flex items-center gap-2">
              {onOpenRewardedAd && (
                <button
                  onClick={() => onOpenRewardedAd('voice_seconds')}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md transition-all active:scale-95"
                >
                  Watch Ad (+2 Min)
                </button>
              )}
              {onSwitchToText && (
                <button
                  onClick={() => {
                    onClose();
                    onSwitchToText();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-medium transition-all"
                >
                  Switch to Text
                </button>
              )}
              {onOpenPremium && (
                <button
                  onClick={onOpenPremium}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium transition-all"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        )}

        {/* Live Captions / Transcript Card */}
        {showCaptions && (transcript || lastAiResponse) && (
          <div className="mt-4 w-full max-w-md bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3.5 backdrop-blur-md text-sm text-center shadow-lg transition-all animate-fade-in">
            {transcript && (
              <p className="text-emerald-400 font-medium italic">
                &ldquo;{transcript}&rdquo;
              </p>
            )}
            {lastAiResponse && !transcript && (
              <p className="text-zinc-200 line-clamp-3">
                {lastAiResponse}
              </p>
            )}
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 px-3 py-1.5 rounded-xl">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Bottom Voice Controls */}
      <div className="w-full max-w-md flex items-center justify-center gap-6 pb-4">
        {/* Replay Button */}
        <button
          onClick={handleReplay}
          disabled={!lastAiResponse || isListening || isProcessing}
          title="Replay Response"
          className="p-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-all active:scale-95"
        >
          <RotateCcw size={20} />
        </button>

        {/* Primary Mic Toggle Action Button */}
        <button
          id="voice-chat-primary-mic"
          onClick={handleToggleMic}
          disabled={isProcessing}
          className={`relative p-6 rounded-full transition-all duration-300 active:scale-95 shadow-2xl flex items-center justify-center ${
            isListening
              ? 'bg-rose-500 text-white ring-8 ring-rose-500/25 animate-pulse'
              : isSpeaking
              ? 'bg-violet-600 text-white ring-4 ring-violet-500/25 hover:bg-violet-500'
              : 'bg-blue-600 hover:bg-blue-500 text-white ring-4 ring-blue-500/20'
          }`}
        >
          {isListening ? (
            <MicOff size={32} />
          ) : isSpeaking ? (
            <Square size={28} />
          ) : (
            <Mic size={32} />
          )}
        </button>

        {/* Stop Speaking / Mute Button */}
        <button
          onClick={handleStopSpeaking}
          disabled={!isSpeaking}
          title="Stop Speaking"
          className="p-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-all active:scale-95"
        >
          <Square size={20} />
        </button>
      </div>
    </div>
  );
};
