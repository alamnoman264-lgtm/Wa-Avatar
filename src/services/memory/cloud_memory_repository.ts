/**
 * WA Avatar - Cloud Memory Repository (Stage 3B)
 * Provides cloud memory synchronization for authenticated users.
 * Strictly uses userId/accountId as the ownership boundary.
 * Never allows User A to view or modify User B's memories.
 */

import { MemoryItem } from '../../types';
import { LocalMemoryRepository } from './local_memory_repository';

export class CloudMemoryRepository {
  /**
   * Fetches remote memories for authenticated user with fallback to local cache
   */
  public static async fetchMemories(userId: string): Promise<MemoryItem[]> {
    if (!userId || userId.startsWith('guest_')) {
      return LocalMemoryRepository.getMemories(userId);
    }

    try {
      const res = await fetch(`/api/memory?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        return data.memories || [];
      }
    } catch {
      // Offline fallback
    }

    return LocalMemoryRepository.getMemories(userId);
  }

  /**
   * Synchronizes local and remote memories for authenticated users
   */
  public static async syncMemories(userId: string, localMemories: MemoryItem[]): Promise<MemoryItem[]> {
    if (!userId || userId.startsWith('guest_')) {
      return localMemories;
    }

    try {
      const res = await fetch('/api/memory/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          memories: localMemories,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.memories || localMemories;
      }
    } catch {
      // Graceful offline fallback
    }

    return localMemories;
  }
}
