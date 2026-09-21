/**
 * WA Avatar - HistoryDrawer
 * Drawer & modal component to view, open, rename, and delete previous chat conversations
 */

import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  Plus,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { ChatSession } from '../../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAllSessions: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onDeleteSession,
  onClearAllSessions,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const startRename = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const saveRename = (sessionId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(sessionId, editTitle.trim());
    }
    setEditingId(null);
  };

  const formatDate = (ts: number) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div
      id="history-drawer-overlay"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-start animate-fade-in"
      onClick={onClose}
    >
      <div
        id="history-drawer-content"
        className="w-full max-w-sm h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
              Chat History
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              {sessions.length}
            </span>
          </div>
          <button
            id="close-history-drawer"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="py-3">
          <button
            id="history-new-chat-btn"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Plus size={16} />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 py-1">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-zinc-400 text-center px-4">
              <Clock size={32} className="mb-2 opacity-50" />
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                No past conversations
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Start a chat with Wasim to see your history saved locally.
              </p>
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              const isEditing = editingId === s.id;

              return (
                <div
                  key={s.id}
                  id={`session-item-${s.id}`}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectSession(s.id);
                      onClose();
                    }
                  }}
                  className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-100'
                      : 'bg-zinc-50/50 dark:bg-zinc-800/40 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  {isEditing ? (
                    <form
                      onSubmit={(e) => saveRename(s.id, e)}
                      className="flex items-center gap-1 w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                        className="flex-1 text-sm bg-white dark:bg-zinc-900 border border-blue-500 rounded px-2 py-1 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1 text-zinc-400 hover:text-zinc-600 rounded"
                      >
                        <X size={16} />
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-sm font-medium truncate">{s.title}</p>
                        <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                          <span>{formatDate(s.updatedAt || s.createdAt)}</span>
                          <span>•</span>
                          <span>{s.messages.length} messages</span>
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          id={`rename-session-${s.id}`}
                          onClick={(e) => startRename(s, e)}
                          title="Rename"
                          className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          id={`delete-session-${s.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(s.id);
                          }}
                          title="Delete"
                          className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-rose-500"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {sessions.length > 0 && (
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
            {showClearConfirm ? (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs text-rose-800 dark:text-rose-200 font-medium mb-2">
                  <AlertTriangle size={14} />
                  <span>Clear all conversation history?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClearAllSessions();
                      setShowClearConfirm(false);
                    }}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium"
                  >
                    Yes, Clear All
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="clear-all-history-button"
                onClick={() => setShowClearConfirm(true)}
                className="w-full py-2 text-xs font-medium text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center gap-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Trash2 size={14} />
                <span>Clear All Chats</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
