/**
 * Ludo 3D Pro - 3D Dice with Physics-style roll, Custom Skins & Canvas Face Textures
 * Standard opposite faces sum to 7: (1-6, 2-5, 3-4)
 */

import * as THREE from 'three';
import { sounds } from './audio.js';
import { economy } from './economyState.js';
import { SHOP_CATALOG } from './shopData.js';

export class Dice3D {
  constructor(scene) {
    this.scene = scene;
    this.isRolling = false;
    this.currentValue = 1;

    // Face rotation map: Which rotation brings face value N to point directly UP (+Y)
    this.faceRotations = {
      1: { x: 0, y: 0, z: Math.PI / 2 },       // +X face
      2: { x: 0, y: 0, z: -Math.PI / 2 },      // -X face
      3: { x: 0, y: 0, z: 0 },                  // +Y face
      4: { x: Math.PI, y: 0, z: 0 },            // -Y face
      5: { x: -Math.PI / 2, y: 0, z: 0 },       // +Z face
      6: { x: Math.PI / 2, y: 0, z: 0 }         // -Z face
    };

    this.mesh = this.createDiceMesh();
    // Authentic board center placement: dice sits and rolls in the exact center of the board
    this.basePosition = new THREE.Vector3(0, 0.58, 0);
    this.mesh.position.copy(this.basePosition);

    this.scene.add(this.mesh);

    this.applySkin();
    this.setValueInstant(6);
  }

  getSkinConfig() {
    const diceId = (economy && economy.data && economy.data.equipped && economy.data.equipped.dice) || 'classic';
    return SHOP_CATALOG.dice.find(d => d.id === diceId) || SHOP_CATALOG.dice[0];
  }

  // Generate crisp 2D canvas texture for a dice face with pip dots
  createFaceTexture(number) {
    const skin = this.getSkinConfig();
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Base background matching skin
    ctx.fillStyle = skin.baseColor;
    ctx.fillRect(0, 0, 256, 256);

    // Radial gradient glow
    const grad = ctx.createRadialGradient(128, 128, 40, 128, 128, 125);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Beveled frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 242, 242);

    // Draw dots (pips)
    ctx.fillStyle = (number === 1) ? skin.pipRed : skin.pipDark;
    const drawDot = (cx, cy, r = 24) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      // Dot shine highlight
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(cx - r*0.3, cy - r*0.3, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = (number === 1) ? skin.pipRed : skin.pipDark;
    };

    const pL = 68, pC = 128, pR = 188;
    switch (number) {
      case 1:
        drawDot(pC, pC, 38);
        break;
      case 2:
        drawDot(pL, pL);
        drawDot(pR, pR);
        break;
      case 3:
        drawDot(pL, pL);
        drawDot(pC, pC);
        drawDot(pR, pR);
        break;
      case 4:
        drawDot(pL, pL);
        drawDot(pR, pL);
        drawDot(pL, pR);
        drawDot(pR, pR);
        break;
      case 5:
        drawDot(pL, pL);
        drawDot(pR, pL);
        drawDot(pC, pC);
        drawDot(pL, pR);
        drawDot(pR, pR);
        break;
      case 6:
        drawDot(pL, pL);
        drawDot(pR, pL);
        drawDot(pL, pC);
        drawDot(pR, pC);
        drawDot(pL, pR);
        drawDot(pR, pR);
        break;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    return texture;
  }

  createDiceMesh() {
    const size = 0.92;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const dummyMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const dice = new THREE.Mesh(geometry, [dummyMat, dummyMat, dummyMat, dummyMat, dummyMat, dummyMat]);
    dice.castShadow = true;
    dice.receiveShadow = true;
    dice.userData = { isDice: true };
    return dice;
  }

  applySkin() {
    const skin = this.getSkinConfig();
    const isMetallic = skin.id === 'gold';
    this.mesh.material = [
      new THREE.MeshStandardMaterial({ map: this.createFaceTexture(1), roughness: 0.2, metalness: isMetallic ? 0.8 : 0.1 }),
      new THREE.MeshStandardMaterial({ map: this.createFaceTexture(2), roughness: 0.2, metalness: isMetallic ? 0.8 : 0.1 }),
      new THREE.MeshStandardMaterial({ map: this.createFaceTexture(3), roughness: 0.2, metalness: isMetallic ? 0.8 : 0.1 }),
      new THREE.MeshStandardMaterial({ map: this.createFaceTexture(4), roughness: 0.2, metalness: isMetallic ? 0.8 : 0.1 }),
      new THREE.MeshStandardMaterial({ map: this.createFaceTexture(5), roughness: 0.2, metalness: isMetallic ? 0.8 : 0.1 }),
      new THREE.MeshStandardMaterial({ map: this.createFaceTexture(6), roughness: 0.2, metalness: isMetallic ? 0.8 : 0.1 })
    ];
  }

  createDiceTray() {
    const group = new THREE.Group();

    const padGeo = new THREE.CylinderGeometry(1.2, 1.25, 0.08, 32);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x182033,
      roughness: 0.4,
      metalness: 0.6
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.receiveShadow = true;
    group.add(pad);

    const rimGeo = new THREE.TorusGeometry(1.22, 0.05, 16, 32);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xffaa00,
      emissiveIntensity: 0.2
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.05;
    group.add(rim);

    return group;
  }

  setValueInstant(val) {
    this.currentValue = val;
    const rot = this.faceRotations[val];
    if (rot) {
      this.mesh.rotation.set(rot.x, rot.y, rot.z);
    }
  }

  onPointerPress() {
    if (this.isRolling) return;
    this.mesh.scale.set(0.92, 0.88, 0.92);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(12); } catch (e) {}
    }
  }

  onPointerRelease() {
    if (this.isRolling) return;
    this.mesh.scale.set(1.0, 1.0, 1.0);
  }

  roll(targetValue = null) {
    if (this.isRolling) return Promise.resolve(this.currentValue);

    this.isRolling = true;
    sounds.playDiceRoll();

    const finalVal = targetValue || (Math.floor(Math.random() * 6) + 1);
    this.currentValue = finalVal;

    const targetRot = this.faceRotations[finalVal];
    // Controlled 2 revolutions on each axis for clean, non-blurring 3D tumble
    const spinsX = 2 * Math.PI * 2;
    const spinsY = 2 * Math.PI * 2;
    const spinsZ = 1 * Math.PI * 2;

    const startRot = {
      x: this.mesh.rotation.x,
      y: this.mesh.rotation.y,
      z: this.mesh.rotation.z
    };
    const endRot = {
      x: targetRot.x + spinsX,
      y: targetRot.y + spinsY,
      z: targetRot.z + spinsZ
    };

    const startY = this.basePosition.y;
    const peakY = startY + 2.0;
    const duration = 820; // Relaxed, smooth organic 3D roll (neither too fast nor sluggish)
    const startTime = performance.now();

    return new Promise((resolve) => {
      const animateRoll = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1.0);
        
        // Quintic ease-out for realistic angular deceleration
        const ease = 1 - Math.pow(1 - progress, 3.6);

        this.mesh.rotation.x = startRot.x + (endRot.x - startRot.x) * ease;
        this.mesh.rotation.y = startRot.y + (endRot.y - startRot.y) * ease;
        this.mesh.rotation.z = startRot.z + (endRot.z - startRot.z) * ease;

        // Realistic multi-stage physical bounce curve
        if (progress < 0.65) {
          // Phase 1: High parabolic toss up and down
          const t1 = progress / 0.65;
          this.mesh.position.y = startY + Math.sin(t1 * Math.PI) * (peakY - startY);
          this.mesh.scale.set(1.0, 1.0, 1.0);
        } else if (progress < 0.85) {
          // Phase 2: First landing rebound bounce
          const t2 = (progress - 0.65) / 0.20;
          this.mesh.position.y = startY + Math.sin(t2 * Math.PI) * 0.35;
          // Slight stretch on bounce
          const squish = 1.0 - Math.sin(t2 * Math.PI) * 0.05;
          this.mesh.scale.set(1.0 + (1.0 - squish), squish, 1.0 + (1.0 - squish));
        } else {
          // Phase 3: Micro settling bounce & resting flush
          const t3 = (progress - 0.85) / 0.15;
          this.mesh.position.y = startY + Math.sin(t3 * Math.PI) * 0.08;
          this.mesh.scale.set(1.0, 1.0, 1.0);
        }

        if (progress < 1.0) {
          requestAnimationFrame(animateRoll);
        } else {
          sounds.playDiceResult();
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate([15, 10, 20]); } catch (e) {}
          }
          this.mesh.position.copy(this.basePosition);
          this.mesh.rotation.set(targetRot.x, targetRot.y, targetRot.z);
          this.mesh.scale.set(1.0, 1.0, 1.0);
          this.isRolling = false;
          resolve(finalVal);
        }
      };

      requestAnimationFrame(animateRoll);
    });
  }

  update(delta) {}
}
