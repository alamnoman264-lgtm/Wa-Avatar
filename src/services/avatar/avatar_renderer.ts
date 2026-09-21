/**
 * WA Avatar - AvatarRenderer (Stage 3A)
 * Three.js WebGL rendering engine with studio lighting, camera framing,
 * performance throttling, power management, and tab visibility pausing.
 */

import * as THREE from 'three';
import { AvatarModelRig } from './avatar_asset_loader';
import { AvatarExpressionController } from './avatar_expression_controller';
import { AvatarAnimationController } from './avatar_animation_controller';
import { AvatarLipSyncController } from './avatar_lip_sync_controller';
import { AvatarRendererConfig } from './avatar_types';

export class AvatarRenderer {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  // Controllers
  private rig: AvatarModelRig | null = null;
  private expressionController: AvatarExpressionController;
  private animationController: AvatarAnimationController;
  private lipSyncController: AvatarLipSyncController;

  // State
  private isVisible: boolean = true;
  private isTabActive: boolean = true;
  private isDisposed: boolean = false;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private targetFps: number = 60;
  private frameInterval: number = 1000 / 60;

  constructor(
    container: HTMLElement,
    canvas: HTMLCanvasElement,
    expressionCtrl: AvatarExpressionController,
    animationCtrl: AvatarAnimationController,
    lipSyncCtrl: AvatarLipSyncController,
    config: Partial<AvatarRendererConfig> = {}
  ) {
    this.container = container;
    this.canvas = canvas;
    this.expressionController = expressionCtrl;
    this.animationController = animationCtrl;
    this.lipSyncController = lipSyncCtrl;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera: focused on human head & bust
    this.camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 20);
    this.camera.position.set(0, 0.05, 3.1);
    this.camera.lookAt(0, 0.02, 0);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: config.antialias !== false,
      powerPreference: config.powerPreference || 'high-performance',
    });

    const dprLimit = config.pixelRatioLimit || 2;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprLimit));
    this.renderer.setSize(width, height, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    // 4. Studio Lighting setup
    this.setupLighting();

    // 5. Visibility and Resize observers
    this.setupObservers();

    // 6. Start loop
    this.lastTime = performance.now();
    this.startLoop();
  }

  private setupLighting(): void {
    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.7);
    this.scene.add(ambientLight);

    // Main Key Light (Warm sunlight, 45 degrees)
    const keyLight = new THREE.DirectionalLight(0xfffaed, 1.3);
    keyLight.position.set(1.5, 2.0, 2.5);
    this.scene.add(keyLight);

    // Soft Fill Light (Cool sky bounce, opposite side)
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.65);
    fillLight.position.set(-1.8, 1.2, 2.0);
    this.scene.add(fillLight);

    // Rim / Backlight (creates crisp profile edge separation)
    const rimLight = new THREE.DirectionalLight(0x93c5fd, 1.0);
    rimLight.position.set(0, 2.5, -2.2);
    this.scene.add(rimLight);
  }

  private setupObservers(): void {
    // Resize Observer
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          this.handleResize(width, height);
        }
      }
    });
    this.resizeObserver.observe(this.container);

    // Intersection Observer (pauses rendering when offscreen)
    this.intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible && !this.animationFrameId) {
          this.startLoop();
        }
      }
    }, { threshold: 0.05 });
    this.intersectionObserver.observe(this.container);

    // Page Visibility API (pauses when browser tab is hidden)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleVisibilityChange = () => {
    this.isTabActive = !document.hidden;
    if (this.isTabActive && this.isVisible && !this.animationFrameId) {
      this.lastTime = performance.now();
      this.startLoop();
    }
  };

  private handleResize(width: number, height: number): void {
    if (this.isDisposed) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  public setRig(rig: AvatarModelRig): void {
    if (this.rig) {
      this.scene.remove(this.rig.root);
    }
    this.rig = rig;
    this.scene.add(rig.root);
  }

  public setCameraDistance(distance: number): void {
    this.camera.position.z = distance;
  }

  private startLoop(): void {
    if (this.animationFrameId || this.isDisposed) return;

    const loop = (now: number) => {
      if (this.isDisposed) return;

      if (!this.isVisible || !this.isTabActive) {
        this.animationFrameId = null;
        return; // Pause loop
      }

      this.animationFrameId = requestAnimationFrame(loop);

      const elapsed = now - this.lastTime;
      if (elapsed < this.frameInterval) return; // Throttle to target FPS

      const delta = Math.min(0.1, elapsed / 1000);
      this.lastTime = now - (elapsed % this.frameInterval);

      this.renderFrame(delta);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  private renderFrame(delta: number): void {
    if (!this.rig) return;

    // 1. Update Expression Controller
    const exprWeights = this.expressionController.update(delta);

    // 2. Update Idle Animation Controller
    const idle = this.animationController.update(delta);

    // 3. Update Lip-Sync Controller
    const lipSync = this.lipSyncController.update(delta);

    // 4. Apply Blinking (composite idle blink + expression squint)
    const combinedBlinkL = Math.max(idle.blinkWeight, exprWeights.eyeSquintLeft);
    const combinedBlinkR = Math.max(idle.blinkWeight, exprWeights.eyeSquintRight);
    this.rig.setMorphTarget('eyeBlinkLeft', combinedBlinkL);
    this.rig.setMorphTarget('eyeBlinkRight', combinedBlinkR);

    // 5. Apply Lip-sync Jaw Movement
    this.rig.setMorphTarget('jawOpen', lipSync.jawOpen);
    this.rig.setMorphTarget('mouthPucker', Math.max(lipSync.mouthPucker, exprWeights.mouthPucker));

    // 6. Apply Expression Morph Targets
    this.rig.setMorphTarget('mouthSmile', exprWeights.mouthSmile);
    this.rig.setMorphTarget('mouthFrown', exprWeights.mouthFrown);
    this.rig.setMorphTarget('browInnerUp', exprWeights.browInnerUp);
    this.rig.setMorphTarget('browDownLeft', exprWeights.browDownLeft);
    this.rig.setMorphTarget('browDownRight', exprWeights.browDownRight);

    // 7. Apply Head Rotations (composite idle + expression)
    this.rig.head.rotation.x = idle.headRotation.x + exprWeights.headTiltX;
    this.rig.head.rotation.y = idle.headRotation.y + exprWeights.headTiltY;
    this.rig.head.rotation.z = idle.headRotation.z + exprWeights.headTiltZ;

    // 8. Apply Chest Breathing
    this.rig.chest.position.y = -1.05 + idle.chestOffset;

    // 9. Apply Eye Saccades (move pupils slightly)
    this.rig.leftEye.rotation.y = idle.eyeOffset.x * 0.4;
    this.rig.leftEye.rotation.x = -idle.eyeOffset.y * 0.3;
    this.rig.rightEye.rotation.y = idle.eyeOffset.x * 0.4;
    this.rig.rightEye.rotation.x = -idle.eyeOffset.y * 0.3;

    // 10. Render
    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    this.isDisposed = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    // Traverse and dispose geometries and materials
    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else if (mesh.material) {
          mesh.material.dispose();
        }
      }
    });

    this.renderer.dispose();
  }
}
