/**
 * WA Avatar - DiagnosticsModal Component (Stage 3B)
 * Developer & Test Diagnostics Panel.
 * STRICT DIRECTIVE:
 * Never exposes production secrets, verification codes, or private API keys.
 */

import React from 'react';
import {
  X,
  Cpu,
  RefreshCw,
  Clock,
  Sparkles,
  Shield,
  Activity,
  Award,
  Film,
  Zap,
} from 'lucide-react';
import { DailyUsageState, UserMode } from '../../types';
import { UsageService } from '../../services/usage_service';
import { TimeService } from '../../services/time_service';
import { ADMOB_TEST_CONFIG } from '../../services/admob_service';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userMode: UserMode;
  usage: DailyUsageState;
  onRefreshUsage: () => void;
  onOpenRewardedAd: (type: 'chat_messages' | 'voice_seconds') => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({
  isOpen,
  onClose,
  userMode,
  usage,
  onRefreshUsage,
  onOpenRewardedAd,
}) => {
  if (!isOpen) return null;

  const indiaTime = TimeService.getIndiaTime();

  const handleAddFiveMessages = () => {
    UsageService.addRewardBonus({
      type: 'chat_messages',
      amount: 5,
      label: '5 Diagnostic Messages',
    });
    onRefreshUsage();
  };

  const handleAddTwoMinutesVoice = () => {
    UsageService.addRewardBonus({
      type: 'voice_seconds',
      amount: 120,
      label: '2 Diagnostic Minutes',
    });
    onRefreshUsage();
  };

  const handleResetDaily = () => {
    UsageService.resetDailyUsage();
    onRefreshUsage();
  };

  return (
    <div
      id="diagnostics-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="w-full max-w-md max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-scale-up">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Cpu size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-100">Test & Diagnostics</h3>
              <p className="text-[10px] text-zinc-500">Stage 3B Developer Inspection</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Diagnostic Metrics */}
          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">Current User Mode</span>
              <span className={`px-2 py-0.5 rounded font-mono font-semibold ${userMode === 'girlfriend' ? 'bg-pink-500/20 text-pink-300' : 'bg-blue-500/20 text-blue-300'}`}>
                {userMode.toUpperCase()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">Timezone Authority</span>
              <span className="font-mono text-zinc-200">
                {indiaTime.timezone} ({indiaTime.formattedTime})
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">Today's Date Key</span>
              <span className="font-mono text-zinc-200">{indiaTime.dateKey}</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">Daily Messages Used</span>
              <span className="font-mono font-semibold text-zinc-200">
                {usage.chatMessagesUsed} / {usage.chatFreeLimit + usage.rewardChatBonus}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">Daily Voice Used</span>
              <span className="font-mono font-semibold text-zinc-200">
                {usage.voiceSecondsUsed}s / {usage.voiceFreeLimitSeconds + usage.rewardVoiceBonusSeconds}s
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">AdMob Environment</span>
              <span className="font-mono text-emerald-400">
                Google Official Test IDs
              </span>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="pt-2">
            <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Simulation Actions
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddFiveMessages}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-center transition-all flex items-center justify-center gap-1.5"
              >
                <Award size={13} className="text-blue-400" />
                <span>+5 Messages</span>
              </button>

              <button
                onClick={handleAddTwoMinutesVoice}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-center transition-all flex items-center justify-center gap-1.5"
              >
                <Award size={13} className="text-emerald-400" />
                <span>+2 Min Voice</span>
              </button>

              <button
                onClick={() => onOpenRewardedAd('chat_messages')}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-center transition-all flex items-center justify-center gap-1.5"
              >
                <Film size={13} className="text-amber-400" />
                <span>Test Rewarded Ad</span>
              </button>

              <button
                onClick={handleResetDaily}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 font-medium text-center transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={13} />
                <span>Reset Limits</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
