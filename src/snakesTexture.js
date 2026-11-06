/**
 * Ludo 3D Pro - High-Resolution 100-Tile Snakes & Ladders Board Texture Generator
 * Full 3D Dynamic Theme Support: Classic, Jungle, Candy, Desert, Ocean, Cyber, Magma, Galaxy, Dragon
 * Sharp dark grid lines, themed checkerboards, custom ladders & cartoon snakes
 */

import * as THREE from 'three';
import { LADDERS, SNAKES } from './snakesLogic.js';

export function createSnakesBoardTexture(themeId = 'snakes_classic') {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  const size = 2048;
  const tileSize = size / 10; // 204.8 px per tile

  // 1. Theme Configuration Palette
  const THEME_CONFIGS = {
    snakes_classic: {
      bg: '#0f172a',
      gridBorder: '#1e293b',
      altTile: '#ffffff',
      tileColors: ['#ffe082', '#80deea', '#ff8a80', '#a5d6a7', '#ce93d8'],
      badgeBg: '#ffffff',
      badgeBorder: '#1e293b',
      ladderRails: '#5c3a17',
      ladderHighlights: '#8d5b28',
      ladderRungs: '#ffd54f',
      snakeBody: '#d32f2f',
      snakeBelly: '#ffe082',
      snakeOutline: '#0f172a'
    },
    snakes_jungle: {
      bg: '#052e16',
      gridBorder: '#14532d',
      altTile: '#f0fdf4',
      tileColors: ['#86efac', '#4ade80', '#22c55e', '#bbf7d0', '#16a34a'],
      badgeBg: '#dcfce7',
      badgeBorder: '#166534',
      ladderRails: '#3f6212',
      ladderHighlights: '#65a30d',
      ladderRungs: '#a3e635',
      snakeBody: '#15803d',
      snakeBelly: '#fef08a',
      snakeOutline: '#052e16'
    },
    snakes_candy: {
      bg: '#4c0519',
      gridBorder: '#9f1239',
      altTile: '#fff1f2',
      tileColors: ['#f472b6', '#38bdf8', '#fbbf24', '#c084fc', '#fbcfe8'],
      badgeBg: '#ffe4e6',
      badgeBorder: '#be123c',
      ladderRails: '#e11d48',
      ladderHighlights: '#fb7185',
      ladderRungs: '#ffffff',
      snakeBody: '#ec4899',
      snakeBelly: '#fef08a',
      snakeOutline: '#881337'
    },
    snakes_desert: {
      bg: '#431407',
      gridBorder: '#7c2d12',
      altTile: '#fff7ed',
      tileColors: ['#fdba74', '#fed7aa', '#f97316', '#fde047', '#fb923c'],
      badgeBg: '#ffedd5',
      badgeBorder: '#9a3412',
      ladderRails: '#78350f',
      ladderHighlights: '#b45309',
      ladderRungs: '#fef08a',
      snakeBody: '#ea580c',
      snakeBelly: '#fef9c3',
      snakeOutline: '#431407'
    },
    snakes_ocean: {
      bg: '#082f49',
      gridBorder: '#075985',
      altTile: '#f0f9ff',
      tileColors: ['#38bdf8', '#22d3ee', '#67e8f9', '#7dd3fc', '#0284c7'],
      badgeBg: '#e0f2fe',
      badgeBorder: '#0369a1',
      ladderRails: '#0c4a6e',
      ladderHighlights: '#0284c7',
      ladderRungs: '#fef08a',
      snakeBody: '#0284c7',
      snakeBelly: '#a5f3fc',
      snakeOutline: '#082f49'
    },
    snakes_cyber: {
      bg: '#030712',
      gridBorder: '#00e5ff',
      altTile: '#111827',
      tileColors: ['#1e1b4b', '#0f172a', '#172554', '#1f2937', '#030712'],
      badgeBg: '#0f172a',
      badgeBorder: '#00e5ff',
      ladderRails: '#0284c7',
      ladderHighlights: '#38bdf8',
      ladderRungs: '#00e5ff',
      snakeBody: '#a855f7',
      snakeBelly: '#00e5ff',
      snakeOutline: '#030712'
    },
    snakes_magma: {
      bg: '#450a0a',
      gridBorder: '#7f1d1d',
      altTile: '#1c1917',
      tileColors: ['#7f1d1d', '#991b1b', '#b91c1c', '#dc2626', '#450a0a'],
      badgeBg: '#292524',
      badgeBorder: '#f97316',
      ladderRails: '#1c1917',
      ladderHighlights: '#44403c',
      ladderRungs: '#f97316',
      snakeBody: '#ef4444',
      snakeBelly: '#fef08a',
      snakeOutline: '#000000'
    },
    snakes_galaxy: {
      bg: '#0b081d',
      gridBorder: '#6b21a8',
      altTile: '#18181b',
      tileColors: ['#3b0764', '#1e1b4b', '#4c1d95', '#581c87', '#2e1065'],
      badgeBg: '#27272a',
      badgeBorder: '#c084fc',
      ladderRails: '#312e81',
      ladderHighlights: '#4f46e5',
      ladderRungs: '#e879f9',
      snakeBody: '#c026d3',
      snakeBelly: '#f0abfc',
      snakeOutline: '#0b081d'
    },
    snakes_dragon: {
      bg: '#422006',
      gridBorder: '#eab308',
      altTile: '#450a0a',
      tileColors: ['#713f12', '#854d0e', '#7f1d1d', '#991b1b', '#831843'],
      badgeBg: '#2e1065',
      badgeBorder: '#ffd700',
      ladderRails: '#78350f',
      ladderHighlights: '#b45309',
      ladderRungs: '#ffd700',
      snakeBody: '#eab308',
      snakeBelly: '#fee2e2',
      snakeOutline: '#450a0a'
    },
    snakes_jurassic: {
      bg: '#052e16',
      gridBorder: '#166534',
      altTile: '#f0fdf4',
      tileColors: ['#15803d', '#166534', '#14532d', '#22c55e', '#4ade80'],
      badgeBg: '#dcfce7',
      badgeBorder: '#15803d',
      ladderRails: '#3f6212',
      ladderHighlights: '#65a30d',
      ladderRungs: '#a3e635',
      snakeBody: '#15803d',
      snakeBelly: '#fef08a',
      snakeOutline: '#052e16'
    },
    snakes_chrono: {
      bg: '#2e180d',
      gridBorder: '#78350f',
      altTile: '#fffbeb',
      tileColors: ['#b45309', '#d97706', '#92400e', '#78350f', '#f59e0b'],
      badgeBg: '#fef3c7',
      badgeBorder: '#92400e',
      ladderRails: '#78350f',
      ladderHighlights: '#d97706',
      ladderRungs: '#fde68a',
      snakeBody: '#b45309',
      snakeBelly: '#fef3c7',
      snakeOutline: '#2e180d'
    },
    snakes_solar_titan: {
      bg: '#451a03',
      gridBorder: '#b45309',
      altTile: '#fffbeb',
      tileColors: ['#f59e0b', '#d97706', '#b45309', '#fbbf24', '#fde68a'],
      badgeBg: '#fef3c7',
      badgeBorder: '#b45309',
      ladderRails: '#78350f',
      ladderHighlights: '#b45309',
      ladderRungs: '#fef08a',
      snakeBody: '#ea580c',
      snakeBelly: '#fef9c3',
      snakeOutline: '#451a03'
    },
    snakes_deep_void: {
      bg: '#020f1e',
      gridBorder: '#0369a1',
      altTile: '#082f49',
      tileColors: ['#0c4a6e', '#075985', '#0284c7', '#0369a1', '#082f49'],
      badgeBg: '#082f49',
      badgeBorder: '#38bdf8',
      ladderRails: '#075985',
      ladderHighlights: '#38bdf8',
      ladderRungs: '#67e8f9',
      snakeBody: '#0284c7',
      snakeBelly: '#a5f3fc',
      snakeOutline: '#020f1e'
    },
    snakes_hyperdrive: {
      bg: '#030712',
      gridBorder: '#9333ea',
      altTile: '#111827',
      tileColors: ['#3b0764', '#1e1b4b', '#4c1d95', '#581c87', '#2e1065'],
      badgeBg: '#0f172a',
      badgeBorder: '#c084fc',
      ladderRails: '#4f46e5',
      ladderHighlights: '#a855f7',
      ladderRungs: '#00e5ff',
      snakeBody: '#a855f7',
      snakeBelly: '#00e5ff',
      snakeOutline: '#030712'
    },
    snakes_apex_dragon: {
      bg: '#3d1d04',
      gridBorder: '#ffd700',
      altTile: '#450a0a',
      tileColors: ['#78350f', '#92400e', '#7f1d1d', '#b45309', '#854d0e'],
      badgeBg: '#2e1065',
      badgeBorder: '#ffd700',
      ladderRails: '#78350f',
      ladderHighlights: '#b45309',
      ladderRungs: '#ffd700',
      snakeBody: '#fbbf24',
      snakeBelly: '#fee2e2',
      snakeOutline: '#3d1d04'
    }
  };

  const cfg = THEME_CONFIGS[themeId] || THEME_CONFIGS.snakes_classic;

  // Background
  ctx.fillStyle = cfg.bg;
  ctx.fillRect(0, 0, size, size);

  // Helper: Tile Center
  const getTileCenter = (num) => {
    const row = Math.floor((num - 1) / 10);
    const rem = (num - 1) % 10;
    const col = (row % 2 === 0) ? rem : (9 - rem);
    const x = col * tileSize + tileSize / 2;
    const y = (9 - row) * tileSize + tileSize / 2;
    return { x, y };
  };

  // 2. Draw 100 Colorful Numbered Tiles
  for (let t = 1; t <= 100; t++) {
    const row = Math.floor((t - 1) / 10);
    const rem = (t - 1) % 10;
    const col = (row % 2 === 0) ? rem : (9 - rem);

    const x = col * tileSize;
    const y = (9 - row) * tileSize;

    const isAlternate = (row + col) % 2 === 0;
    const colorIdx = (row * 10 + col) % cfg.tileColors.length;
    let fill = isAlternate ? cfg.altTile : cfg.tileColors[colorIdx];
    if (t === 100) fill = '#ffd54f';
    if (t === 1) fill = '#4ade80';

    ctx.fillStyle = fill;
    ctx.fillRect(x, y, tileSize, tileSize);

    // Grid Border
    ctx.strokeStyle = cfg.gridBorder;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, tileSize, tileSize);

    // Number Badge Pill
    const badgeW = t >= 100 ? 76 : (t >= 10 ? 64 : 52);
    ctx.fillStyle = cfg.badgeBg;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x + 8, y + 8, badgeW, 44, 8) : ctx.rect(x + 8, y + 8, badgeW, 44);
    ctx.fill();
    ctx.strokeStyle = cfg.badgeBorder;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Tile Number Text
    ctx.fillStyle = t === 100 ? '#b78103' : (t === 1 ? '#15803d' : (cfg.bg === '#030712' ? '#00e5ff' : '#0f172a'));
    ctx.font = 'bold 34px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${t}`, x + 8 + badgeW / 2, y + 30);

    if (t === 100) {
      ctx.fillStyle = '#b78103';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏆 WIN 100', x + tileSize / 2, y + tileSize / 2 + 20);
    } else if (t === 1) {
      ctx.fillStyle = '#15803d';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏁 START 1', x + tileSize / 2, y + tileSize / 2 + 20);
    }
  }

  // 3. Draw Themed Ladders
  Object.entries(LADDERS).forEach(([startStr, endStr]) => {
    const s = parseInt(startStr);
    const e = parseInt(endStr);
    const p1 = getTileCenter(s);
    const p2 = getTileCenter(e);

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(p1.x, p1.y);
    ctx.rotate(angle);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetX = 8;
    ctx.shadowOffsetY = 10;

    const railWidth = 22;
    const ladderSpan = 50;

    ctx.fillStyle = cfg.ladderRails;
    ctx.fillRect(0, -ladderSpan - railWidth / 2, dist, railWidth);
    ctx.fillRect(0, ladderSpan - railWidth / 2, dist, railWidth);

    ctx.fillStyle = cfg.ladderHighlights;
    ctx.fillRect(0, -ladderSpan - railWidth / 2 + 4, dist, railWidth - 8);
    ctx.fillRect(0, ladderSpan - railWidth / 2 + 4, dist, railWidth - 8);

    const rungCount = Math.floor(dist / 42);
    for (let r = 1; r < rungCount; r++) {
      const rx = (r / rungCount) * dist;
      ctx.fillStyle = cfg.ladderRails;
      ctx.fillRect(rx - 8, -ladderSpan, 16, ladderSpan * 2);
      ctx.fillStyle = cfg.ladderRungs;
      ctx.fillRect(rx - 4, -ladderSpan, 8, ladderSpan * 2);
    }

    ctx.restore();
  });

  // 4. Draw Themed Snakes
  let snakeIdx = 0;
  Object.entries(SNAKES).forEach(([headStr, tailStr]) => {
    const h = parseInt(headStr);
    const t = parseInt(tailStr);
    const pHead = getTileCenter(h);
    const pTail = getTileCenter(t);
    snakeIdx++;

    const midX = (pHead.x + pTail.x) / 2 + (snakeIdx % 2 === 0 ? 80 : -80);
    const midY = (pHead.y + pTail.y) / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 6;
    ctx.shadowOffsetY = 8;

    // Outer Border
    ctx.beginPath();
    ctx.moveTo(pHead.x, pHead.y);
    ctx.quadraticCurveTo(midX, midY, pTail.x, pTail.y);
    ctx.strokeStyle = cfg.snakeOutline;
    ctx.lineWidth = 50;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.moveTo(pHead.x, pHead.y);
    ctx.quadraticCurveTo(midX, midY, pTail.x, pTail.y);
    ctx.strokeStyle = cfg.snakeBody;
    ctx.lineWidth = 42;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Belly Center Stripe
    ctx.beginPath();
    ctx.moveTo(pHead.x, pHead.y);
    ctx.quadraticCurveTo(midX, midY, pTail.x, pTail.y);
    ctx.strokeStyle = cfg.snakeBelly;
    ctx.lineWidth = 16;
    ctx.stroke();

    // Snake Head
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.arc(pHead.x, pHead.y, 38, 0, Math.PI * 2);
    ctx.fillStyle = cfg.snakeOutline;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pHead.x, pHead.y, 34, 0, Math.PI * 2);
    ctx.fillStyle = cfg.snakeBody;
    ctx.fill();

    // Red Forked Tongue
    const angle = Math.atan2(pHead.y - midY, pHead.x - midX);
    const tx = pHead.x + Math.cos(angle) * 44;
    const ty = pHead.y + Math.sin(angle) * 44;

    ctx.beginPath();
    ctx.moveTo(pHead.x, pHead.y);
    ctx.lineTo(tx, ty);
    ctx.lineTo(tx + 16, ty - 10);
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + 16, ty + 10);
    ctx.strokeStyle = '#e53935';
    ctx.lineWidth = 7;
    ctx.stroke();

    // Eyes
    const eyeDist = 15;
    const eyeAngle1 = angle + Math.PI / 2.7;
    const eyeAngle2 = angle - Math.PI / 2.7;

    const e1x = pHead.x + Math.cos(eyeAngle1) * eyeDist;
    const e1y = pHead.y + Math.sin(eyeAngle1) * eyeDist;
    const e2x = pHead.x + Math.cos(eyeAngle2) * eyeDist;
    const e2y = pHead.y + Math.sin(eyeAngle2) * eyeDist;

    ctx.beginPath();
    ctx.arc(e1x, e1y, 12, 0, Math.PI * 2);
    ctx.arc(e2x, e2y, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = cfg.snakeOutline;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(e1x + 2, e1y, 6.5, 0, Math.PI * 2);
    ctx.arc(e2x + 2, e2y, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(e1x + 4, e1y - 2, 2.5, 0, Math.PI * 2);
    ctx.arc(e2x + 4, e2y - 2, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.anisotropy = 4;
  return texture;
}
