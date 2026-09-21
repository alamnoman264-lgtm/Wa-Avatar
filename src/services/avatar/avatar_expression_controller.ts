/**
 * WA Avatar - AvatarExpressionController (Stage 3A)
 * Manages facial morph target weights, expression presets, and smooth transition interpolation.
 */

import { AvatarExpression } from '../../types';
import { MorphTargetWeights, ExpressionPreset } from './avatar_types';

export class AvatarExpressionController {
  private currentWeights: MorphTargetWeights = {
    jawOpen: 0,
    mouthSmile: 0.15, // Subtle natural friendly resting smile
    mouthFrown: 0,
    mouthPucker: 0,
    browInnerUp: 0,
    browDownLeft: 0,
    browDownRight: 0,
    eyeBlinkLeft: 0,
    eyeBlinkRight: 0,
    eyeSquintLeft: 0,
    eyeSquintRight: 0,
    cheekPuff: 0,
    headTiltX: 0,
    headTiltY: 0,
    headTiltZ: 0,
  };

  private targetWeights: MorphTargetWeights = { ...this.currentWeights };
  private currentExpression: AvatarExpression = 'neutral';
  private transitionSpeed: number = 8.0; // Lerp factor per second

  // Expression Presets for Wasim Akram's avatar
  private presets: Record<AvatarExpression, ExpressionPreset> = {
    neutral: {
      weights: {
        mouthSmile: 0.15,
        mouthFrown: 0,
        mouthPucker: 0,
        browInnerUp: 0.02,
        browDownLeft: 0,
        browDownRight: 0,
        eyeSquintLeft: 0,
        eyeSquintRight: 0,
        headTiltX: 0,
        headTiltY: 0,
        headTiltZ: 0,
      },
      headRotation: { x: 0, y: 0, z: 0 },
      duration: 350,
    },
    smile: {
      weights: {
        mouthSmile: 0.65,
        mouthFrown: 0,
        mouthPucker: 0,
        browInnerUp: 0.12,
        eyeSquintLeft: 0.2,
        eyeSquintRight: 0.2,
        headTiltX: -0.02,
        headTiltY: 0.02,
        headTiltZ: 0.02,
      },
      headRotation: { x: -0.02, y: 0.02, z: 0.02 },
      duration: 300,
    },
    happy: {
      weights: {
        mouthSmile: 0.85,
        mouthFrown: 0,
        mouthPucker: 0,
        browInnerUp: 0.25,
        eyeSquintLeft: 0.35,
        eyeSquintRight: 0.35,
        headTiltX: -0.04,
        headTiltY: 0.03,
        headTiltZ: 0.03,
      },
      headRotation: { x: -0.04, y: 0.03, z: 0.03 },
      duration: 280,
    },
    thinking: {
      weights: {
        mouthSmile: 0.05,
        mouthFrown: 0.05,
        mouthPucker: 0.15,
        browInnerUp: 0.35,
        browDownLeft: 0.1,
        browDownRight: 0.25,
        eyeSquintLeft: 0.1,
        eyeSquintRight: 0.18,
        headTiltX: -0.03,
        headTiltY: 0.1,
        headTiltZ: -0.08,
      },
      headRotation: { x: -0.03, y: 0.1, z: -0.08 },
      duration: 400,
    },
    confused: {
      weights: {
        mouthSmile: 0,
        mouthFrown: 0.1,
        mouthPucker: 0.2,
        browInnerUp: 0.3,
        browDownLeft: 0.35,
        browDownRight: 0.05,
        eyeSquintLeft: 0.25,
        eyeSquintRight: 0.05,
        headTiltX: 0.02,
        headTiltY: -0.08,
        headTiltZ: 0.1,
      },
      headRotation: { x: 0.02, y: -0.08, z: 0.1 },
      duration: 350,
    },
    sad: {
      weights: {
        mouthSmile: 0,
        mouthFrown: 0.45,
        mouthPucker: 0.05,
        browInnerUp: 0.45,
        browDownLeft: 0,
        browDownRight: 0,
        eyeSquintLeft: 0.1,
        eyeSquintRight: 0.1,
        headTiltX: 0.08,
        headTiltY: 0,
        headTiltZ: -0.02,
      },
      headRotation: { x: 0.08, y: 0, z: -0.02 },
      duration: 450,
    },
    empathetic: {
      weights: {
        mouthSmile: 0.4,
        mouthFrown: 0,
        mouthPucker: 0,
        browInnerUp: 0.25,
        eyeSquintLeft: 0.2,
        eyeSquintRight: 0.2,
        headTiltX: 0.02,
        headTiltY: 0.04,
        headTiltZ: 0.06,
      },
      headRotation: { x: 0.02, y: 0.04, z: 0.06 },
      duration: 350,
    },
    excited: {
      weights: {
        mouthSmile: 0.95,
        mouthFrown: 0,
        mouthPucker: 0,
        browInnerUp: 0.4,
        eyeSquintLeft: 0.2,
        eyeSquintRight: 0.2,
        headTiltX: -0.06,
        headTiltY: 0.04,
        headTiltZ: 0.04,
      },
      headRotation: { x: -0.06, y: 0.04, z: 0.04 },
      duration: 250,
    },
    sleepy: {
      weights: {
        mouthSmile: 0.05,
        mouthFrown: 0,
        mouthPucker: 0,
        browInnerUp: 0.1,
        browDownLeft: 0.1,
        browDownRight: 0.1,
        eyeSquintLeft: 0.45,
        eyeSquintRight: 0.45,
        headTiltX: 0.1,
        headTiltY: 0.02,
        headTiltZ: 0.04,
      },
      headRotation: { x: 0.1, y: 0.02, z: 0.04 },
      duration: 600,
    },
  };

  public setExpression(expression: AvatarExpression): void {
    this.currentExpression = expression;
    const preset = this.presets[expression] || this.presets.neutral;

    // Apply preset target weights
    for (const [key, value] of Object.entries(preset.weights)) {
      const morphKey = key as keyof MorphTargetWeights;
      if (morphKey in this.targetWeights) {
        this.targetWeights[morphKey] = value as number;
      }
    }
  }

  public getExpression(): AvatarExpression {
    return this.currentExpression;
  }

  /**
   * Smoothly interpolates weights toward targets each frame
   * @param delta Seconds elapsed since previous frame
   */
  public update(delta: number): MorphTargetWeights {
    const lerpFactor = Math.min(1.0, delta * this.transitionSpeed);

    for (const key of Object.keys(this.currentWeights) as (keyof MorphTargetWeights)[]) {
      // Allow external override (e.g. blinking, lip-sync) to control specific channels
      if (key !== 'eyeBlinkLeft' && key !== 'eyeBlinkRight' && key !== 'jawOpen') {
        this.currentWeights[key] += (this.targetWeights[key] - this.currentWeights[key]) * lerpFactor;
      }
    }

    return this.currentWeights;
  }

  public getCurrentWeights(): MorphTargetWeights {
    return this.currentWeights;
  }

  public setManualWeight(key: keyof MorphTargetWeights, value: number): void {
    this.currentWeights[key] = value;
  }
}
