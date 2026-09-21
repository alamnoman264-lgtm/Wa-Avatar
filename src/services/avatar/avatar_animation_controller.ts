/**
 * WA Avatar - AvatarAnimationController (Stage 3A)
 * Handles procedural idle animations, realistic blinking, pupil saccades,
 * respiratory cycles, and accessibility motion dampening.
 */

export class AvatarAnimationController {
  // Blinking State
  private nextBlinkTime: number = 2.5;
  private blinkTimer: number = 0;
  private isBlinking: boolean = false;
  private blinkProgress: number = 0;
  private isDoubleBlink: boolean = false;
  private blinkDuration: number = 0.16; // 160ms

  // Breathing State
  private breathPhase: number = 0;

  // Head Micro-drifting
  private headTime: number = 0;

  // Eye Saccade State
  private eyeTargetX: number = 0;
  private eyeTargetY: number = 0;
  private eyeCurrentX: number = 0;
  private eyeCurrentY: number = 0;
  private nextSaccadeTime: number = 2.0;
  private saccadeTimer: number = 0;

  // Cursor Look-At Target (interactive)
  private lookAtTargetX: number = 0;
  private lookAtTargetY: number = 0;
  private lookAtCurrentX: number = 0;
  private lookAtCurrentY: number = 0;

  // Accessibility / Settings
  private reducedMotion: boolean = false;

  constructor() {
    this.scheduleNextBlink();
    this.scheduleNextSaccade();
  }

  public setReducedMotion(enabled: boolean): void {
    this.reducedMotion = enabled;
  }

  public setPointerTarget(normalizedX: number, normalizedY: number): void {
    // Clamped -1.0 to 1.0 from center of screen
    this.lookAtTargetX = Math.max(-1, Math.min(1, normalizedX));
    this.lookAtTargetY = Math.max(-1, Math.min(1, normalizedY));
  }

  private scheduleNextBlink(): void {
    // Humans blink every 2.5 to 5.5 seconds on average
    this.nextBlinkTime = 2.2 + Math.random() * 3.3;
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.isDoubleBlink = Math.random() < 0.18; // 18% chance of realistic double-blink
  }

  private scheduleNextSaccade(): void {
    this.nextSaccadeTime = 1.2 + Math.random() * 2.8;
    this.saccadeTimer = 0;
    // Small random eye fixation shifts (-0.1 to 0.1)
    this.eyeTargetX = (Math.random() - 0.5) * 0.22;
    this.eyeTargetY = (Math.random() - 0.5) * 0.15;
  }

  /**
   * Updates idle animations
   * @param delta Seconds elapsed
   */
  public update(delta: number): {
    blinkWeight: number;
    headRotation: { x: number; y: number; z: number };
    chestOffset: number;
    eyeOffset: { x: number; y: number };
  } {
    if (this.reducedMotion) {
      return {
        blinkWeight: 0,
        headRotation: { x: 0, y: 0, z: 0 },
        chestOffset: 0,
        eyeOffset: { x: 0, y: 0 },
      };
    }

    // 1. BLINK CALCULATION
    this.blinkTimer += delta;
    let blinkWeight = 0;

    if (!this.isBlinking && this.blinkTimer >= this.nextBlinkTime) {
      this.isBlinking = true;
      this.blinkProgress = 0;
    }

    if (this.isBlinking) {
      this.blinkProgress += delta / this.blinkDuration;
      if (this.blinkProgress <= 0.5) {
        // Closing (fast, parabolic curve)
        blinkWeight = Math.sin((this.blinkProgress / 0.5) * (Math.PI / 2));
      } else if (this.blinkProgress < 1.0) {
        // Opening
        blinkWeight = Math.cos(((this.blinkProgress - 0.5) / 0.5) * (Math.PI / 2));
      } else {
        // Finished blink
        blinkWeight = 0;
        if (this.isDoubleBlink) {
          this.isDoubleBlink = false;
          this.nextBlinkTime = 0.12; // Quick second blink
          this.blinkTimer = 0;
          this.isBlinking = false;
        } else {
          this.scheduleNextBlink();
        }
      }
    }

    // 2. BREATHING CYCLE (~13 breaths / min = ~0.22 Hz)
    this.breathPhase += delta * 1.38;
    const breath = (Math.sin(this.breathPhase) + 1) * 0.5; // 0.0 to 1.0
    const chestOffset = breath * 0.018; // Subtle vertical/expansion

    // 3. EYE SACCADES & LOOK-AT TRACKING
    this.saccadeTimer += delta;
    if (this.saccadeTimer >= this.nextSaccadeTime) {
      this.scheduleNextSaccade();
    }
    this.eyeCurrentX += (this.eyeTargetX - this.eyeCurrentX) * Math.min(1.0, delta * 8.0);
    this.eyeCurrentY += (this.eyeTargetY - this.eyeCurrentY) * Math.min(1.0, delta * 8.0);

    // Interactive look-at dampening
    this.lookAtCurrentX += (this.lookAtTargetX - this.lookAtCurrentX) * Math.min(1.0, delta * 3.5);
    this.lookAtCurrentY += (this.lookAtTargetY - this.lookAtCurrentY) * Math.min(1.0, delta * 3.5);

    // 4. NATURAL HEAD MICRO-ROTATIONS (multi-frequency wave to avoid mechanical repetition)
    this.headTime += delta;
    const pitch = Math.sin(this.headTime * 0.7) * 0.015 + breath * 0.008 - this.lookAtCurrentY * 0.08;
    const yaw = Math.sin(this.headTime * 0.5) * 0.02 + Math.cos(this.headTime * 0.23) * 0.01 + this.lookAtCurrentX * 0.14;
    const roll = Math.sin(this.headTime * 0.4) * 0.012 - this.lookAtCurrentX * 0.02;

    return {
      blinkWeight,
      headRotation: { x: pitch, y: yaw, z: roll },
      chestOffset,
      eyeOffset: {
        x: this.eyeCurrentX + this.lookAtCurrentX * 0.08,
        y: this.eyeCurrentY + this.lookAtCurrentY * 0.06,
      },
    };
  }
}
