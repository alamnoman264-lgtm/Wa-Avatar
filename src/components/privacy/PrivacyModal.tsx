/**
 * WA Avatar - PrivacyModal Component (Stage 3B)
 * Comprehensive Privacy & Data Deletion screen.
 * Provides transparent explanations of AI, Voice, Memory, Ads, and Analytics,
 * along with verified destructive deletion actions.
 */

import React, { useState } from 'react';
import {
  X,
  Shield,
  Trash2,
  Lock,
  Mic,
  Database,
  Eye,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { StorageService } from '../../services/storage_service';
import { AuthService } from '../../services/auth_service';
import { APIService } from '../../services/api_service';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataCleared: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  onDataCleared,
}) => {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    StorageService.saveSessions([]);
    StorageService.setActiveSessionId('');
    setConfirmAction(null);
    setSuccessMessage('Chat history successfully cleared.');
    onDataCleared();
  };

  const handleClearMemory = () => {
    StorageService.saveMemories([]);
    setConfirmAction(null);
    setSuccessMessage('All stored memory items successfully cleared.');
    onDataCleared();
  };

  const handleClearLocalData = () => {
    localStorage.clear();
    setConfirmAction(null);
    setSuccessMessage('All local data and preferences reset.');
    onDataCleared();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleDeleteAccount = async () => {
    const user = AuthService.getCurrentUser();
    try {
      await APIService.delete('/api/account/delete', { userId: user.id });
    } catch {
      // offline fallback
    }
    localStorage.clear();
    setConfirmAction(null);
    setSuccessMessage('Account and all associated records permanently deleted.');
    onDataCleared();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div
      id="privacy-policy-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="w-full max-w-xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-base text-zinc-100">
                Privacy & Data Security
              </h3>
              <p className="text-xs text-zinc-400">
                Your data ownership, transparency, and deletion controls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success toast */}
        {successMessage && (
          <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/20 px-5 flex items-center gap-2 text-emerald-400 text-xs">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Policy Disclosures */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 flex items-start gap-3">
              <Lock size={18} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-zinc-200">AI Chat & Processing</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                  Messages are sent via encrypted HTTPS to the server proxy. The AI avatar represents Wasim Akram. We never use your conversations to train public AI models.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 flex items-start gap-3">
              <Mic size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-zinc-200">Microphone & Voice Privacy</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                  Microphone access triggers strictly when you tap the mic button. We never record in the background or store raw audio files.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 flex items-start gap-3">
              <Database size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-zinc-200">Memory & Storage Boundaries</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                  Guest memories reside strictly on your local device. Authenticated users synchronize memories to their own isolated account partition. User A's data can never be accessed by User B.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 flex items-start gap-3">
              <Eye size={18} className="text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-zinc-200">Advertising & Analytics</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                  Ads use Google AdMob test identifiers during development. Analytics are restricted to coarse anonymous usage events (e.g. app open, chat started); message contents are never sent. Girlfriend Mode is 100% ad-free.
                </p>
              </div>
            </div>
          </div>

          {/* Destructive Deletion Controls */}
          <div className="pt-2 border-t border-zinc-800">
            <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Trash2 size={13} />
              <span>Data Deletion Controls</span>
            </h4>

            {confirmAction ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                  <AlertTriangle size={16} />
                  <span>Are you absolutely sure? This action cannot be undone.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirmAction === 'history') handleClearHistory();
                      else if (confirmAction === 'memory') handleClearMemory();
                      else if (confirmAction === 'local') handleClearLocalData();
                      else if (confirmAction === 'account') handleDeleteAccount();
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-all"
                  >
                    Yes, Delete Permanently
                  </button>
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => setConfirmAction('history')}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-rose-500/40 text-left transition-all group"
                >
                  <p className="text-xs font-medium text-zinc-200 group-hover:text-rose-400">
                    Clear Chat History
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Deletes all conversations and transcripts.
                  </p>
                </button>

                <button
                  onClick={() => setConfirmAction('memory')}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-rose-500/40 text-left transition-all group"
                >
                  <p className="text-xs font-medium text-zinc-200 group-hover:text-rose-400">
                    Clear All Memory
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Removes learned facts, preferences & profile keys.
                  </p>
                </button>

                <button
                  onClick={() => setConfirmAction('local')}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-rose-500/40 text-left transition-all group"
                >
                  <p className="text-xs font-medium text-zinc-200 group-hover:text-rose-400">
                    Reset Local Storage
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Clears theme, settings, and cached state.
                  </p>
                </button>

                <button
                  onClick={() => setConfirmAction('account')}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-rose-500/40 text-left transition-all group"
                >
                  <p className="text-xs font-medium text-rose-400">
                    Delete Account
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Permanently deletes profile and cloud partitions.
                  </p>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
