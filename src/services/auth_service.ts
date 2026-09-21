/**
 * WA Avatar - Authentication Service (Stage 3B)
 * Supports Guest Mode (primary, frictionless) along with Google Sign-In
 * and Email authentication architecture.
 */

import { UserProfile } from '../types';
import { StorageService } from './storage_service';

const STORAGE_KEY_AUTH_USER = 'wa_avatar_auth_user_v3';

export class AuthService {
  private static listeners: Array<(user: UserProfile) => void> = [];

  public static subscribe(listener: (user: UserProfile) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notifyListeners(user: UserProfile): void {
    for (const listener of this.listeners) {
      try {
        listener(user);
      } catch (err) {
        console.error('Auth listener error:', err);
      }
    }
  }

  /**
   * Retrieves current user profile. Default is always Guest Mode.
   */
  public static getCurrentUser(): UserProfile {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (raw) {
        return JSON.parse(raw) as UserProfile;
      }
    } catch {
      // fallback
    }

    const guestId = StorageService.getGuestUserId();
    const guestUser: UserProfile = {
      id: guestId,
      name: 'Guest Explorer',
      isGuest: true,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      provider: 'guest',
    };

    return guestUser;
  }

  /**
   * Authenticates via Google Sign-In architecture
   */
  public static async signInWithGoogle(credential?: {
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<UserProfile> {
    const user: UserProfile = {
      id: `usr_google_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: credential?.name || 'Google User',
      email: credential?.email || 'user@gmail.com',
      avatarUrl: credential?.avatarUrl,
      isGuest: false,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      provider: 'google',
    };

    localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    this.notifyListeners(user);
    return user;
  }

  /**
   * Authenticates via Email architecture
   */
  public static async signInWithEmail(email: string, name?: string): Promise<UserProfile> {
    const user: UserProfile = {
      id: `usr_email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name || email.split('@')[0] || 'Member',
      email,
      isGuest: false,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      provider: 'email',
    };

    localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    this.notifyListeners(user);
    return user;
  }

  /**
   * Switches back to Guest Mode
   */
  public static async signOut(): Promise<UserProfile> {
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    const guestUser = this.getCurrentUser();
    this.notifyListeners(guestUser);
    return guestUser;
  }

  /**
   * Checks if current user is Guest
   */
  public static isGuest(): boolean {
    return this.getCurrentUser().isGuest;
  }
}
