/**
 * WA Avatar - AuthPlaceholderModal
 * Guest mode & Stage 1 authentication placeholder modal
 */

import React from 'react';
import { X, UserCheck, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthPlaceholderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
}

export const AuthPlaceholderModal: React.FC<AuthPlaceholderModalProps> = ({
  isOpen,
  onClose,
  onContinueAsGuest,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="auth-modal-card"
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X size={18} />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <UserCheck size={24} />
          </div>

          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            Guest Mode Active
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs">
            You can chat with Wasim Akram&apos;s AI Avatar instantly without creating an account or logging in.
          </p>
        </div>

        {/* Stage 1 vs Stage 2 Info Box */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
            <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Stage 1 (Current):
              </span>
              <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                Full access to text chat, Wasim personality, local chat history, and basic memory.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
            <Sparkles size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-blue-900 dark:text-blue-200">
                Stage 2 (Upcoming):
              </span>
              <p className="text-blue-700 dark:text-blue-300 mt-0.5">
                Full cloud account authentication, cross-device synchronization, and voice cloning.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            id="continue-as-guest-btn"
            onClick={() => {
              onContinueAsGuest();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-sm"
          >
            Continue as Guest
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
