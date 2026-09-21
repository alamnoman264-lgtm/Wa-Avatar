/**
 * WA Avatar - Voice & TTS Service (Stage 2)
 * Manages Speech-to-Text (Voice Input) and Text-to-Speech (Voice Response) with full state management.
 */

import { AvatarState, VoiceSettings } from '../types';

export interface SpeechRecognitionCallbacks {
  onStart: () => void;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (errorMsg: string) => void;
  onEnd: () => void;
}

export class VoiceService {
  private static recognition: any = null;
  private static isListening: boolean = false;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static onAvatarStateChange?: (state: AvatarState) => void;
  private static onLipSyncSpeechStart?: (text: string, durationMs: number) => void;
  private static onLipSyncSpeechStop?: () => void;
  private static lastSpokenText: string = '';

  public static registerStateCallback(cb: (state: AvatarState) => void) {
    this.onAvatarStateChange = cb;
  }

  public static registerLipSyncCallbacks(
    onStart: (text: string, durationMs: number) => void,
    onStop: () => void
  ) {
    this.onLipSyncSpeechStart = onStart;
    this.onLipSyncSpeechStop = onStop;
  }

  public static getProviderStatus(): {
    name: string;
    isFallback: boolean;
    status: 'connected' | 'idle' | 'unavailable';
  } {
    const supported = this.isTTSSupported();
    return {
      name: 'Device Browser Voice (Fallback Voice)',
      isFallback: true,
      status: supported ? 'connected' : 'unavailable',
    };
  }

  // ==========================================
  // SPEECH RECOGNITION (Voice Input)
  // ==========================================

  public static isSpeechRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  public static async startListening(
    callbacks: SpeechRecognitionCallbacks,
    language: string = 'hi-IN'
  ): Promise<boolean> {
    if (!this.isSpeechRecognitionSupported()) {
      callbacks.onError('Voice recognition is not supported in this browser environment.');
      return false;
    }

    try {
      // First ensure microphone permission
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop immediate stream tracks to let recognition take over
          stream.getTracks().forEach((track) => track.stop());
        } catch (permErr: any) {
          if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
            callbacks.onError('Microphone access was denied. Please allow microphone permissions in your browser.');
            return false;
          }
        }
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = language || 'hi-IN'; // Hindi/Hinglish recognition

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onAvatarStateChange) this.onAvatarStateChange('listening');
        callbacks.onStart();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        callbacks.onResult(currentText, !!finalTranscript);
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        this.isListening = false;
        if (this.onAvatarStateChange) this.onAvatarStateChange('idle');

        let msg = 'Could not recognize speech. Please try again.';
        if (event.error === 'not-allowed') {
          msg = 'Microphone permission denied. Please allow microphone access.';
        } else if (event.error === 'no-speech') {
          msg = 'No speech detected. Please speak clearly into your mic.';
        } else if (event.error === 'network') {
          msg = 'Network connection issue during voice recognition.';
        }
        callbacks.onError(msg);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onAvatarStateChange) this.onAvatarStateChange('idle');
        callbacks.onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      callbacks.onError('Failed to access microphone. Check permissions.');
      this.isListening = false;
      if (this.onAvatarStateChange) this.onAvatarStateChange('idle');
      return false;
    }
  }

  public static stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Recognition stop error:', e);
      }
    }
    this.isListening = false;
    if (this.onAvatarStateChange) this.onAvatarStateChange('idle');
  }

  public static cancelListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
      } catch (e) {
        console.warn('Recognition abort error:', e);
      }
    }
    this.isListening = false;
    if (this.onAvatarStateChange) this.onAvatarStateChange('idle');
  }

  // ==========================================
  // TEXT-TO-SPEECH (TTS - Voice Response)
  // ==========================================

  public static isTTSSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public static speak(
    text: string,
    voiceSettings: VoiceSettings,
    onFinish?: () => void
  ): boolean {
    if (!this.isTTSSupported() || !text) {
      if (onFinish) onFinish();
      return false;
    }

    // Stop previous utterance
    this.stopSpeaking();

    try {
      // Clean markdown tags, emojis, code blocks for spoken audio
      const cleaned = text
        .replace(/[*_~`#>]/g, '')
        .replace(/https?:\/\/\S+/g, 'link')
        .replace(/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .trim();

      if (!cleaned) {
        if (onFinish) onFinish();
        return false;
      }

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = Math.max(0.7, Math.min(1.5, voiceSettings.speechSpeed || 1.0));
      utterance.pitch = 1.0;
      utterance.volume = Math.max(0.0, Math.min(1.0, voiceSettings.speechVolume ?? 1.0));

      // Select natural Hindi or Indian English voice if available
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(
        (v) => v.lang.startsWith('hi') || v.lang.includes('IN') || v.name.includes('India')
      );
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }

      this.lastSpokenText = cleaned;

      utterance.onstart = () => {
        if (this.onAvatarStateChange) this.onAvatarStateChange('speaking');
        if (this.onLipSyncSpeechStart) {
          // Estimate spoken duration based on word count and speech rate
          const wordCount = cleaned.split(/\s+/).length;
          const estimatedDurationMs = Math.max(1200, (wordCount / (2.5 * utterance.rate)) * 1000);
          this.onLipSyncSpeechStart(cleaned, estimatedDurationMs);
        }
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        if (this.onLipSyncSpeechStop) this.onLipSyncSpeechStop();
        if (this.onAvatarStateChange) this.onAvatarStateChange('idle');
        if (onFinish) onFinish();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis utterance error:', e);
        this.currentUtterance = null;
        if (this.onLipSyncSpeechStop) this.onLipSyncSpeechStop();
        if (this.onAvatarStateChange) this.onAvatarStateChange('idle');
        if (onFinish) onFinish();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.error('TTS speak failed:', err);
      this.currentUtterance = null;
      if (this.onLipSyncSpeechStop) this.onLipSyncSpeechStop();
      if (this.onAvatarStateChange) this.onAvatarStateChange('idle');
      if (onFinish) onFinish();
      return false;
    }
  }

  public static stopSpeaking(): void {
    if (this.isTTSSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Cancel speech synthesis failed:', e);
      }
    }
    this.currentUtterance = null;
    if (this.onLipSyncSpeechStop) this.onLipSyncSpeechStop();
    if (this.onAvatarStateChange) this.onAvatarStateChange('idle');
  }

  /**
   * Interrupts speech immediately when user starts speaking or presses mic
   */
  public static interruptSpeech(): void {
    if (this.isSpeaking()) {
      this.stopSpeaking();
    }
  }

  public static replayLast(voiceSettings: VoiceSettings): boolean {
    if (!this.lastSpokenText) return false;
    return this.speak(this.lastSpokenText, voiceSettings);
  }

  public static previewVoice(voiceSettings: VoiceSettings): boolean {
    const previewText =
      'Haan bhai! Main Wasim Akram ka AI avatar hoon. Awaaz aur speed bilkul theek lag rahi hai?';
    return this.speak(previewText, voiceSettings);
  }

  public static isSpeaking(): boolean {
    return this.isTTSSupported() && window.speechSynthesis.speaking;
  }
}
