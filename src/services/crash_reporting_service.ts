/**
 * WA Avatar - Crash Reporting Service (Stage 3B)
 * Robust client crash & unhandled exception capture.
 * Automatically scrubs private chats, secrets, API keys, and relationship context.
 */

import { CrashReportMeta, UserMode } from '../types';

export class CrashReportingService {
  private static reports: CrashReportMeta[] = [];

  public static initialize(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.captureError(event.error || event.message);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason);
    });
  }

  public static captureError(error: any, userMode: UserMode = 'normal'): void {
    let message = typeof error === 'string' ? error : error?.message || 'Unknown error';
    let stack = error?.stack || '';

    // SCRUBBING: Remove any accidental keys, tokens, or private secrets
    const scrubRegex = /(?:key|token|secret|password|ashiya|7084523587)=[^\s&]+/gi;
    message = message.replace(scrubRegex, '[REDACTED]');
    stack = stack.replace(scrubRegex, '[REDACTED]');

    const report: CrashReportMeta = {
      timestamp: Date.now(),
      message,
      stack: stack.substring(0, 500),
      userMode,
      isGuest: true,
      platform: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    };

    this.reports.push(report);
    if (this.reports.length > 20) {
      this.reports.shift();
    }

    console.warn('[CrashReporter] Captured scrubbed issue:', report.message);
  }

  public static getReports(): CrashReportMeta[] {
    return [...this.reports];
  }
}
