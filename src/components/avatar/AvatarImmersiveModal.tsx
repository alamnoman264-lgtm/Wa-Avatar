/**
 * WA Avatar - AvatarImmersiveModal (Stage 3A)
 * Full-screen 3D Avatar stage with expression triggers, lighting showcase,
 * voice previews, and touch/cursor gaze tracking.
 */

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Smile,
  Volume2,
  Sliders,
  RotateCcw,
  Eye,
  Info,
  Layers,
} from 'lucide-react';
import { AvatarState, AvatarExpression, UserSettings, UserMode, VoiceSettings } from '../../types';
import { Avatar3DView } from './Avatar3DView';
import { VoiceService } from '../../services/voice_service';

interface AvatarImmersiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarState: AvatarState;
  onAvatarStateChange?: (state: AvatarState) => void;
  userMode?: UserMode;
  voiceSettings?: VoiceSettings;
  settings?: UserSettings;
  onTriggerVoiceSpeak?: (text: string) => void;
  onInterruptSpeech?: () => void;
  reducedMotion?: boolean;
}

export const AvatarImmersiveModal: React.FC<AvatarImmersiveModalProps> = ({
  isOpen,
  onClose,
  avatarState,
  onAvatarStateChange,
  userMode = 'normal',
  voiceSettings,
  settings,
  onTriggerVoiceSpeak,
  onInterruptSpeech,
  reducedMotion = false,
}) => {
  const [selectedExpression, setSelectedExpression] = useState<AvatarExpression>('neutral');
  const [showTools, setShowTools] = useState(true);

  if (!isOpen) return null;

  const expressions: { label: string; expr: AvatarExpression; state: AvatarState }[] = [
    { label: 'Neutral', expr: 'neutral', state: 'idle' },
    { label: 'Smile', expr: 'smile', state: 'happy' },
    { label: 'Happy', expr: 'happy', state: 'happy' },
    { label: 'Thinking', expr: 'thinking', state: 'thinking' },
    { label: 'Confused', expr: 'confused', state: 'confused' },
    { label: 'Empathetic', expr: 'empathetic', state: 'empathetic' },
    { label: 'Excited', expr: 'excited', state: 'excited' },
    { label: 'Relaxed', expr: 'sleepy', state: 'sleepy' },
    { label: 'Concerned', expr: 'sad', state: 'sad' },
  ];

  const handleSelectExpression = (expr: AvatarExpression, state: AvatarState) => {
    setSelectedExpression(expr);
    if (onAvatarStateChange) {
      onAvatarStateChange(state);
    }
  };

  const handleTestVoice = () => {
    const vSettings = voiceSettings || settings?.voice;
    if (onTriggerVoiceSpeak) {
      onTriggerVoiceSpeak(
        userMode === 'girlfriend'
          ? 'Ashiya, main tumhara hamesha khayal rakhunga.'
          : 'Haan bhai, main Wasim Akram hoon. Kuch bhi puch sakte ho!'
      );
    } else if (vSettings) {
      VoiceService.previewVoice(vSettings);
    }
  };

  return (
    <div
      id="avatar-immersive-modal"
      className="fixed inset-0 z-50 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-fade-in"
    >
      {/* Top Header */}
      <div className="w-full max-w-4xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Sparkles className="text-blue-400" size={18} />
          <div>
            <h3 className="font-semibold text-sm text-zinc-200">
              Wasim Akram &bull; 3D Avatar Stage
            </h3>
            <p className="text-[11px] text-zinc-400">
              Interactive 3D viewport with real-time blendshapes and facial rig
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTools(!showTools)}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
              showTools
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
            }`}
          >
            <Sliders size={16} />
            <span className="hidden sm:inline">Expression Controls</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Center 3D Stage */}
      <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center my-2 relative">
        <Avatar3DView
          state={avatarState}
          expression={selectedExpression}
          size="full"
          showStatusBadge={true}
          reducedMotion={reducedMotion || settings?.reducedMotion}
          className="w-full h-full max-h-[60vh] max-w-[500px]"
        />
      </div>

      {/* Bottom Expression Palette */}
      {showTools && (
        <div className="w-full max-w-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col gap-3 animate-slide-up">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium text-zinc-300">Live Facial Expressions</span>
            <button
              onClick={handleTestVoice}
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-all font-medium"
            >
              <Volume2 size={13} />
              <span>Preview Voice</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {expressions.map((item) => (
              <button
                key={item.expr}
                onClick={() => handleSelectExpression(item.expr, item.state)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border active:scale-95 ${
                  selectedExpression === item.expr
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border-zinc-700/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
