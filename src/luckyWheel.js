/**
 * Ludo 3D Master Pro - Realistic Balanced Lucky Wheel with High Player Retention
 * Features 2 Ultra-Rare Jackpots:
 *  1. 👑 Ludo Mythic Emperor Board Theme ('mythic_emperor')
 *  2. 🐉 Snakes Golden Dragon Emperor Board Theme ('snakes_dragon')
 * Developer: Sohel | Raebareli, UP - 229001
 */

import { economy } from './economyState.js';
import { sounds } from './audio.js';
import confetti from 'canvas-confetti';

export const WHEEL_SECTORS = [
  { label: "100", icon: "🪙", type: "coins", val: 100, color: "#f59e0b", textColor: "#ffffff" },
  { label: "10 Gems", icon: "💎", type: "gems", val: 10, color: "#0284c7", textColor: "#ffffff" },
  { label: "LUDO MYTHIC", icon: "👑", type: "ludoTheme", val: "mythic_emperor", color: "#ffd700", textColor: "#1a2536", isJackpot: true },
  { label: "250", icon: "🪙", type: "coins", val: 250, color: "#ea2b2b", textColor: "#ffffff" },
  { label: "25 Gems", icon: "💎", type: "gems", val: 25, color: "#7c4dff", textColor: "#ffffff" },
  { label: "SNAKE MYTHIC", icon: "🐉", type: "snakesTheme", val: "snakes_dragon", color: "#10b981", textColor: "#ffffff", isJackpot: true },
  { label: "500", icon: "🪙", type: "coins", val: 500, color: "#ff6f00", textColor: "#ffffff" },
  { label: "50 Gems", icon: "💎", type: "gems", val: 50, color: "#00b0ff", textColor: "#ffffff", isJackpot: true }
];

export class LuckyWheel {
  constructor(canvasElement, onRewardClaimed) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.onRewardClaimed = onRewardClaimed;
    this.currentRotation = 0;
    this.isSpinning = false;
    this.drawWheel();
  }

  drawWheel() {
    const size = this.canvas.width;
    const center = size / 2;
    const radius = center - 18;
    const ctx = this.ctx;
    const numSectors = WHEEL_SECTORS.length;
    const arc = (2 * Math.PI) / numSectors;

    ctx.clearRect(0, 0, size, size);

    // 1. Outer Shiny Gold Bezel
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 14, 0, 2 * Math.PI);
    ctx.fillStyle = '#b78103';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(center, center, radius + 7, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffd700';
    ctx.fill();

    // LED Bulbs
    const bulbCount = 24;
    for (let b = 0; b < bulbCount; b++) {
      const bulbAngle = (b / bulbCount) * 2 * Math.PI;
      const bx = center + Math.cos(bulbAngle) * (radius + 10);
      const by = center + Math.sin(bulbAngle) * (radius + 10);
      ctx.beginPath();
      ctx.arc(bx, by, 4.5, 0, 2 * Math.PI);
      ctx.fillStyle = (b % 2 === 0) ? '#ffffff' : '#ffea79';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 6;
      ctx.fill();
    }
    ctx.restore();

    // 2. Draw Sectors
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(this.currentRotation);

    for (let i = 0; i < numSectors; i++) {
      const sector = WHEEL_SECTORS[i];
      const startAngle = i * arc;
      const endAngle = startAngle + arc;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = sector.color;
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Text & Icon
      ctx.save();
      ctx.rotate(startAngle + arc / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Draw Icon
      ctx.font = '30px sans-serif';
      ctx.fillText(sector.icon, radius - 18, 0);

      // Draw Label
      ctx.fillStyle = sector.textColor;
      ctx.font = 'bold 20px -apple-system, sans-serif';
      ctx.fillText(sector.label, radius - 58, 0);

      ctx.restore();
    }

    // 3. Center Gold Hub Cap
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, 2 * Math.PI);
    ctx.fillStyle = '#b78103';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffd700';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎲', 0, 0);

    ctx.restore();
  }

  spin() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    sounds.playDiceRoll();

    // Realistic high-retention probabilities
    const rand = Math.random();
    let targetIndex = 0;
    if (rand < 0.005) targetIndex = 2; // 0.5% chance: Ludo Mythic Emperor Theme!
    else if (rand < 0.012) targetIndex = 5; // 0.7% chance: Snakes Golden Dragon Theme!
    else if (rand < 0.04) targetIndex = 7; // 2.8% chance: 50 Gems
    else if (rand < 0.10) targetIndex = 6; // 6% chance: 500 Coins
    else if (rand < 0.22) targetIndex = 4; // 12% chance: 25 Gems
    else if (rand < 0.40) targetIndex = 3; // 18% chance: 250 Coins
    else if (rand < 0.65) targetIndex = 1; // 25% chance: 10 Gems
    else targetIndex = 0; // 35% chance: 100 Coins

    const sectorAngle = (2 * Math.PI) / WHEEL_SECTORS.length;
    const targetAngleOnWheel = (targetIndex + 0.5) * sectorAngle;
    const finalAngle = (Math.PI * 3 / 2) - targetAngleOnWheel;

    const fullSpins = (Math.floor(Math.random() * 3) + 5) * 2 * Math.PI;
    const totalRotation = this.currentRotation + fullSpins + (finalAngle - (this.currentRotation % (2 * Math.PI)));

    const duration = 3800;
    const startTime = performance.now();
    const startRotation = this.currentRotation;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const ease = 1 - Math.pow(1 - progress, 5);
      this.currentRotation = startRotation + (totalRotation - startRotation) * ease;
      this.drawWheel();

      if (progress < 1.0) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        sounds.playVictory();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

        const wonSector = WHEEL_SECTORS[targetIndex];
        this.applyReward(wonSector);

        if (this.onRewardClaimed) {
          this.onRewardClaimed(wonSector);
        }
      }
    };

    requestAnimationFrame(animate);
  }

  applyReward(sector) {
    if (sector.type === 'coins') {
      economy.addCoins(sector.val);
    } else if (sector.type === 'gems') {
      economy.addGems(sector.val);
    } else if (sector.type === 'ludoTheme') {
      economy.unlockItem('themes', sector.val);
      economy.equipItem('themes', sector.val);
    } else if (sector.type === 'snakesTheme') {
      economy.unlockItem('snakesThemes', sector.val);
      economy.equipItem('snakesThemes', sector.val);
    }
    economy.recordSpinUsed();
  }
}
