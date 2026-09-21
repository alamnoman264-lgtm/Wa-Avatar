/**
 * WA Avatar - Avatar3DService (Stage 3A)
 * Unified high-level orchestrator coordinating AvatarRenderer, AssetLoader,
 * AnimationController, ExpressionController, and LipSyncController.
 * Fully decoupled from ChatService, GeminiService, MemoryService, and VoiceService.
 */

import { AvatarState, AvatarExpression } from '../../types';
import { AvatarAssetLoader, AvatarModelRig } from './avatar_asset_loader';
import { AvatarRenderer } from './avatar_renderer';
import { AvatarExpressionController } from './avatar_expression_controller';
import { AvatarAnimationController } from './avatar_animation_controller';
import { AvatarLipSyncController } from './avatar_lip_sync_controller';
import { AvatarRendererConfig } from './avatar_types';

export class Avatar3DService {
  private loader: AvatarAssetLoader;
  private expressionController: AvatarExpressionController;
  private animationController: AvatarAnimationController;
  private lipSyncController: AvatarLipSyncController;
  private renderer: AvatarRenderer | null = null;
  private rig: AvatarModelRig | null = null;
  private currentState: AvatarState = 'idle';

  constructor() {
    this.loader = new AvatarAssetLoader();
    this.expressionController = new AvatarExpressionController();
    this.animationController = new AvatarAnimationController();
    this.lipSyncController = new AvatarLipSyncController();
  }

  /**
   * Mounts the 3D Avatar into the given HTML container and canvas
   */
  public async mount(
    container: HTMLElement,
    canvas: HTMLCanvasElement,
    config?: Partial<AvatarRendererConfig>,
    modelUrl?: string
  ): Promise<void> {
    // 1. Initialize Renderer
    this.renderer = new AvatarRenderer(
      container,
      canvas,
      this.expressionController,
      this.animationController,
      this.lipSyncController,
      config
    );

    // 2. Load model (procedural or custom GLB)
    this.rig = await this.loader.loadAvatar(modelUrl);
    this.renderer.setRig(this.rig);

    // 3. Apply initial state
    this.setState(this.currentState);
  }

  /**
   * Sets the overall AvatarState, automatically mapping to appropriate expressions and animation behavior
   */
  public setState(state: AvatarState): void {
    this.currentState = state;

    switch (state) {
      case 'idle':
        this.expressionController.setExpression('neutral');
        break;
      case 'listening':
        this.expressionController.setExpression('smile');
        break;
      case 'thinking':
        this.expressionController.setExpression('thinking');
        break;
      case 'speaking':
        this.expressionController.setExpression('smile');
        break;
      case 'happy':
        this.expressionController.setExpression('happy');
        break;
      case 'excited':
        this.expressionController.setExpression('excited');
        break;
      case 'confused':
        this.expressionController.setExpression('confused');
        break;
      case 'sad':
        this.expressionController.setExpression('sad');
        break;
      case 'empathetic':
        this.expressionController.setExpression('empathetic');
        break;
      case 'sleepy':
        this.expressionController.setExpression('sleepy');
        break;
      case 'error':
        this.expressionController.setExpression('confused');
        break;
      default:
        this.expressionController.setExpression('neutral');
        break;
    }
  }

  public getState(): AvatarState {
    return this.currentState;
  }

  public setExpression(expression: AvatarExpression): void {
    this.expressionController.setExpression(expression);
  }

  public getExpression(): AvatarExpression {
    return this.expressionController.getExpression();
  }

  public setReducedMotion(enabled: boolean): void {
    this.animationController.setReducedMotion(enabled);
  }

  public setPointerTarget(x: number, y: number): void {
    this.animationController.setPointerTarget(x, y);
  }

  public attachAudioElement(audioElement: HTMLAudioElement): void {
    this.lipSyncController.attachAudioElement(audioElement);
  }

  public startProceduralSpeech(text: string, durationMs?: number): void {
    this.setState('speaking');
    this.lipSyncController.startProceduralSpeech(text, durationMs);
  }

  public stopSpeaking(): void {
    this.lipSyncController.stopSpeaking();
    if (this.currentState === 'speaking') {
      this.setState('idle');
    }
  }

  public isSpeaking(): boolean {
    return this.lipSyncController.isSpeaking();
  }

  public isProceduralModel(): boolean {
    return this.rig ? this.rig.isProcedural : true;
  }

  public dispose(): void {
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    this.lipSyncController.dispose();
    this.rig = null;
  }
}
