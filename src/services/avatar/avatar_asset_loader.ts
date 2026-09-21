/**
 * WA Avatar - AvatarAssetLoader (Stage 3A)
 * Loads external GLTF/GLB models or builds a procedural realistic 3D model
 * representing Wasim Akram with full morph targets for expressions, lip-sync, and idle animations.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface AvatarModelRig {
  root: THREE.Group;
  head: THREE.Object3D;
  chest: THREE.Object3D;
  leftEye: THREE.Object3D;
  rightEye: THREE.Object3D;
  leftEyelid?: THREE.Object3D;
  rightEyelid?: THREE.Object3D;
  mouthMesh?: THREE.Mesh;
  morphMeshes: THREE.Mesh[];
  setMorphTarget: (name: string, value: number) => void;
  isProcedural: boolean;
}

export class AvatarAssetLoader {
  private gltfLoader: GLTFLoader;

  constructor() {
    this.gltfLoader = new GLTFLoader();
  }

  /**
   * Attempts to load a GLTF/GLB model from URL, or falls back to procedural realistic 3D model
   */
  public async loadAvatar(url?: string): Promise<AvatarModelRig> {
    if (url) {
      try {
        const gltf = await this.loadGLTF(url);
        const rig = this.setupGLTFRig(gltf.scene);
        if (rig) return rig;
      } catch (err) {
        console.warn('Custom GLB model loading failed, falling back to procedural 3D model:', err);
      }
    }

    // Default to the procedural 3D Wasim Akram model
    return this.buildProceduralWasimAvatar();
  }

  private loadGLTF(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(url, resolve, undefined, reject);
    });
  }

  private setupGLTFRig(modelScene: THREE.Group): AvatarModelRig | null {
    try {
      const morphMeshes: THREE.Mesh[] = [];
      let head: THREE.Object3D | null = null;
      let leftEye: THREE.Object3D | null = null;
      let rightEye: THREE.Object3D | null = null;
      let chest: THREE.Object3D | null = null;

      modelScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
            morphMeshes.push(mesh);
          }
          const lowerName = mesh.name.toLowerCase();
          if (lowerName.includes('head') && !head) head = mesh;
          if (lowerName.includes('eye_l') || lowerName.includes('left_eye')) leftEye = mesh;
          if (lowerName.includes('eye_r') || lowerName.includes('right_eye')) rightEye = mesh;
          if (lowerName.includes('chest') || lowerName.includes('spine')) chest = mesh;
        }
      });

      const root = modelScene;
      if (!head) head = root;
      if (!chest) chest = root;
      if (!leftEye) leftEye = head;
      if (!rightEye) rightEye = head;

      const setMorphTarget = (name: string, value: number) => {
        for (const mesh of morphMeshes) {
          if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
            // Check direct name or aliases
            const aliases: Record<string, string[]> = {
              jawOpen: ['jawOpen', 'mouthOpen', 'viseme_aa', 'mouth_open'],
              mouthSmile: ['mouthSmile', 'mouthSmileLeft', 'mouthSmileRight', 'smile'],
              mouthFrown: ['mouthFrown', 'mouthFrownLeft', 'mouthFrownRight', 'frown'],
              browInnerUp: ['browInnerUp', 'browUp'],
              eyeBlinkLeft: ['eyeBlinkLeft', 'blink_l', 'blink'],
              eyeBlinkRight: ['eyeBlinkRight', 'blink_r', 'blink'],
              mouthPucker: ['mouthPucker', 'viseme_O', 'mouth_pucker'],
            };

            const searchKeys = aliases[name] || [name];
            for (const key of searchKeys) {
              const idx = mesh.morphTargetDictionary[key];
              if (idx !== undefined) {
                mesh.morphTargetInfluences[idx] = Math.max(0, Math.min(1, value));
              }
            }
          }
        }
      };

      return {
        root,
        head,
        chest,
        leftEye,
        rightEye,
        morphMeshes,
        setMorphTarget,
        isProcedural: false,
      };
    } catch (err) {
      console.warn('Error setting up GLTF rig:', err);
      return null;
    }
  }

  /**
   * Procedural Realistic 3D Model representing Wasim Akram:
   * Features detailed head proportions, styled dark hair, expressive eyes,
   * eyelids, mouth with morph targets, neck, shoulders, shirt & jacket.
   */
  public buildProceduralWasimAvatar(): AvatarModelRig {
    const root = new THREE.Group();
    root.name = 'WasimAvatarRig';

    // ----------------------------------------------------
    // Materials
    // ----------------------------------------------------
    // Warm wheatish/olive South Asian skin tone
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#d49774'),
      roughness: 0.65,
      metalness: 0.05,
      shadowSide: THREE.DoubleSide,
    });

    const skinShadowMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#c2825e'),
      roughness: 0.72,
      metalness: 0.02,
    });

    // Dark styled hair with subtle sheen
    const hairMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1c1917'),
      roughness: 0.8,
      metalness: 0.1,
    });

    // Sclera (eyeball white)
    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f8fafc'),
      roughness: 0.1,
      metalness: 0.0,
    });

    // Dark brown iris matching Wasim Akram's eye color
    const irisMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2d1a10'),
      roughness: 0.2,
      metalness: 0.1,
    });

    // Pupil
    const pupilMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#000000'),
    });

    // Lips material (natural warm rose-brown)
    const lipsMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#aa5d4e'),
      roughness: 0.5,
      metalness: 0.05,
    });

    // Casual jacket (slate navy)
    const jacketMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1e293b'),
      roughness: 0.75,
      metalness: 0.1,
    });

    // Inner collar shirt (clean off-white)
    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f1f5f9'),
      roughness: 0.6,
      metalness: 0.0,
    });

    // ----------------------------------------------------
    // Chest & Shoulders Rig (moves with breathing)
    // ----------------------------------------------------
    const chest = new THREE.Group();
    chest.name = 'Chest';
    chest.position.set(0, -1.05, 0);

    // Shoulders & Torso
    const torsoGeo = new THREE.CylinderGeometry(0.85, 0.95, 1.2, 24);
    torsoGeo.scale(1.2, 1.0, 0.65);
    const torsoMesh = new THREE.Mesh(torsoGeo, jacketMaterial);
    torsoMesh.position.set(0, -0.4, 0);
    chest.add(torsoMesh);

    // Jacket Collar Left & Right Lapels
    const lapelLeftGeo = new THREE.BoxGeometry(0.12, 0.45, 0.06);
    lapelLeftGeo.rotateZ(0.25);
    const lapelLeft = new THREE.Mesh(lapelLeftGeo, jacketMaterial);
    lapelLeft.position.set(-0.24, 0.1, 0.35);
    chest.add(lapelLeft);

    const lapelRightGeo = new THREE.BoxGeometry(0.12, 0.45, 0.06);
    lapelRightGeo.rotateZ(-0.25);
    const lapelRight = new THREE.Mesh(lapelRightGeo, jacketMaterial);
    lapelRight.position.set(0.24, 0.1, 0.35);
    chest.add(lapelRight);

    // Inner White Shirt V-Neck
    const shirtGeo = new THREE.BufferGeometry();
    const shirtVertices = new Float32Array([
      -0.2, 0.25, 0.33,
       0.2, 0.25, 0.33,
       0.0, -0.2, 0.33,
    ]);
    shirtGeo.setAttribute('position', new THREE.BufferAttribute(shirtVertices, 3));
    shirtGeo.computeVertexNormals();
    const shirtMesh = new THREE.Mesh(shirtGeo, shirtMaterial);
    chest.add(shirtMesh);

    root.add(chest);

    // ----------------------------------------------------
    // Neck & Head Rig
    // ----------------------------------------------------
    const head = new THREE.Group();
    head.name = 'Head';
    head.position.set(0, 0, 0);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.55, 20);
    const neckMesh = new THREE.Mesh(neckGeo, skinShadowMaterial);
    neckMesh.position.set(0, -0.5, -0.04);
    head.add(neckMesh);

    // Main Head Cranium & Face Shape
    const headGeo = new THREE.SphereGeometry(0.62, 32, 28);
    headGeo.scale(0.85, 1.05, 0.95);
    const headMesh = new THREE.Mesh(headGeo, skinMaterial);
    headMesh.position.set(0, 0.05, 0);
    head.add(headMesh);

    // Jawline and Chin Structure
    const chinGeo = new THREE.BoxGeometry(0.36, 0.28, 0.35);
    chinGeo.rotateX(0.2);
    const chinMesh = new THREE.Mesh(chinGeo, skinMaterial);
    chinMesh.position.set(0, -0.36, 0.3);
    head.add(chinMesh);

    // Cheekbones (subtle lateral definition)
    const cheekLeft = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), skinMaterial);
    cheekLeft.scale.set(1.0, 0.7, 0.8);
    cheekLeft.position.set(-0.35, -0.05, 0.36);
    head.add(cheekLeft);

    const cheekRight = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), skinMaterial);
    cheekRight.scale.set(1.0, 0.7, 0.8);
    cheekRight.position.set(0.35, -0.05, 0.36);
    head.add(cheekRight);

    // Ears Left & Right
    const earGeo = new THREE.SphereGeometry(0.16, 16, 12);
    earGeo.scale(0.35, 1.0, 0.6);
    earGeo.rotateZ(0.1);
    const earLeft = new THREE.Mesh(earGeo, skinMaterial);
    earLeft.position.set(-0.55, 0.05, -0.05);
    head.add(earLeft);

    const earRight = new THREE.Mesh(earGeo, skinMaterial);
    earRight.scale.set(-0.35, 1.0, 0.6);
    earRight.position.set(0.55, 0.05, -0.05);
    head.add(earRight);

    // Nose
    const noseBridgeGeo = new THREE.ConeGeometry(0.09, 0.32, 16);
    noseBridgeGeo.rotateX(-0.35);
    const noseBridge = new THREE.Mesh(noseBridgeGeo, skinMaterial);
    noseBridge.position.set(0, -0.02, 0.58);
    head.add(noseBridge);

    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), skinMaterial);
    noseTip.position.set(0, -0.16, 0.62);
    head.add(noseTip);

    // Nostrils
    const nostrilLeft = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), skinShadowMaterial);
    nostrilLeft.position.set(-0.07, -0.17, 0.58);
    head.add(nostrilLeft);

    const nostrilRight = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), skinShadowMaterial);
    nostrilRight.position.set(0.07, -0.17, 0.58);
    head.add(nostrilRight);

    // ----------------------------------------------------
    // Eyes Rig & Saccades
    // ----------------------------------------------------
    const leftEye = new THREE.Group();
    leftEye.name = 'LeftEye';
    leftEye.position.set(-0.21, 0.08, 0.49);

    const rightEye = new THREE.Group();
    rightEye.name = 'RightEye';
    rightEye.position.set(0.21, 0.08, 0.49);

    // Eyeball Sclera
    const eyeballGeo = new THREE.SphereGeometry(0.11, 20, 16);
    eyeballGeo.scale(1.0, 0.85, 0.95);

    const leftEyeball = new THREE.Mesh(eyeballGeo, eyeWhiteMaterial);
    const rightEyeball = new THREE.Mesh(eyeballGeo, eyeWhiteMaterial);

    // Irises & Pupils
    const irisGeo = new THREE.CircleGeometry(0.052, 24);
    const pupilGeo = new THREE.CircleGeometry(0.026, 20);

    const leftIris = new THREE.Mesh(irisGeo, irisMaterial);
    leftIris.position.set(0, 0, 0.105);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMaterial);
    leftPupil.position.set(0, 0, 0.107);
    leftEye.add(leftEyeball, leftIris, leftPupil);

    const rightIris = new THREE.Mesh(irisGeo, irisMaterial);
    rightIris.position.set(0, 0, 0.105);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMaterial);
    rightPupil.position.set(0, 0, 0.107);
    rightEye.add(rightEyeball, rightIris, rightPupil);

    head.add(leftEye, rightEye);

    // Eyebrows
    const browGeo = new THREE.BoxGeometry(0.22, 0.04, 0.06);
    browGeo.rotateZ(0.08);
    const leftBrow = new THREE.Mesh(browGeo, hairMaterial);
    leftBrow.position.set(-0.21, 0.22, 0.55);
    head.add(leftBrow);

    const rightBrowGeo = new THREE.BoxGeometry(0.22, 0.04, 0.06);
    rightBrowGeo.rotateZ(-0.08);
    const rightBrow = new THREE.Mesh(rightBrowGeo, hairMaterial);
    rightBrow.position.set(0.21, 0.22, 0.55);
    head.add(rightBrow);

    // ----------------------------------------------------
    // Eyelids (for realistic blinking)
    // ----------------------------------------------------
    const eyelidGeo = new THREE.SphereGeometry(0.12, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const leftEyelid = new THREE.Mesh(eyelidGeo, skinMaterial);
    leftEyelid.position.copy(leftEye.position);
    leftEyelid.position.z += 0.01;
    leftEyelid.rotation.x = -Math.PI * 0.5; // Initially fully open
    head.add(leftEyelid);

    const rightEyelid = new THREE.Mesh(eyelidGeo, skinMaterial);
    rightEyelid.position.copy(rightEye.position);
    rightEyelid.position.z += 0.01;
    rightEyelid.rotation.x = -Math.PI * 0.5; // Initially fully open
    head.add(rightEyelid);

    // ----------------------------------------------------
    // Mouth & Lower Jaw Rig with Morph Targets
    // ----------------------------------------------------
    const mouthGroup = new THREE.Group();
    mouthGroup.name = 'MouthGroup';
    mouthGroup.position.set(0, -0.28, 0.53);

    // Upper and Lower Lips
    const upperLipGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.28, 16);
    upperLipGeo.rotateZ(Math.PI * 0.5);
    const upperLip = new THREE.Mesh(upperLipGeo, lipsMaterial);
    upperLip.position.set(0, 0.03, 0.03);
    mouthGroup.add(upperLip);

    const lowerLipGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.24, 16);
    lowerLipGeo.rotateZ(Math.PI * 0.5);
    const lowerLip = new THREE.Mesh(lowerLipGeo, lipsMaterial);
    lowerLip.position.set(0, -0.03, 0.02);
    mouthGroup.add(lowerLip);

    head.add(mouthGroup);

    // ----------------------------------------------------
    // Styled Dark Hair (Modern Pompadour / Textured Crop)
    // ----------------------------------------------------
    const hairGroup = new THREE.Group();
    hairGroup.name = 'HairGroup';

    // Hair base crown
    const hairCrownGeo = new THREE.SphereGeometry(0.64, 24, 20);
    hairCrownGeo.scale(0.88, 1.08, 0.98);
    const hairCrown = new THREE.Mesh(hairCrownGeo, hairMaterial);
    hairCrown.position.set(0, 0.16, -0.04);
    hairGroup.add(hairCrown);

    // Top Crest Volume
    const crestGeo = new THREE.CylinderGeometry(0.42, 0.52, 0.35, 20);
    crestGeo.rotateX(0.2);
    const crest = new THREE.Mesh(crestGeo, hairMaterial);
    crest.position.set(0, 0.65, 0.08);
    hairGroup.add(crest);

    // Front styled fringe
    const fringeGeo = new THREE.ConeGeometry(0.48, 0.28, 16);
    fringeGeo.rotateX(-0.4);
    const fringe = new THREE.Mesh(fringeGeo, hairMaterial);
    fringe.position.set(0, 0.68, 0.32);
    hairGroup.add(fringe);

    // Sideburns Left & Right
    const sideburnGeo = new THREE.BoxGeometry(0.07, 0.32, 0.12);
    const leftSideburn = new THREE.Mesh(sideburnGeo, hairMaterial);
    leftSideburn.position.set(-0.5, 0.1, 0.2);
    hairGroup.add(leftSideburn);

    const rightSideburn = new THREE.Mesh(sideburnGeo, hairMaterial);
    rightSideburn.position.set(0.5, 0.1, 0.2);
    hairGroup.add(rightSideburn);

    head.add(hairGroup);
    root.add(head);

    // ----------------------------------------------------
    // Unified Morph Target Controller for Procedural Mesh
    // ----------------------------------------------------
    const setMorphTarget = (name: string, value: number) => {
      const v = Math.max(0, Math.min(1, value));

      if (name === 'eyeBlinkLeft' || name === 'blink_l') {
        // -PI*0.5 is open, 0 is fully closed
        leftEyelid.rotation.x = -Math.PI * 0.5 * (1 - v);
      }
      if (name === 'eyeBlinkRight' || name === 'blink_r') {
        rightEyelid.rotation.x = -Math.PI * 0.5 * (1 - v);
      }

      if (name === 'jawOpen') {
        // Lip separation and lower jaw drop
        lowerLip.position.y = -0.03 - v * 0.09;
        mouthGroup.scale.y = 1 + v * 0.4;
        chinMesh.position.y = -0.36 - v * 0.04;
      }

      if (name === 'mouthSmile') {
        upperLip.scale.x = 1 + v * 0.28;
        lowerLip.scale.x = 1 + v * 0.24;
        upperLip.position.y = 0.03 + v * 0.02;
        mouthGroup.position.z = 0.53 + v * 0.01;
      }

      if (name === 'mouthPucker') {
        upperLip.scale.x = Math.max(0.6, 1 - v * 0.35);
        lowerLip.scale.x = Math.max(0.6, 1 - v * 0.35);
        mouthGroup.position.z = 0.53 + v * 0.04;
      }

      if (name === 'mouthFrown') {
        upperLip.position.y = 0.03 - v * 0.02;
        lowerLip.position.y = -0.03 - v * 0.02;
      }

      if (name === 'browInnerUp') {
        leftBrow.position.y = 0.22 + v * 0.04;
        rightBrow.position.y = 0.22 + v * 0.04;
      }

      if (name === 'browDownLeft') {
        leftBrow.position.y = 0.22 - v * 0.04;
      }

      if (name === 'browDownRight') {
        rightBrow.position.y = 0.22 - v * 0.04;
      }
    };

    return {
      root,
      head,
      chest,
      leftEye,
      rightEye,
      leftEyelid,
      rightEyelid,
      morphMeshes: [],
      setMorphTarget,
      isProcedural: true,
    };
  }
}
