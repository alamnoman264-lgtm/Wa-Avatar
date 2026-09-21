/**
 * WA Avatar - 3D Avatar Types & Interfaces (Stage 3A)
 * Defines morph targets, blendshapes, visemes, and animation configs.
 */

import { AvatarState, AvatarExpression, LipSyncViseme } from '../../types';

export interface MorphTargetWeights {
  jawOpen: number;
  mouthSmile: number;
  mouthFrown: number;
  mouthPucker: number;
  browInnerUp: number;
  browDownLeft: number;
  browDownRight: number;
  eyeBlinkLeft: number;
  eyeBlinkRight: number;
  eyeSquintLeft: number;
  eyeSquintRight: number;
  cheekPuff: number;
  headTiltX: number;
  headTiltY: number;
  headTiltZ: number;
}

export interface ExpressionPreset {
  weights: Partial<MorphTargetWeights>;
  headRotation: { x: number; y: number; z: number };
  duration: number; // Transition duration in milliseconds
}

export interface VisemeFrame {
  viseme: LipSyncViseme;
  jawOpen: number;
  mouthPucker: number;
  mouthSmile: number;
}

export interface AvatarRendererConfig {
  antialias: boolean;
  alpha: boolean;
  powerPreference: 'high-performance' | 'default' | 'low-power';
  reducedMotion: boolean;
  pixelRatioLimit: number;
}

export interface AvatarAudioAnalyzer {
  connectSource: (audioElement: HTMLAudioElement) => void;
  disconnect: () => void;
  getAmplitude: () => number;
  getVisemeWeights: () => { jawOpen: number; mouthPucker: number };
}
