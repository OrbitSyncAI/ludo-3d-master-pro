/**
 * Ludo 3D Pro - 3D Token (Pawn) Class & Management
 * Realistic hopping animation, selection glow, multi-token stacking
 * Optimized for rock-solid 60 FPS mobile performance & zero ghost highlights
 */

import * as THREE from 'three';
import { PLAYERS_CONFIG, getTokenWorldCoords } from './boardData.js';
import { sounds } from './audio.js';

// Module-level shared geometries to eliminate GPU buffer duplication across tokens
const SHARED_GEOMETRIES = {
  base: new THREE.CylinderGeometry(0.32, 0.38, 0.15, 20),
  goldRing: new THREE.TorusGeometry(0.33, 0.035, 12, 24),
  body: new THREE.CylinderGeometry(0.18, 0.30, 0.38, 20),
  collar: new THREE.CylinderGeometry(0.24, 0.24, 0.06, 20),
  head: new THREE.SphereGeometry(0.24, 20, 20),
  crown: new THREE.ConeGeometry(0.08, 0.14, 14),
  selectionRing: new THREE.RingGeometry(0.36, 0.52, 24)
};

// Module-level shared metallic materials
const BASE_MAT = new THREE.MeshStandardMaterial({
  color: 0x2b3040,
  metalness: 0.9,
  roughness: 0.2
});

const GOLD_MAT = new THREE.MeshStandardMaterial({
  color: 0xffd700,
  metalness: 0.95,
  roughness: 0.1
});

export class Token3D {
  constructor(playerId, tokenIndex, scene) {
    this.playerId = playerId;
    this.tokenIndex = tokenIndex;
    this.scene = scene;
    this.playerConfig = PLAYERS_CONFIG[playerId];
    
    this.step = -1; // -1: in Yard, 0..50: common path, 51..55: home stretch, 56: won
    this.isMoving = false;
    this.isSelectable = false;
    this.baseY = 0.25;
    
    this.mesh = this.createMesh();
    this.selectionRing = this.createSelectionRing();
    this.scene.add(this.mesh);
    this.scene.add(this.selectionRing);

    // Initial position in yard
    this.updatePositionInstant();
  }

  // Create elegant Pawn Mesh with metallic base and colored crystal head
  createMesh() {
    const group = new THREE.Group();
    group.userData = {
      isToken: true,
      playerId: this.playerId,
      tokenIndex: this.tokenIndex
    };

    // 1. Heavy Metallic Base
    const baseMesh = new THREE.Mesh(SHARED_GEOMETRIES.base, BASE_MAT);
    baseMesh.position.y = 0.075;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // 2. Gold Accent Ring
    const goldMesh = new THREE.Mesh(SHARED_GEOMETRIES.goldRing, GOLD_MAT);
    goldMesh.rotation.x = Math.PI / 2;
    goldMesh.position.y = 0.16;
    group.add(goldMesh);

    // 3. Tapered Pawn Body (Player Color)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: this.playerConfig.hexColor,
      metalness: 0.5,
      roughness: 0.3
    });
    const bodyMesh = new THREE.Mesh(SHARED_GEOMETRIES.body, bodyMat);
    bodyMesh.position.y = 0.35;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // 4. Neck Collar Ring
    const collarMesh = new THREE.Mesh(SHARED_GEOMETRIES.collar, GOLD_MAT);
    collarMesh.position.y = 0.56;
    group.add(collarMesh);

    // 5. Gemstone Crown Sphere Head (Standard Material with emissive for 60 FPS mobile speed)
    const headMat = new THREE.MeshStandardMaterial({
      color: this.playerConfig.hexColor,
      emissive: this.playerConfig.glowColor,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.5
    });
    const headMesh = new THREE.Mesh(SHARED_GEOMETRIES.head, headMat);
    headMesh.position.y = 0.78;
    headMesh.castShadow = true;
    group.add(headMesh);

    // 6. Mini Crown Finial on top
    const crownMesh = new THREE.Mesh(SHARED_GEOMETRIES.crown, GOLD_MAT);
    crownMesh.position.y = 1.05;
    group.add(crownMesh);

    return group;
  }

  // Pulsing Holographic Selection Ring under active token
  createSelectionRing() {
    const ringMat = new THREE.MeshBasicMaterial({
      color: this.playerConfig.hexColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
    const ring = new THREE.Mesh(SHARED_GEOMETRIES.selectionRing, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.12;
    ring.visible = false;
    return ring;
  }

  // Smooth coordinate update when stacking or resting
  smoothOffsetTo(targetOffset = { x: 0, z: 0 }, duration = 120) {
    if (this.isMoving) return;
    const base = getTokenWorldCoords(this.playerId, this.tokenIndex, this.step);
    this.baseY = base.y;
    const destX = base.x + (targetOffset.x || 0);
    const destZ = base.z + (targetOffset.z || 0);
    const startX = this.mesh.position.x;
    const startZ = this.mesh.position.z;

    const diff = Math.hypot(destX - startX, destZ - startZ);
    if (diff < 0.005) return;

    const startTime = performance.now();
    const stepSlide = (now) => {
      if (this.isMoving) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const ease = 0.5 - Math.cos(progress * Math.PI) / 2;

      const curX = startX + (destX - startX) * ease;
      const curZ = startZ + (destZ - startZ) * ease;
      this.mesh.position.x = curX;
      this.mesh.position.z = curZ;
      this.selectionRing.position.x = curX;
      this.selectionRing.position.z = curZ;

      if (progress < 1.0) {
        requestAnimationFrame(stepSlide);
      } else {
        this.mesh.position.set(destX, base.y, destZ);
        this.selectionRing.position.set(destX, 0.12, destZ);
      }
    };
    requestAnimationFrame(stepSlide);
  }

  // Immediate coordinate update without animation
  updatePositionInstant(stackOffset = { x: 0, z: 0 }) {
    const target = getTokenWorldCoords(this.playerId, this.tokenIndex, this.step);
    this.baseY = target.y;
    this.mesh.position.set(target.x + stackOffset.x, target.y, target.z + stackOffset.z);
    this.selectionRing.position.set(target.x + stackOffset.x, 0.12, target.z + stackOffset.z);
    if (!this.isSelectable || this.step >= 56) {
      this.selectionRing.visible = false;
      this.selectionRing.material.opacity = 0.0;
    }
  }

  // Set whether this token can be clicked to move
  setSelectable(selectable) {
    // If token has already reached home goal (step >= 56), it can NEVER be selectable or highlighted
    if (this.step >= 56) {
      selectable = false;
    }
    this.isSelectable = selectable;
    if (selectable) {
      this.selectableStartTime = performance.now();
      this.selectionRing.visible = true;
      this.selectionRing.material.opacity = 0.0;
      // Golden beacon ring for yard pawns, team color for track pawns
      this.selectionRing.material.color.setHex(this.step === -1 ? 0xffd700 : this.playerConfig.hexColor);
      // Synchronize selectionRing position lockstep with token's current world position (elevated above yard pedestal)
      const ringY = this.step === -1 ? 0.26 : 0.12;
      this.selectionRing.position.set(this.mesh.position.x, ringY, this.mesh.position.z);
    } else {
      this.selectionRing.visible = false;
      this.selectionRing.material.opacity = 0.0;
      if (this.baseY !== undefined) {
        this.mesh.position.y = this.baseY; // reset flush on pedestal
      }
      this.mesh.scale.set(1.0, 1.0, 1.0);
      this.mesh.rotation.set(0, 0, 0);
    }
  }

  // Animate hop step-by-step
  async moveAlongPath(targetStep, getStackOffsetFn) {
    this.isMoving = true;
    this.setSelectable(false);

    // If starting from yard
    if (this.step === -1) {
      sounds.playTokenSpawn();
      await this.animateYardSpawn();
      this.step = 0;
      const finalCoord = getTokenWorldCoords(this.playerId, this.tokenIndex, 0);
      this.baseY = finalCoord.y;
      this.mesh.position.set(finalCoord.x, finalCoord.y, finalCoord.z);
      this.selectionRing.position.set(finalCoord.x, 0.12, finalCoord.z);
      this.isMoving = false;
      return;
    }

    const stepsToHop = targetStep - this.step;
    for (let s = 1; s <= stepsToHop; s++) {
      const currentHopStep = this.step + s;
      const startCoord = getTokenWorldCoords(this.playerId, this.tokenIndex, currentHopStep - 1);
      const endCoord = getTokenWorldCoords(this.playerId, this.tokenIndex, currentHopStep);
      
      const pitchMultiplier = 1.0 + (s / stepsToHop) * 0.4;
      sounds.playTokenStep(pitchMultiplier);

      await this.animateSingleHop(startCoord, endCoord);
    }

    this.step = targetStep;
    
    // Apply final stack offset if sharing space
    const offset = getStackOffsetFn ? getStackOffsetFn(this) : { x: 0, z: 0 };
    const finalCoord = getTokenWorldCoords(this.playerId, this.tokenIndex, this.step);
    this.baseY = finalCoord.y;
    this.mesh.position.set(finalCoord.x + offset.x, finalCoord.y, finalCoord.z + offset.z);
    this.selectionRing.position.set(finalCoord.x + offset.x, 0.12, finalCoord.z + offset.z);
    if (this.step >= 56) {
      this.selectionRing.visible = false;
      this.selectionRing.material.opacity = 0.0;
    }

    this.isMoving = false;
  }

  // Smooth, rhythmic step hop animation from tile A to B (180ms with squash & stretch - balanced pacing)
  animateSingleHop(start, end, duration = 180) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const hopHeight = 0.55;

      const stepHop = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1.0);

        // Cosine smooth easing for organic horizontal trajectory
        const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
        const x = start.x + (end.x - start.x) * ease;
        const z = start.z + (end.z - start.z) * ease;

        // Parabolic arc for Y
        const arc = Math.sin(progress * Math.PI);
        const y = start.y + arc * hopHeight;

        // Dynamic squash and stretch: stretched at peak, subtle cushion squash on touchdown
        const scaleY = 1.0 + (arc > 0.25 ? (arc - 0.25) * 0.18 : -(0.25 - arc) * 0.10);
        const scaleXZ = 1.0 / Math.sqrt(Math.max(0.65, scaleY));
        this.mesh.scale.set(scaleXZ, scaleY, scaleXZ);

        this.mesh.position.set(x, y, z);
        this.selectionRing.position.set(x, 0.12, z);

        if (progress < 1.0) {
          requestAnimationFrame(stepHop);
        } else {
          this.mesh.position.set(end.x, end.y, end.z);
          this.selectionRing.position.set(end.x, 0.12, end.z);
          this.mesh.scale.set(1.0, 1.0, 1.0);
          resolve();
        }
      };
      requestAnimationFrame(stepHop);
    });
  }

  // Dramatic Celebratory Arc out of Yard onto Start Square (Balanced 460ms)
  animateYardSpawn(duration = 460) {
    return new Promise((resolve) => {
      this.setSelectable(false);
      const start = getTokenWorldCoords(this.playerId, this.tokenIndex, -1);
      const end = getTokenWorldCoords(this.playerId, this.tokenIndex, 0);
      this.baseY = end.y;
      const startTime = performance.now();
      const jumpHeight = 2.4; // High triumphant airborne leap

      const spawnAnim = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1.0);

        if (progress < 0.8) {
          // Phase 1: Majestic soaring arc with 2 full airborne spins
          const t = progress / 0.8;
          const ease = 0.5 - Math.cos(t * Math.PI) / 2;
          const x = start.x + (end.x - start.x) * ease;
          const z = start.z + (end.z - start.z) * ease;
          const y = start.y + Math.sin(t * Math.PI) * jumpHeight;

          this.mesh.position.set(x, y, z);
          this.selectionRing.position.set(x, 0.12, z);
          this.mesh.rotation.y = t * Math.PI * 4; // 2 full airborne spins

          // Mid-air stretch
          const stretch = 1.0 + Math.sin(t * Math.PI) * 0.22;
          this.mesh.scale.set(1.0 / Math.sqrt(stretch), stretch, 1.0 / Math.sqrt(stretch));
        } else {
          // Phase 2: Landing impact & elastic squash-stretch
          const t2 = (progress - 0.8) / 0.2;
          this.mesh.position.set(end.x, end.y, end.z);
          this.selectionRing.position.set(end.x, 0.12, end.z);
          this.mesh.rotation.y = 0;

          const squish = 1.0 - Math.sin(t2 * Math.PI) * 0.20;
          this.mesh.scale.set(1.0 + (1.0 - squish), squish, 1.0 + (1.0 - squish));
        }

        if (progress < 1.0) {
          requestAnimationFrame(spawnAnim);
        } else {
          this.mesh.rotation.set(0, 0, 0);
          this.mesh.position.set(end.x, end.y, end.z);
          this.selectionRing.position.set(end.x, 0.12, end.z);
          this.mesh.scale.set(1.0, 1.0, 1.0);
          resolve();
        }
      };
      requestAnimationFrame(spawnAnim);
    });
  }

  // Knockout return to base yard (Crisp 380ms)
  animateCaptured() {
    return new Promise((resolve) => {
      this.setSelectable(false);
      sounds.playTokenCapture();
      const start = { ...this.mesh.position };
      this.step = -1;
      const end = getTokenWorldCoords(this.playerId, this.tokenIndex, -1);
      this.baseY = end.y;
      const startTime = performance.now();
      const duration = 380;

      const capAnim = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1.0);

        const x = start.x + (end.x - start.x) * progress;
        const z = start.z + (end.z - start.z) * progress;
        const y = Math.max(start.y, end.y) + Math.sin(progress * Math.PI) * 1.8;

        this.mesh.position.set(x, y, z);
        this.selectionRing.position.set(x, 0.12, z);
        this.mesh.rotation.y = progress * Math.PI * 6; // spin back
        this.mesh.rotation.x = Math.sin(progress * Math.PI) * 0.6; // tilt tumble

        if (progress < 1.0) {
          requestAnimationFrame(capAnim);
        } else {
          this.mesh.rotation.set(0, 0, 0);
          this.mesh.position.set(end.x, end.y, end.z);
          this.selectionRing.position.set(end.x, 0.26, end.z);
          this.selectionRing.visible = false;
          this.selectionRing.material.opacity = 0.0;
          resolve();
        }
      };
      requestAnimationFrame(capAnim);
    });
  }

  // Idle hover bounce when selectable (Slow, calm, majestic rhythmic breathing - zero fast jerk)
  update(delta) {
    if (this.isSelectable && !this.isMoving && this.step < 56) {
      if (this.baseY === undefined) {
        this.baseY = getTokenWorldCoords(this.playerId, this.tokenIndex, this.step).y;
      }

      // Smooth slow entry ramp (800ms ease-in)
      const elapsed = Math.min((performance.now() - (this.selectableStartTime || performance.now())) / 800, 1.0);
      const entryEase = 0.5 - Math.cos(elapsed * Math.PI) / 2;

      // Lock selection ring under token
      this.selectionRing.position.x = this.mesh.position.x;
      this.selectionRing.position.y = this.step === -1 ? 0.26 : 0.12;
      this.selectionRing.position.z = this.mesh.position.z;

      // Very slow, relaxing breathing frequency (1 full cycle every ~3.5 seconds)
      const t = Date.now() * 0.0018;

      // Gentle, slow unlock bounce for tokens in yard when 6 is rolled
      if (this.step === -1) {
        const bounce = (Math.sin(t) * 0.5 + 0.5) * 0.12 * entryEase;
        this.mesh.position.y = this.baseY + bounce;
        const pulseScale = 1.0 + Math.sin(t) * 0.03 * entryEase;
        this.mesh.scale.set(1.0, pulseScale, 1.0);
        this.mesh.rotation.y = 0;

        // Radiant expanding golden aura beacon (slow & smooth)
        const ringPulse = 1.0 + Math.sin(t) * 0.08;
        this.selectionRing.scale.set(ringPulse, ringPulse, ringPulse);
        this.selectionRing.material.opacity = (0.75 + Math.sin(t) * 0.20) * entryEase;
      } else {
        // Track slow calm hover bounce
        const hover = (Math.sin(t) * 0.5 + 0.5) * 0.08 * entryEase;
        this.mesh.position.y = this.baseY + hover;
        const pulse = 1.0 + Math.sin(t) * 0.06;
        this.selectionRing.scale.set(pulse, pulse, pulse);
        this.selectionRing.material.opacity = (0.75 + Math.sin(t) * 0.20) * entryEase;
      }
    }
  }

  destroy() {
    this.scene.remove(this.mesh);
    this.scene.remove(this.selectionRing);
  }
}
