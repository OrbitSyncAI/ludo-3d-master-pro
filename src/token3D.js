/**
 * Ludo 3D Pro - 3D Token (Pawn) Class & Management
 * Realistic hopping animation, selection glow, multi-token stacking
 */

import * as THREE from 'three';
import { PLAYERS_CONFIG, getTokenWorldCoords } from './boardData.js';
import { sounds } from './audio.js';

export class Token3D {
  constructor(playerId, tokenIndex, scene) {
    this.playerId = playerId;
    this.tokenIndex = tokenIndex;
    this.scene = scene;
    this.playerConfig = PLAYERS_CONFIG[playerId];
    
    this.step = -1; // -1: in Yard, 0..50: common path, 51..55: home stretch, 56: won
    this.isMoving = false;
    this.isSelectable = false;
    
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
    const baseGeo = new THREE.CylinderGeometry(0.32, 0.38, 0.15, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x2b3040,
      metalness: 0.9,
      roughness: 0.2
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.075;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // 2. Gold Accent Ring
    const goldRingGeo = new THREE.TorusGeometry(0.33, 0.035, 16, 32);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.95,
      roughness: 0.1
    });
    const goldMesh = new THREE.Mesh(goldRingGeo, goldMat);
    goldMesh.rotation.x = Math.PI / 2;
    goldMesh.position.y = 0.16;
    group.add(goldMesh);

    // 3. Tapered Pawn Body (Player Color)
    const bodyGeo = new THREE.CylinderGeometry(0.18, 0.30, 0.38, 32);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: this.playerConfig.hexColor,
      metalness: 0.5,
      roughness: 0.3
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.35;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // 4. Neck Collar Ring
    const collarGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.06, 32);
    const collarMesh = new THREE.Mesh(collarGeo, goldMat);
    collarMesh.position.y = 0.56;
    group.add(collarMesh);

    // 5. Gemstone Crown Sphere Head
    const headGeo = new THREE.SphereGeometry(0.24, 32, 32);
    const headMat = new THREE.MeshPhysicalMaterial({
      color: this.playerConfig.hexColor,
      emissive: this.playerConfig.glowColor,
      emissiveIntensity: 0.35,
      roughness: 0.1,
      metalness: 0.4,
      clearcoat: 1.0,
      transmission: 0.2
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 0.78;
    headMesh.castShadow = true;
    group.add(headMesh);

    // 6. Mini Crown Finial on top
    const crownGeo = new THREE.ConeGeometry(0.08, 0.14, 16);
    const crownMesh = new THREE.Mesh(crownGeo, goldMat);
    crownMesh.position.y = 1.05;
    group.add(crownMesh);

    return group;
  }

  // Pulsing Holographic Selection Ring under active token
  createSelectionRing() {
    const ringGeo = new THREE.RingGeometry(0.36, 0.52, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.12;
    return ring;
  }

  // Immediate coordinate update without animation
  updatePositionInstant(stackOffset = { x: 0, z: 0 }) {
    const target = getTokenWorldCoords(this.playerId, this.tokenIndex, this.step);
    this.mesh.position.set(target.x + stackOffset.x, target.y, target.z + stackOffset.z);
    this.selectionRing.position.set(target.x + stackOffset.x, target.y + 0.01, target.z + stackOffset.z);
  }

  // Set whether this token can be clicked to move
  setSelectable(selectable) {
    this.isSelectable = selectable;
    if (selectable) {
      this.selectionRing.material.opacity = 0.85;
      this.selectionRing.material.color.setHex(this.playerConfig.hexColor);
    } else {
      this.selectionRing.material.opacity = 0.0;
      const target = getTokenWorldCoords(this.playerId, this.tokenIndex, this.step);
      this.mesh.position.y = target.y; // reset flush on pedestal
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
    this.mesh.position.set(finalCoord.x + offset.x, finalCoord.y, finalCoord.z + offset.z);
    this.selectionRing.position.set(finalCoord.x + offset.x, finalCoord.y + 0.01, finalCoord.z + offset.z);

    this.isMoving = false;
  }

  // Smooth arc hop animation from point A to B
  animateSingleHop(start, end, duration = 160) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const hopHeight = 0.65;

      const stepHop = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1.0);

        // Linear interpolation for X and Z
        const x = start.x + (end.x - start.x) * progress;
        const z = start.z + (end.z - start.z) * progress;
        // Parabolic arc for Y
        const y = start.y + Math.sin(progress * Math.PI) * hopHeight;

        this.mesh.position.set(x, y, z);
        this.selectionRing.position.set(x, 0.12, z);

        if (progress < 1.0) {
          requestAnimationFrame(stepHop);
        } else {
          this.mesh.position.set(end.x, end.y, end.z);
          resolve();
        }
      };
      requestAnimationFrame(stepHop);
    });
  }

  // Dramatic Arc out of Yard onto Start Square
  animateYardSpawn(duration = 380) {
    return new Promise((resolve) => {
      const start = getTokenWorldCoords(this.playerId, this.tokenIndex, -1);
      const end = getTokenWorldCoords(this.playerId, this.tokenIndex, 0);
      const startTime = performance.now();
      const jumpHeight = 1.6;

      const spawnAnim = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1.0);

        const x = start.x + (end.x - start.x) * progress;
        const z = start.z + (end.z - start.z) * progress;
        const y = start.y + Math.sin(progress * Math.PI) * jumpHeight;

        this.mesh.position.set(x, y, z);
        this.mesh.rotation.y = progress * Math.PI * 4; // 2 full spins

        if (progress < 1.0) {
          requestAnimationFrame(spawnAnim);
        } else {
          this.mesh.rotation.y = 0;
          this.mesh.position.set(end.x, end.y, end.z);
          resolve();
        }
      };
      requestAnimationFrame(spawnAnim);
    });
  }

  // Knockout return to base yard
  animateCaptured() {
    return new Promise((resolve) => {
      sounds.playTokenCapture();
      const start = { ...this.mesh.position };
      this.step = -1;
      const end = getTokenWorldCoords(this.playerId, this.tokenIndex, -1);
      const startTime = performance.now();
      const duration = 450;

      const capAnim = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1.0);

        const x = start.x + (end.x - start.x) * progress;
        const z = start.z + (end.z - start.z) * progress;
        const y = Math.max(start.y, end.y) + Math.sin(progress * Math.PI) * 1.8;

        this.mesh.position.set(x, y, z);
        this.mesh.rotation.y = progress * Math.PI * 8; // spin back
        this.mesh.rotation.x = Math.sin(progress * Math.PI) * 0.8; // tilt tumble

        if (progress < 1.0) {
          requestAnimationFrame(capAnim);
        } else {
          this.mesh.rotation.set(0, 0, 0);
          this.mesh.position.set(end.x, end.y, end.z);
          resolve();
        }
      };
      requestAnimationFrame(capAnim);
    });
  }

  // Idle hover bounce when selectable
  update(delta) {
    if (this.isSelectable && !this.isMoving) {
      const bounce = Math.sin(Date.now() * 0.008 + this.tokenIndex) * 0.12;
      const baseCoord = getTokenWorldCoords(this.playerId, this.tokenIndex, this.step);
      this.mesh.position.y = baseCoord.y + Math.max(0, bounce);

      const pulse = 1.0 + Math.sin(Date.now() * 0.01) * 0.15;
      this.selectionRing.scale.set(pulse, pulse, pulse);
    }
  }
}
