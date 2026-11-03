/**
 * Ludo 3D Pro - Realistic Balanced Lucky Wheel with High Player Retention
 * Tighter, balanced coin/gem rewards with ultra-rare Mythic Emperor jackpot
 */

import { economy } from './economyState.js';
import { sounds } from './audio.js';
import confetti from 'canvas-confetti';

export const WHEEL_SECTORS = [
  { label: "50", icon: "🪙", type: "coins", val: 50, color: "#f59e0b", textColor: "#ffffff" },
  { label: "1 Gem", icon: "💎", type: "gems", val: 1, color: "#0284c7", textColor: "#ffffff" },
  { label: "100", icon: "🪙", type: "coins", val: 100, color: "#ea2b2b", textColor: "#ffffff" },
  { label: "2 Gems", icon: "💎", type: "gems", val: 2, color: "#7c4dff", textColor: "#ffffff" },
  { label: "150", icon: "🪙", type: "coins", val: 150, color: "#00aa4f", textColor: "#ffffff" },
  { label: "3 Gems", icon: "💎", type: "gems", val: 3, color: "#00b0ff", textColor: "#ffffff" },
  { label: "300", icon: "🪙", type: "coins", val: 300, color: "#ff6f00", textColor: "#ffffff", isJackpot: true },
  { label: "MYTHIC THEME", icon: "👑", type: "theme", val: "mythic_emperor", color: "#ffd700", textColor: "#1a2536", isJackpot: true }
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
      ctx.font = '32px sans-serif';
      ctx.fillText(sector.icon, radius - 20, 0);

      // Draw Label
      ctx.fillStyle = sector.textColor;
      ctx.font = 'bold 22px -apple-system, sans-serif';
      ctx.fillText(sector.label, radius - 62, 0);

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

    // Realistic high-retention probabilities (Rarer high payouts so visitors play more matches)
    const rand = Math.random();
    let targetIndex = 0;
    if (rand < 0.005) targetIndex = 7; // 0.5% chance: Mythic Emperor Theme!
    else if (rand < 0.02) targetIndex = 6; // 1.5% chance: 300 Coins
    else if (rand < 0.06) targetIndex = 5; // 4% chance: 3 Gems
    else if (rand < 0.15) targetIndex = 4; // 9% chance: 150 Coins
    else if (rand < 0.28) targetIndex = 3; // 13% chance: 2 Gems
    else if (rand < 0.48) targetIndex = 2; // 20% chance: 100 Coins
    else if (rand < 0.72) targetIndex = 1; // 24% chance: 1 Gem
    else targetIndex = 0; // 28% chance: 50 Coins

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
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

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
    } else if (sector.type === 'theme') {
      economy.unlockItem('themes', sector.val);
      economy.equipItem('themes', sector.val);
    }
    economy.recordSpinUsed();
  }
}
