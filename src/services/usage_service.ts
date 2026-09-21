/**
 * WA Avatar - Usage Service (Stage 3B)
 * Freemium quota management for daily chat (30 msgs) and voice (5 mins = 300s).
 * Strictly calculates daily resets against Asia/Kolkata (IST).
 */

import { DailyUsageState, RewardedAdReward } from '../types';
import { TimeService } from './time_service';

const STORAGE_KEY_USAGE = 'wa_avatar_daily_usage_v3';

export const FREE_LIMITS = {
  CHAT_MESSAGES: 30,
  VOICE_SECONDS: 300, // 5 minutes
  REWARD_CHAT_BONUS: 5, // +5 messages per rewarded ad
  REWARD_VOICE_BONUS_SECONDS: 120, // +2 minutes per rewarded ad
};

export class UsageService {
  private static listeners: Array<(usage: DailyUsageState) => void> = [];

  /**
   * Subscribe to usage state changes
   */
  public static subscribe(listener: (usage: DailyUsageState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notifyListeners(usage: DailyUsageState): void {
    for (const listener of this.listeners) {
      try {
        listener(usage);
      } catch (err) {
        console.error('Usage listener error:', err);
      }
    }
  }

  /**
   * Returns current active daily usage state for today in Asia/Kolkata.
   * Resets automatically if date has rolled over.
   */
  public static getUsage(): DailyUsageState {
    const todayKey = TimeService.getAsiaKolkataDateKey();

    try {
      const raw = localStorage.getItem(STORAGE_KEY_USAGE);
      if (raw) {
        const parsed = JSON.parse(raw) as DailyUsageState;
        if (parsed.date === todayKey) {
          return parsed;
        }
      }
    } catch {
      // Fall through to fresh initialization
    }

    // Initialize fresh daily record for today (Asia/Kolkata)
    const fresh: DailyUsageState = {
      date: todayKey,
      chatMessagesUsed: 0,
      chatFreeLimit: FREE_LIMITS.CHAT_MESSAGES,
      voiceSecondsUsed: 0,
      voiceFreeLimitSeconds: FREE_LIMITS.VOICE_SECONDS,
      rewardChatBonus: 0,
      rewardVoiceBonusSeconds: 0,
      isPremium: false,
    };

    this.saveUsage(fresh);
    return fresh;
  }

  /**
   * Saves usage state locally and triggers listeners
   */
  private static saveUsage(state: DailyUsageState): void {
    try {
      localStorage.setItem(STORAGE_KEY_USAGE, JSON.stringify(state));
    } catch (err) {
      console.warn('Failed to save usage locally:', err);
    }
    this.notifyListeners(state);
  }

  /**
   * Checks if user is permitted to send an AI message
   */
  public static canSendChatMessage(): {
    allowed: boolean;
    remaining: number;
    totalAllowed: number;
    used: number;
    reason?: string;
  } {
    const usage = this.getUsage();

    if (usage.isPremium) {
      return {
        allowed: true,
        remaining: 999999,
        totalAllowed: 999999,
        used: usage.chatMessagesUsed,
      };
    }

    const totalAllowed = usage.chatFreeLimit + usage.rewardChatBonus;
    const remaining = Math.max(0, totalAllowed - usage.chatMessagesUsed);

    if (remaining <= 0) {
      return {
        allowed: false,
        remaining: 0,
        totalAllowed,
        used: usage.chatMessagesUsed,
        reason:
          "You've reached today's free chat limit. You can continue tomorrow or upgrade when Premium is available.",
      };
    }

    return {
      allowed: true,
      remaining,
      totalAllowed,
      used: usage.chatMessagesUsed,
    };
  }

  /**
   * Increments chat AI message generation count
   */
  public static incrementChatUsage(): DailyUsageState {
    const usage = this.getUsage();
    usage.chatMessagesUsed += 1;
    this.saveUsage(usage);
    this.syncWithServer(usage);
    return usage;
  }

  /**
   * Checks if voice interaction is permitted
   */
  public static canUseVoice(requiredSeconds = 1): {
    allowed: boolean;
    remainingSeconds: number;
    reason?: string;
  } {
    const usage = this.getUsage();

    if (usage.isPremium) {
      return {
        allowed: true,
        remainingSeconds: 999999,
      };
    }

    const totalAllowed = usage.voiceFreeLimitSeconds + usage.rewardVoiceBonusSeconds;
    const remainingSeconds = Math.max(0, totalAllowed - usage.voiceSecondsUsed);

    if (remainingSeconds < requiredSeconds) {
      return {
        allowed: false,
        remainingSeconds,
        reason:
          "You've reached today's free voice limit (5 mins). Watch a short ad for 2 extra minutes or upgrade to Premium.",
      };
    }

    return {
      allowed: true,
      remainingSeconds,
    };
  }

  /**
   * Records voice duration consumed in seconds
   */
  public static addVoiceUsage(seconds: number): DailyUsageState {
    const usage = this.getUsage();
    usage.voiceSecondsUsed = Math.min(
      usage.voiceFreeLimitSeconds + usage.rewardVoiceBonusSeconds,
      usage.voiceSecondsUsed + Math.round(seconds)
    );
    this.saveUsage(usage);
    this.syncWithServer(usage);
    return usage;
  }

  /**
   * Grants rewarded ad bonus
   */
  public static addRewardBonus(reward: RewardedAdReward): DailyUsageState {
    const usage = this.getUsage();
    if (reward.type === 'chat_messages') {
      usage.rewardChatBonus += reward.amount;
    } else if (reward.type === 'voice_seconds') {
      usage.rewardVoiceBonusSeconds += reward.amount;
    }
    this.saveUsage(usage);
    this.syncWithServer(usage);
    return usage;
  }

  /**
   * Manual daily reset (used by developer diagnostics or timezone roll)
   */
  public static resetDailyUsage(): DailyUsageState {
    const todayKey = TimeService.getAsiaKolkataDateKey();
    const fresh: DailyUsageState = {
      date: todayKey,
      chatMessagesUsed: 0,
      chatFreeLimit: FREE_LIMITS.CHAT_MESSAGES,
      voiceSecondsUsed: 0,
      voiceFreeLimitSeconds: FREE_LIMITS.VOICE_SECONDS,
      rewardChatBonus: 0,
      rewardVoiceBonusSeconds: 0,
      isPremium: false,
    };
    this.saveUsage(fresh);
    return fresh;
  }

  /**
   * Formats chat usage string: "Today's free messages: 12 / 30"
   */
  public static getChatUsageDisplay(usage?: DailyUsageState): string {
    const u = usage || this.getUsage();
    if (u.isPremium) return "Messages: Unlimited (Premium)";
    const totalAllowed = u.chatFreeLimit + u.rewardChatBonus;
    return `Today's free messages: ${u.chatMessagesUsed} / ${totalAllowed}`;
  }

  /**
   * Formats voice remaining string: "Voice remaining today: 3m 42s"
   */
  public static getVoiceRemainingDisplay(usage?: DailyUsageState): string {
    const u = usage || this.getUsage();
    if (u.isPremium) return "Voice: Unlimited (Premium)";
    const totalAllowed = u.voiceFreeLimitSeconds + u.rewardVoiceBonusSeconds;
    const remaining = Math.max(0, totalAllowed - u.voiceSecondsUsed);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `Voice remaining today: ${mins}m ${String(secs).padStart(2, '0')}s`;
  }

  /**
   * Best-effort background sync with backend /api/usage
   */
  public static async syncWithServer(usage: DailyUsageState): Promise<void> {
    try {
      await fetch('/api/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usage),
      });
    } catch {
      // Quiet background failure; local authoritative cache remains responsive
    }
  }
}
