/**
 * WA Avatar - TimeService (Stage 2)
 * Accurate date and time calculations synchronized to Asia/Kolkata (India Standard Time).
 */

export interface IndiaTimeContext {
  date: Date;
  year: number;
  month: number; // 1-indexed (1 = January, 12 = December)
  day: number;
  dayOfWeek: string;
  monthName: string;
  formattedDate: string; // e.g., "21 September 2026"
  formattedTime: string; // e.g., "10:15 AM"
  timezone: string;
  dateKey: string; // "YYYY-MM-DD" in Asia/Kolkata
}

export class TimeService {
  private static readonly TIMEZONE = 'Asia/Kolkata';

  /**
   * Returns current date string "YYYY-MM-DD" strictly in Asia/Kolkata timezone.
   */
  public static getAsiaKolkataDateKey(): string {
    const t = this.getIndiaTime();
    return t.dateKey;
  }

  /**
   * Returns current date & time converted to Asia/Kolkata (IST).
   */
  public static getIndiaTime(): IndiaTimeContext {
    const now = new Date();

    // Format parts in Asia/Kolkata timezone
    const dtfDate = new Intl.DateTimeFormat('en-IN', {
      timeZone: this.TIMEZONE,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    });

    const dtfTime = new Intl.DateTimeFormat('en-IN', {
      timeZone: this.TIMEZONE,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const dtfNumbers = new Intl.DateTimeFormat('en-IN', {
      timeZone: this.TIMEZONE,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });

    const parts = dtfNumbers.formatToParts(now);
    const day = parseInt(parts.find((p) => p.type === 'day')?.value || '1', 10);
    const month = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10);
    const year = parseInt(parts.find((p) => p.type === 'year')?.value || '2026', 10);

    const fullParts = dtfDate.formatToParts(now);
    const dayOfWeek = fullParts.find((p) => p.type === 'weekday')?.value || 'Monday';
    const monthName = fullParts.find((p) => p.type === 'month')?.value || 'September';

    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return {
      date: now,
      year,
      month,
      day,
      dayOfWeek,
      monthName,
      formattedDate: `${day} ${monthName} ${year}`,
      formattedTime: dtfTime.format(now),
      timezone: this.TIMEZONE,
      dateKey,
    };
  }

  /**
   * Checks if user message is asking about current date, time, or day
   */
  public static isDateTimeQuestion(message: string): boolean {
    const q = message.toLowerCase();
    return (
      q.includes('aaj kya date') ||
      q.includes('aaj konsi date') ||
      q.includes('kya date hai') ||
      q.includes('kitna time') ||
      q.includes('what time') ||
      q.includes('what date') ||
      q.includes('what day is it') ||
      q.includes('aaj kaun sa din') ||
      q.includes('aaj ka din') ||
      q.includes('abhi ka time')
    );
  }

  /**
   * Generates a context string for prompt injection
   */
  public static getPromptTimeContext(): string {
    const t = this.getIndiaTime();
    return `Current Real-World Time: ${t.formattedTime}, Date: ${t.formattedDate} (${t.dayOfWeek}), Timezone: ${t.timezone} (India Standard Time). When answering user questions about the current date, time, or day, accurately use this real-world time.`;
  }
}
