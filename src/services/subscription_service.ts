/**
 * WA Avatar - Subscription Service (Stage 3B)
 * Architecture for Freemium and Premium subscriptions.
 * Enforces transparency: no fake purchases, clearly communicates "Premium coming soon"
 * until production in-app billing is connected.
 */

import { PlanFeature, SubscriptionState } from '../types';

export const FREE_PLAN_FEATURES: PlanFeature[] = [
  {
    title: 'Daily AI Messages',
    freeValue: '30 messages / day',
    premiumValue: 'Unlimited messages',
    highlight: true,
  },
  {
    title: 'Voice Chat Interaction',
    freeValue: '5 minutes / day',
    premiumValue: 'Unlimited voice chat',
    highlight: true,
  },
  {
    title: 'Memory Storage',
    freeValue: 'Local device memory',
    premiumValue: 'Cloud sync across devices',
  },
  {
    title: '3D Avatar Fidelity',
    freeValue: 'Standard interactive 3D',
    premiumValue: 'Ultra 3D with expressions',
  },
  {
    title: 'Voice Synthesis Profile',
    freeValue: 'Device TTS + Wasim AI',
    premiumValue: 'Neural Wasim Akram voice',
  },
  {
    title: 'Ad Experience',
    freeValue: 'Non-intrusive banner ads',
    premiumValue: '100% Ad-Free experience',
    highlight: true,
  },
  {
    title: 'Processing Priority',
    freeValue: 'Standard queue',
    premiumValue: 'Instant response queue',
  },
];

const STORAGE_KEY_SUB = 'wa_avatar_subscription_v3';

export class SubscriptionService {
  /**
   * Checks if an external production payment gateway (e.g. Google Play Billing, Stripe) is configured.
   * Default is false to strictly prevent fraudulent fake purchases.
   */
  public static isPaymentConfigured(): boolean {
    return false; // Will be set to true when Google Play Billing API credentials are deployed
  }

  /**
   * Returns current subscription state
   */
  public static getSubscription(): SubscriptionState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SUB);
      if (raw) {
        return JSON.parse(raw) as SubscriptionState;
      }
    } catch {
      // fallback
    }

    return {
      tier: 'free',
      status: 'active',
    };
  }

  /**
   * Checks if user has an active premium entitlement
   */
  public static isPremium(): boolean {
    const sub = this.getSubscription();
    return sub.tier === 'premium' && sub.status === 'active';
  }

  /**
   * Returns feature list comparison for UI
   */
  public static getFeatures(): PlanFeature[] {
    return FREE_PLAN_FEATURES;
  }

  /**
   * Staged subscription upgrade handler (for developer test mode or future billing callback)
   */
  public static setSubscription(sub: SubscriptionState): void {
    localStorage.setItem(STORAGE_KEY_SUB, JSON.stringify(sub));
  }
}
