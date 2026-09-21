/**
 * WA Avatar - AdMob Service (Stage 3B)
 * Google AdMob architecture with official Google Test Ad Unit IDs.
 * Implements strict guard rails preventing intrusion during voice chat,
 * avatar speaking, birthday celebrations, and Girlfriend Mode.
 */

import { AdConfig, RewardedAdReward } from '../types';
import { EntitlementService } from './entitlement_service';
import { UsageService } from './usage_service';

// Official Google AdMob Test Ad Unit IDs (Android)
export const ADMOB_TEST_CONFIG: AdConfig = {
  appId: 'ca-app-pub-3940256099942544~3347511713',
  bannerUnitId: 'ca-app-pub-3940256099942544/6300978111',
  interstitialUnitId: 'ca-app-pub-3940256099942544/1033173712',
  rewardedUnitId: 'ca-app-pub-3940256099942544/5224354917',
  isTestMode: true,
};

export class AdMobService {
  private static lastInterstitialShownAt = 0;
  private static readonly MIN_INTERSTITIAL_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes minimum interval

  /**
   * Returns active AdMob configuration
   */
  public static getConfig(): AdConfig {
    return ADMOB_TEST_CONFIG;
  }

  /**
   * Determines if a banner ad is permitted to be shown
   */
  public static canShowBanner(userMode: string): boolean {
    if (userMode === 'girlfriend') return false;
    return EntitlementService.shouldDisplayAds(userMode === 'girlfriend');
  }

  /**
   * Validates if an interstitial ad is safe and permitted to display.
   * Strictly enforces safety rules.
   */
  public static canShowInterstitial(context: {
    userMode: string;
    isVoiceActive: boolean;
    isAvatarSpeaking: boolean;
    isBirthdayGreeting: boolean;
    isAppLaunch?: boolean;
    isJustSentMessage?: boolean;
  }): boolean {
    // 1. Never show inside Girlfriend Mode
    if (context.userMode === 'girlfriend') return false;

    // 2. Never show to premium users
    if (!EntitlementService.shouldDisplayAds(false)) return false;

    // 3. Never show at app launch
    if (context.isAppLaunch) return false;

    // 4. Never show immediately after sending a message
    if (context.isJustSentMessage) return false;

    // 5. Never interrupt voice chat
    if (context.isVoiceActive) return false;

    // 6. Never interrupt while avatar is speaking
    if (context.isAvatarSpeaking) return false;

    // 7. Never interrupt during a birthday greeting
    if (context.isBirthdayGreeting) return false;

    // 8. Enforce minimum time interval between interstitials
    const now = Date.now();
    if (now - this.lastInterstitialShownAt < this.MIN_INTERSTITIAL_INTERVAL_MS) {
      return false;
    }

    return true;
  }

  /**
   * Marks that an interstitial was displayed
   */
  public static recordInterstitialShown(): void {
    this.lastInterstitialShownAt = Date.now();
  }

  /**
   * Completes a rewarded ad and credits the user's daily usage quota
   */
  public static completeRewardedAd(reward: RewardedAdReward): void {
    UsageService.addRewardBonus(reward);
  }
}
