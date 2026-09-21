/**
 * WA Avatar - Storage Service (Stage 2)
 * Local persistence management for chats, settings, user identity, and memory
 */

import { ChatSession, MemoryItem, UserSettings } from '../types';

const STORAGE_KEYS = {
  SESSIONS: 'wa_avatar_sessions',
  ACTIVE_SESSION_ID: 'wa_avatar_active_session_id',
  SETTINGS: 'wa_avatar_settings',
  MEMORIES: 'wa_avatar_memories',
  GUEST_USER_ID: 'wa_guest_user_id',
  SPECIAL_SESSION_TOKEN: 'wa_special_session_token',
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  language: 'auto',
  memoryEnabled: true,
  soundEnabled: false,
  userMode: 'normal',
  specialAccessVerified: false,
  voice: {
    voiceInputEnabled: true,
    voiceResponseEnabled: false,
    autoSpeak: false,
    speechSpeed: 1.0,
    speechVolume: 1.0,
    selectedVoiceProfile: 'wasim_official',
  },
};

export const StorageService = {
  // --- User Identity ---
  getGuestUserId(): string {
    try {
      let id = localStorage.getItem(STORAGE_KEYS.GUEST_USER_ID);
      if (!id) {
        id = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem(STORAGE_KEYS.GUEST_USER_ID, id);
      }
      return id;
    } catch {
      return 'guest_local';
    }
  },

  getSpecialSessionToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.SPECIAL_SESSION_TOKEN);
    } catch {
      return null;
    }
  },

  setSpecialSessionToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.SPECIAL_SESSION_TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEYS.SPECIAL_SESSION_TOKEN);
      }
    } catch (e) {
      console.error('Failed to set special session token:', e);
    }
  },

  // --- Chat Sessions ---
  getSessions(): ChatSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load chat sessions:', e);
      return [];
    }
  },

  saveSessions(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save chat sessions:', e);
    }
  },

  getActiveSessionId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
    } catch {
      return null;
    }
  },

  setActiveSessionId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
      }
    } catch (e) {
      console.error('Failed to set active session ID:', e);
    }
  },

  // --- Settings ---
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        voice: {
          ...DEFAULT_SETTINGS.voice,
          ...(parsed.voice || {}),
        },
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  // --- Memory ---
  getMemories(): MemoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveMemories(memories: MemoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    } catch (e) {
      console.error('Failed to save memories:', e);
    }
  },

  clearMemories(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.MEMORIES);
    } catch (e) {
      console.error('Failed to clear memories:', e);
    }
  },

  clearAllChats(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
    } catch (e) {
      console.error('Failed to clear chat sessions:', e);
    }
  },
};

