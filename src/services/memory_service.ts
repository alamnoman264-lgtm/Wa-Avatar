/**
 * WA Avatar - Memory Service (Stage 2)
 * Comprehensive long-term memory system with user-isolation, categories, confirmation, and settings.
 */

import { MemoryItem, MemoryCategory, UserMode } from '../types';
import { StorageService } from './storage_service';

export const MemoryService = {
  /**
   * Get all stored memories for a specific user ID
   */
  getMemoriesForUser(userId: string): MemoryItem[] {
    const all = StorageService.getMemories();
    return all.filter((m) => m.userId === userId);
  },

  /**
   * Helper to get all memories across all users (for backup or admin)
   */
  getAllMemories(): MemoryItem[] {
    return StorageService.getMemories();
  },

  /**
   * Adds or updates a memory item for a given user
   */
  addOrUpdateMemory(
    userId: string,
    category: MemoryCategory,
    key: string,
    value: string,
    label?: string
  ): MemoryItem[] {
    const settings = StorageService.getSettings();
    if (!settings.memoryEnabled) {
      return this.getMemoriesForUser(userId);
    }

    const all = StorageService.getMemories();
    const now = Date.now();
    const trimmedVal = value.trim();

    // Check if memory for this user & key already exists
    const existingIndex = all.findIndex(
      (m) => m.userId === userId && (m.key.toLowerCase() === key.toLowerCase() || (m.category === category && m.value.toLowerCase() === trimmedVal.toLowerCase()))
    );

    let updated: MemoryItem[];
    if (existingIndex !== -1) {
      updated = [...all];
      updated[existingIndex] = {
        ...updated[existingIndex],
        value: trimmedVal,
        label: label || updated[existingIndex].label || key,
        category,
        updatedAt: now,
      };
    } else {
      const newItem: MemoryItem = {
        id: `mem_${now}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        category,
        key,
        value: trimmedVal,
        label: label || key,
        createdAt: now,
        updatedAt: now,
      };
      // Keep up to 100 memories total
      updated = [newItem, ...all].slice(0, 100);
    }

    StorageService.saveMemories(updated);
    return updated.filter((m) => m.userId === userId);
  },

  /**
   * Deletes a specific memory item by ID
   */
  deleteMemory(id: string, userId?: string): MemoryItem[] {
    const all = StorageService.getMemories();
    const updated = all.filter((m) => m.id !== id);
    StorageService.saveMemories(updated);
    return userId ? updated.filter((m) => m.userId === userId) : updated;
  },

  /**
   * Clears memories for a given user
   */
  clearUserMemories(userId: string): void {
    const all = StorageService.getMemories();
    const updated = all.filter((m) => m.userId !== userId);
    StorageService.saveMemories(updated);
  },

  /**
   * Clears all memories completely
   */
  clearAll(): void {
    StorageService.clearMemories();
  },

  /**
   * Selects relevant memories for Gemini context
   * - If memory is disabled, returns []
   * - Strictly enforces user separation (Normal users NEVER see Girlfriend memories)
   */
  getRelevantMemoriesForPrompt(
    userId: string,
    userMessage: string,
    userMode: UserMode = 'normal'
  ): string[] {
    const settings = StorageService.getSettings();
    if (!settings.memoryEnabled) {
      return [];
    }

    // Isolate by user ID
    const userMemories = this.getMemoriesForUser(userId);
    if (userMemories.length === 0) return [];

    const promptLower = userMessage.toLowerCase();
    const relevant: string[] = [];

    // Prioritize user's name
    const nameMem = userMemories.find(
      (m) => m.key === 'name' || m.key === 'userName'
    );
    if (nameMem) {
      relevant.push(
        userMode === 'girlfriend'
          ? `User's Name: ${nameMem.value}`
          : `User's Name: ${nameMem.value}`
      );
    }

    // Match keywords or questions
    for (const mem of userMemories) {
      if (mem.key === 'name' || mem.key === 'userName') continue;

      const valLower = mem.value.toLowerCase();
      const labelLower = (mem.label || mem.key).toLowerCase();

      if (
        promptLower.includes(labelLower) ||
        promptLower.includes(valLower) ||
        promptLower.includes('remember') ||
        promptLower.includes('yaad') ||
        promptLower.includes('mera') ||
        promptLower.includes('meri') ||
        promptLower.includes('mujhe') ||
        promptLower.includes('about me') ||
        promptLower.includes('favourite') ||
        promptLower.includes('favorite')
      ) {
        relevant.push(`${mem.label || mem.key}: ${mem.value}`);
      }
    }

    // Cap at most 5 relevant items for concise context
    return relevant.slice(0, 5);
  },
};
