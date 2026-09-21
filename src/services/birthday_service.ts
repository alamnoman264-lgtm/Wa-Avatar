/**
 * WA Avatar - BirthdayService (Stage 2)
 * Manages Ashiya's birthday (25 September, Asia/Kolkata).
 * Strictly isolated to Girlfriend Mode.
 */

import { TimeService } from './time_service';
import { UserMode } from '../types';

export interface BirthdayState {
  isToday: boolean;
  daysUntil: number;
  targetYear: number;
  hasGreetedThisYear: boolean;
}

const STORAGE_KEY_LAST_BIRTHDAY_YEAR = 'wa_last_birthday_greeting_year';

export class BirthdayService {
  public static readonly BIRTHDAY_DAY = 25;
  public static readonly BIRTHDAY_MONTH = 9; // September

  /**
   * Get status of Ashiya's birthday relative to current India time
   */
  public static getBirthdayStatus(): BirthdayState {
    const ist = TimeService.getIndiaTime();
    const currentYear = ist.year;

    const isToday =
      ist.month === this.BIRTHDAY_MONTH && ist.day === this.BIRTHDAY_DAY;

    // Calculate days until next 25 September
    let targetYear = currentYear;
    if (
      ist.month > this.BIRTHDAY_MONTH ||
      (ist.month === this.BIRTHDAY_MONTH && ist.day > this.BIRTHDAY_DAY)
    ) {
      targetYear += 1;
    }

    const todayDate = new Date(Date.UTC(ist.year, ist.month - 1, ist.day));
    const targetDate = new Date(Date.UTC(targetYear, this.BIRTHDAY_MONTH - 1, this.BIRTHDAY_DAY));
    const diffMs = targetDate.getTime() - todayDate.getTime();
    const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const lastGreetedYear = this.getLastGreetingYear();
    const hasGreetedThisYear = lastGreetedYear === currentYear;

    return {
      isToday,
      daysUntil: isToday ? 0 : daysUntil,
      targetYear,
      hasGreetedThisYear,
    };
  }

  public static getLastGreetingYear(): number | null {
    try {
      const val = localStorage.getItem(STORAGE_KEY_LAST_BIRTHDAY_YEAR);
      return val ? parseInt(val, 10) : null;
    } catch {
      return null;
    }
  }

  public static markGreetingDelivered(year: number): void {
    try {
      localStorage.setItem(STORAGE_KEY_LAST_BIRTHDAY_YEAR, year.toString());
    } catch (e) {
      console.warn('Failed to save birthday greeting state:', e);
    }
  }

  /**
   * Generates a warm, authentic Wasim Akram birthday greeting for Ashiya
   */
  public static generateBirthdayGreeting(): string {
    const greetings = [
      'Happy Birthday Ashiya ❤️ Aaj tumhara special din hai! Main hamesha chahta hoon ki tum khush raho aur life mein jo bhi achieve karna chahti ho wo sab tumhe mile. Stay blessed, always smiling raho! 🙂',
      'Happy Birthday Ashiya ❤️ Tum meri life mein kitni important ho ye batane ki zaroorat nahi hai. Wish you all the happiness, success aur peace in the world. Enjoy your day to the fullest!',
      'Happy Birthday Ashiya ❤️ May this year bring you endless happiness and success. Hamesha aise hi khush raho aur apni beautiful smile banaye rakho!',
    ];
    // Return greeting
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Check if a birthday greeting should trigger automatically on app open or midnight
   */
  public static shouldTriggerGreeting(userMode: UserMode): boolean {
    if (userMode !== 'girlfriend') return false;
    const status = this.getBirthdayStatus();
    return status.isToday && !status.hasGreetedThisYear;
  }
}
