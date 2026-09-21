/**
 * WA Avatar - MessageInput (Stage 2)
 * Bottom message bar with real Speech-to-Text Voice Input, Audio Waveform indicator, and Send button.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, X, AlertCircle } from 'lucide-react';
import { VoiceService } from '../../services/voice_service';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  onListeningStateChange?: (isListening: boolean) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Wasim se kuch bhi pucho...',
  onListeningStateChange,
}) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea up to max-height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (disabled || !text.trim()) return;

    if (isListening) {
      handleStopVoice();
    }

    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Toggle or start voice recognition
  const handleToggleVoice = async () => {
    if (isListening) {
      handleStopVoice();
      return;
    }

    setVoiceError(null);
    const started = await VoiceService.startListening({
      onStart: () => {
        setIsListening(true);
        if (onListeningStateChange) onListeningStateChange(true);
      },
      onResult: (transcript, isFinal) => {
        setText(transcript);
        if (isFinal) {
          // Keep listening or allow user to send
        }
      },
      onError: (errMsg) => {
        setIsListening(false);
        setVoiceError(errMsg);
        if (onListeningStateChange) onListeningStateChange(false);
      },
      onEnd: () => {
        setIsListening(false);
        if (onListeningStateChange) onListeningStateChange(false);
      },
    });

    if (!started) {
      setIsListening(false);
      if (onListeningStateChange) onListeningStateChange(false);
    }
  };

  const handleStopVoice = () => {
    VoiceService.stopListening();
    setIsListening(false);
    if (onListeningStateChange) onListeningStateChange(false);
  };

  const handleCancelVoice = () => {
    VoiceService.cancelListening();
    setIsListening(false);
    if (onListeningStateChange) onListeningStateChange(false);
  };

  return (
    <div
      id="chat-input-bar"
      className="w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 transition-colors relative"
    >
      {/* Voice Error Notification */}
      {voiceError && (
        <div className="max-w-3xl mx-auto mb-2 px-3 py-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-1.5">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{voiceError}</span>
          </div>
          <button
            onClick={() => setVoiceError(null)}
            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Active Listening Waveform Banner */}
      {isListening && (
        <div className="max-w-3xl mx-auto mb-2.5 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Listening... Speak in Hindi, Hinglish, or English
            </span>
            {/* Audio visualization animation bars */}
            <div className="flex items-center gap-1 ml-1">
              <span className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <span className="w-1 h-5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.2s]" />
              <span className="w-1 h-4 bg-emerald-500 rounded-full animate-pulse [animation-delay:-0.1s]" />
            </div>
          </div>
          <button
            onClick={handleCancelVoice}
            className="text-xs font-medium text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-1 rounded-md hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="max-w-3xl mx-auto flex items-end gap-2 relative">
        {/* Voice Input Microphone Button */}
        <button
          type="button"
          id="mic-voice-button"
          onClick={handleToggleVoice}
          title={isListening ? 'Stop listening' : 'Start voice input'}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-sm ${
            isListening
              ? 'bg-emerald-600 text-white animate-pulse ring-4 ring-emerald-400/30'
              : 'text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/80 dark:border-zinc-700/60'
          }`}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Text Input Container */}
        <div className="flex-1 min-w-0 flex items-center bg-zinc-100 dark:bg-zinc-800/90 rounded-2xl border border-zinc-200 dark:border-zinc-700/70 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 px-3.5 py-1.5 transition-all">
          <textarea
            ref={textareaRef}
            id="message-textarea"
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              isListening ? 'Listening to your voice...' : placeholder
            }
            className="w-full bg-transparent resize-none text-[15px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none max-h-36 py-1 leading-relaxed"
          />
        </div>

        {/* Send Button */}
        <button
          id="send-message-button"
          type="button"
          onClick={() => handleSubmit()}
          disabled={disabled || !text.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-sm ${
            text.trim() && !disabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-blue-500/25'
              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
          }`}
          title="Send message"
        >
          <Send
            size={17}
            className={text.trim() && !disabled ? 'translate-x-0.5' : ''}
          />
        </button>
      </div>

      {/* Subtle safety and stage disclaimer */}
      <div className="max-w-3xl mx-auto mt-2 text-center">
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-1">
          <Sparkles size={11} className="text-blue-500" />
          <span>WA Avatar • Wasim Akram AI Avatar (Stage 2)</span>
        </p>
      </div>
    </div>
  );
};
