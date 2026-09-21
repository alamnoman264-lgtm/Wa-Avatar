/**
 * WA Avatar - TypingIndicator
 * Displays animated "Wasim is thinking..." with natural pulsing animation
 */

import React from 'react';
import { AvatarWidget } from '../avatar/AvatarWidget';

export const TypingIndicator: React.FC = () => {
  return (
    <div
      id="typing-indicator"
      className="flex items-start gap-3 my-2 text-zinc-700 dark:text-zinc-300"
    >
      <AvatarWidget state="thinking" size="sm" />
      <div className="flex flex-col">
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Wasim is thinking
          </span>
          <div className="flex items-center gap-1 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.32s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.16s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
          </div>
        </div>
        <span className="text-[11px] text-zinc-400 mt-1 pl-1">Generating response</span>
      </div>
    </div>
  );
};
