/**
 * Ludo 3D Master Pro - Luxury Main Menu Hub, 300-Level Sagas, Royal Store & Inventory
 * Full PUBG/Free Fire Celebration Animations, 100% Clickable Buttons, Zero Scrollbars
 * Features:
 *  - First-time Profile Name/Avatar Setup & Header Profile Edit Modal
 *  - Single-currency Store (Pure Coins or Pure Diamonds >= 100 or Spin Exclusive)
 *  - Custom In-Game Insufficient Funds Modal (Zero native alerts!)
 *  - Lucky Wheel with Live Ticking Seconds (22h 49m 35s) & 2 Mythic Jackpots
 *  - Perfectly Padded Home Scroll Area with Copyright Footer
 *  - Data Backup Export (JSON Download) & Import (Restore)
 * Developer: Sohel | Raebareli, UP - 229001
 */

import confetti from 'canvas-confetti';
import { sounds } from './audio.js';
import { economy } from './economyState.js';
import { LEVELS, MILESTONES } from './levelsData.js';
import { SNAKES_STAGES, SNAKES_MILESTONES } from './snakesLevelsData.js';
import { SHOP_CATALOG } from './shopData.js';
import { LuckyWheel } from './luckyWheel.js';
import {
  PUBLISHER_INFO,
  PRIVACY_POLICY_TEXT,
  TERMS_OF_SERVICE_TEXT,
  RULES_GUIDE_TEXT
} from './privacyAndTerms.js';

export class HomeUIManager {
  constructor(callbacks = {}) {
    this.callbacks = callbacks; // onStartGame(config), onEquip(type, id)
    this.activeTab = 'home';
    this.shopCategory = 'ludoThemes'; // 'ludoThemes', 'snakesThemes', 'dice', 'pawns', 'exchange', 'inventory'
    this.wheelInstance = null;
    this.spinTimerInterval = null;
    this.initDOM();
  }

  initDOM() {
    this.container = document.createElement('div');
    this.container.id = 'home-screen-root';
    this.container.className = 'home-screen-container';
    document.getElementById('game-screen').appendChild(this.container);

    this.legalModal = document.createElement('div');
    this.legalModal.className = 'modal-overlay hidden';
    document.getElementById('game-screen').appendChild(this.legalModal);

    this.setupModal = document.createElement('div');
    this.setupModal.className = 'modal-overlay hidden';
    document.getElementById('game-screen').appendChild(this.setupModal);

    this.render();

    // Check if first-time user profile setup is needed
    if (!economy.data.isProfileSetupDone) {
      setTimeout(() => {
        this.openProfileModal(true);
      }, 350);
    }
  }

  show() {
    this.container.classList.remove('hidden');
    this.render();
  }

  hide() {
    this.container.classList.add('hidden');
    if (this.spinTimerInterval) {
      clearInterval(this.spinTimerInterval);
      this.spinTimerInterval = null;
    }
  }

  openDrawer() {
    const drawer = this.container.querySelector('#drawer-overlay');
    if (drawer) drawer.classList.remove('hidden');
  }

  closeDrawer() {
    const drawer = this.container.querySelector('#drawer-overlay');
    if (drawer) drawer.classList.add('hidden');
  }

  updateWalletDisplay() {
    const coinsDisp = this.container.querySelector('#disp-coins');
    const gemsDisp = this.container.querySelector('#disp-gems');
    if (coinsDisp) coinsDisp.textContent = economy.data.coins.toLocaleString();
    if (gemsDisp) gemsDisp.textContent = economy.data.gems.toLocaleString();
  }

  render() {
    if (this.spinTimerInterval) {
      clearInterval(this.spinTimerInterval);
      this.spinTimerInterval = null;
    }

    const playerName = economy.data.playerName || PUBLISHER_INFO.developerName;
    const playerAvatar = economy.data.avatar || '👑';

    this.container.innerHTML = `
      <!-- Top Profile & Wallet Bar -->
      <div class="home-top-bar">
        <div class="top-bar-left">
          <button class="btn-hamburger" id="btn-hamburger-menu" title="Menu">☰</button>
          <div class="user-profile-badge" id="btn-user-profile" title="Click to Edit Profile">
            <div class="avatar-ring">${playerAvatar}</div>
            <div class="profile-info">
              <span class="profile-name">${playerName}</span>
              <div class="level-pill">LVL ${economy.data.level} ✏️</div>
            </div>
          </div>
        </div>

        <div class="wallet-badges">
          <div class="wallet-badge coins-badge" title="Coins">
            <span class="wallet-icon">🪙</span>
            <span class="wallet-val" id="disp-coins">${economy.data.coins.toLocaleString()}</span>
          </div>
          <div class="wallet-badge gems-badge" title="Diamonds">
            <span class="wallet-icon">💎</span>
            <span class="wallet-val" id="disp-gems">${economy.data.gems.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <!-- Main Scrollable Content Area -->
      <div class="home-content-body" id="home-content-body">
        ${this.renderTabContent()}
      </div>

      <!-- Bottom Mobile Tab Navigation (5 Clean Dedicated Tabs) -->
      <div class="home-bottom-nav">
        <button class="nav-tab ${this.activeTab === 'home' ? 'active' : ''}" data-tab="home">
          <span class="nav-icon">🏠</span>
          <span class="nav-label">Home</span>
        </button>
        <button class="nav-tab ${this.activeTab === 'ludo_saga' ? 'active' : ''}" data-tab="ludo_saga">
          <span class="nav-icon">🎲</span>
          <span class="nav-label">Ludo 300L</span>
        </button>
        <button class="nav-tab ${this.activeTab === 'snakes_saga' ? 'active' : ''}" data-tab="snakes_saga">
          <span class="nav-icon">🐍</span>
          <span class="nav-label">Snakes 300L</span>
        </button>
        <button class="nav-tab ${this.activeTab === 'shop' ? 'active' : ''}" data-tab="shop">
          <span class="nav-icon">🛍️</span>
          <span class="nav-label">Store</span>
        </button>
        <button class="nav-tab ${this.activeTab === 'spin' ? 'active' : ''}" data-tab="spin">
          <span class="nav-icon">🎡</span>
          <span class="nav-label">Lucky Spin</span>
        </button>
      </div>

      <!-- Side Drawer Navigation Menu with CLOSE (✕) Button & Backup Options -->
      <div class="drawer-overlay hidden" id="drawer-overlay">
        <div class="drawer-panel">
          <div class="drawer-header">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <h2>🎲 Ludo 3D Master Pro</h2>
                <p class="dev-tag">Developer: ${PUBLISHER_INFO.developerName}</p>
                <p class="dev-tag" style="font-size:0.68rem;opacity:0.85;">${PUBLISHER_INFO.address}</p>
              </div>
              <button class="drawer-close-btn" id="btn-close-drawer">✕</button>
            </div>
          </div>

          <div class="drawer-nav-list">
            <button class="drawer-nav-item drawer-update-item" data-drawer-action="check-update">
              <span class="item-icon">🔄</span>
              <div class="item-update-row">
                <span>Check for Updates</span>
                <span class="version-chip">v1.3.0</span>
              </div>
            </button>
            <button class="drawer-nav-item" data-drawer-action="profile">
              <span class="item-icon">👤</span>
              <span>Edit Player Profile</span>
            </button>
            <button class="drawer-nav-item" data-drawer-action="inventory">
              <span class="item-icon">🎒</span>
              <span>My Royal Inventory</span>
            </button>
            <button class="drawer-nav-item" data-drawer-action="export-backup">
              <span class="item-icon">📤</span>
              <span>Export Progress Backup (Save)</span>
            </button>
            <button class="drawer-nav-item" data-drawer-action="import-backup">
              <span class="item-icon">📥</span>
              <span>Import Progress Backup (Restore)</span>
            </button>
            <button class="drawer-nav-item" data-drawer-action="rules">
              <span class="item-icon">📖</span>
              <span>How to Play & Rules</span>
            </button>
            <button class="drawer-nav-item" data-drawer-action="privacy">
              <span class="item-icon">📜</span>
              <span>Privacy Policy</span>
            </button>
            <button class="drawer-nav-item" data-drawer-action="terms">
              <span class="item-icon">⚖️</span>
              <span>Terms of Service</span>
            </button>
            <button class="drawer-nav-item" data-drawer-action="contact">
              <span class="item-icon">📞</span>
              <span>Developer Support</span>
            </button>
          </div>

          <div class="drawer-copyright-footer">
            <p>© 2026 Ludo 3D Master Pro. All Rights Reserved.</p>
            <p>Designed & Developed by Sohel</p>
          </div>
        </div>
      </div>
    `;

    this.bindTabEvents();
    this.bindContentEvents();
    this.bindDrawerEvents();

    if (this.activeTab === 'spin') {
      this.initLuckyWheel();
    }

    // Scroll active shop sub-tab into view so horizontal nav stays exactly on clicked tab
    if (this.activeTab === 'shop') {
      const activeSubTab = this.container.querySelector('.shop-sub-tab.active');
      if (activeSubTab) {
        activeSubTab.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' });
      }
    }

    // Instantly anchor to current level node without any jarring top-to-bottom falling animation
    if (this.activeTab === 'ludo_saga' || this.activeTab === 'snakes_saga') {
      const scrollBody = this.container.querySelector('#home-content-body');
      if (scrollBody) {
        scrollBody.style.scrollBehavior = 'auto';
        scrollBody.scrollTop = scrollBody.scrollHeight;
        const activeNode = this.container.querySelector('.saga-node.current') || 
                           this.container.querySelector('[data-level="1"]') ||
                           this.container.querySelector('[data-snakes-stage="1"]');
        if (activeNode) {
          activeNode.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
        requestAnimationFrame(() => {
          scrollBody.style.scrollBehavior = 'smooth';
        });
      }
    }
  }

  renderTabContent() {
    if (this.activeTab === 'ludo_saga') return this.renderSagaMap();
    if (this.activeTab === 'snakes_saga') return this.renderSnakesAdventureMap();
    if (this.activeTab === 'shop') return this.renderShop();
    if (this.activeTab === 'spin') return this.renderDailySpin();
    return this.renderHomeMenu();
  }

  // 1. Home Menu Hub (5 Vibrant, 100% Clickable Cards + Copyright Footer)
  renderHomeMenu() {
    const hasBonus = (economy.data.bonusSpinsAvailable || 0) > 0;
    return `
      <div class="daily-banner" id="btn-quick-spin">
        <div class="banner-text">
          <span class="banner-badge">${hasBonus ? '🌟 BONUS SPIN READY' : 'DAILY FORTUNE'}</span>
          <h3>Spin the Lucky Wheel!</h3>
          <p>Win Coins, Gems & Rare Mythic Emperor Theme!</p>
        </div>
        <div class="banner-art">🎡</div>
      </div>

      <div class="section-title">
        <span>🎮 SELECT GAME MODE</span>
      </div>

      <div class="mode-cards-grid">
        <!-- 1. Classic Ludo -->
        <div class="game-mode-card card-classic" data-mode-setup="classic">
          <div class="mode-icon">🎲</div>
          <div class="mode-info">
            <h4>Classic Ludo</h4>
            <p>Official 4-color tournament board</p>
            <span class="mode-tag tag-classic">2-4 PLAYERS / ROBOT</span>
          </div>
          <button class="btn-play-mode" data-mode-setup="classic">PLAY</button>
        </div>

        <!-- 2. Quick Ludo -->
        <div class="game-mode-card card-quick" data-mode-setup="quick">
          <div class="mode-icon">⚡</div>
          <div class="mode-info">
            <h4>Quick Ludo</h4>
            <p>First pawn home wins match</p>
            <span class="mode-tag tag-fast">FAST 5-MIN</span>
          </div>
          <button class="btn-play-mode" data-mode-setup="quick">PLAY</button>
        </div>

        <!-- 3. 2v2 Team Battle (Ludo) -->
        <div class="game-mode-card card-team" data-mode-setup="team2v2">
          <div class="mode-icon">👥</div>
          <div class="mode-info">
            <h4>2v2 Team Battle (Ludo)</h4>
            <p>Red + Yellow vs Green + Blue! Cooperative partner immunity</p>
            <span class="mode-tag tag-team">2v2 COOPERATIVE</span>
          </div>
          <button class="btn-play-mode" data-mode-setup="team2v2">PLAY 2v2</button>
        </div>

        <!-- 4. Ludo 300 Saga -->
        <div class="game-mode-card card-saga" data-action="open-saga">
          <div class="mode-icon">🗺️</div>
          <div class="mode-info">
            <h4>Ludo 300 Saga</h4>
            <p>Climb from Level 1 at bottom to Level 300!</p>
            <span class="mode-tag tag-saga">300 LEVELS</span>
          </div>
          <button class="btn-play-mode" data-action="open-saga">JOURNEY</button>
        </div>

        <!-- 5. Snakes & Ladders 3D -->
        <div class="game-mode-card card-snakes" data-mode-setup="snakes">
          <div class="mode-icon">🐍</div>
          <div class="mode-info">
            <h4>Snakes & Ladders 3D</h4>
            <p>Authentic 100-tile illustrated cartoon board</p>
            <span class="mode-tag tag-snakes">2-4 PLAYERS / ROBOT</span>
          </div>
          <button class="btn-play-mode" data-mode-setup="snakes">PLAY</button>
        </div>

        <!-- 6. 2v2 Snakes Team Battle -->
        <div class="game-mode-card card-team-snakes" data-mode-setup="team_snakes">
          <div class="mode-icon">🤝</div>
          <div class="mode-info">
            <h4>2v2 Snakes Team Battle</h4>
            <p>Duo race to 100! Team Solar vs Team Cyber</p>
            <span class="mode-tag tag-team">2v2 COOPERATIVE</span>
          </div>
          <button class="btn-play-mode" data-mode-setup="team_snakes">PLAY 2v2</button>
        </div>

        <!-- 7. Snakes 300 Stages Adventure -->
        <div class="game-mode-card card-snakes-adventure" data-action="open-snakes-saga">
          <div class="mode-icon">🧗</div>
          <div class="mode-info">
            <h4>Snakes 300 Stages</h4>
            <p>300-Stage Adventure Campaign! Boss Themes at 25, 50, 75...</p>
            <span class="mode-tag tag-adventure">CAMPAIGN MODE</span>
          </div>
          <button class="btn-play-mode" data-action="open-snakes-saga">ADVENTURE</button>
        </div>
      </div>
    `;
  }

  // 2. 300 Level Ludo Saga Map (Level 1 is strictly at the BOTTOM!)
  renderSagaMap() {
    let levelsHtml = '';
    const completedCount = Object.keys(economy.data.completedLevels).length;
    const currentUnlock = completedCount + 1;

    for (let i = 1; i <= 300; i++) {
      const isLocked = i > currentUnlock;
      const isCurrent = i === currentUnlock;
      const isMilestone = i % 25 === 0;
      const stars = economy.data.completedLevels[i] || 0;
      const isClaimed = economy.isMilestoneClaimed(i);

      let milestoneBadge = '';
      if (isMilestone) {
        const reward = MILESTONES[i];
        if (reward) {
          milestoneBadge = `
            <div class="milestone-box" data-milestone="${i}">
              <span class="chest-icon">${isClaimed ? '✅' : '🎁'}</span>
              <div class="milestone-label">
                <strong>LEVEL ${i} ROYAL CHEST</strong>
                <span>${reward.title}</span>
              </div>
              ${i <= currentUnlock && !isClaimed ? '<button class="btn-claim-chest">CLAIM</button>' : ''}
            </div>
          `;
        }
      }

      const offsets = ['offset-center', 'offset-left', 'offset-center', 'offset-right'];
      const offsetClass = offsets[(i - 1) % 4];

      levelsHtml += `
        <div class="saga-node-wrapper ${offsetClass}">
          ${milestoneBadge}
          <div class="saga-node ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''} ${stars > 0 ? 'completed' : ''}" data-level="${i}">
            <span class="level-num">${i}</span>
            ${stars > 0 ? `<div class="node-stars">${'⭐'.repeat(stars)}</div>` : ''}
          </div>
        </div>
      `;
    }

    return `
      <div class="saga-container">
        <div class="saga-road-track">
          ${levelsHtml}
        </div>
      </div>
    `;
  }

  // 3. 300 Stage Snakes & Ladders Adventure Map
  renderSnakesAdventureMap() {
    let stagesHtml = '';
    const completedStages = economy.data.completedSnakesStages || {};
    const completedCount = Object.keys(completedStages).length;
    const currentUnlock = completedCount + 1;

    for (let i = 1; i <= 300; i++) {
      const isLocked = i > currentUnlock;
      const isCurrent = i === currentUnlock;
      const isMilestone = i % 25 === 0;
      const stars = completedStages[i] || 0;
      const isClaimed = economy.isSnakesMilestoneClaimed(i);

      let milestoneBadge = '';
      if (isMilestone) {
        const reward = SNAKES_MILESTONES[i];
        if (reward) {
          milestoneBadge = `
            <div class="milestone-box" data-snakes-milestone="${i}">
              <span class="chest-icon">${isClaimed ? '✅' : '🎁'}</span>
              <div class="milestone-label">
                <strong>STAGE ${i} BOSS CHEST</strong>
                <span>${reward.title}</span>
              </div>
              ${i <= currentUnlock && !isClaimed ? '<button class="btn-claim-snakes-chest">CLAIM</button>' : ''}
            </div>
          `;
        }
      }

      const offsets = ['offset-left', 'offset-center', 'offset-right', 'offset-center'];
      const offsetClass = offsets[(i - 1) % 4];

      stagesHtml += `
        <div class="saga-node-wrapper ${offsetClass}">
          ${milestoneBadge}
          <div class="saga-node snakes-node ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''} ${stars > 0 ? 'completed' : ''}" data-snakes-stage="${i}">
            <span class="level-num">${i}</span>
            ${stars > 0 ? `<div class="node-stars">${'⭐'.repeat(stars)}</div>` : ''}
          </div>
        </div>
      `;
    }

    return `
      <div class="saga-container">
        <div class="saga-road-track">
          ${stagesHtml}
        </div>
      </div>
    `;
  }

  // 4. Complete Categorized Royal Store, Diamond Exchange & Inventory
  renderShop() {
    this.shopCategory = this.shopCategory || 'ludoThemes';

    const curTheme = economy.data.equipped?.theme || 'classic_royal';
    const curSnakesTheme = economy.data.equipped?.snakesTheme || 'snakes_classic';
    const curDice = economy.data.equipped?.dice || 'classic';
    const curPawn = economy.data.equipped?.pawn || 'crown';

    const renderItems = (list, inventoryType, currentEquippedId) => {
      const ownedList = (economy.data.inventory && Array.isArray(economy.data.inventory[inventoryType]))
        ? economy.data.inventory[inventoryType]
        : [];

      return list.map(item => {
        const isOwned = ownedList.includes(item.id);
        const isEquipped = currentEquippedId === item.id;
        const rarity = item.rarity || 'COMMON';
        const isSpin = item.isSpinExclusive;

        let actionBtnHtml = '';
        if (isEquipped) {
          actionBtnHtml = '<span class="badge-equipped">✅ EQUIPPED</span>';
        } else if (isOwned) {
          actionBtnHtml = `<button class="btn-shop-equip" data-type="${inventoryType}" data-id="${item.id}">EQUIP</button>`;
        } else if (isSpin) {
          actionBtnHtml = `<button class="btn-shop-spin-exclusive" data-spin-target="${item.id}">🎡 WIN IN SPIN</button>`;
        } else if (item.priceGems > 0) {
          // Pure Diamonds
          actionBtnHtml = `
            <button class="btn-shop-buy btn-price-gems" 
              data-type="${inventoryType}" 
              data-id="${item.id}" 
              data-coins="0" 
              data-gems="${item.priceGems}">
              💎 ${item.priceGems}
            </button>
          `;
        } else {
          // Pure Coins
          actionBtnHtml = `
            <button class="btn-shop-buy btn-price-coins" 
              data-type="${inventoryType}" 
              data-id="${item.id}" 
              data-coins="${item.priceCoins || 0}" 
              data-gems="0">
              🪙 ${(item.priceCoins || 0).toLocaleString()}
            </button>
          `;
        }

        return `
          <div class="shop-item-card ${isEquipped ? 'is-equipped' : ''}">
            <div class="item-icon-box" style="background: ${item.previewColor ? item.previewColor + '22' : '#f1f5f9'}">
              <span class="item-icon">${item.icon}</span>
            </div>
            <div class="item-details">
              <div>
                <span class="rarity-pill rarity-${rarity.toLowerCase()}">${rarity}</span>
                ${isSpin ? '<span class="spin-tag">🎡 SPIN JACKPOT</span>' : ''}
              </div>
              <strong>${item.name}</strong>
              <p>${item.desc || ''}</p>
            </div>
            <div class="item-action">
              ${actionBtnHtml}
            </div>
          </div>
        `;
      }).join('');
    };

    let contentHtml = '';

    if (this.shopCategory === 'ludoThemes') {
      contentHtml = `
        <div class="shop-section">
          <h4>🎲 Ludo Board Themes</h4>
          <div class="shop-items-list">
            ${renderItems(SHOP_CATALOG.ludoThemes, 'themes', curTheme)}
          </div>
        </div>
      `;
    } else if (this.shopCategory === 'snakesThemes') {
      contentHtml = `
        <div class="shop-section">
          <h4>🐍 Snakes & Ladders Themes (Live 3D)</h4>
          <div class="shop-items-list">
            ${renderItems(SHOP_CATALOG.snakesThemes, 'snakesThemes', curSnakesTheme)}
          </div>
        </div>
      `;
    } else if (this.shopCategory === 'dice') {
      contentHtml = `
        <div class="shop-section">
          <h4>🎲 Tournament Dice Skins</h4>
          <div class="shop-items-list">
            ${renderItems(SHOP_CATALOG.dice, 'dice', curDice)}
          </div>
        </div>
      `;
    } else if (this.shopCategory === 'pawns') {
      contentHtml = `
        <div class="shop-section">
          <h4>👑 Imperial Pawn Styles</h4>
          <div class="shop-items-list">
            ${renderItems(SHOP_CATALOG.pawns, 'pawns', curPawn)}
          </div>
        </div>
      `;
    } else if (this.shopCategory === 'exchange') {
      contentHtml = `
        <div class="shop-section">
          <h4>💎 Convert Coins to Diamonds (1,000 Coins = 50 💎)</h4>
          <div class="exchange-grid">
            ${SHOP_CATALOG.coinToDiamondPacks.map(p => {
              const canAfford = economy.data.coins >= p.coins;
              return `
                <div class="exchange-card">
                  <span class="exchange-icon">${p.icon}</span>
                  <strong>+${p.gems} Diamonds</strong>
                  <span style="font-size:0.68rem; color:#16a34a; font-weight:800; margin-bottom:4px;">${p.bonus}</span>
                  <button class="btn-exchange-buy ${!canAfford ? 'btn-disabled' : ''}" data-coins="${p.coins}" data-gems="${p.gems}">
                    🪙 ${p.coins.toLocaleString()} Coins
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } else if (this.shopCategory === 'inventory') {
      const ownedLudo = economy.data.inventory.themes || [];
      const ownedSnakes = economy.data.inventory.snakesThemes || [];
      const ownedDice = economy.data.inventory.dice || [];
      const ownedPawns = economy.data.inventory.pawns || [];

      const totalOwned = ownedLudo.length + ownedSnakes.length + ownedDice.length + ownedPawns.length;
      const totalCatalog = SHOP_CATALOG.ludoThemes.length + SHOP_CATALOG.snakesThemes.length + SHOP_CATALOG.dice.length + SHOP_CATALOG.pawns.length;
      const percent = Math.round((totalOwned / totalCatalog) * 100);

      contentHtml = `
        <div class="inventory-summary-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>🎒 My Royal Collection</strong>
            <span style="font-size:0.8rem; font-weight:800; color:#ffd700;">${totalOwned} / ${totalCatalog} Items (${percent}%)</span>
          </div>
          <div class="inventory-progress-bar">
            <div class="inventory-progress-fill" style="width: ${percent}%;"></div>
          </div>
        </div>

        <div class="shop-section">
          <h4>🎲 Owned Ludo Themes</h4>
          <div class="shop-items-list">
            ${renderItems(SHOP_CATALOG.ludoThemes.filter(t => ownedLudo.includes(t.id)), 'themes', curTheme)}
          </div>
        </div>

        <div class="shop-section">
          <h4>🐍 Owned Snakes Themes</h4>
          <div class="shop-items-list">
            ${renderItems(SHOP_CATALOG.snakesThemes.filter(t => ownedSnakes.includes(t.id)), 'snakesThemes', curSnakesTheme)}
          </div>
        </div>

        <div class="shop-section">
          <h4>🎲 Owned Dice Skins</h4>
          <div class="shop-items-list">
            ${renderItems(SHOP_CATALOG.dice.filter(d => ownedDice.includes(d.id)), 'dice', curDice)}
          </div>
        </div>

        <div class="shop-section">
          <h4>👑 Owned Pawns</h4>
          <div class="shop-items-list">
            ${renderItems(SHOP_CATALOG.pawns.filter(p => ownedPawns.includes(p.id)), 'pawns', curPawn)}
          </div>
        </div>
      `;
    }

    return `
      <div class="shop-container">
        <div class="shop-header">
          <h3>🛍️ ROYAL STORE & CUSTOMIZATION</h3>
          <p>Coins: 🪙 ${economy.data.coins.toLocaleString()} | Diamonds: 💎 ${economy.data.gems.toLocaleString()}</p>
        </div>

        <!-- Store Sub-Category Filter Tabs -->
        <div class="shop-sub-nav">
          <button class="shop-sub-tab ${this.shopCategory === 'ludoThemes' ? 'active' : ''}" data-shop-cat="ludoThemes">🎲 Ludo Themes</button>
          <button class="shop-sub-tab ${this.shopCategory === 'snakesThemes' ? 'active' : ''}" data-shop-cat="snakesThemes">🐍 Snakes Themes</button>
          <button class="shop-sub-tab ${this.shopCategory === 'dice' ? 'active' : ''}" data-shop-cat="dice">🎲 Dice</button>
          <button class="shop-sub-tab ${this.shopCategory === 'pawns' ? 'active' : ''}" data-shop-cat="pawns">👑 Pawns</button>
          <button class="shop-sub-tab ${this.shopCategory === 'exchange' ? 'active' : ''}" data-shop-cat="exchange">💎 Buy 💎</button>
          <button class="shop-sub-tab ${this.shopCategory === 'inventory' ? 'active' : ''}" data-shop-cat="inventory">🎒 Inventory</button>
        </div>

        ${contentHtml}
      </div>
    `;
  }

  // 5. Illustrated Canvas Lucky Wheel with Live Ticking Seconds & Casino Styling
  renderDailySpin() {
    const canSpin = economy.canSpin();
    const bonusCount = economy.data.bonusSpinsAvailable || 0;
    const countdownMs = economy.getSpinCountdown();
    const timerStr = this.formatCountdown(countdownMs);

    return `
      <div class="spin-container">
        <div class="spin-header">
          <h3>🎡 DAILY LUCKY WHEEL</h3>
          <p>Spin to win real coins, gems, and 2 Ultra-Rare Mythic Themes!</p>
          ${bonusCount > 0 ? `<div class="bonus-spin-badge">🌟 ${bonusCount} BONUS SPINS AVAILABLE!</div>` : ''}
        </div>

        <div class="wheel-stage">
          <div class="wheel-pointer">▼</div>
          <canvas id="lucky-wheel-canvas" width="600" height="600"></canvas>
        </div>

        <button class="btn-start-spin ${!canSpin ? 'btn-disabled' : ''}" id="btn-spin-now" ${!canSpin ? 'disabled' : ''}>
          ${canSpin ? (bonusCount > 0 ? `🎰 SPIN BONUS (${bonusCount})` : '🎰 SPIN FOR FREE') : `⏰ NEXT FREE SPIN: ${timerStr}`}
        </button>

        <div class="spin-result-msg" id="spin-result-msg"></div>

        <!-- High-Grade Casino Gold Rules Card -->
        <div class="spin-rules-card">
          <div class="spin-rules-title">
            <span>✨ CASINO FORTUNE RULES ✨</span>
          </div>
          <div class="spin-rules-items">
            <div class="spin-rule-row">
              <span class="rule-icon">🕒</span>
              <span class="rule-text"><strong>1 Free Daily Spin:</strong> Recharges automatically every 24 hours.</span>
            </div>
            <div class="spin-rule-row">
              <span class="rule-icon">⭐</span>
              <span class="rule-text"><strong>Earn Bonus Spins:</strong> Clear every 5 levels in Saga & Adventure!</span>
            </div>
            <div class="spin-rule-row jackpot-row">
              <span class="rule-icon">👑</span>
              <span class="rule-text"><strong>Ludo Mythic Emperor:</strong> 24K Celestial Gold Board Theme!</span>
            </div>
            <div class="spin-rule-row jackpot-row">
              <span class="rule-icon">🐉</span>
              <span class="rule-text"><strong>Snakes Dragon Emperor:</strong> Legendary 24K Gold Ladder Theme!</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  formatCountdown(ms) {
    if (ms <= 0) return '00h 00m 00s';
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;
  }

  initLuckyWheel() {
    const canvas = this.container.querySelector('#lucky-wheel-canvas');
    if (!canvas) return;

    this.wheelInstance = new LuckyWheel(canvas, (won) => {
      this.updateWalletDisplay();
      const msg = this.container.querySelector('#spin-result-msg');
      const btn = this.container.querySelector('#btn-spin-now');
      if (msg) {
        if (won.type === 'ludoTheme') {
          msg.textContent = `🎉 JACKPOT! You won Ludo Mythic Emperor Theme!`;
          this.showCelebrationModal('JACKPOT WON!', 'mythic_emperor', 'themes');
        } else if (won.type === 'snakesTheme') {
          msg.textContent = `🎉 JACKPOT! You won Snakes Golden Dragon Theme!`;
          this.showCelebrationModal('JACKPOT WON!', 'snakes_dragon', 'snakesThemes');
        } else {
          msg.textContent = `🎉 You won: +${won.val.toLocaleString()} ${won.type === 'coins' ? 'Coins 🪙' : 'Diamonds 💎'}!`;
        }
      }
      this.render();
    });

    const spinBtn = this.container.querySelector('#btn-spin-now');
    if (spinBtn) {
      spinBtn.addEventListener('click', () => {
        if (economy.canSpin()) {
          spinBtn.disabled = true;
          this.wheelInstance.spin();
        }
      });
    }

    // Live Ticking Seconds Timer
    if (this.spinTimerInterval) clearInterval(this.spinTimerInterval);
    this.spinTimerInterval = setInterval(() => {
      if (this.activeTab !== 'spin') {
        clearInterval(this.spinTimerInterval);
        this.spinTimerInterval = null;
        return;
      }
      const canSpin = economy.canSpin();
      const spinBtnEl = this.container.querySelector('#btn-spin-now');
      if (!spinBtnEl) return;

      if (canSpin) {
        const bonusCount = economy.data.bonusSpinsAvailable || 0;
        spinBtnEl.textContent = bonusCount > 0 ? `🎰 SPIN BONUS (${bonusCount})` : '🎰 SPIN FOR FREE';
        spinBtnEl.disabled = false;
        spinBtnEl.classList.remove('btn-disabled');
      } else {
        const cd = economy.getSpinCountdown();
        spinBtnEl.textContent = `⏰ NEXT FREE SPIN: ${this.formatCountdown(cd)}`;
        spinBtnEl.disabled = true;
        spinBtnEl.classList.add('btn-disabled');
      }
    }, 1000);
  }

  // First Time Setup & Profile Edit Modal
  openProfileModal(isFirstTime = false) {
    const currentName = economy.data.playerName || 'Sohel';
    const currentAvatar = economy.data.avatar || '👑';
    const avatars = ['👑', '🦁', '🐯', '🐉', '🦅', '🤖', '🧙', '👸', '⚡', '💎', '🎲', '🏆'];

    let selectedAvatar = currentAvatar;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay profile-modal-overlay';
    modal.innerHTML = `
      <div class="modal-card profile-modal-card">
        <div class="profile-modal-header">
          <span class="profile-header-icon">${isFirstTime ? '🎉' : '👤'}</span>
          <h3>${isFirstTime ? 'WELCOME TO LUDO 3D!' : 'PLAYER PROFILE'}</h3>
          <p>${isFirstTime ? 'Enter your champion name and choose your lucky royal avatar:' : 'Update your game profile and custom avatar:'}</p>
        </div>

        <div class="profile-form-group">
          <label>CHAMPION NAME</label>
          <input type="text" id="input-player-name" class="profile-name-input" maxlength="16" value="${currentName}" placeholder="Enter Name">
        </div>

        <div class="profile-form-group">
          <label>SELECT ROYAL AVATAR</label>
          <div class="avatar-selection-grid" id="avatar-grid">
            ${avatars.map(av => `
              <button class="avatar-option ${av === selectedAvatar ? 'selected' : ''}" data-avatar="${av}">${av}</button>
            `).join('')}
          </div>
        </div>

        <div class="profile-actions">
          ${!isFirstTime ? '<button class="btn-setup-cancel" id="btn-cancel-profile">CANCEL</button>' : ''}
          <button class="btn-setup-start" id="btn-save-profile">
            ${isFirstTime ? '🚀 START PLAYING' : '💾 SAVE PROFILE'}
          </button>
        </div>
      </div>
    `;

    document.getElementById('game-screen').appendChild(modal);

    const avBtns = modal.querySelectorAll('.avatar-option');
    avBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playButtonClick();
        avBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedAvatar = btn.dataset.avatar;
      });
    });

    const cancelBtn = modal.querySelector('#btn-cancel-profile');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        sounds.playButtonClick();
        modal.remove();
      });
    }

    const saveBtn = modal.querySelector('#btn-save-profile');
    saveBtn.addEventListener('click', () => {
      sounds.playButtonClick();
      const inputEl = modal.querySelector('#input-player-name');
      const enteredName = (inputEl.value || '').trim() || 'Player 1';
      economy.setPlayerProfile(enteredName, selectedAvatar);
      modal.remove();
      this.render();
      if (isFirstTime) {
        sounds.playVictory();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
      }
    });
  }

  // Custom In-Game Insufficient Funds Modal (Zero native alerts!)
  showInsufficientFundsModal(item, coinsCost, gemsCost) {
    sounds.playButtonClick();
    const isCoinsMissing = coinsCost > 0 && economy.data.coins < coinsCost;
    const isGemsMissing = gemsCost > 0 && economy.data.gems < gemsCost;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card insufficient-funds-card">
        <div class="insufficient-icon-header">
          ${isGemsMissing ? '💎' : '🪙'}
        </div>
        <h3 class="insufficient-title">INSUFFICIENT BALANCE</h3>
        <p class="insufficient-sub">
          You need more currency to unlock <strong>${item.name}</strong>.
        </p>

        <div class="balance-breakdown-box">
          <div class="breakdown-row">
            <span>Your Balance:</span>
            <strong>🪙 ${economy.data.coins.toLocaleString()} | 💎 ${economy.data.gems}</strong>
          </div>
          <div class="breakdown-row highlight-cost">
            <span>Item Price:</span>
            <strong>${gemsCost > 0 ? `💎 ${gemsCost} Diamonds` : `🪙 ${coinsCost.toLocaleString()} Coins`}</strong>
          </div>
          <div class="breakdown-row highlight-needed">
            <span>Still Needed:</span>
            <strong style="color:#ef4444;">
              ${isGemsMissing ? `💎 ${(gemsCost - economy.data.gems)} Diamonds` : `🪙 ${(coinsCost - economy.data.coins).toLocaleString()} Coins`}
            </strong>
          </div>
        </div>

        <div class="insufficient-actions">
          ${isGemsMissing ? `
            <button class="btn-funds-action btn-convert-now" id="btn-go-exchange">
              💎 CONVERT COINS TO DIAMONDS
            </button>
          ` : ''}
          <button class="btn-funds-action btn-spin-now" id="btn-go-spin">
            🎡 SPIN LUCKY WHEEL FOR FREE
          </button>
          <button class="btn-setup-cancel" id="btn-close-funds" style="width:100%; margin-top:6px;">
            CLOSE
          </button>
        </div>
      </div>
    `;

    document.getElementById('game-screen').appendChild(modal);

    const closeBtn = modal.querySelector('#btn-close-funds');
    closeBtn.addEventListener('click', () => {
      sounds.playButtonClick();
      modal.remove();
    });

    const exchBtn = modal.querySelector('#btn-go-exchange');
    if (exchBtn) {
      exchBtn.addEventListener('click', () => {
        sounds.playButtonClick();
        modal.remove();
        this.activeTab = 'shop';
        this.shopCategory = 'exchange';
        this.render();
      });
    }

    const spinBtn = modal.querySelector('#btn-go-spin');
    if (spinBtn) {
      spinBtn.addEventListener('click', () => {
        sounds.playButtonClick();
        modal.remove();
        this.activeTab = 'spin';
        this.render();
      });
    }
  }

  // PUBG / Free Fire Style Celebratory Unlock / Equip Animation
  showCelebrationModal(headline, itemId, itemType, isEquipOnly = false) {
    sounds.playVictory();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#ffd700', '#ff8a80', '#00e5ff', '#a855f7', '#ffffff']
    });

    let item = null;
    if (itemType === 'themes' || itemType === 'ludoThemes') {
      item = SHOP_CATALOG.ludoThemes.find(t => t.id === itemId);
    } else if (itemType === 'snakesThemes') {
      item = SHOP_CATALOG.snakesThemes.find(t => t.id === itemId);
    } else if (itemType === 'dice') {
      item = SHOP_CATALOG.dice.find(t => t.id === itemId);
    } else if (itemType === 'pawns') {
      item = SHOP_CATALOG.pawns.find(t => t.id === itemId);
    }
    if (!item) item = { name: itemId, icon: '✨', rarity: 'EPIC', desc: 'Customization Item' };

    const modal = document.createElement('div');
    modal.className = 'pubg-celebration-overlay';
    modal.innerHTML = `
      <div class="pubg-sunburst"></div>
      <div class="pubg-card-burst ${item.rarity ? 'tier-' + item.rarity.toLowerCase() : ''}">
        <span class="pubg-rarity-pill ${item.rarity ? 'badge-' + item.rarity.toLowerCase() : ''}">${item.rarity || 'LEGENDARY'}</span>
        <h2 class="pubg-headline">${headline}</h2>
        <div class="pubg-item-icon-glow">
          <span class="pubg-big-icon">${item.icon || '🎁'}</span>
        </div>
        <h3 class="pubg-item-name">${item.name}</h3>
        <p class="pubg-item-desc">${item.desc || ''}</p>
        <div class="pubg-equipped-status">
          <span class="status-badge">⚡ ACTIVE IN 3D MATCHES</span>
        </div>
        <button class="pubg-btn-claim" id="btn-pubg-continue">CONTINUE</button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#btn-pubg-continue').addEventListener('click', () => {
      sounds.playButtonClick();
      modal.remove();
      this.render();
    });
  }

  // Backup Export: Dedicated Download & Share Modal for Mobile & Desktop
  exportBackup() {
    this.openExportModal();
  }

  openExportModal() {
    sounds.playButtonClick();
    const jsonStr = economy.exportBackupJSON();
    let previewData = {};
    try { previewData = JSON.parse(jsonStr); } catch (e) {}

    const name = previewData.player?.name || economy.data.playerName || 'Player';
    const coins = previewData.wallet?.coins !== undefined ? previewData.wallet.coins : economy.data.coins;
    const gems = previewData.wallet?.gems !== undefined ? previewData.wallet.gems : economy.data.gems;
    const lvl = previewData.player?.level || economy.data.level || 1;
    const ludoCount = Object.keys(previewData.sagaProgress?.completedLevels || economy.data.completedLevels || {}).length;
    const snakesCount = Object.keys(previewData.sagaProgress?.completedSnakesStages || economy.data.completedSnakesStages || {}).length;
    const themesCount = (previewData.inventory?.themes || economy.data.inventory?.themes || []).length;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card backup-restore-card">
        <div class="backup-modal-header">
          <div class="backup-header-title">
            <span class="backup-header-icon">💾</span>
            <div>
              <h3>EXPORT GAME PROGRESS (JSON)</h3>
              <p>1-Click Copy or Download your complete JSON game save</p>
            </div>
          </div>
          <button class="modal-close-icon" id="btn-close-export">✕</button>
        </div>

        <div class="backup-modal-body">
          <div class="backup-preview-badge" style="background: #f0fdf4; border-color: #22c55e; color: #15803d;">
            <span class="preview-badge-title">✨ PROGRESS SECURED IN JSON:</span>
            <div class="preview-badge-details">
              <strong>${name}</strong> (LVL ${lvl}) • 🪙 ${coins.toLocaleString()} Coins • 💎 ${gems.toLocaleString()} Diamonds • 🏆 ${ludoCount} Levels • 🐍 ${snakesCount} Stages • 🎨 ${themesCount} Themes
            </div>
          </div>

          <!-- Primary: 1-Click Copy Button -->
          <button class="btn-backup-action btn-purple-copy" id="btn-trigger-copy" style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%) !important; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.45);">
            <span class="action-icon">📋</span>
            <div class="action-text">
              <strong style="font-size: 0.95rem;">COPY JSON CODE (1-CLICK)</strong>
              <small>Instantly copies complete JSON to clipboard</small>
            </div>
          </button>

          <!-- Secondary Download Button -->
          <button class="btn-backup-action btn-gold-download" id="btn-trigger-download">
            <span class="action-icon">📥</span>
            <div class="action-text">
              <strong>DOWNLOAD .JSON FILE</strong>
              <small>Direct file download to device storage</small>
            </div>
          </button>

          <!-- Share via Apps -->
          <button class="btn-backup-action btn-blue-share" id="btn-trigger-share">
            <span class="action-icon">📤</span>
            <div class="action-text">
              <strong>SHARE .JSON FILE VIA APPS</strong>
              <small>Send JSON to Drive, WhatsApp or Email</small>
            </div>
          </button>

          <div id="export-status-alert" class="backup-live-alert hidden"></div>

          <div class="backup-divider"><span>OR VIEW RAW JSON DATA</span></div>
          <textarea id="export-text-view" class="backup-textarea" readonly>${jsonStr}</textarea>
        </div>

        <div class="backup-modal-actions" style="justify-content: flex-end;">
          <button class="btn-setup-cancel" id="btn-done-export">DONE / CLOSE</button>
        </div>
      </div>
    `;

    document.getElementById('game-screen').appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('#btn-close-export').addEventListener('click', close);
    modal.querySelector('#btn-done-export').addEventListener('click', close);

    const alertBox = modal.querySelector('#export-status-alert');
    const showAlert = (msg, isSuccess = true) => {
      alertBox.textContent = msg;
      alertBox.className = `backup-live-alert ${isSuccess ? '' : 'alert-error'}`;
      alertBox.classList.remove('hidden');
    };

    const filename = `ludo_3d_master_pro_backup_${Date.now()}.json`;

    // 1. Copy JSON Code action (Primary)
    modal.querySelector('#btn-trigger-copy').addEventListener('click', () => {
      sounds.playButtonClick();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(jsonStr).then(() => {
            showAlert('✅ 100% JSON Code copied to clipboard!');
          }).catch(() => {
            const ta = modal.querySelector('#export-text-view');
            ta.select();
            document.execCommand('copy');
            showAlert('✅ JSON Code copied to clipboard!');
          });
        } else {
          const ta = modal.querySelector('#export-text-view');
          ta.select();
          document.execCommand('copy');
          showAlert('✅ JSON Code copied to clipboard!');
        }
      } catch (e) {
        const ta = modal.querySelector('#export-text-view');
        ta.select();
        showAlert('📋 JSON selected. Long-press to copy.');
      }
    });

    // 2. Download action
    modal.querySelector('#btn-trigger-download').addEventListener('click', () => {
      sounds.playButtonClick();
      try {
        const encodedData = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = encodedData;
        a.download = filename;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();

        // Also trigger blob fallback for mobile webviews
        setTimeout(() => {
          try {
            const a2 = document.createElement('a');
            a2.href = blobUrl;
            a2.download = filename;
            document.body.appendChild(a2);
            a2.click();
            setTimeout(() => a2.remove(), 2000);
          } catch (e) {}
        }, 150);

        setTimeout(() => {
          a.remove();
          setTimeout(() => URL.revokeObjectURL(blobUrl), 120000);
        }, 1000);

        showAlert(`✅ Download started! File "${filename}" saved.`);
      } catch (e) {
        showAlert('⚠️ Direct download blocked. Please use Copy JSON button above.', false);
      }
    });

    // 3. Share action
    modal.querySelector('#btn-trigger-share').addEventListener('click', async () => {
      sounds.playButtonClick();
      try {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const file = new File([blob], filename, { type: 'application/json' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Ludo 3D Master Pro Backup',
            text: `Backup for ${name} (Coins: ${coins})`
          });
          showAlert('✅ JSON file shared successfully!');
          return;
        }

        if (navigator.share) {
          await navigator.share({
            title: 'Ludo 3D Master Pro Backup',
            text: jsonStr
          });
          showAlert('✅ JSON backup text shared successfully!');
          return;
        }

        showAlert('⚠️ Native share not supported on this device. Use Copy JSON Code above.', false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          showAlert('⚠️ Share sheet closed or cancelled.', false);
        }
      }
    });
  }

  // Backup Import: strictly JSON Upload File or Paste JSON
  openImportModal() {
    sounds.playButtonClick();
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card backup-restore-card">
        <div class="backup-modal-header">
          <div class="backup-header-title">
            <span class="backup-header-icon">📥</span>
            <div>
              <h3>RESTORE GAME PROGRESS (JSON)</h3>
              <p>Restore your saved coins, diamonds, levels & skins from JSON</p>
            </div>
          </div>
          <button class="modal-close-icon" id="btn-close-import">✕</button>
        </div>

        <div class="backup-modal-body">
          <!-- Primary: 1-Click Paste Button -->
          <button class="btn-backup-action btn-gold-restore-action" id="btn-quick-paste" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important; color: white !important; border: 1.5px solid #34d399 !important; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.45); margin-bottom: 12px;">
            <span class="action-icon">📋</span>
            <div class="action-text">
              <strong style="color: white; font-size: 0.95rem;">PASTE JSON CODE (1-CLICK)</strong>
              <small style="color: #d1fae5;">Instantly paste copied JSON from clipboard</small>
            </div>
          </button>

          <!-- Secondary: .json file drop -->
          <div class="file-drop-zone" id="file-drop-zone">
            <span class="drop-zone-icon">📁</span>
            <span class="drop-zone-text">Tap to select your backup <strong>.json</strong> file</span>
            <input type="file" id="backup-file-input" accept=".json,application/json" class="hidden-file-input">
          </div>

          <div class="backup-divider"><span>OR PASTE RAW JSON BELOW</span></div>

          <textarea id="backup-text-input" class="backup-textarea" placeholder="Paste your saved JSON progress text here..."></textarea>

          <div id="backup-preview-badge" class="backup-preview-badge hidden">
            <span class="preview-badge-title">✨ VALID JSON BACKUP DETECTED:</span>
            <div class="preview-badge-details" id="preview-badge-details"></div>
          </div>
        </div>

        <div class="backup-modal-actions">
          <button class="btn-setup-cancel" id="btn-cancel-import">CANCEL</button>
          <button class="btn-setup-start btn-gold-restore" id="btn-confirm-import">RESTORE FROM JSON</button>
        </div>
      </div>
    `;

    document.getElementById('game-screen').appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('#btn-close-import').addEventListener('click', close);
    modal.querySelector('#btn-cancel-import').addEventListener('click', close);

    const fileInput = modal.querySelector('#backup-file-input');
    const textInput = modal.querySelector('#backup-text-input');
    const previewBox = modal.querySelector('#backup-preview-badge');
    const previewDetails = modal.querySelector('#preview-badge-details');

    const updatePreview = (jsonStr) => {
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed && typeof parsed === 'object') {
          const name = parsed.player?.name || parsed.playerName || 'Player';
          const coins = parsed.wallet?.coins !== undefined ? parsed.wallet.coins : (parsed.coins || 0);
          const gems = parsed.wallet?.gems !== undefined ? parsed.wallet.gems : (parsed.gems || 0);
          const lvl = parsed.player?.level || parsed.level || 1;
          const completedLudo = Object.keys(parsed.sagaProgress?.completedLevels || parsed.completedLevels || {}).length;
          const completedSnakes = Object.keys(parsed.sagaProgress?.completedSnakesStages || parsed.completedSnakesStages || {}).length;

          previewDetails.innerHTML = `
            <strong>${name}</strong> (LVL ${lvl}) | 🪙 ${coins.toLocaleString()} Coins | 💎 ${gems.toLocaleString()} Diamonds | 🏆 ${completedLudo} Ludo Levels | 🐍 ${completedSnakes} Stages
          `;
          previewBox.classList.remove('hidden');
          return true;
        }
      } catch (e) {
        previewBox.classList.add('hidden');
      }
      return false;
    };

    textInput.addEventListener('input', () => {
      updatePreview(textInput.value.trim());
    });

    // Paste from clipboard (1-Click Paste)
    const btnPaste = modal.querySelector('#btn-quick-paste');
    if (btnPaste) {
      btnPaste.addEventListener('click', async () => {
        sounds.playButtonClick();
        try {
          if (navigator.clipboard && navigator.clipboard.readText) {
            const clipText = await navigator.clipboard.readText();
            if (clipText && clipText.trim()) {
              textInput.value = clipText.trim();
              updatePreview(clipText.trim());
              return;
            }
          }
          textInput.focus();
        } catch (e) {
          textInput.focus();
        }
      });
    }

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          textInput.value = event.target.result;
          updatePreview(event.target.result);
        };
        reader.readAsText(file);
      }
    });

    modal.querySelector('#btn-confirm-import').addEventListener('click', () => {
      sounds.playButtonClick();
      const content = textInput.value.trim();
      if (!content) {
        this.showGenericNotice('EMPTY BACKUP', 'Please choose a .json backup file or paste valid JSON text.');
        return;
      }
      const success = economy.importBackupJSON(content);
      modal.remove();
      if (success) {
        sounds.playVictory();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        this.showGenericNotice('RESTORE SUCCESSFUL', 'Your game progress, coins, diamonds, and inventory have been successfully restored from JSON!');
        this.render();
      } else {
        this.showGenericNotice('INVALID JSON BACKUP', 'The backup format was invalid JSON. Please ensure you copied or uploaded valid JSON.');
      }
    });
  }

  showGenericNotice(title, message) {
    sounds.playButtonClick();
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const icon = title.includes('EXPORT') ? '💾' : (title.includes('RESTORE') || title.includes('SUCCESS') ? '🎉' : '🛡️');
    modal.innerHTML = `
      <div class="modal-card luxury-notice-card">
        <div class="notice-icon-badge">${icon}</div>
        <h3 class="notice-gold-title">${title}</h3>
        <p class="notice-desc-text">${message}</p>
        <button class="btn-royal-action" id="btn-ok-notice">CONTINUE</button>
      </div>
    `;
    document.getElementById('game-screen').appendChild(modal);
    modal.querySelector('#btn-ok-notice').addEventListener('click', () => {
      sounds.playButtonClick();
      modal.remove();
    });
  }

  bindTabEvents() {
    const tabs = this.container.querySelectorAll('.nav-tab');
    tabs.forEach(t => {
      t.addEventListener('click', () => {
        sounds.playButtonClick();
        this.activeTab = t.dataset.tab;
        this.render();
      });
    });
  }

  bindDrawerEvents() {
    const btnHam = this.container.querySelector('#btn-hamburger-menu');
    if (btnHam) {
      btnHam.addEventListener('click', () => {
        sounds.playButtonClick();
        this.openDrawer();
      });
    }

    const btnProfile = this.container.querySelector('#btn-user-profile');
    if (btnProfile) {
      btnProfile.addEventListener('click', () => {
        sounds.playButtonClick();
        this.openProfileModal(false);
      });
    }

    const btnClose = this.container.querySelector('#btn-close-drawer');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        sounds.playButtonClick();
        this.closeDrawer();
      });
    }

    const drawer = this.container.querySelector('#drawer-overlay');
    if (drawer) {
      drawer.addEventListener('click', (e) => {
        if (e.target === drawer) this.closeDrawer();
      });
    }

    const drawerItems = this.container.querySelectorAll('[data-drawer-action]');
    drawerItems.forEach(item => {
      item.addEventListener('click', () => {
        sounds.playButtonClick();
        const action = item.dataset.drawerAction;
        this.closeDrawer();
        if (action === 'profile') {
          this.openProfileModal(false);
        } else if (action === 'inventory') {
          this.activeTab = 'shop';
          this.shopCategory = 'inventory';
          this.render();
        } else if (action === 'export-backup') {
          this.exportBackup();
        } else if (action === 'import-backup') {
          this.openImportModal();
        } else if (action === 'check-update') {
          this.checkForUpdatesManual();
        } else {
          this.showLegalModal(action);
        }
      });
    });
  }

  // Dedicated Full-Screen System Update Page
  async checkForUpdatesManual() {
    sounds.playButtonClick();
    const CURRENT_VERSION = '1.3.4';
    const GITHUB_REPO = 'OrbitSyncAI/ludo-3d-master-pro';

    this.legalModal.className = 'legal-page-screen';
    this.legalModal.innerHTML = `
      <header class="legal-page-header">
        <button class="btn-legal-back" id="btn-close-up-screen" title="Back">
          <span>← BACK</span>
        </button>
        <div class="legal-header-badge">
          <span>🚀 SYSTEM UPDATE</span>
        </div>
        <div style="width: 50px;"></div>
      </header>

      <main class="legal-page-content">
        <div class="update-page-card" id="update-dynamic-body">
          <div class="update-icon-header spin-icon" style="font-size: 38px; margin: 12px 0;">🔄</div>
          <h2 class="update-title" style="color: #ffd700; font-size: 1.2rem; font-weight: 900;">CHECKING FOR UPDATES...</h2>
          <p class="update-subtitle" style="color: #cbd5e1; font-size: 0.84rem; margin: 8px 0 16px;">Connecting to GitHub Releases server...</p>
          <div class="checking-spinner-bar"><div class="spinner-line"></div></div>
        </div>
      </main>

      <footer class="legal-page-footer">
        <button class="btn-royal-return" id="btn-return-up-screen">
          <span>← RETURN TO HOME</span>
        </button>
      </footer>
    `;

    const closeUpdate = () => {
      sounds.playButtonClick();
      this.legalModal.className = 'legal-page-screen hidden';
    };

    const topBack = this.legalModal.querySelector('#btn-close-up-screen');
    if (topBack) topBack.addEventListener('click', closeUpdate);

    const botBack = this.legalModal.querySelector('#btn-return-up-screen');
    if (botBack) botBack.addEventListener('click', closeUpdate);

    const updateContainer = this.legalModal.querySelector('#update-dynamic-body');

    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
        cache: 'no-cache'
      });

      if (!res.ok) {
        throw new Error(`GitHub responded with ${res.status}`);
      }

      const release = await res.json();
      const latestTag = (release.tag_name || 'v1.3.4').replace(/^v/, '');

      let apkUrl = `https://github.com/${GITHUB_REPO}/releases/download/v${latestTag}/Ludo-3D-Master-Pro.apk`;
      let iosUrl = `https://github.com/${GITHUB_REPO}/releases/download/v${latestTag}/Ludo-3D-Master-Pro.ipa`;

      if (Array.isArray(release.assets)) {
        const apkAsset = release.assets.find(a => a.name && a.name.endsWith('.apk'));
        if (apkAsset && apkAsset.browser_download_url) {
          apkUrl = apkAsset.browser_download_url;
        }
        const iosAsset = release.assets.find(a => a.name && (a.name.endsWith('.ipa') || a.name.endsWith('.zip')));
        if (iosAsset && iosAsset.browser_download_url) {
          iosUrl = iosAsset.browser_download_url;
        }
      }

      const isNewer = this.compareVersions(latestTag, CURRENT_VERSION) > 0;

      if (!isNewer) {
        // Up to date!
        updateContainer.innerHTML = `
          <div class="update-icon-header" style="font-size: 42px; margin: 10px 0;">🎉</div>
          <h2 class="update-title" style="color: #ffd700; font-size: 1.25rem; font-weight: 900;">YOU'RE RUNNING THE LATEST VERSION!</h2>
          <p class="update-subtitle" style="color: #cbd5e1; font-size: 0.86rem; margin: 8px 0 16px;">Your copy of <strong>Ludo 3D Master Pro</strong> is completely up-to-date.</p>

          <div class="update-ver-chip-box" style="margin: 14px 0;">
            <span class="chip-current" style="background: rgba(15,23,42,0.8); border: 1.5px solid #ffd700; color: #ffd700; padding: 6px 14px; border-radius: 12px; font-weight: 900; font-size: 0.82rem;">Current Version: v${CURRENT_VERSION}</span>
          </div>

          <div style="background: rgba(15,23,42,0.7); border-radius: 14px; padding: 14px; margin: 16px 0; text-align: left;">
            <h4 style="color: #67e8f9; margin: 0 0 8px 0; font-size: 0.90rem;">🛡️ Permanent Local Save Guarantee:</h4>
            <p style="color: #94a3b8; font-size: 0.78rem; margin: 0; line-height: 1.5;">All your unlocked 300 levels, coins, diamonds, and equipped store skins are permanently retained on this device.</p>
          </div>

          <div class="update-dl-buttons-group" style="margin-top: 18px;">
            <a href="${apkUrl}" download="Ludo-3D-Master-Pro.apk" target="_blank" class="btn-update-dl btn-dl-apk">
              <span class="dl-icon">🤖</span>
              <div class="dl-meta">
                <strong>Re-download Android APK</strong>
                <small>Direct File Download (.apk)</small>
              </div>
            </a>
            <a href="${iosUrl}" download="Ludo-3D-Master-Pro.ipa" target="_blank" class="btn-update-dl btn-dl-ios">
              <span class="dl-icon">🍏</span>
              <div class="dl-meta">
                <strong>Re-download iOS Package</strong>
                <small>Direct File Download (.ipa)</small>
              </div>
            </a>
          </div>
        `;
      } else {
        // Newer version available!
        updateContainer.innerHTML = `
          <div class="update-icon-header" style="font-size: 42px; margin: 10px 0;">🚀</div>
          <h2 class="update-title" style="color: #ffd700; font-size: 1.25rem; font-weight: 900;">NEW UPDATE READY!</h2>
          <div class="update-compare-row" style="margin: 12px 0;">
            <span class="ver-pill ver-old">v${CURRENT_VERSION}</span>
            <span class="ver-arrow">➜</span>
            <span class="ver-pill ver-new">v${latestTag}</span>
          </div>
          <p class="update-subtitle" style="color: #cbd5e1; font-size: 0.86rem; margin: 8px 0 16px;">A brand-new commercial release with fresh themes & optimizations is available!</p>

          <div class="update-dl-buttons-group">
            <a href="${apkUrl}" download="Ludo-3D-Master-Pro.apk" target="_blank" class="btn-update-dl btn-dl-apk">
              <span class="dl-icon">🤖</span>
              <div class="dl-meta">
                <strong>Download Android APK</strong>
                <small>Direct File Download (.apk)</small>
              </div>
            </a>
            <a href="${iosUrl}" download="Ludo-3D-Master-Pro.ipa" target="_blank" class="btn-update-dl btn-dl-ios">
              <span class="dl-icon">🍏</span>
              <div class="dl-meta">
                <strong>Download iOS Package</strong>
                <small>Direct File Download (.ipa)</small>
              </div>
            </a>
          </div>

          <p class="update-safe-hint" style="margin-top: 14px;">🔒 In-Place Update: Install directly over existing app. Do NOT uninstall — all coins, levels & themes will persist!</p>
        `;
      }
    } catch (err) {
      console.warn('Update check note:', err);
      updateContainer.innerHTML = `
        <div class="update-icon-header" style="font-size: 38px; margin: 10px 0;">ℹ️</div>
        <h2 class="update-title" style="color: #ffd700; font-size: 1.2rem; font-weight: 900;">APP VERSION: v${CURRENT_VERSION}</h2>
        <p class="update-subtitle" style="color: #cbd5e1; font-size: 0.84rem; margin: 8px 0 16px;">Direct Download Links from GitHub Releases:</p>
        <div class="update-dl-buttons-group">
          <a href="https://github.com/${GITHUB_REPO}/releases/download/v${CURRENT_VERSION}/Ludo-3D-Master-Pro.apk" download="Ludo-3D-Master-Pro.apk" target="_blank" class="btn-update-dl btn-dl-apk">
            <span class="dl-icon">🤖</span>
            <div class="dl-meta">
              <strong>Download Latest Android APK</strong>
              <small>Direct File Download (.apk)</small>
            </div>
          </a>
          <a href="https://github.com/${GITHUB_REPO}/releases/download/v${CURRENT_VERSION}/Ludo-3D-Master-Pro.ipa" download="Ludo-3D-Master-Pro.ipa" target="_blank" class="btn-update-dl btn-dl-ios">
            <span class="dl-icon">🍏</span>
            <div class="dl-meta">
              <strong>Download Latest iOS Package</strong>
              <small>Direct File Download (.ipa)</small>
            </div>
          </a>
        </div>
        <p class="update-safe-hint" style="margin-top: 14px;">🔒 In-Place Update: Overwrites binary while keeping all user progress safe.</p>
      `;
    }
  }

  compareVersions(v1, v2) {
    const p1 = (v1 || '').split('.').map(n => parseInt(n) || 0);
    const p2 = (v2 || '').split('.').map(n => parseInt(n) || 0);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const a = p1[i] || 0;
      const b = p2[i] || 0;
      if (a > b) return 1;
      if (a < b) return -1;
    }
    return 0;
  }

  // Dedicated Full-Screen Legal, Privacy & Game Rules Page
  showLegalModal(type) {
    sounds.playButtonClick();
    let title = "Game Info";
    let icon = "📜";
    let content = "";

    if (type === 'privacy') {
      title = "Privacy Policy";
      icon = "📜";
      content = PRIVACY_POLICY_TEXT;
    } else if (type === 'terms') {
      title = "Terms of Service";
      icon = "⚖️";
      content = TERMS_OF_SERVICE_TEXT;
    } else if (type === 'rules') {
      title = "How to Play & Rules";
      icon = "📖";
      content = RULES_GUIDE_TEXT;
    } else if (type === 'contact') {
      title = "Developer & Publisher Support";
      icon = "📞";
      content = `
        <h2>Developer Details</h2>
        <div class="contact-card-box">
          <p><strong>Publisher / Developer:</strong> ${PUBLISHER_INFO.developerName}</p>
          <p><strong>Official Address:</strong> ${PUBLISHER_INFO.address}</p>
          <p><strong>Support Email:</strong> <a href="mailto:${PUBLISHER_INFO.email}">${PUBLISHER_INFO.email}</a></p>
          <p><strong>Official Phone:</strong> <a href="tel:${PUBLISHER_INFO.phone}">${PUBLISHER_INFO.phone}</a></p>
          <p><strong>Game Version:</strong> ${PUBLISHER_INFO.version}</p>
        </div>
      `;
    }

    this.legalModal.className = 'legal-page-screen';
    this.legalModal.innerHTML = `
      <header class="legal-page-header">
        <button class="btn-legal-back" id="btn-close-legal" title="Back">
          <span>← BACK</span>
        </button>
        <div class="legal-header-badge">
          <span>${icon} ${title}</span>
        </div>
        <div style="width: 50px;"></div>
      </header>

      <main class="legal-page-content">
        <div class="legal-content-card">
          ${content}
        </div>
      </main>

      <footer class="legal-page-footer">
        <button class="btn-royal-return" id="btn-agree-legal">
          <span>← RETURN TO HOME</span>
        </button>
      </footer>
    `;

    const close = () => {
      sounds.playButtonClick();
      this.legalModal.className = 'legal-page-screen hidden';
    };

    const closeBtn = this.legalModal.querySelector('#btn-close-legal');
    if (closeBtn) closeBtn.addEventListener('click', close);

    const agreeBtn = this.legalModal.querySelector('#btn-agree-legal');
    if (agreeBtn) agreeBtn.addEventListener('click', close);
  }

  bindContentEvents() {
    const quickSpin = this.container.querySelector('#btn-quick-spin');
    if (quickSpin) {
      quickSpin.addEventListener('click', () => {
        sounds.playButtonClick();
        this.activeTab = 'spin';
        this.render();
      });
    }

    // Direct buttons and cards for Saga and Adventure
    const sagaTriggers = this.container.querySelectorAll('[data-action="open-saga"]');
    sagaTriggers.forEach(el => {
      el.addEventListener('click', () => {
        sounds.playButtonClick();
        this.activeTab = 'ludo_saga';
        this.render();
      });
    });

    const snakesSagaTriggers = this.container.querySelectorAll('[data-action="open-snakes-saga"]');
    snakesSagaTriggers.forEach(el => {
      el.addEventListener('click', () => {
        sounds.playButtonClick();
        this.activeTab = 'snakes_saga';
        this.render();
      });
    });

    const btnFocus = this.container.querySelector('#btn-focus-current');
    if (btnFocus) {
      btnFocus.addEventListener('click', () => {
        sounds.playButtonClick();
        const activeNode = this.container.querySelector('.saga-node.current') || 
                           this.container.querySelector('[data-level="1"]') || 
                           this.container.querySelector('[data-snakes-stage="1"]');
        if (activeNode) {
          activeNode.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      });
    }

    // Match setup triggers for Classic, Quick, and Snakes & Ladders
    const setupTriggers = this.container.querySelectorAll('[data-mode-setup]');
    setupTriggers.forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        sounds.playButtonClick();
        const mode = el.dataset.modeSetup;
        this.openMatchSetupModal(mode);
      });
    });

    // Level Node Click in Ludo 300 Saga
    const ludoLevelNodes = this.container.querySelectorAll('[data-level]:not(.locked)');
    ludoLevelNodes.forEach(node => {
      node.addEventListener('click', () => {
        sounds.playButtonClick();
        const levelNum = parseInt(node.dataset.level);
        const levelData = LEVELS[levelNum - 1] || LEVELS[0];
        this.hide();
        if (this.callbacks.onStartGame) {
          this.callbacks.onStartGame({
            mode: levelData.isQuick ? 'quick' : 'classic',
            playerCount: levelData.botCount + 1,
            levelNumber: levelNum,
            isAI: true
          });
        }
      });
    });

    // Stage Node Click in Snakes 300 Adventure
    const snakesStageNodes = this.container.querySelectorAll('[data-snakes-stage]:not(.locked)');
    snakesStageNodes.forEach(node => {
      node.addEventListener('click', () => {
        sounds.playButtonClick();
        const stageNum = parseInt(node.dataset.snakesStage);
        const stageData = SNAKES_STAGES[stageNum - 1] || SNAKES_STAGES[0];
        this.hide();
        if (this.callbacks.onStartGame) {
          this.callbacks.onStartGame({
            mode: 'snakes',
            playerCount: stageData.botCount + 1,
            levelNumber: stageNum,
            isAI: true
          });
        }
      });
    });

    // Claim Ludo Milestone Chest
    const milestoneChests = this.container.querySelectorAll('.milestone-box[data-milestone]');
    milestoneChests.forEach(chest => {
      chest.addEventListener('click', () => {
        sounds.playVictory();
        const mNum = parseInt(chest.dataset.milestone);
        const reward = MILESTONES[mNum];
        if (!reward) return;

        if (economy.isMilestoneClaimed(mNum)) {
          this.showGenericNotice('CHEST ALREADY CLAIMED', `You have already claimed Level ${mNum} Royal Chest!`);
          return;
        }
        const completedCount = Object.keys(economy.data.completedLevels).length;
        if (completedCount >= mNum) {
          economy.claimMilestone(mNum);
          economy.addCoins(reward.coins);
          economy.addGems(reward.gems);
          if (reward.itemType && reward.itemId) {
            economy.unlockItem(reward.itemType, reward.itemId);
          }
          this.showCelebrationModal(`LEVEL ${mNum} REWARD CLAIMED!`, reward.itemId || 'coins', reward.itemType || 'themes');
        } else {
          this.showGenericNotice(`LEVEL ${mNum} LOCKED`, `Level ${mNum} Royal Chest unlocks when you reach Level ${mNum}!\nReward: ${reward.title}`);
        }
      });
    });

    // Claim Snakes Milestone Chest
    const snakesMilestones = this.container.querySelectorAll('.milestone-box[data-snakes-milestone]');
    snakesMilestones.forEach(chest => {
      chest.addEventListener('click', () => {
        sounds.playVictory();
        const mNum = parseInt(chest.dataset.snakesMilestone);
        const reward = SNAKES_MILESTONES[mNum];
        if (!reward) return;

        if (economy.isSnakesMilestoneClaimed(mNum)) {
          this.showGenericNotice('CHEST ALREADY CLAIMED', `You have already claimed Stage ${mNum} Boss Chest!`);
          return;
        }
        const completedStages = economy.data.completedSnakesStages || {};
        const completedCount = Object.keys(completedStages).length;
        if (completedCount >= mNum) {
          economy.claimSnakesMilestone(mNum);
          economy.addCoins(reward.coins);
          economy.addGems(reward.gems);
          if (reward.itemType && reward.itemId) {
            economy.unlockItem(reward.itemType, reward.itemId);
            economy.equipItem(reward.itemType, reward.itemId);
          }
          this.showCelebrationModal(`STAGE ${mNum} BOSS CHEST!`, reward.itemId, reward.itemType);
        } else {
          this.showGenericNotice(`STAGE ${mNum} LOCKED`, `Stage ${mNum} Boss Chest unlocks when you beat Stage ${mNum}!\nReward: ${reward.title}`);
        }
      });
    });

    // Store Sub-Category Filter Tabs Click
    const storeSubTabs = this.container.querySelectorAll('.shop-sub-tab');
    storeSubTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        sounds.playButtonClick();
        this.shopCategory = tab.dataset.shopCat;
        this.render();
      });
    });

    // Spin Exclusive Buttons
    const spinTargetBtns = this.container.querySelectorAll('.btn-shop-spin-exclusive');
    spinTargetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playButtonClick();
        this.activeTab = 'spin';
        this.render();
      });
    });

    // Store Buy Buttons (Single-currency validation with Custom Modal)
    const buyBtns = this.container.querySelectorAll('.btn-shop-buy');
    buyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const id = btn.dataset.id;
        const coins = parseInt(btn.dataset.coins) || 0;
        const gems = parseInt(btn.dataset.gems) || 0;

        let targetItem = null;
        if (type === 'themes') targetItem = SHOP_CATALOG.ludoThemes.find(i => i.id === id);
        else if (type === 'snakesThemes') targetItem = SHOP_CATALOG.snakesThemes.find(i => i.id === id);
        else if (type === 'dice') targetItem = SHOP_CATALOG.dice.find(i => i.id === id);
        else if (type === 'pawns') targetItem = SHOP_CATALOG.pawns.find(i => i.id === id);
        if (!targetItem) targetItem = { name: id, icon: '✨' };

        // Check if player has enough funds
        if (economy.data.coins < coins || economy.data.gems < gems) {
          this.showInsufficientFundsModal(targetItem, coins, gems);
          return;
        }

        const result = economy.purchaseItem(type, id, coins, gems);
        if (result.success) {
          if (this.callbacks.onEquip) this.callbacks.onEquip(type, id);
          this.showCelebrationModal('PURCHASE SUCCESSFUL!', id, type);
        }
      });
    });

    // Store Equip Buttons
    const equipBtns = this.container.querySelectorAll('.btn-shop-equip');
    equipBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playButtonClick();
        const type = btn.dataset.type;
        const id = btn.dataset.id;
        economy.equipItem(type, id);
        if (this.callbacks.onEquip) this.callbacks.onEquip(type, id);
        this.showCelebrationModal('ITEM EQUIPPED!', id, type, true);
      });
    });

    // Buy Diamonds with Coins (1,000 Coins = 50 Diamonds)
    const exchangeBtns = this.container.querySelectorAll('.btn-exchange-buy:not(.btn-disabled)');
    exchangeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const coins = parseInt(btn.dataset.coins);
        const gems = parseInt(btn.dataset.gems);
        if (economy.exchangeCoinsForGems(coins, gems)) {
          this.showCelebrationModal(`CONVERTED FOR +${gems} 💎!`, 'diamond_pack', 'exchange');
        } else {
          this.showGenericNotice('NOT ENOUGH COINS', `You need 🪙 ${coins.toLocaleString()} Coins to convert to diamonds.`);
        }
      });
    });
  }

  openMatchSetupModal(mode) {
    const isTeamMode = (mode === 'team2v2' || mode === 'team_snakes');
    let selectedPlayerCount = 4;
    let selectedOpponentType = 'ai'; // 'ai' or 'pass_play'

    const modeTitles = {
      classic: 'Classic Ludo (4 Tokens Home)',
      quick: 'Quick Ludo (1st Token Wins)',
      team2v2: '2v2 Ludo Team Battle (Cooperative)',
      team_snakes: '2v2 Snakes Team Battle (Cooperative)',
      snakes: 'Snakes & Ladders 3D'
    };

    const playerSelectionHtml = isTeamMode ? `
      <div class="setup-section">
        <label>TEAM FORMATION (4 PLAYERS)</label>
        <div class="team-setup-pairing-box">
          <div class="pairing-badge solar-pairing">🔴 Team Solar: Red (P1) + 🟡 Yellow (P3)</div>
          <div class="vs-pairing-badge">⚔️ VS ⚔️</div>
          <div class="pairing-badge cyber-pairing">🟢 Team Cyber: Green (P2) + 🔵 Blue (P4)</div>
        </div>
        <small class="team-info-hint">🛡️ Cooperative: Teammates never knock out each other!</small>
      </div>
    ` : `
      <div class="setup-section">
        <label>SELECT PLAYERS</label>
        <div class="setup-btn-group" id="group-player-count">
          <button class="setup-player-count-btn" data-count="2">2 PLAYERS</button>
          <button class="setup-player-count-btn" data-count="3">3 PLAYERS</button>
          <button class="setup-player-count-btn active" data-count="4">4 PLAYERS</button>
        </div>
      </div>
    `;

    this.setupModal.classList.remove('hidden');
    this.setupModal.innerHTML = `
      <div class="modal-card setup-modal-card">
        <div class="setup-header">
          <h3>🎮 MATCH SETUP</h3>
          <span class="setup-sub">${modeTitles[mode] || 'Match Config'}</span>
        </div>

        ${playerSelectionHtml}

        <div class="setup-section">
          <label>OPPONENT MODE</label>
          <div class="setup-btn-group setup-vertical-group" id="group-opp-type">
            <button class="setup-opp-btn active" data-opp="ai">🤖 VS SMART BOTS</button>
            <button class="setup-opp-btn" data-opp="pass_play">👥 PASS & PLAY (FRIENDS)</button>
          </div>
        </div>

        <div class="setup-actions">
          <button class="btn-setup-cancel" id="btn-cancel-setup">CANCEL</button>
          <button class="btn-setup-start" id="btn-start-match-now">🚀 START MATCH</button>
        </div>
      </div>
    `;

    // Handle Player Count selection (if not team mode)
    if (!isTeamMode) {
      const countBtns = this.setupModal.querySelectorAll('.setup-player-count-btn');
      countBtns.forEach(b => {
        b.addEventListener('click', () => {
          sounds.playButtonClick();
          countBtns.forEach(btn => btn.classList.remove('active'));
          b.classList.add('active');
          selectedPlayerCount = parseInt(b.dataset.count);
        });
      });
    }

    // Handle Opponent selection
    const oppBtns = this.setupModal.querySelectorAll('.setup-opp-btn');
    oppBtns.forEach(b => {
      b.addEventListener('click', () => {
        sounds.playButtonClick();
        oppBtns.forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        selectedOpponentType = b.dataset.opp;
      });
    });

    this.setupModal.querySelector('#btn-cancel-setup').addEventListener('click', () => {
      sounds.playButtonClick();
      this.setupModal.classList.add('hidden');
    });

    this.setupModal.querySelector('#btn-start-match-now').addEventListener('click', () => {
      sounds.playButtonClick();
      this.setupModal.classList.add('hidden');
      this.hide();
      if (this.callbacks.onStartGame) {
        if (mode === 'team_snakes') {
          this.callbacks.onStartGame({
            mode: 'snakes',
            isTeam: true,
            playerCount: 4,
            isAI: selectedOpponentType === 'ai'
          });
        } else if (mode === 'team2v2') {
          this.callbacks.onStartGame({
            mode: 'team2v2',
            isTeam: true,
            playerCount: 4,
            isAI: selectedOpponentType === 'ai'
          });
        } else {
          this.callbacks.onStartGame({
            mode,
            playerCount: selectedPlayerCount,
            isAI: selectedOpponentType === 'ai'
          });
        }
      }
    });
  }
}
