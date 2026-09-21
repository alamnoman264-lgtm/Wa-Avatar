/**
 * WA Avatar - AvatarWidget (Stage 2)
 * Rich interactive visual avatar representation with state transitions:
 * idle, listening, thinking, speaking, happy, excited, confused, sad, empathetic, error.
 */

import React from 'react';
import { AvatarState } from '../../types';

interface AvatarWidgetProps {
  state?: AvatarState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatusBadge?: boolean;
  showStateLabel?: boolean;
  className?: string;
  onClick?: () => void;
}

export const AvatarWidget: React.FC<AvatarWidgetProps> = ({
  state = 'idle',
  size = 'md',
  showStatusBadge = false,
  showStateLabel = false,
  className = '',
  onClick,
}) => {
  // Dimension mapping
  const sizeClasses = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-28 h-28 text-xl',
  }[size];

  // State-based ring & aura styling
  const stateRings: Record<AvatarState, string> = {
    idle: 'ring-1 ring-zinc-300/80 dark:ring-zinc-700/80',
    listening: 'ring-2 ring-emerald-500 ring-offset-2 animate-pulse dark:ring-offset-zinc-950',
    thinking: 'ring-2 ring-blue-500 ring-offset-2 animate-pulse dark:ring-offset-zinc-950',
    speaking: 'ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-zinc-950 shadow-lg shadow-violet-500/20',
    happy: 'ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-zinc-950 shadow-md shadow-amber-400/20',
    excited: 'ring-2 ring-amber-500 ring-offset-2 animate-bounce dark:ring-offset-zinc-950',
    confused: 'ring-2 ring-orange-400 ring-offset-1 dark:ring-offset-zinc-950',
    sad: 'ring-2 ring-slate-400 ring-offset-1 opacity-90',
    empathetic: 'ring-2 ring-rose-400 ring-offset-2 dark:ring-offset-zinc-950 shadow-md shadow-rose-400/30',
    sleepy: 'ring-1 ring-zinc-500/50 opacity-75',
    error: 'ring-2 ring-red-500 ring-offset-2 animate-pulse dark:ring-offset-zinc-950',
  };

  const badgeColors: Record<AvatarState, string> = {
    idle: 'bg-emerald-500',
    listening: 'bg-emerald-400 animate-ping',
    thinking: 'bg-blue-400 animate-pulse',
    speaking: 'bg-violet-500 animate-pulse',
    happy: 'bg-amber-400',
    excited: 'bg-amber-500',
    confused: 'bg-orange-400',
    sad: 'bg-slate-400',
    empathetic: 'bg-rose-400',
    sleepy: 'bg-indigo-400',
    error: 'bg-red-500',
  };

  const stateLabels: Record<AvatarState, string> = {
    idle: 'Online',
    listening: 'Listening...',
    thinking: 'Thinking...',
    speaking: 'Speaking...',
    happy: 'Feeling Good',
    excited: 'Excited!',
    confused: 'Hmm...',
    sad: 'Concerned',
    empathetic: 'Empathetic',
    sleepy: 'Resting',
    error: 'Error',
  };

  return (
    <div
      id={`avatar-widget-${size}`}
      onClick={onClick}
      className={`relative inline-flex flex-col items-center select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div
        className={`relative rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-zinc-800 to-zinc-950 text-white font-medium shadow-md transition-all duration-300 ${sizeClasses} ${
          stateRings[state] || stateRings.idle
        }`}
      >
        {/* Stylized Avatar Illustration for Wasim Akram */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full object-cover"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2a075" />
              <stop offset="100%" stopColor="#c78054" />
            </linearGradient>
            <linearGradient id="jacketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={state === 'empathetic' ? '#9d174d' : '#0284c7'} />
              <stop offset="100%" stopColor={state === 'empathetic' ? '#831843' : '#0369a1'} />
            </linearGradient>
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1c1917" />
              <stop offset="100%" stopColor="#0c0a09" />
            </linearGradient>
          </defs>

          {/* Background backdrop */}
          <rect width="100" height="100" fill="url(#bgGrad)" />

          {/* Shoulders & Jacket */}
          <path
            d="M20 95 C22 75, 34 68, 50 68 C66 68, 78 75, 80 95 Z"
            fill="url(#jacketGrad)"
          />
          {/* Inner Shirt / Collar */}
          <polygon points="43,68 50,82 57,68" fill="#f8fafc" />

          {/* Neck */}
          <rect x="43" y="52" width="14" height="18" rx="2" fill="url(#skinGrad)" />

          {/* Head & Face */}
          <ellipse cx="50" cy="42" rx="19" ry="22" fill="url(#skinGrad)" />

          {/* Eyes (adapted slightly based on state) */}
          {state === 'sad' ? (
            <>
              <ellipse cx="43" cy="42" rx="2.5" ry="1.8" fill="#1c1917" />
              <ellipse cx="57" cy="42" rx="2.5" ry="1.8" fill="#1c1917" />
            </>
          ) : state === 'happy' || state === 'excited' ? (
            <>
              {/* Smiling eyes */}
              <path d="M40 40 Q43 36 46 40" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M54 40 Q57 36 60 40" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <ellipse cx="43" cy="40" rx="2.5" ry="2.2" fill="#1c1917" />
              <ellipse cx="57" cy="40" rx="2.5" ry="2.2" fill="#1c1917" />
              <circle cx="44" cy="39" r="0.8" fill="#ffffff" />
              <circle cx="58" cy="39" r="0.8" fill="#ffffff" />
            </>
          )}

          {/* Eyebrows */}
          {state === 'confused' ? (
            <>
              <path d="M38 36 Q43 33 47 37" stroke="#1c1917" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M53 31 Q57 30 62 33" stroke="#1c1917" strokeWidth="1.8" strokeLinecap="round" />
            </>
          ) : state === 'sad' ? (
            <>
              <path d="M38 32 Q43 35 47 36" stroke="#1c1917" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M53 36 Q57 35 62 32" stroke="#1c1917" strokeWidth="1.8" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M38 34 Q43 32 47 34" stroke="#1c1917" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M53 34 Q57 32 62 34" stroke="#1c1917" strokeWidth="1.8" strokeLinecap="round" />
            </>
          )}

          {/* Nose */}
          <path
            d="M50 40 L49 48 L52 48"
            stroke="#b86f45"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Mouth (expressions) */}
          {state === 'happy' || state === 'excited' ? (
            <path
              d="M42 53 Q50 61 58 53 Z"
              fill="#873e23"
              stroke="#873e23"
              strokeWidth="1"
            />
          ) : state === 'speaking' ? (
            <ellipse cx="50" cy="55" rx="4.5" ry="3.5" fill="#873e23" />
          ) : state === 'sad' ? (
            <path
              d="M44 56 Q50 52 56 56"
              stroke="#873e23"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            /* Friendly gentle smile (default) */
            <path
              d="M44 54 Q50 59 56 54"
              stroke="#873e23"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Empathetic cheek blush */}
          {state === 'empathetic' && (
            <>
              <circle cx="37" cy="46" r="3.5" fill="#f43f5e" opacity="0.3" />
              <circle cx="63" cy="46" r="3.5" fill="#f43f5e" opacity="0.3" />
            </>
          )}

          {/* Modern Haircut */}
          <path
            d="M30 38 C28 24, 38 15, 50 15 C62 15, 72 24, 70 38 C68 31, 64 25, 52 23 C42 22, 34 29, 30 38 Z"
            fill="url(#hairGrad)"
          />
          {/* Sideburns */}
          <path d="M31 36 L32 45 L35 41 Z" fill="url(#hairGrad)" />
          <path d="M69 36 L68 45 L65 41 Z" fill="url(#hairGrad)" />
        </svg>

        {/* State Overlays */}
        {state === 'thinking' && (
          <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-[1px] flex items-center justify-center">
            <span className="flex space-x-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
            </span>
          </div>
        )}

        {state === 'listening' && (
          <div className="absolute inset-0 bg-emerald-500/25 flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
              <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            </div>
          </div>
        )}

        {state === 'speaking' && (
          <div className="absolute bottom-1 inset-x-0 flex items-center justify-center gap-0.5">
            <span className="w-0.5 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.2s]" />
            <span className="w-0.5 h-3.5 bg-white rounded-full animate-bounce" />
            <span className="w-0.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.1s]" />
          </div>
        )}

        {/* Status Indicator Dot */}
        {showStatusBadge && (
          <span
            className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-zinc-900 ${
              size === 'sm' ? 'w-2.5 h-2.5' : size === 'xl' ? 'w-5 h-5' : 'w-3 h-3'
            } ${badgeColors[state] || badgeColors.idle}`}
          />
        )}
      </div>

      {showStateLabel && (
        <span
          className={`mt-1.5 text-xs font-medium ${
            state === 'thinking'
              ? 'text-blue-600 dark:text-blue-400 animate-pulse'
              : state === 'listening'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : state === 'speaking'
              ? 'text-violet-600 dark:text-violet-400 font-semibold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          {stateLabels[state] || 'Online'}
        </span>
      )}
    </div>
  );
};
