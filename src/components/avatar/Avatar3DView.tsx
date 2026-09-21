/**
 * WA Avatar - Avatar3DView (Stage 3A)
 * Interactive 3D Avatar component rendering Wasim Akram's realistic model,
 * real-time facial expressions, gaze tracking, breathing, and lip-sync.
 */

import React, { useEffect, useRef, useState } from 'react';
import { AvatarState, AvatarExpression } from '../../types';
import { Avatar3DService } from '../../services/avatar/avatar_3d_service';
import { Sparkles, Maximize2, Minimize2, Mic, Volume2 } from 'lucide-react';
import { AvatarWidget } from './AvatarWidget';

interface Avatar3DViewProps {
  state?: AvatarState;
  expression?: AvatarExpression;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showStatusBadge?: boolean;
  showControls?: boolean;
  onToggleImmersive?: () => void;
  isImmersive?: boolean;
  className?: string;
  reducedMotion?: boolean;
}

export const Avatar3DView: React.FC<Avatar3DViewProps> = ({
  state = 'idle',
  expression,
  size = 'md',
  showStatusBadge = true,
  showControls = false,
  onToggleImmersive,
  isImmersive = false,
  className = '',
  reducedMotion = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const avatarServiceRef = useRef<Avatar3DService | null>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Dimension mapping
  const sizeClasses = {
    sm: 'w-24 h-24 sm:w-28 sm:h-28',
    md: 'w-48 h-48 sm:w-56 sm:h-56',
    lg: 'w-64 h-64 sm:w-72 sm:h-72',
    xl: 'w-80 h-80 sm:w-96 sm:h-96',
    full: 'w-full h-full min-h-[350px]',
  }[size];

  // State labels
  const stateLabels: Record<AvatarState, string> = {
    idle: 'Ready',
    listening: 'Listening...',
    thinking: 'Thinking...',
    speaking: 'Speaking...',
    happy: 'Feeling Good',
    excited: 'Excited!',
    confused: 'Hmm...',
    sad: 'Concerned',
    empathetic: 'Empathetic',
    sleepy: 'Relaxed',
    error: 'Notice',
  };

  const stateColors: Record<AvatarState, string> = {
    idle: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    listening: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400 animate-pulse',
    thinking: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-400 animate-pulse',
    speaking: 'bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-400',
    happy: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400',
    excited: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400 animate-bounce',
    confused: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-400',
    sad: 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-400',
    empathetic: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-400',
    sleepy: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-400',
    error: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-400',
  };

  // Mount 3D Avatar
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // Check WebGL availability
    try {
      const gl =
        canvasRef.current.getContext('webgl2') ||
        canvasRef.current.getContext('webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const service = new Avatar3DService();
    avatarServiceRef.current = service;

    service
      .mount(containerRef.current, canvasRef.current, {
        antialias: true,
        reducedMotion,
        pixelRatioLimit: size === 'full' ? 2 : 1.5,
      })
      .then(() => {
        setIsLoaded(true);
        service.setState(state);
        if (expression) {
          service.setExpression(expression);
        }
      })
      .catch((err) => {
        console.warn('3D Avatar mount failure, falling back to 2D:', err);
        setWebglSupported(false);
      });

    return () => {
      service.dispose();
      avatarServiceRef.current = null;
    };
  }, []);

  // Update State when prop changes
  useEffect(() => {
    if (avatarServiceRef.current) {
      avatarServiceRef.current.setState(state);
      if (expression) {
        avatarServiceRef.current.setExpression(expression);
      }
    }
  }, [state, expression]);

  // Update reduced motion
  useEffect(() => {
    if (avatarServiceRef.current) {
      avatarServiceRef.current.setReducedMotion(reducedMotion);
    }
  }, [reducedMotion]);

  // Pointer tracking for interactive head/eye glance
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !containerRef.current || !avatarServiceRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    avatarServiceRef.current.setPointerTarget(nx, ny);
  };

  const handlePointerLeave = () => {
    if (avatarServiceRef.current) {
      avatarServiceRef.current.setPointerTarget(0, 0);
    }
  };

  if (!webglSupported) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <AvatarWidget
          state={state}
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'xl'}
          showStatusBadge={showStatusBadge}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id={`avatar-3d-container-${size}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative flex items-center justify-center select-none overflow-hidden rounded-3xl ${sizeClasses} ${className}`}
    >
      {/* Background Aura Glow according to State */}
      <div
        className={`absolute inset-0 rounded-3xl transition-all duration-700 pointer-events-none ${
          state === 'listening'
            ? 'bg-gradient-to-t from-emerald-500/15 to-transparent'
            : state === 'thinking'
            ? 'bg-gradient-to-t from-blue-500/15 to-transparent'
            : state === 'speaking'
            ? 'bg-gradient-to-t from-violet-500/20 to-transparent'
            : state === 'happy' || state === 'excited'
            ? 'bg-gradient-to-t from-amber-500/15 to-transparent'
            : state === 'empathetic'
            ? 'bg-gradient-to-t from-rose-500/20 to-transparent'
            : 'bg-gradient-to-t from-blue-500/5 to-transparent'
        }`}
      />

      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        id="avatar-3d-canvas"
        className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
      />

      {/* Status Pill Badge */}
      {showStatusBadge && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-sm transition-all duration-300">
          <span
            className={`w-2 h-2 rounded-full ${
              state === 'listening'
                ? 'bg-emerald-500 animate-ping'
                : state === 'thinking'
                ? 'bg-blue-500 animate-pulse'
                : state === 'speaking'
                ? 'bg-violet-500 animate-bounce'
                : 'bg-emerald-500'
            }`}
          />
          <span className={`${stateColors[state] || stateColors.idle} px-1 rounded`}>
            {stateLabels[state] || 'Wasim Akram'}
          </span>
        </div>
      )}

      {/* Controls Overlay: Immersive Toggle */}
      {showControls && onToggleImmersive && (
        <button
          onClick={onToggleImmersive}
          title={isImmersive ? 'Exit Immersive Mode' : 'Immersive Avatar Mode'}
          className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 shadow-md transition-all active:scale-95"
        >
          {isImmersive ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      )}
    </div>
  );
};
