/**
 * WA Avatar - Centralized APIService (Stage 3B)
 * Unified interface for backend network interactions with structured error handling
 * for 401 Unauthorized, 403 Forbidden, 429 Rate Limit, 500 Server Error, and offline timeouts.
 */

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  friendlyMessage?: string;
  status: number;
}

export class APIService {
  private static readonly TIMEOUT_MS = 25000;

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const response = await fetch(endpoint, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });

      clearTimeout(timeoutId);
      const status = response.status;
      let json: any = null;

      try {
        json = await response.json();
      } catch {
        json = null;
      }

      if (response.ok) {
        return {
          data: json as T,
          status,
        };
      }

      // Handle specific HTTP error status codes with friendly Indian context
      let friendlyMessage = 'Kuch technical issue aaya bhai. Kripya dobara try karein.';

      if (status === 401) {
        friendlyMessage = 'Verification ya access code sahi nahi hai bhai.';
      } else if (status === 403) {
        friendlyMessage = 'Yeh feature access karne ki permission nahi hai.';
      } else if (status === 429) {
        friendlyMessage =
          json?.message ||
          'Bohat tezi se messages bheje gaye hain bhai. Ek minute ruk kar aaram se baat karo.';
      } else if (status === 503) {
        friendlyMessage =
          json?.friendlyMessage || 'AI Service abhi start ho rahi hai. Kripya thodi der mein try karein.';
      } else if (status >= 500) {
        friendlyMessage =
          json?.friendlyMessage || 'Server response generate nahi kar saka. Please refresh or retry.';
      }

      return {
        error: json?.error || `HTTP ${status}`,
        friendlyMessage: json?.friendlyMessage || json?.message || friendlyMessage,
        status,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        return {
          error: 'Timeout',
          friendlyMessage: 'Server response aane mein time lag gaya. Internet check karo bhai.',
          status: 408,
        };
      }

      return {
        error: err?.message || 'Network Failure',
        friendlyMessage: 'Network connection check karo bhai aur phir try karo.',
        status: 0,
      };
    }
  }

  // Generic methods
  public static get<T>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public static post<T>(endpoint: string, body: any, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), headers });
  }

  public static delete<T>(endpoint: string, body?: any, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }
}
