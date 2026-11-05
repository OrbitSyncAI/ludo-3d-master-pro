/**
 * Ludo 3D Pro - Luxury Royal Casual 3D Board
 * Polished White Marble / Royal Gold Trim with Vibrant Classic Colors
 */

import * as THREE from 'three';
import {
  BOARD_SIZE,
  TILE_SIZE,
  BOARD_OFFSET,
  COMMON_PATH,
  SAFE_TILE_INDICES,
  PLAYERS_CONFIG,
  gridToWorld
} from './boardData.js';
import { SHOP_CATALOG } from './shopData.js';
import { economy } from './economyState.js';

export class Board3D {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.tileMeshes = [];
    this.starMeshes = [];
    this.pathwayMeshes = [];
    this.innerYardMeshes = [];
    this.yardMeshes = [];
    this.init();
  }

  init() {
    this.buildBase();
    this.buildYards();
    this.buildPathTiles();
    this.buildHomeStretches();
    this.buildCenterPyramid();
    this.applyCurrentTheme();
    this.scene.add(this.group);
  }

  // Luxury High-Contrast Royal Chamfered Base
  buildBase() {
    const boardThickness = 0.65;
    
    // Main Solid Luxury Frame Plinth
    const baseGeo = new THREE.BoxGeometry(16.6, boardThickness, 16.6);
    this.baseMat = new THREE.MeshStandardMaterial({
      color: 0x16233b,
      roughness: 0.25,
      metalness: 0.3
    });
    const baseMesh = new THREE.Mesh(baseGeo, this.baseMat);
    baseMesh.position.y = -boardThickness / 2;
    baseMesh.receiveShadow = true;
    this.group.add(baseMesh);

    // Gleaming 24K Gold Trim Border
    const trimGeo = new THREE.BoxGeometry(16.9, 0.22, 16.9);
    this.trimMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.15
    });
    const trimMesh = new THREE.Mesh(trimGeo, this.trimMat);
    trimMesh.position.y = -boardThickness / 2;
    this.group.add(trimMesh);

    // Themed Grid Surface
    const surfaceGeo = new THREE.BoxGeometry(15.2, 0.05, 15.2);
    this.surfaceMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.1
    });
    const surfaceMesh = new THREE.Mesh(surfaceGeo, this.surfaceMat);
    surfaceMesh.position.y = 0.025;
    surfaceMesh.receiveShadow = true;
    this.group.add(surfaceMesh);
  }

  // Apply Theme dynamically from equipped theme - TOTAL 3D TRANSFORMATION
  applyCurrentTheme() {
    const themeId = (economy && economy.data && economy.data.equipped && economy.data.equipped.theme) || 'classic_royal';
    const theme = (SHOP_CATALOG.ludoThemes && SHOP_CATALOG.ludoThemes.find(t => t.id === themeId)) || SHOP_CATALOG.ludoThemes[0];

    // Atmospheric Scene 3D Background transformation
    if (this.scene && theme.sceneBg !== undefined) {
      this.scene.background = new THREE.Color(theme.sceneBg);
    }

    if (this.baseMat && theme.boardColor !== undefined) this.baseMat.color.setHex(theme.boardColor);
    if (this.trimMat && theme.trimColor !== undefined) this.trimMat.color.setHex(theme.trimColor);
    if (this.surfaceMat && theme.surfaceColor !== undefined) this.surfaceMat.color.setHex(theme.surfaceColor);

    // Apply custom theme colors to all pathway tiles
    if (this.pathwayMeshes) {
      this.pathwayMeshes.forEach(mesh => {
        if (!mesh.userData.isStart) {
          const col = mesh.userData.isSafe ? (theme.starColor || 0xffea00) : (theme.pathwayColor || 0xf8fafc);
          mesh.material.color.setHex(col);
          if (mesh.material.roughness !== undefined) {
            mesh.material.roughness = themeId === 'neon' ? 0.08 : (themeId === 'wood' ? 0.35 : 0.2);
          }
        }
      });
    }

    // Apply custom theme colors to all inner yard pads
    if (this.innerYardMeshes) {
      this.innerYardMeshes.forEach(mesh => {
        if (theme.innerYardColor !== undefined) {
          mesh.material.color.setHex(theme.innerYardColor);
        }
      });
    }

    // Apply theme to stars
    if (this.starMeshes) {
      this.starMeshes.forEach(star => {
        if (theme.starColor !== undefined) {
          star.material.color.setHex(theme.starColor);
          if (star.material.emissive) star.material.emissive.setHex(theme.starColor);
        }
      });
    }

    // Update outer yard plinths if theme has custom yardColor
    if (this.yardMeshes) {
      this.yardMeshes.forEach(mesh => {
        if (theme.yardColor !== undefined) {
          mesh.material.color.setHex(theme.yardColor);
        } else if (mesh.userData && mesh.userData.defaultColor) {
          mesh.material.color.setHex(mesh.userData.defaultColor);
        }
      });
    }
  }

  // 4 Player Base Yards
  buildYards() {
    PLAYERS_CONFIG.forEach((p) => {
      const yardGroup = new THREE.Group();
      const worldCenter = gridToWorld(p.yardCenter.x, p.yardCenter.y, 0.08);

      // Outer Colored Yard Plinth
      const yardGeo = new THREE.BoxGeometry(5.8, 0.12, 5.8);
      const yardMat = new THREE.MeshStandardMaterial({
        color: p.hexColor,
        roughness: 0.25,
        metalness: 0.4
      });
      const yardMesh = new THREE.Mesh(yardGeo, yardMat);
      yardMesh.position.set(worldCenter.x, 0.06, worldCenter.z);
      yardMesh.receiveShadow = true;
      yardMesh.userData = { player: p, defaultColor: p.hexColor };
      yardGroup.add(yardMesh);
      this.yardMeshes.push(yardMesh);

      // Inner Themed Pad
      const innerGeo = new THREE.BoxGeometry(4.5, 0.09, 4.5);
      const innerMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.1
      });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      innerMesh.position.set(worldCenter.x, 0.11, worldCenter.z);
      innerMesh.receiveShadow = true;
      yardGroup.add(innerMesh);
      this.innerYardMeshes.push(innerMesh);

      // 4 Token Pedestals with Golden Rings
      p.yardPositions.forEach((pos) => {
        const pedPos = gridToWorld(pos.x, pos.y, 0.15);
        
        // Gold Outer Ring
        const ringGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.04, 32);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          roughness: 0.2,
          metalness: 0.85
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(pedPos.x, pedPos.y, pedPos.z);
        ringMesh.receiveShadow = true;
        yardGroup.add(ringMesh);

        // Colored Inner Target Pad
        const socketGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.05, 32);
        const socketMat = new THREE.MeshStandardMaterial({
          color: p.hexColor,
          roughness: 0.25,
          metalness: 0.3
        });
        const socketMesh = new THREE.Mesh(socketGeo, socketMat);
        socketMesh.position.set(pedPos.x, pedPos.y + 0.01, pedPos.z);
        yardGroup.add(socketMesh);
      });

      this.group.add(yardGroup);
    });
  }

  // 52 Common Pathway Tiles
  buildPathTiles() {
    const tileGeo = new THREE.BoxGeometry(0.92, 0.06, 0.92);

    COMMON_PATH.forEach((tile, index) => {
      const isSafe = SAFE_TILE_INDICES.includes(index);
      
      let tileColor = 0xf8fafc;
      let isStart = false;
      PLAYERS_CONFIG.forEach((p) => {
        if (p.startTileIndex === index) {
          tileColor = p.hexColor;
          isStart = true;
        }
      });

      const tileMat = new THREE.MeshStandardMaterial({
        color: isStart ? tileColor : (isSafe ? 0xffea00 : 0xf8fafc),
        roughness: isStart ? 0.25 : 0.2,
        metalness: isStart ? 0.35 : 0.05
      });

      const pos = gridToWorld(tile.x, tile.y, 0.08);
      const tileMesh = new THREE.Mesh(tileGeo, tileMat);
      tileMesh.position.set(pos.x, pos.y, pos.z);
      tileMesh.receiveShadow = true;
      tileMesh.userData = { tileIndex: index, isSafe, isStart };

      this.group.add(tileMesh);
      this.tileMeshes.push(tileMesh);
      this.pathwayMeshes.push(tileMesh);

      // Star Safe Zone Mesh
      if (isSafe) {
        this.addStarMesh(pos.x, pos.y + 0.04, pos.z, isStart ? 0xffffff : 0xffa000);
      }
    });
  }

  addStarMesh(x, y, z, color = 0xffa000) {
    const starShape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.28;
    const innerRadius = 0.12;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const sx = Math.cos(angle) * radius;
      const sy = Math.sin(angle) * radius;
      if (i === 0) starShape.moveTo(sx, sy);
      else starShape.lineTo(sx, sy);
    }
    starShape.closePath();

    const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.04, bevelEnabled: false });
    const starMat = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.9,
      roughness: 0.15,
      emissive: color,
      emissiveIntensity: 0.2
    });

    const starMesh = new THREE.Mesh(starGeo, starMat);
    starMesh.rotation.x = -Math.PI / 2;
    starMesh.position.set(x, y, z);
    this.group.add(starMesh);
    this.starMeshes.push(starMesh);
  }

  // 4 Player Home Stretches
  buildHomeStretches() {
    const tileGeo = new THREE.BoxGeometry(0.93, 0.08, 0.93);

    PLAYERS_CONFIG.forEach((p) => {
      p.homeStretch.forEach((tile) => {
        const pos = gridToWorld(tile.x, tile.y, 0.1);
        const mat = new THREE.MeshStandardMaterial({
          color: p.hexColor,
          roughness: 0.25,
          metalness: 0.4
        });

        const mesh = new THREE.Mesh(tileGeo, mat);
        mesh.position.set(pos.x, pos.y, pos.z);
        mesh.receiveShadow = true;
        this.group.add(mesh);
      });
    });
  }

  // Center Victory Platform & Floating Crown
  buildCenterPyramid() {
    const centerPos = gridToWorld(7, 7, 0.1);
    
    // Golden central platform
    const centerBaseGeo = new THREE.BoxGeometry(2.9, 0.12, 2.9);
    const centerBaseMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.2
    });
    const centerBaseMesh = new THREE.Mesh(centerBaseGeo, centerBaseMat);
    centerBaseMesh.position.set(centerPos.x, 0.06, centerPos.z);
    this.group.add(centerBaseMesh);

    // 4 Colored Goal Triangles
    PLAYERS_CONFIG.forEach((p) => {
      const triShape = new THREE.Shape();
      triShape.moveTo(0, 0);

      if (p.id === 0) {
        triShape.lineTo(-1.4, -1.4);
        triShape.lineTo(1.4, -1.4);
      } else if (p.id === 1) {
        triShape.lineTo(-1.4, 1.4);
        triShape.lineTo(-1.4, -1.4);
      } else if (p.id === 2) {
        triShape.lineTo(-1.4, 1.4);
        triShape.lineTo(1.4, 1.4);
      } else if (p.id === 3) {
        triShape.lineTo(1.4, 1.4);
        triShape.lineTo(1.4, -1.4);
      }
      triShape.closePath();

      const extrude = new THREE.ExtrudeGeometry(triShape, { depth: 0.08, bevelEnabled: false });
      const mat = new THREE.MeshStandardMaterial({
        color: p.hexColor,
        roughness: 0.2,
        metalness: 0.5
      });
      const triMesh = new THREE.Mesh(extrude, mat);
      triMesh.rotation.x = -Math.PI / 2;
      triMesh.position.set(centerPos.x, 0.13, centerPos.z);
      this.group.add(triMesh);
    });

    // Central Floating 3D Golden Victory Trophy
    const crownGeo = new THREE.OctahedronGeometry(0.48, 0);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffb300,
      emissiveIntensity: 0.45,
      roughness: 0.15,
      metalness: 0.85
    });
    this.victoryCrystal = new THREE.Mesh(crownGeo, crownMat);
    this.victoryCrystal.position.set(centerPos.x, 0.85, centerPos.z);
    this.victoryCrystal.castShadow = true;
    this.group.add(this.victoryCrystal);

    const victoryLight = new THREE.PointLight(0xffd700, 1.5, 6);
    victoryLight.position.set(centerPos.x, 1.3, centerPos.z);
    this.group.add(victoryLight);
  }

  update(delta) {
    if (this.victoryCrystal) {
      this.victoryCrystal.rotation.y += delta * 1.5;
      this.victoryCrystal.position.y = 0.85 + Math.sin(Date.now() * 0.003) * 0.09;
    }
  }

  destroy() {
    this.scene.remove(this.group);
  }
}
