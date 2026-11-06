/**
 * Ludo 3D Pro - In-Game HUD & Tactical Action Overlay
 * Premium Pause & Exit Modal (Resume, Restart, Quit to Home) + Victory & Status Displays
 */

import { sounds } from './audio.js';
import { PLAYERS_CONFIG } from './boardData.js';
import { economy } from './economyState.js';

export function getDiceFaceSvg(val = 6) {
  const num = Math.min(Math.max(parseInt(val) || 6, 1), 6);
  const pipsMap = {
    1: `
      <circle cx="28" cy="28" r="8.5" fill="#e11d48"/>
      <circle cx="25.5" cy="25.5" r="2.8" fill="#ffffff" opacity="0.8"/>
    `,
    2: `
      <circle cx="17" cy="17" r="5.5" fill="#0f172a"/>
      <circle cx="15.5" cy="15.5" r="1.8" fill="#ffffff" opacity="0.7"/>
      <circle cx="39" cy="39" r="5.5" fill="#0f172a"/>
      <circle cx="37.5" cy="37.5" r="1.8" fill="#ffffff" opacity="0.7"/>
    `,
    3: `
      <circle cx="16" cy="16" r="5.2" fill="#0f172a"/>
      <circle cx="14.8" cy="14.8" r="1.8" fill="#ffffff" opacity="0.7"/>
      <circle cx="28" cy="28" r="5.2" fill="#0f172a"/>
      <circle cx="26.8" cy="26.8" r="1.8" fill="#ffffff" opacity="0.7"/>
      <circle cx="40" cy="40" r="5.2" fill="#0f172a"/>
      <circle cx="38.8" cy="38.8" r="1.8" fill="#ffffff" opacity="0.7"/>
    `,
    4: `
      <circle cx="17" cy="17" r="5.2" fill="#0f172a"/>
      <circle cx="15.8" cy="15.8" r="1.8" fill="#ffffff" opacity="0.7"/>
      <circle cx="39" cy="17" r="5.2" fill="#0f172a"/>
      <circle cx="37.8" cy="15.8" r="1.8" fill="#ffffff" opacity="0.7"/>
      <circle cx="17" cy="39" r="5.2" fill="#0f172a"/>
      <circle cx="15.8" cy="37.8" r="1.8" fill="#ffffff" opacity="0.7"/>
      <circle cx="39" cy="39" r="5.2" fill="#0f172a"/>
      <circle cx="37.8" cy="37.8" r="1.8" fill="#ffffff" opacity="0.7"/>
    `,
    5: `
      <circle cx="16" cy="16" r="5" fill="#0f172a"/>
      <circle cx="15" cy="15" r="1.6" fill="#ffffff" opacity="0.7"/>
      <circle cx="40" cy="16" r="5" fill="#0f172a"/>
      <circle cx="39" cy="15" r="1.6" fill="#ffffff" opacity="0.7"/>
      <circle cx="28" cy="28" r="5.5" fill="#e11d48"/>
      <circle cx="26.8" cy="26.8" r="1.8" fill="#ffffff" opacity="0.8"/>
      <circle cx="16" cy="40" r="5" fill="#0f172a"/>
      <circle cx="15" cy="39" r="1.6" fill="#ffffff" opacity="0.7"/>
      <circle cx="40" cy="40" r="5" fill="#0f172a"/>
      <circle cx="39" cy="39" r="1.6" fill="#ffffff" opacity="0.7"/>
    `,
    6: `
      <circle cx="17" cy="15" r="5" fill="#0f172a"/>
      <circle cx="15.8" cy="13.8" r="1.6" fill="#ffffff" opacity="0.7"/>
      <circle cx="17" cy="28" r="5" fill="#0f172a"/>
      <circle cx="15.8" cy="26.8" r="1.6" fill="#ffffff" opacity="0.7"/>
      <circle cx="17" cy="41" r="5" fill="#0f172a"/>
      <circle cx="15.8" cy="39.8" r="1.6" fill="#ffffff" opacity="0.7"/>
      <circle cx="39" cy="15" r="5" fill="#0f172a"/>
      <circle cx="37.8" cy="13.8" r="1.6" fill="#ffffff" opacity="0.7"/>
      <circle cx="39" cy="28" r="5" fill="#0f172a"/>
      <circle cx="37.8" cy="26.8" r="1.6" fill="#ffffff" opacity="0.7"/>
      <circle cx="39" cy="41" r="5" fill="#0f172a"/>
      <circle cx="37.8" cy="39.8" r="1.6" fill="#ffffff" opacity="0.7"/>
    `
  };

  return `
    <svg class="dice-svg-face" viewBox="0 0 56 56" width="100%" height="100%" style="display:block; overflow:visible;">
      <!-- Solid White 3D Dice Face with Crisp 2.5px Slate Border -->
      <rect x="3" y="3" width="50" height="50" rx="12" ry="12" fill="#ffffff" stroke="#94a3b8" stroke-width="2.5"/>
      <!-- Soft Depth Shadow at bottom of dice -->
      <path d="M 5 42 Q 5 51 14 51 L 42 51 Q 51 51 51 42 L 51 45 Q 51 53 42 53 L 14 53 Q 5 53 5 45 Z" fill="#cbd5e1" opacity="0.75"/>
      <!-- Crisp High-Contrast Pips (100% visible, zero defs dependency) -->
      ${pipsMap[num]}
    </svg>
  `;
}

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

    // Sleek Floating Match Status Dock (Replaces clunky yellow button)
    this.rollController = document.createElement('div');
    this.rollController.className = 'match-status-dock hidden';
    this.rollController.innerHTML = `
      <div class="match-status-pill" id="turn-prompt">
        <span class="status-pip-dot"></span>
        <span id="turn-prompt-text">Welcome to Ludo 3D</span>
      </div>
    `;
    screen.appendChild(this.rollController);

    // Make match status pill clickable to roll immediately
    const pill = this.rollController.querySelector('#turn-prompt');
    if (pill) {
      let lastPillTap = 0;
      const onPillTap = (e) => {
        const now = Date.now();
        if (now - lastPillTap < 350) return;
        if (this.isRollAllowed === false) return;
        lastPillTap = now;
        sounds.playButtonClick();
        if (this.callbacks.onRoll) this.callbacks.onRoll();
      };
      pill.addEventListener('pointerup', onPillTap);
      pill.addEventListener('click', onPillTap);
    }

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

    const turnPrompt = document.getElementById('turn-prompt');
    if (turnPrompt) {
      turnPrompt.addEventListener('click', () => {
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
    const activePlayer = players && players[activePlayerIndex];
    if (activePlayer) {
      this.activePlayerId = activePlayer.id;
      this.highlightActivePlayer(activePlayer.id, activePlayer.name);
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

  updateDiceDisplay(rollValue, isRolling = false, activePlayerId = this.activePlayerId) {
    if (activePlayerId !== undefined && activePlayerId !== null) {
      const cornerPip = document.getElementById(`corner-pip-${activePlayerId}`);
      if (cornerPip) {
        if (!this.rollIntervals) this.rollIntervals = {};
        if (isRolling) {
          cornerPip.classList.add('spinning');
          if (!this.rollIntervals[activePlayerId]) {
            this.rollIntervals[activePlayerId] = setInterval(() => {
              const rand = Math.floor(Math.random() * 6) + 1;
              cornerPip.innerHTML = getDiceFaceSvg(rand);
            }, 60);
          }
        } else {
          if (this.rollIntervals[activePlayerId]) {
            clearInterval(this.rollIntervals[activePlayerId]);
            delete this.rollIntervals[activePlayerId];
          }
          cornerPip.classList.remove('spinning');
          if (rollValue) {
            cornerPip.innerHTML = getDiceFaceSvg(rollValue);
            cornerPip.classList.remove('bounce-dice');
            void cornerPip.offsetWidth; // Force reflow to re-trigger bounce cleanly
            cornerPip.classList.add('bounce-dice');
            setTimeout(() => cornerPip.classList.remove('bounce-dice'), 600);
          }
        }
      }
    }
  }

  setupPlayerCards(players) {
    const currentCardCount = this.playersContainer.querySelectorAll('.player-hud-card').length;
    if (currentCardCount === players.length) {
      // Cards already created, only update rank badges if any
      players.forEach(p => {
        const card = document.getElementById(`player-hud-${p.id}`);
        if (card && p.hasFinished && p.rank) {
          let rankBadge = card.querySelector('.hud-rank-badge');
          if (!rankBadge) {
            rankBadge = document.createElement('span');
            rankBadge.className = 'hud-rank-badge';
            card.appendChild(rankBadge);
          }
          const medals = { 1: '🥇 1ST', 2: '🥈 2ND', 3: '🥉 3RD', 4: '4TH' };
          rankBadge.textContent = medals[p.rank] || `RANK ${p.rank}`;
        }
      });
      return;
    }

    this.playersContainer.innerHTML = '';
    const cornerClasses = ['pos-bottom-left', 'pos-top-left', 'pos-top-right', 'pos-bottom-right'];
    const isMultiPlayer = players.length > 2;

    players.forEach((p, idx) => {
      // In 4-player games: Left cards (idx 0 & 1) have dice on LEFT, Right cards (idx 2 & 3) have dice on RIGHT
      // In 2-player games: Both cards have dice on RIGHT (looks great as requested)
      const isLeft = isMultiPlayer && (idx === 0 || idx === 1);
      const card = document.createElement('div');
      card.id = `player-hud-${p.id}`;
      card.className = `player-card player-hud-card ${cornerClasses[idx]} ${isLeft ? 'dice-on-left' : 'dice-on-right'} ${p.isAI ? 'is-bot' : 'is-human'}`;
      card.style.borderColor = p.color ? (p.color.primary || p.color.textColor) : (p.text || '#ffd700');

      // High-contrast, crystal clear readable colors on white card
      const readableColors = {
        0: '#dc2626', // Bold Red
        1: '#15803d', // Bold Emerald Green
        2: '#b45309', // Bold Royal Amber
        3: '#0284c7'  // Bold Deep Blue
      };
      const nameColor = (p.color && p.color.textColor) ? p.color.textColor : (readableColors[idx] || (p.text || '#0f172a'));

      const roleBadge = p.team 
        ? `<span class="type-pill hud-role" style="background: ${p.team === 'A' ? '#fee2e2; color: #dc2626' : '#dcfce7; color: #16a34a'}">${p.team === 'A' ? '🔴 SOLAR' : '🟢 CYBER'}</span>`
        : `<span class="type-pill hud-role">${p.isAI ? 'BOT' : (p.id === 0 ? 'YOU' : `P${p.id + 1}`)}</span>`;

      const diceHtml = `
        <!-- INTEGRATED LUDO KING CORNER DICE BUTTON (Large, Pure 3D Dice) -->
        <button class="corner-dice-btn" id="corner-dice-${p.id}" data-player-id="${p.id}" title="${p.name} Tap to Roll">
          <span class="corner-dice-pip" id="corner-pip-${p.id}">${getDiceFaceSvg(6)}</span>
        </button>
      `;

      const profileHtml = `
        <div class="card-left-section">
          <div class="player-avatar hud-avatar-box" style="background: ${p.color ? (p.color.primary || '#cbd5e1') + '22' : '#ffffff22'}">
            <span class="hud-avatar">${p.isAI ? '🤖' : (p.id === 0 ? (economy?.data?.avatar || '👑') : '👤')}</span>
            <div class="active-pulse-ring"></div>
          </div>
          <div class="player-info hud-player-meta">
            <div class="hud-name-row">
              <strong class="player-name hud-name" style="color: ${nameColor}">${p.name}</strong>
              <span class="hud-turn-badge" id="hud-turn-badge-${p.id}">TURN</span>
            </div>
            <div class="player-meta">
              ${roleBadge}
              <span class="home-score hud-score-chip" id="hud-score-${p.id}">🏆 0/4</span>
            </div>
          </div>
        </div>
      `;

      // If left card in 4-player game, put dice on LEFT; otherwise put dice on RIGHT
      card.innerHTML = isLeft
        ? `${diceHtml}${profileHtml}<div class="active-pulse-dot"></div>`
        : `${profileHtml}${diceHtml}<div class="active-pulse-dot"></div>`;

      // Whole-card and Corner Dice instant tap handler (Ludo King style effortless rolling)
      let lastCardTap = 0;
      const triggerCardRoll = (e) => {
        const now = Date.now();
        if (now - lastCardTap < 350) return;
        if (this.isRollAllowed === false) return;

        // If card belongs to the active human player, roll immediately!
        if (card.classList.contains('active-turn') && !p.isAI) {
          lastCardTap = now;
          if (e) {
            e.stopPropagation();
            if (e.cancelable) e.preventDefault();
          }
          sounds.playButtonClick();
          if (this.callbacks.onRoll) this.callbacks.onRoll();
        }
      };

      card.addEventListener('pointerup', triggerCardRoll);
      card.addEventListener('click', triggerCardRoll);

      const cornerDiceBtn = card.querySelector('.corner-dice-btn');
      if (cornerDiceBtn) {
        cornerDiceBtn.addEventListener('pointerup', triggerCardRoll);
        cornerDiceBtn.addEventListener('click', triggerCardRoll);
      }

      this.playersContainer.appendChild(card);
    });
  }

  highlightActivePlayer(playerId, playerName) {
    this.activePlayerId = playerId;
    const allCards = this.playersContainer.querySelectorAll('.player-hud-card');
    allCards.forEach(c => {
      c.classList.remove('active-turn');
      const dice = c.querySelector('.corner-dice-btn');
      if (dice) dice.classList.remove('dice-ready-pulse');
    });

    const activeCard = document.getElementById(`player-hud-${playerId}`);
    if (activeCard) {
      activeCard.classList.add('active-turn');
      const activeDice = activeCard.querySelector('.corner-dice-btn');
      if (activeDice) activeDice.classList.add('dice-ready-pulse');
    }

    const text = document.getElementById('turn-prompt-text');
    if (text) {
      text.textContent = `${playerName}'s turn - Tap to Roll`;
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
    this.isRollAllowed = enabled;
    const rollBtn = document.getElementById('btn-roll');
    if (rollBtn) {
      rollBtn.disabled = !enabled;
      rollBtn.style.opacity = enabled ? '1.0' : '0.5';
      rollBtn.style.pointerEvents = enabled ? 'auto' : 'none';
    }
  }

  // Match Victory / Defeat Screen with Differentiated Rewards, Retry & Next Level Options
  showVictoryModal(winner, stats, rewardInfo, onReturnHome, onRetryMatch, onNextLevel) {
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
          <button class="btn-win-return" id="btn-win-return">🏠 HOME</button>
          ${onRetryMatch ? `<button class="btn-win-retry" id="btn-win-retry">🔄 ${isDefeat ? 'TRY AGAIN' : 'RETRY'}</button>` : ''}
          ${(!isDefeat && onNextLevel && rewardInfo?.hasNextLevel) ? `<button class="btn-win-next" id="btn-win-next">▶️ NEXT LEVEL</button>` : ''}
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

    const nextBtn = document.getElementById('btn-win-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        sounds.playButtonClick();
        this.modalOverlay.classList.add('hidden');
        if (onNextLevel) onNextLevel();
      });
    }

    document.getElementById('btn-win-return').addEventListener('click', () => {
      sounds.playButtonClick();
      this.modalOverlay.classList.add('hidden');
      if (onReturnHome) onReturnHome();
    });
  }
}
