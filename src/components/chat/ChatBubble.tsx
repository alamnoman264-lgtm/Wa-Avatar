/**
 * WA Avatar - ChatBubble (Stage 2)
 * Message bubble with actions (Copy, TTS Speak/Replay, Regenerate, Delete)
 * and interactive Memory Confirmation prompt card ("Is information ko yaad rakhu?").
 */

import React, { useState } from 'react';
import {
  Copy,
  Check,
  RotateCw,
  Trash2,
  AlertCircle,
  Volume2,
  VolumeX,
  Brain,
} from 'lucide-react';
import { ChatMessage, MemoryConfirmationPrompt, VoiceSettings } from '../../types';
import { AvatarWidget } from '../avatar/AvatarWidget';
import { VoiceService } from '../../services/voice_service';

interface ChatBubbleProps {
  message: ChatMessage;
  isLastAssistantMessage?: boolean;
  voiceSettings?: VoiceSettings;
  onRegenerate?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onConfirmMemory?: (prompt: MemoryConfirmationPrompt) => void;
  onDismissMemory?: (messageId: string) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isLastAssistantMessage = false,
  voiceSettings = {
    voiceInputEnabled: true,
    voiceResponseEnabled: false,
    autoSpeak: false,
    speechSpeed: 1.0,
    speechVolume: 1.0,
    selectedVoiceProfile: 'wasim_official',
  },
  onRegenerate,
  onDelete,
  onConfirmMemory,
  onDismissMemory,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const isUser = message.role === 'user';
  const isError = message.status === 'error';

  const formatTime = (ts: number) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy message:', e);
    }
  };

  const handleToggleSpeak = () => {
    if (isPlayingAudio) {
      VoiceService.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      VoiceService.speak(message.content, voiceSettings, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  return (
    <div
      id={`message-${message.id}`}
      className={`group flex items-start gap-3 my-3 w-full transition-all ${
        isUser ? 'flex-row-reverse justify-start' : 'flex-row justify-start'
      }`}
    >
      {/* Avatar for AI messages */}
      {!isUser && (
        <AvatarWidget
          state={message.avatarState || 'idle'}
          size="sm"
          className="mt-0.5 flex-shrink-0"
        />
      )}

      {/* Message content container */}
      <div
        className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* Author tag */}
        <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-zinc-400">
          <span className="font-medium">
            {isUser ? 'You' : 'Wasim Akram (AI)'}
          </span>
          <span>•</span>
          <span>{formatTime(message.timestamp)}</span>
        </div>

        {/* Bubble */}
        <div
          className={`relative px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm transition-all ${
            isUser
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm'
              : isError
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900 rounded-tl-sm'
              : 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700/60 rounded-tl-sm'
          }`}
        >
          {isError && (
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium mb-1 text-xs">
              <AlertCircle size={14} />
              <span>Connection Issue</span>
            </div>
          )}

          {/* Formatted Text Content */}
          <div className="whitespace-pre-wrap break-words selection:bg-blue-200 dark:selection:bg-blue-900">
            {message.content}
          </div>
        </div>

        {/* Interactive Memory Confirmation Prompt Card */}
        {message.memoryConfirmation && onConfirmMemory && onDismissMemory && (
          <div
            id={`mem-confirm-${message.id}`}
            className="mt-2 p-3 w-full bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/80 rounded-xl text-xs space-y-2 animate-fade-in shadow-sm"
          >
            <div className="flex items-center gap-1.5 text-blue-900 dark:text-blue-200 font-semibold">
              <Brain size={15} className="text-blue-600 dark:text-blue-400" />
              <span>{message.memoryConfirmation.question || 'Is information ko yaad rakhu?'}</span>
            </div>
            <p className="text-blue-800 dark:text-blue-300">
              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                {message.memoryConfirmation.label}:{' '}
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                &ldquo;{message.memoryConfirmation.value}&rdquo;
              </span>
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onConfirmMemory(message.memoryConfirmation!)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs transition-colors flex items-center gap-1"
              >
                <Check size={13} />
                <span>Yes</span>
              </button>
              <button
                onClick={() => onDismissMemory(message.id)}
                className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg text-xs transition-colors"
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* Hover/Touch Actions Bar */}
        <div
          className={`flex items-center gap-1 mt-1 px-1 opacity-80 group-hover:opacity-100 transition-opacity ${
            isUser ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {/* Copy button */}
          <button
            id={`copy-btn-${message.id}`}
            onClick={handleCopy}
            title="Copy message"
            className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
          >
            {copied ? (
              <span className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 gap-0.5">
                <Check size={13} />
                <span className="text-[10px]">Copied</span>
              </span>
            ) : (
              <Copy size={13} />
            )}
          </button>

          {/* TTS Audio Speak/Replay Button (AI messages only) */}
          {!isUser && (
            <button
              id={`speak-btn-${message.id}`}
              onClick={handleToggleSpeak}
              title={isPlayingAudio ? 'Stop speaking' : 'Speak / Replay voice'}
              className={`p-1 rounded transition-colors ${
                isPlayingAudio
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/60'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800'
              }`}
            >
              {isPlayingAudio ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
          )}

          {/* Regenerate button (AI messages only) */}
          {!isUser && onRegenerate && (
            <button
              id={`regen-btn-${message.id}`}
              onClick={() => onRegenerate(message.id)}
              title="Regenerate response"
              className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
            >
              <RotateCw size={13} />
            </button>
          )}

          {/* Delete message button */}
          {onDelete && (
            <button
              id={`delete-btn-${message.id}`}
              onClick={() => onDelete(message.id)}
              title="Delete message"
              className="p-1 rounded text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
