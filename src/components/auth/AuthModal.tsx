/**
 * WA Avatar - AuthModal Component (Stage 3B)
 * Optional authentication management supporting Google Sign-In, Email, and Guest Mode.
 * Preserves Guest Mode as primary and frictionless.
 */

import React, { useState } from 'react';
import { X, User, Mail, LogIn, LogOut, CheckCircle, Shield } from 'lucide-react';
import { AuthService } from '../../services/auth_service';
import { UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserChanged: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isEmailMode, setIsEmailMode] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    const user = await AuthService.signInWithGoogle({
      email: 'wasim.explorer@gmail.com',
      name: 'Google Explorer',
    });
    onUserChanged(user);
    onClose();
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    const user = await AuthService.signInWithEmail(emailInput.trim(), nameInput.trim());
    onUserChanged(user);
    onClose();
  };

  const handleSignOut = async () => {
    const guestUser = await AuthService.signOut();
    onUserChanged(guestUser);
    onClose();
  };

  return (
    <div
      id="auth-login-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-scale-up">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <User size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-100">Account & Profile</h3>
              <p className="text-[11px] text-zinc-400">
                {currentUser.isGuest ? 'Browsing as Guest' : `Signed in as ${currentUser.name}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Current profile badge */}
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-200">{currentUser.name}</p>
                <p className="text-[10px] text-zinc-500">
                  {currentUser.isGuest ? 'Local-only data (No account required)' : currentUser.email}
                </p>
              </div>
            </div>

            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${currentUser.isGuest ? 'bg-zinc-800 text-zinc-400' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              {currentUser.isGuest ? 'Guest' : 'Verified'}
            </span>
          </div>

          {currentUser.isGuest ? (
            <div className="space-y-3 pt-1">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Login is completely optional. Signing in enables cloud synchronization of chat and memories across your devices.
              </p>

              {/* Google Sign-in button */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 flex items-center justify-center gap-2 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Email sign in toggle */}
              {isEmailMode ? (
                <form onSubmit={handleEmailSignIn} className="space-y-2 pt-1">
                  <input
                    type="text"
                    placeholder="Your Name (Optional)"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium transition-all"
                  >
                    Sign In with Email
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsEmailMode(true)}
                  className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium border border-zinc-800 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Mail size={13} />
                  <span>Continue with Email</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
                <CheckCircle size={15} className="shrink-0" />
                <span>Cloud synchronization active for this account.</span>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 text-xs font-medium border border-zinc-700 flex items-center justify-center gap-1.5 transition-all"
              >
                <LogOut size={14} />
                <span>Switch to Guest Mode</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
