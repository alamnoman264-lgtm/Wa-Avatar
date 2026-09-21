/**
 * WA Avatar - SpecialAccessModal (Stage 2)
 * Secure verification screen for Girlfriend Mode / Special Access.
 */

import React, { useState } from 'react';
import { X, Lock, KeyRound, AlertCircle, Heart, CheckCircle2, Shield } from 'lucide-react';
import { GeminiService } from '../../services/gemini_service';
import { UserMode } from '../../types';

interface SpecialAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserMode: UserMode;
  onVerificationSuccess: (token: string) => void;
  onExitSpecialMode: () => void;
}

export const SpecialAccessModal: React.FC<SpecialAccessModalProps> = ({
  isOpen,
  onClose,
  currentUserMode,
  onVerificationSuccess,
  onExitSpecialMode,
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAlreadyGirlfriend = currentUserMode === 'girlfriend';

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await GeminiService.verifySpecialAccess(code.trim());
    setIsLoading(false);

    if (result.success && result.token) {
      setSuccessMessage('Special Mode verified successfully ❤️');
      setTimeout(() => {
        onVerificationSuccess(result.token!);
        setCode('');
        setSuccessMessage(null);
        onClose();
      }, 900);
    } else {
      setErrorMessage(result.message || 'Invalid passcode. Please try again.');
    }
  };

  const handleExit = () => {
    onExitSpecialMode();
    onClose();
  };

  return (
    <div
      id="special-access-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              {isAlreadyGirlfriend ? <Heart size={16} /> : <Lock size={16} />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {isAlreadyGirlfriend ? 'Special Access Active' : 'Special Access Verification'}
              </h3>
              <p className="text-xs text-zinc-400">
                {isAlreadyGirlfriend ? 'Private Mode enabled' : 'Authorized personal access only'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        {isAlreadyGirlfriend ? (
          <div className="space-y-4 pt-1">
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-2 text-rose-900 dark:text-rose-200">
              <div className="flex items-center gap-2 font-medium text-xs">
                <Heart size={15} className="text-rose-500 fill-rose-500" />
                <span>Special Mode (Ashiya) is currently active.</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
                Wasim&apos;s avatar communicates with personal familiarity, warmth, and full memory synchronization.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleExit}
                className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Shield size={14} />
                <span>Exit Special Mode & Lock</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4 pt-1">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Enter your secret authorization passcode to unlock dedicated personal mode.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <KeyRound size={13} className="text-zinc-400" />
                <span>Secret Passcode</span>
              </label>
              <input
                type="password"
                autoComplete="off"
                placeholder="Enter secret code..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Error or Success feedback */}
            {errorMessage && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 size={14} className="flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="py-2 px-3 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!code.trim() || isLoading}
                className="py-2 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                {isLoading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <KeyRound size={13} />
                    <span>Authorize</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
