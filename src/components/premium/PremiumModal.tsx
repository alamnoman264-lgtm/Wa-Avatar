/**
 * WA Avatar - PremiumModal Component (Stage 3B)
 * Comprehensive plan comparison (Free Plan vs Premium Plan).
 * STRICT DIRECTIVE:
 * - No fake purchases.
 * - Displays "Premium coming soon" until production in-app billing is connected.
 */

import React from 'react';
import { X, Check, Sparkles, Zap, Shield, Crown, Clock, AlertCircle } from 'lucide-react';
import { SubscriptionService, FREE_PLAN_FEATURES } from '../../services/subscription_service';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacy?: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  onOpenPrivacy,
}) => {
  if (!isOpen) return null;

  const isPremium = SubscriptionService.isPremium();
  const features = FREE_PLAN_FEATURES;

  return (
    <div
      id="premium-plan-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="w-full max-w-xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-blue-950/40 via-zinc-900 to-indigo-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crown size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-base text-zinc-100 flex items-center gap-2">
                WA Avatar Plans
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 font-normal">
                  Freemium
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Transparent comparison of Free vs. Premium tiers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Notice */}
        <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 px-5 flex items-center gap-2 text-amber-300 text-xs">
          <AlertCircle size={15} className="shrink-0" />
          <span>
            <strong>Production Note:</strong> In-app subscriptions will be available upon official app store release. Currently all users enjoy generous free access!
          </span>
        </div>

        {/* Body - Feature Comparison Table */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Plan Cards Summary */}
          <div className="grid grid-cols-2 gap-3">
            {/* Free Card */}
            <div className={`p-4 rounded-xl border ${!isPremium ? 'bg-blue-950/20 border-blue-500/40' : 'bg-zinc-800/50 border-zinc-700/60'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-zinc-300">Free Plan</span>
                {!isPremium && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-500 text-white font-medium">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xl font-bold text-zinc-100">₹0 <span className="text-xs font-normal text-zinc-400">/ forever</span></p>
              <p className="text-[11px] text-zinc-400 mt-1">
                30 AI messages &bull; 5 min voice daily &bull; Local memory
              </p>
            </div>

            {/* Premium Card */}
            <div className="p-4 rounded-xl border bg-gradient-to-b from-amber-500/10 to-zinc-900 border-amber-500/30 relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                  <Crown size={12} /> Premium
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium">
                  Coming Soon
                </span>
              </div>
              <p className="text-xl font-bold text-zinc-100">TBD <span className="text-xs font-normal text-zinc-400">/ month</span></p>
              <p className="text-[11px] text-zinc-400 mt-1">
                Unlimited chat &bull; Cloud sync &bull; Ad-free &bull; Ultra 3D
              </p>
            </div>
          </div>

          {/* Detailed Features List */}
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Feature Breakdown
            </h4>

            <div className="divide-y divide-zinc-800/80 rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/50">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className={`p-3 text-xs flex items-center justify-between gap-2 ${
                    feat.highlight ? 'bg-zinc-800/30' : ''
                  }`}
                >
                  <span className="text-zinc-300 font-medium flex-1">
                    {feat.title}
                  </span>
                  <div className="flex items-center gap-4 text-right">
                    <span className="text-zinc-400 w-28 text-[11px]">
                      {feat.freeValue}
                    </span>
                    <span className="text-amber-400 font-medium w-28 text-[11px] flex items-center justify-end gap-1">
                      <Check size={12} className="text-amber-400" />
                      {feat.premiumValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          {onOpenPrivacy && (
            <button
              onClick={() => {
                onClose();
                onOpenPrivacy();
              }}
              className="text-xs text-zinc-400 hover:text-zinc-200 underline transition-colors"
            >
              Privacy & Data Policy
            </button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
