/**
 * WA Avatar - RewardedAdModal Component (Stage 3B)
 * Opt-in Rewarded Ad player with official Google Test Ad ID.
 * STRICT DIRECTIVE:
 * - Never autoplays. User must explicitly choose to watch.
 * - On completion, credits usage quota (+5 messages or +2 min voice).
 */

import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, X, Sparkles, Shield, Clock } from 'lucide-react';
import { RewardedAdReward } from '../../types';
import { ADMOB_TEST_CONFIG, AdMobService } from '../../services/admob_service';
import { AnalyticsService } from '../../services/analytics_service';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardType: 'chat_messages' | 'voice_seconds';
  onRewardGranted: (reward: RewardedAdReward) => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  rewardType,
  onRewardGranted,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCountdown(5);
      setIsCompleted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (isPlaying && countdown === 0) {
      setIsCompleted(true);
      setIsPlaying(false);

      const reward: RewardedAdReward =
        rewardType === 'chat_messages'
          ? {
              type: 'chat_messages',
              amount: 5,
              label: '5 Extra Messages',
            }
          : {
              type: 'voice_seconds',
              amount: 120,
              label: '2 Extra Voice Minutes',
            };

      AdMobService.completeRewardedAd(reward);
      AnalyticsService.logEvent('ad_reward_completed', { rewardType });
      onRewardGranted(reward);
    }

    return () => clearTimeout(timer);
  }, [isPlaying, countdown, rewardType, onRewardGranted]);

  if (!isOpen) return null;

  const rewardLabel =
    rewardType === 'chat_messages' ? '5 Extra AI Messages' : '2 Extra Voice Minutes';

  const handleStartWatch = () => {
    setIsPlaying(true);
    setCountdown(5);
  };

  return (
    <div
      id="rewarded-ad-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] uppercase tracking-wider font-semibold">
              AdMob Test
            </span>
            <span className="text-xs text-zinc-400 font-medium">Rewarded Ad</span>
          </div>

          {!isPlaying && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Ad Player Body */}
        <div className="p-5 flex flex-col items-center text-center">
          {isPlaying ? (
            <div className="w-full py-8 flex flex-col items-center justify-center space-y-4">
              <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-blue-500/10 border-2 border-blue-500 text-blue-400 font-bold text-xl animate-pulse">
                {countdown}s
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Playing Google Test Video Ad...
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Ad Unit: {ADMOB_TEST_CONFIG.rewardedUnitId}
                </p>
              </div>
            </div>
          ) : isCompleted ? (
            <div className="py-6 flex flex-col items-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-base font-semibold text-zinc-100">Reward Unlocked!</h4>
              <p className="text-xs text-zinc-400 max-w-xs">
                You received <span className="text-emerald-400 font-semibold">{rewardLabel}</span> for today!
              </p>
              <button
                onClick={onClose}
                className="mt-3 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all shadow-md"
              >
                Continue Chatting
              </button>
            </div>
          ) : (
            <div className="py-4 flex flex-col items-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Sparkles size={28} />
              </div>

              <div>
                <h4 className="text-base font-semibold text-zinc-100">Get More Free Access</h4>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed max-w-xs">
                  Watch a quick 5-second sponsor video to immediately receive{' '}
                  <span className="text-blue-400 font-semibold">{rewardLabel}</span>.
                </p>
              </div>

              <div className="w-full pt-2 flex flex-col gap-2">
                <button
                  onClick={handleStartWatch}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                >
                  <Play size={14} fill="currentColor" />
                  <span>Watch Test Ad ({rewardLabel})</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 font-medium text-xs transition-all"
                >
                  No Thanks, Maybe Later
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
