/**
 * Ludo 3D Pro - Authentic 100-Tile Illustrated Snakes & Ladders 3D Board
 * Realistic Step-by-Step Walking, Ladder Climbing & Snake Sliding Animations
 */

import * as THREE from 'three';
import { tileToGrid } from './snakesLogic.js';
import { createSnakesBoardTexture } from './snakesTexture.js';
import { sounds } from './audio.js';
import { economy } from './economyState.js';
import { SHOP_CATALOG } from './shopData.js';

export class SnakesBoard3D {
  constructor(scene, themeId = null) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.pawns = [];
    this.themeId = themeId || economy.data.equipped?.snakesTheme || 'snakes_classic';
    this.init();
  }

  init() {
    this.buildBoard();
    this.scene.add(this.group);
  }

  buildBoard() {
    const boardSize = 16.0;
    const boardThickness = 0.6;
    const themeConfig = (SHOP_CATALOG.snakesThemes && SHOP_CATALOG.snakesThemes.find(t => t.id === this.themeId)) || {
      boardColor: 0x16233b,
      trimColor: 0xffd700
    };

    // Solid Base Plinth (Themed Frame)
    const baseGeo = new THREE.BoxGeometry(boardSize, boardThickness, boardSize);
    const baseMat = new THREE.MeshStandardMaterial({
      color: themeConfig.boardColor || 0x16233b,
      metalness: 0.35,
      roughness: 0.25
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -boardThickness / 2;
    baseMesh.receiveShadow = true;
    this.group.add(baseMesh);

    // Themed Trim Border
    const trimGeo = new THREE.BoxGeometry(boardSize + 0.35, 0.22, boardSize + 0.35);
    const trimMat = new THREE.MeshStandardMaterial({
      color: themeConfig.trimColor || 0xffd700,
      metalness: 0.95,
      roughness: 0.1
    });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = -boardThickness / 2;
    this.group.add(trimMesh);

    // Play Surface with 100-Tile Illustrated Canvas Texture dynamically generated for this theme
    const boardTexture = createSnakesBoardTexture(this.themeId);
    const surfaceGeo = new THREE.PlaneGeometry(15.2, 15.2);
    const surfaceMat = new THREE.MeshStandardMaterial({
      map: boardTexture,
      roughness: 0.2,
      metalness: 0.05
    });
    const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
    surfaceMesh.rotation.x = -Math.PI / 2;
    surfaceMesh.position.y = 0.03;
    surfaceMesh.receiveShadow = true;
    this.group.add(surfaceMesh);
  }

  createPawns(players) {
    this.pawns.forEach(p => this.group.remove(p));
    this.pawns = [];

    players.forEach((p, idx) => {
      const group = new THREE.Group();

      // Heavy Gold Base
      const baseGeo = new THREE.CylinderGeometry(0.32, 0.38, 0.16, 24);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.9,
        roughness: 0.15
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.08;
      base.castShadow = true;
      group.add(base);

      // Pawn Body (Player Color)
      const bodyGeo = new THREE.CylinderGeometry(0.20, 0.28, 0.45, 24);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: p.colorHex,
        metalness: 0.4,
        roughness: 0.2
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.38;
      body.castShadow = true;
      group.add(body);

      // Gem Sphere Head
      const headGeo = new THREE.SphereGeometry(0.24, 20, 20);
      const headMat = new THREE.MeshStandardMaterial({
        color: p.colorHex,
        emissive: p.colorHex,
        emissiveIntensity: 0.35,
        roughness: 0.15,
        metalness: 0.4
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 0.75;
      head.castShadow = true;
      group.add(head);

      const pos = tileToGrid(1);
      const offset = (idx - (players.length - 1) / 2) * 0.38;
      group.position.set(pos.x + offset, 0.1, pos.z);

      this.group.add(group);
      this.pawns.push(group);
    });
  }

  // 1. Step-by-Step Walking (Tile by Tile)
  async animatePawnWalk(playerIndex, startTile, targetTile) {
    const pawn = this.pawns[playerIndex];
    if (!pawn) return;

    const offset = (playerIndex - (this.pawns.length - 1) / 2) * 0.32;
    const steps = targetTile - startTile;
    for (let s = 1; s <= steps; s++) {
      const currentStepTile = startTile + s;
      const startCoord = tileToGrid(currentStepTile - 1);
      const endCoord = tileToGrid(currentStepTile);

      sounds.playTokenStep(1.0 + (s / Math.max(1, steps)) * 0.25);
      await this.hopSingleTile(pawn, startCoord, endCoord, offset);
    }
  }

  // Fallback alias in case called directly
  async animatePawnMove(playerIndex, targetTile) {
    const pawn = this.pawns[playerIndex];
    if (!pawn) return;
    const endCoord = tileToGrid(targetTile);
    const offset = (playerIndex - (this.pawns.length - 1) / 2) * 0.32;
    pawn.position.set(endCoord.x + offset, 0.1, endCoord.z);
  }

  hopSingleTile(pawn, start, end, offset = 0, duration = 230) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const hopHeight = 0.58;

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1.0);
        const arc = Math.sin(progress * Math.PI);

        pawn.position.x = start.x + (end.x - start.x) * progress + offset;
        pawn.position.z = start.z + (end.z - start.z) * progress;
        pawn.position.y = 0.1 + arc * hopHeight;

        const scaleY = 1.0 + arc * 0.12;
        const scaleXZ = 1.0 - arc * 0.06;
        pawn.scale.set(scaleXZ, scaleY, scaleXZ);

        if (progress < 1.0) {
          requestAnimationFrame(step);
        } else {
          pawn.position.set(end.x + offset, 0.1, end.z);
          pawn.scale.set(1.0, 1.0, 1.0);
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  // 2. Smooth Climb Up Along the Ladder (Authentic 850ms)
  animateLadderClimb(playerIndex, startTile, targetTile, duration = 850) {
    const pawn = this.pawns[playerIndex];
    if (!pawn) return Promise.resolve();

    const offset = (playerIndex - (this.pawns.length - 1) / 2) * 0.32;
    const start = tileToGrid(startTile);
    const end = tileToGrid(targetTile);
    const startTime = performance.now();

    return new Promise((resolve) => {
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1.0);
        const ease = progress * progress * (3 - 2 * progress); // smooth smoothstep

        pawn.position.x = start.x + (end.x - start.x) * ease + offset;
        pawn.position.z = start.z + (end.z - start.z) * ease;
        pawn.position.y = 0.1 + Math.sin(progress * Math.PI) * 1.2;

        if (progress < 1.0) {
          requestAnimationFrame(step);
        } else {
          pawn.position.set(end.x + offset, 0.1, end.z);
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  // 3. Smooth Slide Down Along the Snake Body (Authentic 880ms)
  animateSnakeSlide(playerIndex, startTile, targetTile, duration = 880) {
    const pawn = this.pawns[playerIndex];
    if (!pawn) return Promise.resolve();

    const offset = (playerIndex - (this.pawns.length - 1) / 2) * 0.32;
    const start = tileToGrid(startTile);
    const end = tileToGrid(targetTile);
    const startTime = performance.now();

    return new Promise((resolve) => {
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1.0);
        const ease = 1 - Math.pow(1 - progress, 2); // deceleration

        // S-curve serpentine wobble while sliding
        const wobble = Math.sin(progress * Math.PI * 4) * 0.35;
        pawn.position.x = start.x + (end.x - start.x) * ease + wobble + offset;
        pawn.position.z = start.z + (end.z - start.z) * ease;
        pawn.position.y = 0.1 + Math.sin(progress * Math.PI) * 0.5;

        if (progress < 1.0) {
          requestAnimationFrame(step);
        } else {
          pawn.position.set(end.x + offset, 0.1, end.z);
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  destroy() {
    this.scene.remove(this.group);
  }
}
