/**
 * WA Avatar - AvatarLipSyncController (Stage 3A)
 * Provides real-time lip-sync via Web Audio Analyser frequency analysis
 * and procedural fallback viseme scheduling for Web Speech TTS.
 */

export class AvatarLipSyncController {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isAnalyzing: boolean = false;

  // Real-time calculated weights
  private currentJawOpen: number = 0;
  private currentMouthPucker: number = 0;
  private targetJawOpen: number = 0;

  // Fallback procedural speech generator
  private isProceduralSpeaking: boolean = false;
  private proceduralStartTime: number = 0;
  private proceduralEstimatedDuration: number = 0;
  private speechCadenceTime: number = 0;

  public attachAudioElement(audioEl: HTMLAudioElement): void {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.4;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const source = this.audioContext.createMediaElementSource(audioEl);
      source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      this.isAnalyzing = true;
    } catch (err) {
      console.warn('Could not attach Web Audio analyser to element:', err);
    }
  }

  public startProceduralSpeech(text: string, durationMs?: number): void {
    this.isProceduralSpeaking = true;
    this.proceduralStartTime = performance.now();
    // Approximate duration: ~85ms per character if duration is not provided
    this.proceduralEstimatedDuration = durationMs || Math.max(1200, text.length * 80);
    this.speechCadenceTime = 0;
  }

  public stopSpeaking(): void {
    this.isProceduralSpeaking = false;
    this.targetJawOpen = 0;
    this.currentJawOpen = 0;
    this.currentMouthPucker = 0;
  }

  /**
   * Updates lip-sync animation each frame
   * @param delta Seconds elapsed
   * @returns Current jawOpen and mouthPucker weights (0.0 to 1.0)
   */
  public update(delta: number): { jawOpen: number; mouthPucker: number } {
    // 1. Live Web Audio frequency analysis mode
    if (this.isAnalyzing && this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray as any);

      // Low/mid frequency energy corresponds to vowel openness
      let sumLow = 0;
      let sumMid = 0;
      const binCount = this.dataArray.length;

      for (let i = 2; i < 16; i++) {
        sumLow += this.dataArray[i];
      }
      for (let i = 16; i < 40; i++) {
        sumMid += this.dataArray[i];
      }

      const avgLow = sumLow / 14 / 255;
      const avgMid = sumMid / 24 / 255;

      if (avgLow > 0.08 || avgMid > 0.08) {
        this.targetJawOpen = Math.min(0.9, avgLow * 1.5 + avgMid * 0.4);
        this.currentMouthPucker = Math.min(0.6, avgMid * 0.8);
      } else {
        this.targetJawOpen = 0;
        this.currentMouthPucker = 0;
      }
    }
    // 2. Fallback procedural speech mode (for browser Web Speech API)
    else if (this.isProceduralSpeaking) {
      const elapsed = performance.now() - this.proceduralStartTime;
      if (elapsed > this.proceduralEstimatedDuration) {
        this.stopSpeaking();
        return { jawOpen: 0, mouthPucker: 0 };
      }

      this.speechCadenceTime += delta * 12; // Syllable speech frequency
      // Multi-sine wave combination for human vowel cadence
      const wave1 = Math.sin(this.speechCadenceTime);
      const wave2 = Math.sin(this.speechCadenceTime * 1.8 + 0.4);
      const composite = Math.max(0, (wave1 * 0.6 + wave2 * 0.4));

      // Natural speech pauses
      const pauseCycle = Math.sin(this.speechCadenceTime * 0.25);
      const pauseGate = pauseCycle > -0.7 ? 1.0 : 0.15;

      this.targetJawOpen = composite * 0.75 * pauseGate;
      this.currentMouthPucker = Math.max(0, Math.sin(this.speechCadenceTime * 0.9)) * 0.25;
    } else {
      this.targetJawOpen = 0;
    }

    // Quick lerp for responsive mouth movement
    const lerpSpeed = 22.0;
    this.currentJawOpen += (this.targetJawOpen - this.currentJawOpen) * Math.min(1.0, delta * lerpSpeed);

    // Clamp small values cleanly to zero
    if (this.currentJawOpen < 0.01) {
      this.currentJawOpen = 0;
    }

    return {
      jawOpen: this.currentJawOpen,
      mouthPucker: this.currentMouthPucker,
    };
  }

  public isSpeaking(): boolean {
    return this.isProceduralSpeaking || this.currentJawOpen > 0.05;
  }

  public dispose(): void {
    this.stopSpeaking();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {
        // ignore
      }
    }
    this.audioContext = null;
    this.analyser = null;
  }
}
