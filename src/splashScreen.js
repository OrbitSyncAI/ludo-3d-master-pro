/**
 * Ludo 3D Master Pro - High-End First Launch Splash & Loading Screen
 * Authentic AAA game opening with animated crown, gem pawns, glowing energy bar & sound
 */

import { sounds } from './audio.js';

export class SplashScreen {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.splashEl = null;
    this.progress = 0;
  }

  show() {
    this.splashEl = document.createElement('div');
    this.splashEl.id = 'game-splash-screen';
    this.splashEl.innerHTML = `
      <div class="splash-bg-glow"></div>
      <div class="splash-particles">
        <span class="particle p1"></span>
        <span class="particle p2"></span>
        <span class="particle p3"></span>
        <span class="particle p4"></span>
        <span class="particle p5"></span>
        <span class="particle p6"></span>
      </div>

      <div class="splash-content">
        <!-- Floating Royal Emblem -->
        <div class="splash-emblem-wrapper">
          <div class="splash-crown-aura"></div>
          <div class="splash-crown-icon">👑</div>
          <div class="splash-orbit-ring">
            <span class="gem-orbit gem-red"></span>
            <span class="gem-orbit gem-green"></span>
            <span class="gem-orbit gem-yellow"></span>
            <span class="gem-orbit gem-blue"></span>
          </div>
        </div>

        <!-- 3D Brand Title -->
        <div class="splash-brand-block">
          <div class="splash-brand-top">THE ROYAL EXPERIENCE</div>
          <h1 class="splash-game-title">
            <span class="title-ludo">LUDO 3D</span>
            <span class="title-master">MASTER PRO</span>
          </h1>
          <div class="splash-edition-chip">
            <span>🎲 500 LEVELS • SNAKES 3D • 60 FPS</span>
          </div>
        </div>

        <!-- Animated Progress Energy Bar -->
        <div class="splash-loader-area">
          <div class="splash-status-row">
            <span id="splash-status-text">Starting 3D Game Engine...</span>
            <span id="splash-percent-text">0%</span>
          </div>
          <div class="splash-progress-track">
            <div id="splash-progress-fill" class="splash-progress-fill">
              <span class="splash-progress-glow"></span>
            </div>
          </div>
        </div>

        <!-- Studio Watermark -->
        <div class="splash-footer">
          <div class="splash-studio-name">ORBITSYNC STUDIOS</div>
          <div class="splash-version">BUILD v1.3.7 • PRODUCTION READY</div>
        </div>
      </div>
    `;

    this.container.appendChild(this.splashEl);
    this.startLoadingSequence();
  }

  startLoadingSequence() {
    const statusSteps = [
      { progress: 15, text: "✨ Loading 3D Board & Visual Shaders..." },
      { progress: 38, text: "🎲 Initializing 500 Levels & Stages..." },
      { progress: 62, text: "👑 Calibrating 60 FPS Physics & AI Engine..." },
      { progress: 85, text: "🛡️ Securing Player Data & Cloud Vault..." },
      { progress: 100, text: "🚀 Welcome to the Royal Arena!" }
    ];

    const fillEl = document.getElementById('splash-progress-fill');
    const percentEl = document.getElementById('splash-percent-text');
    const statusEl = document.getElementById('splash-status-text');

    const totalDuration = 1800; // 1.8 seconds - crisp, authentic AAA mobile loading feel
    const startTime = performance.now();

    const animateProgress = (now) => {
      const elapsed = now - startTime;
      const rawPct = Math.min(elapsed / totalDuration, 1.0);
      // Smooth cubic ease-out
      const easePct = 1 - Math.pow(1 - rawPct, 2.5);
      const currentPct = Math.min(Math.round(easePct * 100), 100);

      if (fillEl) fillEl.style.width = `${currentPct}%`;
      if (percentEl) percentEl.textContent = `${currentPct}%`;

      // Update dynamic status line
      for (let i = statusSteps.length - 1; i >= 0; i--) {
        if (currentPct >= statusSteps[i].progress) {
          if (statusEl && statusEl.textContent !== statusSteps[i].text) {
            statusEl.textContent = statusSteps[i].text;
          }
          break;
        }
      }

      if (rawPct < 1.0) {
        requestAnimationFrame(animateProgress);
      } else {
        // Complete! Play triumphant opening chime
        try {
          sounds.playSplashIntro();
        } catch (e) {}

        setTimeout(() => {
          this.dismiss();
        }, 250);
      }
    };

    requestAnimationFrame(animateProgress);
  }

  dismiss() {
    if (!this.splashEl) return;
    this.splashEl.classList.add('splash-dismiss');

    setTimeout(() => {
      if (this.splashEl && this.splashEl.parentNode) {
        this.splashEl.parentNode.removeChild(this.splashEl);
      }
      this.splashEl = null;
      if (typeof this.onComplete === 'function') {
        this.onComplete();
      }
    }, 550);
  }
}
