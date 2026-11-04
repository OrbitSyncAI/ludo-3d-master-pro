/**
 * Ludo 3D Pro - In-Game HUD & Tactical Action Overlay
 * Premium Pause & Exit Modal (Resume, Restart, Quit to Home) + Victory & Status Displays
 */

import { sounds } from './audio.js';
import { PLAYERS_CONFIG } from './boardData.js';
import { economy } from './economyState.js';

export class UIManager {
  constructor(callbacks = {}) {
    this.callbacks = callbacks; // onRoll, onExitToHome, onRestartMatch
    this.soundEnabled = true;
    this.initDOM();
  }

  initDOM() {
    const screen = document.getElementById('game-screen');

    // In-Game Top Bar Header
    this.header = document.createElement('header');
    this.header.className = 'game-header in-game-header hidden';
    this.header.innerHTML = `
      <div class="header-left">
        <button id="btn-pause-game" class="btn-pause-pill" title="Pause Game">
          <span>⏸️ PAUSE</span>
        </button>
      </div>

      <div class="header-center">
        <span class="in-game-title-badge" id="current-mode-label">LUDO CLASSIC</span>
      </div>

      <div class="header-right">
        <button id="btn-home-exit" class="btn-exit-home" title="Exit to Home">
          <span>🏠 HOME</span>
        </button>
        <button id="btn-sound" class="btn-sound-toggle" title="Sound">🔊</button>
      </div>
    `;
    screen.appendChild(this.header);

    // 4 Corner Player Cards
    this.playersContainer = document.createElement('div');
    this.playersContainer.className = 'players-overlay hidden';
    screen.appendChild(this.playersContainer);

    // Bottom Action Dock
    this.rollController = document.createElement('div');
    this.rollController.className = 'roll-controller hidden';
    this.rollController.innerHTML = `
      <div class="turn-prompt-pill" id="turn-prompt">
        <span id="turn-prompt-text">Welcome to Ludo 3D!</span>
      </div>

      <div class="roll-btn-wrapper">
        <button id="btn-roll" class="roll-btn btn-roll-dice">
          <span class="dice-pip-display dice-icon-preview">🎲</span>
          <div class="roll-text roll-btn-labels">
            <span class="roll-title main-roll-text">ROLL DICE</span>
            <span class="roll-sub sub-roll-text">Tap button or 3D dice</span>
          </div>
        </button>
      </div>
    `;
    screen.appendChild(this.rollController);

    // Modal Overlay (Pause, Victory, Legal, Setup)
    this.modalOverlay = document.createElement('div');
    this.modalOverlay.className = 'modal-overlay hidden';
    screen.appendChild(this.modalOverlay);

    this.bindEvents();
  }

  bindEvents() {
    const btnPause = document.getElementById('btn-pause-game');
    if (btnPause) {
      btnPause.addEventListener('click', () => {
        sounds.playButtonClick();
        this.showPauseModal();
      });
    }

    const btnExit = document.getElementById('btn-home-exit');
    if (btnExit) {
      btnExit.addEventListener('click', () => {
        sounds.playButtonClick();
        this.showPauseModal();
      });
    }

    const btnRoll = document.getElementById('btn-roll');
    if (btnRoll) {
      btnRoll.addEventListener('click', () => {
        sounds.playButtonClick();
        if (this.callbacks.onRoll) this.callbacks.onRoll();
      });
    }

    const btnSound = document.getElementById('btn-sound');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        sounds.enabled = this.soundEnabled;
        btnSound.textContent = this.soundEnabled ? '🔊' : '🔇';
        btnSound.classList.toggle('muted', !this.soundEnabled);
      });
    }
  }

  // Premium In-Game Pause & Exit Modal (Zero browser alert/confirm!)
  showPauseModal() {
    sounds.playButtonClick();
    this.modalOverlay.classList.remove('hidden');
    this.modalOverlay.innerHTML = `
      <div class="modal-card pause-modal-card">
        <div class="pause-icon-header">⏸️</div>
        <h2 class="pause-title">GAME PAUSED</h2>
        <p class="pause-subtitle">Take a breather! Choose an option below:</p>

        <div class="pause-actions-list">
          <button class="btn-pause-action btn-resume" id="btn-pause-resume">
            <span class="action-icon">▶️</span>
            <span class="action-label">RESUME MATCH</span>
          </button>

          <button class="btn-pause-action btn-restart" id="btn-pause-restart">
            <span class="action-icon">🔄</span>
            <span class="action-label">RESTART MATCH</span>
          </button>

          <button class="btn-pause-action btn-quit" id="btn-pause-quit">
            <span class="action-icon">🚪</span>
            <span class="action-label">QUIT TO HOME MENU</span>
          </button>
        </div>

        <div class="pause-footer-info">
          <span>Settings: Sound ${this.soundEnabled ? 'ON 🔊' : 'OFF 🔇'}</span>
        </div>
      </div>
    `;

    document.getElementById('btn-pause-resume').addEventListener('click', () => {
      sounds.playButtonClick();
      this.modalOverlay.classList.add('hidden');
    });

    document.getElementById('btn-pause-restart').addEventListener('click', () => {
      sounds.playButtonClick();
      this.modalOverlay.classList.add('hidden');
      if (this.callbacks.onRestartMatch) {
        this.callbacks.onRestartMatch();
      } else if (this.callbacks.onExitToHome) {
        this.callbacks.onExitToHome();
      }
    });

    document.getElementById('btn-pause-quit').addEventListener('click', () => {
      sounds.playButtonClick();
      this.modalOverlay.classList.add('hidden');
      if (this.callbacks.onExitToHome) this.callbacks.onExitToHome();
    });
  }

  showInGameHUD(title = 'LUDO CLASSIC') {
    this.header.classList.remove('hidden');
    this.playersContainer.classList.remove('hidden');
    this.rollController.classList.remove('hidden');
    const label = document.getElementById('current-mode-label');
    if (label) label.textContent = title;
  }

  showInGameUI(title = 'LUDO CLASSIC') {
    this.showInGameHUD(title);
  }

  hideInGameHUD() {
    this.header.classList.add('hidden');
    this.playersContainer.classList.add('hidden');
    this.rollController.classList.add('hidden');
  }

  hideInGameUI() {
    this.hideInGameHUD();
  }

  renderPlayerCards(players, activePlayerIndex = 0, tokens = null, positions = null) {
    this.setupPlayerCards(players);
    if (players && players[activePlayerIndex]) {
      this.highlightActivePlayer(players[activePlayerIndex].id, players[activePlayerIndex].name);
    }
    if (tokens) {
      players.forEach(p => {
        const finished = tokens[p.id] ? tokens[p.id].filter(s => s === 56).length : 0;
        this.updatePlayerScore(p.id, finished, 4);
      });
    } else if (positions) {
      players.forEach(p => {
        const score = document.getElementById(`hud-score-${p.id}`);
        if (score) {
          const pos = positions[p.id] || 1;
          score.textContent = `📍 Tile ${pos}`;
        }
      });
    }
  }

  updateDiceDisplay(rollValue, isRolling = false) {
    const dicePreview = this.rollController ? this.rollController.querySelector('.dice-icon-preview') : null;
    const rollMain = this.rollController ? this.rollController.querySelector('.main-roll-text') : null;
    if (isRolling) {
      if (dicePreview) dicePreview.classList.add('spinning');
      if (rollMain) rollMain.textContent = 'ROLLING...';
    } else {
      if (dicePreview) {
        dicePreview.classList.remove('spinning');
        if (rollValue) {
          const pipIcons = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
          dicePreview.textContent = pipIcons[rollValue - 1] || `${rollValue}`;
        } else {
          dicePreview.textContent = '🎲';
        }
      }
      if (rollMain) {
        rollMain.textContent = rollValue ? `ROLLED ${rollValue}!` : 'ROLL DICE';
      }
    }
  }

  setupPlayerCards(players) {
    this.playersContainer.innerHTML = '';
    const cornerClasses = ['pos-bottom-left', 'pos-top-left', 'pos-top-right', 'pos-bottom-right'];

    players.forEach((p, idx) => {
      const card = document.createElement('div');
      card.id = `player-hud-${p.id}`;
      card.className = `player-card player-hud-card ${cornerClasses[idx]} ${p.isAI ? 'is-bot' : 'is-human'}`;
      card.style.borderColor = p.color ? p.color.primary : '#ffd700';

      const roleBadge = p.team 
        ? `<span class="type-pill hud-role" style="background: ${p.team === 'A' ? '#fee2e2; color: #dc2626' : '#dcfce7; color: #16a34a'}">${p.team === 'A' ? '🔴 SOLAR' : '🟢 CYBER'}</span>`
        : `<span class="type-pill hud-role">${p.isAI ? 'BOT' : 'YOU'}</span>`;

      card.innerHTML = `
        <div class="player-avatar hud-avatar-box" style="background: ${p.color ? p.color.primary + '22' : '#ffffff22'}">
          <span class="hud-avatar">${p.isAI ? '🤖' : (economy?.data?.avatar || '👑')}</span>
        </div>
        <div class="player-info hud-player-meta">
          <strong class="player-name hud-name" style="color: ${p.color ? p.color.textColor : '#ffffff'}">${p.name}</strong>
          <div class="player-meta">
            ${roleBadge}
            <span class="home-score hud-score-chip" id="hud-score-${p.id}">🏆 0/4</span>
          </div>
        </div>
        <div class="active-pulse-dot"></div>
      `;
      this.playersContainer.appendChild(card);
    });
  }

  highlightActivePlayer(playerId, playerName) {
    const allCards = this.playersContainer.querySelectorAll('.player-hud-card');
    allCards.forEach(c => c.classList.remove('active-turn'));

    const activeCard = document.getElementById(`player-hud-${playerId}`);
    if (activeCard) {
      activeCard.classList.add('active-turn');
    }

    const text = document.getElementById('turn-prompt-text');
    if (text) {
      text.textContent = `${playerName}'s turn - Tap to Roll!`;
    }
  }

  updatePlayerScore(playerId, finishedCount, totalTokens = 4) {
    const score = document.getElementById(`hud-score-${playerId}`);
    if (score) {
      score.textContent = `🏆 ${finishedCount}/${totalTokens}`;
    }
  }

  updateStatus(message, isHighlight = false) {
    const text = document.getElementById('turn-prompt-text');
    if (text) {
      text.textContent = message;
      if (isHighlight) {
        text.parentElement.classList.add('prompt-pulse');
        setTimeout(() => text.parentElement.classList.remove('prompt-pulse'), 1200);
      }
    }
  }

  setRollButtonEnabled(enabled) {
    const rollBtn = document.getElementById('btn-roll');
    if (rollBtn) {
      rollBtn.disabled = !enabled;
      rollBtn.style.opacity = enabled ? '1.0' : '0.5';
      rollBtn.style.pointerEvents = enabled ? 'auto' : 'none';
    }
  }

  // Match Victory / Defeat Screen with Differentiated Rewards & Retry Option
  showVictoryModal(winner, stats, rewardInfo, onReturnHome, onRetryMatch) {
    this.modalOverlay.classList.remove('hidden');

    const isDefeat = rewardInfo && rewardInfo.isDefeat;

    if (isDefeat) {
      sounds.playDefeat();
    } else {
      sounds.playVictory();
    }

    let rewardSection = '';
    if (rewardInfo) {
      if (rewardInfo.isFriendly) {
        rewardSection = `
          <div class="victory-reward-card friendly-reward">
            <span>👥 Friendly Pass & Play Match</span>
            <small>Casual match between friends — Play 300 Saga to earn Coins & Diamonds!</small>
          </div>
        `;
      } else {
        rewardSection = `
          <div class="victory-reward-card ${isDefeat ? 'defeat-reward' : (rewardInfo.isLevel ? 'saga-reward' : 'bot-reward')}">
            <span class="reward-title-badge ${isDefeat ? 'badge-defeat' : ''}">${rewardInfo.title || (isDefeat ? 'DEFEAT' : 'VICTORY REWARDS')}</span>
            <div class="reward-chips-row">
              ${rewardInfo.coins > 0 ? `<div class="reward-chip chip-coins">🪙 +${rewardInfo.coins.toLocaleString()}</div>` : ''}
              ${rewardInfo.gems > 0 ? `<div class="reward-chip chip-gems">💎 +${rewardInfo.gems}</div>` : ''}
              ${rewardInfo.xp > 0 ? `<div class="reward-chip chip-xp">⭐ +${rewardInfo.xp} XP</div>` : ''}
            </div>
            ${rewardInfo.stars ? `<div class="reward-stars-row">${'⭐'.repeat(rewardInfo.stars)}</div>` : ''}
            ${isDefeat ? `<div class="defeat-tip-text">Level remained uncleared. Re-roll with better tactics!</div>` : ''}
          </div>
        `;
      }
    }

    let teamSection = '';
    if (rewardInfo && rewardInfo.isTeam) {
      teamSection = `
        <div class="team-victory-banner">
          <div class="team-banner-title">👥 ${rewardInfo.winningTeam || 'TEAM BATTLE'} WINS!</div>
          <div class="team-partner-row">
            ${(rewardInfo.teamMembers || []).map(m => `
              <div class="team-partner-badge">
                <span>${m.id === 0 ? (economy?.data?.avatar || '👑') : '🤖'}</span>
                <strong>${m.name}</strong>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    let podiumSection = '';
    if (rewardInfo && rewardInfo.rankings && rewardInfo.rankings.length > 0) {
      podiumSection = `
        <div class="tournament-podium-section">
          <div class="podium-header-bar">🏆 MATCH STANDINGS & LEADERBOARD</div>
          <div class="podium-list">
            ${rewardInfo.rankings.map(r => `
              <div class="podium-row rank-${r.rank} ${r.isWinner ? 'podium-winner' : ''} ${r.isDefeated ? 'podium-defeated' : ''}">
                <span class="rank-badge">${r.rank === 1 ? '🥇 1st' : (r.rank === 2 ? '🥈 2nd' : (r.rank === 3 ? '🥉 3rd' : '💔 4th'))}</span>
                <div class="rank-player-details">
                  <strong class="rank-player-name">${r.name} ${r.team ? `(${r.team === 'A' ? 'Solar' : 'Cyber'})` : ''}</strong>
                  <span class="rank-player-score">${r.scoreLabel || ''}</span>
                </div>
                <span class="rank-status-tag ${r.isWinner ? 'tag-winner' : (r.isDefeated ? 'tag-defeated' : 'tag-position')}">
                  ${r.isWinner ? '👑 WINNER' : (r.isDefeated ? '💔 DEFEATED' : (r.rank === 2 ? 'RUNNER UP' : '3RD'))}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    this.modalOverlay.innerHTML = `
      <div class="modal-card ${isDefeat ? 'defeat-card' : 'victory-card'}">
        <div class="${isDefeat ? 'defeat-icon' : 'victory-crown'}">${isDefeat ? '💔' : '👑'}</div>
        <h1 class="${isDefeat ? 'defeat-title' : 'victory-title'}">${isDefeat ? 'MATCH DEFEAT!' : 'MATCH VICTORY!'}</h1>
        <p class="winner-announcement" style="color: ${isDefeat ? '#cbd5e1' : (winner.color ? winner.color.textColor : '#b78103')}">
          ${isDefeat ? `<strong>${winner.name}</strong> outplayed you this time!` : `<strong>${winner.name}</strong> has conquered the board!`}
        </p>

        ${teamSection}
        ${rewardSection}
        ${podiumSection}

        <div class="victory-stats-grid">
          <div class="stat-box">
            <span class="stat-num">${stats ? stats.totalTurns : 1}</span>
            <span class="stat-lbl">Turns</span>
          </div>
          <div class="stat-box">
            <span class="stat-num">${stats && stats.kills ? stats.kills[winner.id] || 0 : 0}</span>
            <span class="stat-lbl">Knockouts</span>
          </div>
          <div class="stat-box">
            <span class="stat-num">${stats && stats.sixesRolled ? stats.sixesRolled[winner.id] || 0 : 0}</span>
            <span class="stat-lbl">Sixes</span>
          </div>
        </div>

        <div class="match-end-btn-row">
          ${isDefeat && onRetryMatch ? `<button class="btn-win-retry" id="btn-win-retry">🔄 TRY AGAIN</button>` : ''}
          <button class="btn-win-return" id="btn-win-return">🏠 RETURN TO HOME</button>
        </div>
      </div>
    `;

    const retryBtn = document.getElementById('btn-win-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        sounds.playButtonClick();
        this.modalOverlay.classList.add('hidden');
        if (onRetryMatch) onRetryMatch();
      });
    }

    document.getElementById('btn-win-return').addEventListener('click', () => {
      sounds.playButtonClick();
      this.modalOverlay.classList.add('hidden');
      if (onReturnHome) onReturnHome();
    });
  }
}
