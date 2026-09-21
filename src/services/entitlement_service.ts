/**
 * WA Avatar - Entitlement Service (Stage 3B)
 * Centralizes feature gating and permission checks based on active subscription tier.
 */

import { SubscriptionService } from './subscription_service';

export type EntitlementFeature =
  | 'unlimited_chat'
  | 'unlimited_voice'
  | 'cloud_memory'
  | 'no_ads'
  | 'priority_model'
  | 'custom_owner_voice';

export class EntitlementService {
  /**
   * Checks if user is entitled to a specific capability
   */
  public static isEntitled(feature: EntitlementFeature): boolean {
    const isPremium = SubscriptionService.isPremium();

    switch (feature) {
      case 'unlimited_chat':
      case 'unlimited_voice':
      case 'cloud_memory':
      case 'no_ads':
      case 'priority_model':
      case 'custom_owner_voice':
        return isPremium;

      default:
        return false;
    }
  }

  /**
   * Checks whether ads should be displayed to the user
   */
  public static shouldDisplayAds(isGirlfriendMode = false): boolean {
    // 1. Girlfriend mode is strictly 100% ad-free
    if (isGirlfriendMode) {
      return false;
    }

    // 2. Premium users receive no ads
    if (SubscriptionService.isPremium()) {
      return false;
    }

    // 3. Free plan users see non-intrusive ads
    return true;
  }
}
