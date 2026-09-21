/**
 * WA Avatar - AdMobBanner Component (Stage 3B)
 * Google AdMob non-intrusive test banner.
 * STRICT DIRECTIVE:
 * - Hidden 100% inside Girlfriend Mode.
 * - Hidden for Premium users.
 * - Does NOT cover chat messages, input field, mic button, or avatar controls.
 */

import React, { useState } from 'react';
import { Sparkles, Info, X } from 'lucide-react';
import { ADMOB_TEST_CONFIG } from '../../services/admob_service';
import { SubscriptionService } from '../../services/subscription_service';

interface AdMobBannerProps {
  userMode: string;
  className?: string;
  onOpenPremium?: () => void;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  userMode,
  className = '',
  onOpenPremium,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // 1. Never show inside Girlfriend Mode
  if (userMode === 'girlfriend') {
    return null;
  }

  // 2. Never show to Premium users
  if (SubscriptionService.isPremium() || isDismissed) {
    return null;
  }

  return (
    <div
      id="admob-test-banner"
      className={`w-full max-w-lg mx-auto px-3 py-1.5 transition-all ${className}`}
    >
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] uppercase tracking-wider font-semibold">
            Ad
          </span>
          <div className="truncate">
            <p className="text-xs text-zinc-300 font-medium truncate">
              Google AdMob Test &bull; Upgrade to remove ads
            </p>
            <p className="text-[10px] text-zinc-500 font-mono truncate">
              ID: {ADMOB_TEST_CONFIG.bannerUnitId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenPremium && (
            <button
              onClick={onOpenPremium}
              className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 text-[11px] font-medium transition-all"
            >
              Premium
            </button>
          )}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Hide test banner"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
