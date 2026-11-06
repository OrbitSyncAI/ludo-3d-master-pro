/**
 * Ludo 3D Pro - Authentic 100-Tile Illustrated Snakes & Ladders 3D Board
 * Realistic Step-by-Step Walking, Ladder Climbing & Snake Sliding Animations
 * Precision Tile Centering: Multiple pawns cluster strictly inside the tile without spilling over
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
      metalness: 0.85,
      roughness: 0.2
    });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = -0.11;
    this.group.add(trimMesh);

    // High-Resolution 100-Tile Board Face (Canvas Texture with Themed Graphics)
    const rawTexture = createSnakesBoardTexture(this.themeId);
    const boardTexture = (rawTexture instanceof THREE.Texture)
      ? rawTexture
      : new THREE.CanvasTexture(rawTexture);
    boardTexture.needsUpdate = true;
    boardTexture.anisotropy = 4;

    const faceGeo = new THREE.PlaneGeometry(15.2, 15.2);
    const faceMat = new THREE.MeshStandardMaterial({
      map: boardTexture,
      roughness: 0.25,
      metalness: 0.1
    });
    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    faceMesh.rotation.x = -Math.PI / 2;
    faceMesh.position.y = 0.01;
    faceMesh.receiveShadow = true;
    this.group.add(faceMesh);
  }

  // Create Pawns for active players
  createPawns(players) {
    this.pawns.forEach(p => this.group.remove(p));
    this.pawns = [];

    const initialPositions = Array(players.length).fill(1);

    players.forEach((p, idx) => {
      const group = new THREE.Group();
      group.userData = { isPawn: true, playerIndex: idx };

      // Base
      const baseGeo = new THREE.CylinderGeometry(0.24, 0.30, 0.14, 20);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.85,
        roughness: 0.25
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.07;
      base.castShadow = true;
      group.add(base);

      // Gold Ring
      const ringGeo = new THREE.TorusGeometry(0.25, 0.03, 12, 20);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.9,
        roughness: 0.15
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.14;
      group.add(ring);

      // Body (Player Color)
      const bodyGeo = new THREE.CylinderGeometry(0.14, 0.22, 0.35, 20);
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
      const headGeo = new THREE.SphereGeometry(0.22, 20, 20);
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
      const offset = this.getPawnTileOffset(idx, 1, initialPositions);
      group.position.set(pos.x + offset.x, 0.1, pos.z + offset.z);

      this.group.add(group);
      this.pawns.push(group);
    });
  }

  // Calculate precise offset so multiple pawns on the SAME tile remain strictly centered
  // and NEVER spill over into adjacent tile boxes (tile pitch is 1.52)
  getPawnTileOffset(playerIndex, targetTile, positions = null) {
    if (!positions) return { x: 0, z: 0 };

    const sharingPlayers = [];
    for (let i = 0; i < positions.length; i++) {
      if (positions[i] === targetTile) {
        sharingPlayers.push(i);
      }
    }
    if (!sharingPlayers.includes(playerIndex)) {
      sharingPlayers.push(playerIndex);
    }
    sharingPlayers.sort((a, b) => a - b);

    const count = sharingPlayers.length;
    if (count <= 1) {
      return { x: 0, z: 0 }; // Dead center of tile box!
    }

    const myIdx = sharingPlayers.indexOf(playerIndex);
    // Tight 2x2 or radial cluster strictly inside tile (radius <= 0.22, pitch = 1.52)
    if (count === 2) {
      return myIdx === 0 ? { x: -0.22, z: 0 } : { x: 0.22, z: 0 };
    } else if (count === 3) {
      const angles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
      return {
        x: Math.cos(angles[myIdx]) * 0.22,
        z: Math.sin(angles[myIdx]) * 0.22
      };
    } else {
      // 4 players on same tile -> 2x2 grid centered within the tile
      const gridOffsets = [
        { x: -0.22, z: -0.22 },
        { x: 0.22, z: -0.22 },
        { x: -0.22, z: 0.22 },
        { x: 0.22, z: 0.22 }
      ];
      return gridOffsets[myIdx] || { x: 0, z: 0 };
    }
  }

  // Update all pawns to their exact centered cluster on their current tiles
  updateAllPawnTilePositions(positions) {
    if (!positions || !this.pawns) return;
    this.pawns.forEach((pawn, idx) => {
      const tile = positions[idx];
      if (tile) {
        const coord = tileToGrid(tile);
        const offset = this.getPawnTileOffset(idx, tile, positions);
        pawn.position.set(coord.x + offset.x, 0.1, coord.z + offset.z);
      }
    });
  }

  // 1. Step-by-Step Walking (Tile by Tile)
  async animatePawnWalk(playerIndex, startTile, targetTile, positions = null) {
    const pawn = this.pawns[playerIndex];
    if (!pawn) return;

    const steps = targetTile - startTile;
    for (let s = 1; s <= steps; s++) {
      const currentStepTile = startTile + s;
      const startCoord = tileToGrid(currentStepTile - 1);
      const endCoord = tileToGrid(currentStepTile);

      // On intermediate steps, hop through tile center; on final step, apply final tile cluster offset
      const isFinal = (s === steps);
      const finalOffset = isFinal ? this.getPawnTileOffset(playerIndex, targetTile, positions) : { x: 0, z: 0 };

      sounds.playTokenStep(1.0 + (s / Math.max(1, steps)) * 0.25);
      await this.hopSingleTile(pawn, startCoord, endCoord, finalOffset);
    }
  }

  // Fallback alias in case called directly
  async animatePawnMove(playerIndex, targetTile, positions = null) {
    const pawn = this.pawns[playerIndex];
    if (!pawn) return;
    const endCoord = tileToGrid(targetTile);
    const offset = this.getPawnTileOffset(playerIndex, targetTile, positions);
    pawn.position.set(endCoord.x + offset.x, 0.1, endCoord.z + offset.z);
  }

  hopSingleTile(pawn, start, end, offset = { x: 0, z: 0 }, duration = 240) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const hopHeight = 0.55;

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1.0);
        const arc = Math.sin(progress * Math.PI);

        pawn.position.x = start.x + (end.x - start.x) * progress + offset.x * progress;
        pawn.position.z = start.z + (end.z - start.z) * progress + offset.z * progress;
        pawn.position.y = 0.1 + arc * hopHeight;

        const scaleY = 1.0 + arc * 0.12;
        const scaleXZ = 1.0 - arc * 0.06;
        pawn.scale.set(scaleXZ, scaleY, scaleXZ);

        if (progress < 1.0) {
          requestAnimationFrame(step);
        } else {
          pawn.position.set(end.x + offset.x, 0.1, end.z + offset.z);
          pawn.scale.set(1.0, 1.0, 1.0);
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  // 2. Smooth Climb Up Along the Ladder (Leisurely & clear 980ms)
  animateLadderClimb(playerIndex, startTile, targetTile, positions = null, duration = 980) {
    const pawn = this.pawns[playerIndex];
    if (!pawn) return Promise.resolve();

    const offset = this.getPawnTileOffset(playerIndex, targetTile, positions);
    const start = tileToGrid(startTile);
    const end = tileToGrid(targetTile);
    const startTime = performance.now();

    return new Promise((resolve) => {
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1.0);
        const ease = progress * progress * (3 - 2 * progress); // smooth smoothstep

        pawn.position.x = start.x + (end.x - start.x) * ease + offset.x * ease;
        pawn.position.z = start.z + (end.z - start.z) * ease + offset.z * ease;
        pawn.position.y = 0.1 + Math.sin(progress * Math.PI) * 1.2;

        if (progress < 1.0) {
          requestAnimationFrame(step);
        } else {
          pawn.position.set(end.x + offset.x, 0.1, end.z + offset.z);
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  // 3. Smooth Slide Down Along the Snake Body (Serpentine & smooth 1050ms)
  animateSnakeSlide(playerIndex, startTile, targetTile, positions = null, duration = 1050) {
    const pawn = this.pawns[playerIndex];
    if (!pawn) return Promise.resolve();

    const offset = this.getPawnTileOffset(playerIndex, targetTile, positions);
    const start = tileToGrid(startTile);
    const end = tileToGrid(targetTile);
    const startTime = performance.now();

    return new Promise((resolve) => {
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1.0);
        const ease = 1 - Math.pow(1 - progress, 2); // deceleration

        // S-curve serpentine wobble while sliding
        const wobble = Math.sin(progress * Math.PI * 4) * 0.25;
        pawn.position.x = start.x + (end.x - start.x) * ease + wobble + offset.x * ease;
        pawn.position.z = start.z + (end.z - start.z) * ease + offset.z * ease;
        pawn.position.y = 0.1 + Math.sin(progress * Math.PI) * 0.5;

        if (progress < 1.0) {
          requestAnimationFrame(step);
        } else {
          pawn.position.set(end.x + offset.x, 0.1, end.z + offset.z);
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
