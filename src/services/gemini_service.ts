/**
 * WA Avatar - Gemini Service Frontend Client (Stage 2)
 * Proxies chat, memory, title generation, and special verification through backend API
 */

import {
  SendMessageRequest,
  SendMessageResponse,
  MemoryCategory,
  UserMode,
} from '../types';

export const GeminiService = {
  /**
   * Sends user message to server /api/chat with full Stage 2 context
   */
  async sendMessage(params: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.friendlyMessage ||
            errorData.error ||
            'AI response generate karne mein issue aaya bhai.'
        );
      }

      const data = await response.json();
      return {
        reply: data.reply || '',
        avatarState: data.avatarState || 'idle',
        detectedMemories: data.detectedMemories || [],
        newConversationSummary: data.newConversationSummary,
      };
    } catch (error: any) {
      console.error('GeminiService sendMessage failed:', error);
      throw error;
    }
  },

  /**
   * Verifies Girlfriend Mode / Special Access code against backend
   */
  async verifySpecialAccess(code: string): Promise<{
    success: boolean;
    message: string;
    userMode?: UserMode;
    token?: string;
  }> {
    try {
      const response = await fetch('/api/verify-special', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message || 'Special mode activated.',
          userMode: data.userMode || 'girlfriend',
          token: data.token,
        };
      }

      return {
        success: false,
        message: data.message || 'Verification failed.',
      };
    } catch (err) {
      console.error('Special access verification network error:', err);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  },

  /**
   * Generates conversation summary for long chats
   */
  async summarizeConversation(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  ): Promise<string> {
    try {
      const response = await fetch('/api/summarize-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) return '';
      const data = await response.json().catch(() => ({ summary: '' }));
      return data.summary || '';
    } catch {
      return '';
    }
  },

  /**
   * Generates a concise title for new chat sessions
   */
  async generateTitle(firstMessage: string): Promise<string> {
    try {
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstMessage }),
      });

      if (!response.ok) {
        return this.fallbackTitle(firstMessage);
      }

      const data = await response.json();
      return data.title || this.fallbackTitle(firstMessage);
    } catch {
      return this.fallbackTitle(firstMessage);
    }
  },

  fallbackTitle(message: string): string {
    const cleaned = message.trim().replace(/[^\w\s]/gi, '');
    const words = cleaned.split(/\s+/).slice(0, 3).join(' ');
    return words || 'Conversation';
  },
};
