/**
 * WA Avatar - Local Memory Repository (Stage 3B)
 * Handles client-side local memory persistence per user ID boundary.
 */

import { MemoryItem, MemoryCategory } from '../../types';
import { StorageService } from '../storage_service';

export class LocalMemoryRepository {
  public static getMemories(userId: string): MemoryItem[] {
    const all = StorageService.getMemories();
    return all.filter((m) => m.userId === userId);
  }

  public static saveMemory(
    userId: string,
    category: MemoryCategory,
    key: string,
    value: string,
    label?: string
  ): MemoryItem[] {
    const all = StorageService.getMemories();
    const now = Date.now();
    const trimmedVal = value.trim();

    const existingIndex = all.findIndex(
      (m) =>
        m.userId === userId &&
        (m.key.toLowerCase() === key.toLowerCase() ||
          (m.category === category && m.value.toLowerCase() === trimmedVal.toLowerCase()))
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
        id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        category,
        key,
        value: trimmedVal,
        label: label || key,
        createdAt: now,
        updatedAt: now,
      };
      updated = [newItem, ...all];
    }

    StorageService.saveMemories(updated);
    return updated.filter((m) => m.userId === userId);
  }

  public static deleteMemory(userId: string, memoryId: string): MemoryItem[] {
    const all = StorageService.getMemories();
    const updated = all.filter((m) => !(m.userId === userId && m.id === memoryId));
    StorageService.saveMemories(updated);
    return updated.filter((m) => m.userId === userId);
  }

  public static clearAll(userId: string): void {
    const all = StorageService.getMemories();
    const remaining = all.filter((m) => m.userId !== userId);
    StorageService.saveMemories(remaining);
  }
}
