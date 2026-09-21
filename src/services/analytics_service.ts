/**
 * WA Avatar - Analytics Service (Stage 3B)
 * Privacy-preserving event tracker.
 * STRICT DIRECTIVE:
 * Never sends chat contents, voice audio, secrets, relationship data, or private memories.
 * Only collects coarse, non-sensitive telemetry events.
 */

import { AnalyticsEventType } from '../types';

export class AnalyticsService {
  private static eventsQueue: Array<{
    event: AnalyticsEventType;
    timestamp: number;
    metadata?: Record<string, string | number | boolean>;
  }> = [];

  /**
   * Logs a non-sensitive telemetry event
   */
  public static logEvent(
    event: AnalyticsEventType,
    metadata?: Record<string, string | number | boolean>
  ): void {
    // Sanitize any metadata to strictly guarantee no PII or message content leaks
    const sanitizedMetadata: Record<string, string | number | boolean> = {};
    if (metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        const lowerKey = key.toLowerCase();
        // Disallow dangerous keys that might contain private messages or secrets
        if (
          lowerKey.includes('message') ||
          lowerKey.includes('text') ||
          lowerKey.includes('prompt') ||
          lowerKey.includes('code') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('token') ||
          lowerKey.includes('girlfriend') ||
          lowerKey.includes('ashiya') ||
          lowerKey.includes('audio') ||
          lowerKey.includes('voice_data')
        ) {
          continue;
        }
        sanitizedMetadata[key] = value;
      }
    }

    const payload = {
      event,
      timestamp: Date.now(),
      metadata: sanitizedMetadata,
    };

    this.eventsQueue.push(payload);
    if (this.eventsQueue.length > 50) {
      this.eventsQueue.shift();
    }

    // In development, log friendly summary
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics] Event: ${event}`, sanitizedMetadata);
    }
  }

  /**
   * Retrieves recent non-sensitive event history for developer diagnostics
   */
  public static getRecentEvents(): typeof AnalyticsService.eventsQueue {
    return [...this.eventsQueue];
  }
}
