/**
 * Ludo 3D Pro - Luxury Main Menu Hub, 300-Level Sagas, Royal Store & Inventory
 * Full PUBG/Free Fire Celebration Animations, 100% Clickable Buttons, Zero Scrollbars
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
  }

  show() {
    this.container.classList.remove('hidden');
    this.render();
  }

  hide() {
    this.container.classList.add('hidden');
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
    this.container.innerHTML = `
      <!-- Top Profile & Wallet Bar -->
      <div class="home-top-bar">
        <div class="top-bar-left">
          <button class="btn-hamburger" id="btn-hamburger-menu" title="Menu">☰</button>
          <div class="user-profile-badge">
            <div class="avatar-ring">${economy.data.avatar}</div>
            <div class="profile-info">
              <span class="profile-name">${PUBLISHER_INFO.developerName}</span>
              <div class="level-pill">LVL ${economy.data.level}</div>
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

      <!-- Main Scrollable Content Area (Generous bottom padding so cards never hide!) -->
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

      <!-- Side Drawer Navigation Menu with CLOSE (✕) Button -->
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
            <button class="drawer-nav-item" data-drawer-action="inventory">
              <span class="item-icon">🎒</span>
              <span>My Royal Inventory</span>
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
        </div>
      </div>
    `;

    this.bindTabEvents();
    this.bindContentEvents();
    this.bindDrawerEvents();

    if (this.activeTab === 'spin') {
      this.initLuckyWheel();
    }

    // Scroll to bottom (Level 1) when Ludo or Snakes Saga opens
    if (this.activeTab === 'ludo_saga' || this.activeTab === 'snakes_saga') {
      setTimeout(() => {
        const activeNode = this.container.querySelector('.saga-node.current') || 
                           this.container.querySelector('[data-level="1"]') ||
                           this.container.querySelector('[data-snakes-stage="1"]');
        if (activeNode) {
          activeNode.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
      }, 60);
    }
  }

  renderTabContent() {
    if (this.activeTab === 'ludo_saga') return this.renderSagaMap();
    if (this.activeTab === 'snakes_saga') return this.renderSnakesAdventureMap();
    if (this.activeTab === 'shop') return this.renderShop();
    if (this.activeTab === 'spin') return this.renderDailySpin();
    return this.renderHomeMenu();
  }

  // 1. Home Menu Hub (5 Vibrant, 100% Clickable Cards)
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

        <!-- 3. Ludo 300 Saga -->
        <div class="game-mode-card card-saga" data-action="open-saga">
          <div class="mode-icon">🗺️</div>
          <div class="mode-info">
            <h4>Ludo 300 Saga</h4>
            <p>Climb from Level 1 at bottom to Level 300!</p>
            <span class="mode-tag tag-saga">300 LEVELS</span>
          </div>
          <button class="btn-play-mode" data-action="open-saga">JOURNEY</button>
        </div>

        <!-- 4. Snakes & Ladders 3D -->
        <div class="game-mode-card card-snakes" data-mode-setup="snakes">
          <div class="mode-icon">🐍</div>
          <div class="mode-info">
            <h4>Snakes & Ladders 3D</h4>
            <p>Authentic 100-tile illustrated cartoon board</p>
            <span class="mode-tag tag-snakes">2-4 PLAYERS / ROBOT</span>
          </div>
          <button class="btn-play-mode" data-mode-setup="snakes">PLAY</button>
        </div>

        <!-- 5. Snakes 300 Stages Adventure -->
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

      const offsets = ['offset-left', 'offset-center', 'offset-right', 'offset-center'];
      const offsetClass = offsets[(i - 1) % 4];

      levelsHtml += `
        <div class="saga-node-wrapper ${offsetClass}">
          ${milestoneBadge}
          <div class="saga-node ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''} ${stars > 0 ? 'completed' : ''}" data-level="${i}">
            <span class="level-num">${i}</span>
            ${stars > 0 ? `<div class="node-stars">${'⭐'.repeat(stars)}</div>` : ''}
            ${isCurrent ? '<div class="pin-marker">🏁 START HERE</div>' : ''}
          </div>
        </div>
      `;
    }

    return `
      <div class="saga-container">
        <div class="saga-road-track">
          ${levelsHtml}
        </div>
        <button id="btn-focus-current" class="btn-focus-current-pill">🎯 LEVEL ${currentUnlock} of 300</button>
      </div>
    `;
  }

  // 2b. Snakes & Ladders 300-Stage Adventure Map (Stage 1 at bottom, Stage 300 at top!)
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
            <div class="milestone-box snakes-milestone" data-snakes-milestone="${i}">
              <span class="chest-icon">${isClaimed ? '✅' : reward.icon}</span>
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
            ${isCurrent ? '<div class="pin-marker">🏁 START HERE</div>' : ''}
          </div>
        </div>
      `;
    }

    return `
      <div class="saga-container">
        <div class="saga-road-track">
          ${stagesHtml}
        </div>
        <button id="btn-focus-current" class="btn-focus-current-pill">🎯 STAGE ${Math.min(300, currentUnlock)} of 300</button>
      </div>
    `;
  }

  // 3. Complete Categorized Royal Store, Diamond Exchange & Inventory
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

        return `
          <div class="shop-item-card ${isEquipped ? 'is-equipped' : ''}">
            <div class="item-icon-box" style="background: ${item.previewColor ? item.previewColor + '22' : '#f1f5f9'}">
              <span class="item-icon">${item.icon}</span>
            </div>
            <div class="item-details">
              <div>
                <span class="rarity-pill rarity-${rarity.toLowerCase()}">${rarity}</span>
                ${item.isUltraRare ? '<span class="spin-tag">🎡 SPIN JACKPOT</span>' : ''}
              </div>
              <strong>${item.name}</strong>
              <p>${item.desc || ''}</p>
            </div>
            <div class="item-action">
              ${isEquipped ? 
                '<span class="badge-equipped">✅ EQUIPPED</span>' : 
                (isOwned ? 
                  `<button class="btn-shop-equip" data-type="${inventoryType}" data-id="${item.id}">EQUIP</button>` : 
                  `<button class="btn-shop-buy" 
                     data-type="${inventoryType}" 
                     data-id="${item.id}" 
                     data-coins="${item.priceCoins || 0}" 
                     data-gems="${item.priceGems || 0}">
                    ${item.priceGems > 0 ? `💎 ${item.priceGems}` : `🪙 ${(item.priceCoins || 0).toLocaleString()}`}
                   </button>`
                )
              }
            </div>
          </div>
        `;
      }).join('');
    };

    let contentHtml = '';

    if (this.shopCategory === 'ludoThemes') {
      contentHtml = `
        <div class="shop-section">
          <h4>🎲 Ludo Board Themes (Budget to Mythic)</h4>
          <div class="shop-items-list">
            ${renderItems(SHOP_CATALOG.ludoThemes, 'themes', curTheme)}
          </div>
        </div>
      `;
    } else if (this.shopCategory === 'snakesThemes') {
      contentHtml = `
        <div class="shop-section">
          <h4>🐍 Snakes & Ladders Themes (Live in 3D!)</h4>
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
          <h4>💎 Buy Diamonds with Coins (1,000 Coins = 50 💎)</h4>
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

  // Quick 1-Tap Diamond Exchange Prompt
  showGemExchangePrompt(targetItemId, coinsCost, gemsGiven, onComplete) {
    const modal = document.createElement('div');
    modal.className = 'pubg-celebration-overlay';
    modal.innerHTML = `
      <div class="pubg-card-burst">
        <h2 class="pubg-headline">💎 NEED DIAMONDS?</h2>
        <div class="pubg-item-icon-glow">
          <span class="pubg-big-icon">💎</span>
        </div>
        <p class="pubg-item-desc" style="color:white; font-size:0.86rem;">
          You need more Diamonds for this item!<br><br>
          Exchange <strong>🪙 ${coinsCost.toLocaleString()} Coins</strong> for <strong>+${gemsGiven} Diamonds 💎</strong> now?
        </p>
        <div style="display:flex; flex-direction:column; gap:10px; margin-top:16px;">
          <button class="pubg-btn-claim" id="btn-confirm-exchange">
            🪙 EXCHANGE & UNLOCK
          </button>
          <button class="btn-pause-action btn-quit" id="btn-cancel-exchange" style="padding:10px;">
            CANCEL
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#btn-confirm-exchange').addEventListener('click', () => {
      sounds.playButtonClick();
      modal.remove();
      if (onComplete) onComplete();
    });

    modal.querySelector('#btn-cancel-exchange').addEventListener('click', () => {
      sounds.playButtonClick();
      modal.remove();
    });
  }

  // 4. Illustrated Canvas Lucky Wheel
  renderDailySpin() {
    const canSpin = economy.canSpin();
    const bonusCount = economy.data.bonusSpinsAvailable || 0;
    const countdownMs = economy.getSpinCountdown();
    const hours = Math.floor(countdownMs / (1000 * 60 * 60));
    const mins = Math.floor((countdownMs % (1000 * 60 * 60)) / (1000 * 60));

    return `
      <div class="spin-container">
        <div class="spin-header">
          <h3>🎡 DAILY LUCKY WHEEL</h3>
          <p>Spin to win real coins, gems, and the Ultra-Rare Mythic Emperor Theme!</p>
          ${bonusCount > 0 ? `<div class="bonus-spin-badge">🌟 ${bonusCount} BONUS SPINS AVAILABLE!</div>` : ''}
        </div>

        <div class="wheel-stage">
          <div class="wheel-pointer">▼</div>
          <canvas id="lucky-wheel-canvas" width="600" height="600"></canvas>
        </div>

        <button class="btn-start-spin ${!canSpin ? 'btn-disabled' : ''}" id="btn-spin-now" ${!canSpin ? 'disabled' : ''}>
          ${canSpin ? '🎰 SPIN FOR FREE' : `⏰ NEXT FREE SPIN: ${hours}h ${mins}m`}
        </button>

        <div class="spin-result-msg" id="spin-result-msg"></div>

        <div class="spin-rules-box">
          <p>• 1 Free Daily Spin every 24 Hours</p>
          <p>• <strong>Bonus Spin:</strong> Earn +1 Extra Spin every 5 levels in Saga!</p>
          <p>• <strong>Ultra-Rare Jackpot:</strong> 👑 Mythic Emperor Board Theme!</p>
        </div>
      </div>
    `;
  }

  initLuckyWheel() {
    const canvas = this.container.querySelector('#lucky-wheel-canvas');
    if (!canvas) return;

    this.wheelInstance = new LuckyWheel(canvas, (won) => {
      this.updateWalletDisplay();
      const msg = this.container.querySelector('#spin-result-msg');
      const btn = this.container.querySelector('#btn-spin-now');
      if (msg) {
        if (won.type === 'theme') {
          msg.textContent = `🎉 JACKPOT! You won the Mythic Emperor Theme!`;
          this.showCelebrationModal('JACKPOT WON!', 'mythic_emperor', 'themes');
        } else {
          msg.textContent = `🎉 You won: +${won.val.toLocaleString()} ${won.type === 'coins' ? 'Coins' : 'Gems'}!`;
        }
      }
      if (btn) {
        btn.textContent = "COME BACK TOMORROW";
        btn.disabled = true;
      }
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
        if (action === 'inventory') {
          this.activeTab = 'shop';
          this.shopCategory = 'inventory';
          this.render();
        } else {
          this.showLegalModal(action);
        }
      });
    });
  }

  showLegalModal(type) {
    let title = "Game Info";
    let content = "";

    if (type === 'privacy') {
      title = "Privacy Policy";
      content = PRIVACY_POLICY_TEXT;
    } else if (type === 'terms') {
      title = "Terms of Service";
      content = TERMS_OF_SERVICE_TEXT;
    } else if (type === 'rules') {
      title = "Rules & How to Play";
      content = RULES_GUIDE_TEXT;
    } else if (type === 'contact') {
      title = "Developer & Publisher Support";
      content = `
        <h2>Developer Details</h2>
        <div class="contact-card-box">
          <p><strong>Name:</strong> ${PUBLISHER_INFO.developerName}</p>
          <p><strong>Address:</strong> ${PUBLISHER_INFO.address}</p>
          <p><strong>Email:</strong> <a href="mailto:${PUBLISHER_INFO.email}">${PUBLISHER_INFO.email}</a></p>
          <p><strong>Phone:</strong> <a href="tel:${PUBLISHER_INFO.phone}">${PUBLISHER_INFO.phone}</a></p>
          <p><strong>App Version:</strong> ${PUBLISHER_INFO.version}</p>
        </div>
      `;
    }

    this.legalModal.classList.remove('hidden');
    this.legalModal.innerHTML = `
      <div class="modal-card legal-modal-card">
        <div class="legal-modal-header">
          <h3>${title}</h3>
          <button class="modal-close-icon" id="btn-close-legal">✕</button>
        </div>
        <div class="legal-modal-content">
          ${content}
        </div>
        <button class="btn-legal-agree" id="btn-agree-legal">UNDERSTOOD</button>
      </div>
    `;

    const close = () => this.legalModal.classList.add('hidden');
    this.legalModal.querySelector('#btn-close-legal').addEventListener('click', close);
    this.legalModal.querySelector('#btn-agree-legal').addEventListener('click', close);
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
          alert(`You have already claimed Level ${mNum} Royal Chest!`);
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
          alert(`Level ${mNum} Royal Chest unlocks when you reach Level ${mNum}!\nReward: ${reward.title}`);
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
          alert(`You have already claimed Stage ${mNum} Boss Chest!`);
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
          alert(`Stage ${mNum} Boss Chest unlocks when you beat Stage ${mNum}!\nReward: ${reward.title}`);
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

    // Store Buy Buttons (100% Clickable with Instant Gem Conversion Prompt)
    const buyBtns = this.container.querySelectorAll('.btn-shop-buy');
    buyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const id = btn.dataset.id;
        const coins = parseInt(btn.dataset.coins) || 0;
        const gems = parseInt(btn.dataset.gems) || 0;

        // Check if player has enough funds
        if (economy.data.coins < coins || economy.data.gems < gems) {
          const deficitGems = gems - economy.data.gems;
          // If deficit is gems and player has coins to convert
          if (deficitGems > 0 && economy.data.coins >= 1000) {
            const packsNeeded = Math.ceil(deficitGems / 50);
            const coinsCost = packsNeeded * 1000;
            const gemsGiven = packsNeeded * 50;

            this.showGemExchangePrompt(id, coinsCost, gemsGiven, () => {
              if (economy.exchangeCoinsForGems(coinsCost, gemsGiven)) {
                const purchase = economy.purchaseItem(type, id, coins, gems);
                if (purchase.success) {
                  if (this.callbacks.onEquip) this.callbacks.onEquip(type, id);
                  this.showCelebrationModal('UNLOCKED & EQUIPPED!', id, type);
                }
              }
            });
            return;
          }

          alert(`💎 INSUFFICIENT BALANCE\nYou have: 🪙 ${economy.data.coins.toLocaleString()} Coins | 💎 ${economy.data.gems} Diamonds.\nItem price: ${coins > 0 ? coins.toLocaleString() + ' Coins ' : ''}${gems > 0 ? gems + ' Diamonds 💎' : ''}.\n\n💡 Tip: Convert coins to diamonds or spin the Lucky Wheel!`);
          return;
        }

        const result = economy.purchaseItem(type, id, coins, gems);
        if (result.success) {
          if (this.callbacks.onEquip) this.callbacks.onEquip(type, id);
          this.showCelebrationModal('PURCHASE SUCCESSFUL!', id, type);
        }
      });
    });

    // Store Equip Buttons (100% Clickable with Instant Feedback)
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
          this.showCelebrationModal(`EXCHANGED FOR +${gems} 💎!`, 'diamond_pack', 'exchange');
        } else {
          alert(`❌ Not enough Coins! You need ${coins.toLocaleString()} Coins.`);
        }
      });
    });
  }

  openMatchSetupModal(mode) {
    let selectedPlayerCount = 4;
    let selectedOpponentType = 'ai'; // 'ai' or 'pass_play'

    const modeTitles = {
      classic: 'Classic Ludo (4 Tokens Home)',
      quick: 'Quick Ludo (1st Token Wins)',
      snakes: 'Snakes & Ladders 3D'
    };

    this.setupModal.classList.remove('hidden');
    this.setupModal.innerHTML = `
      <div class="modal-card setup-modal-card">
        <div class="setup-header">
          <h3>🎮 MATCH SETUP</h3>
          <span class="setup-sub">${modeTitles[mode] || 'Match Config'}</span>
        </div>

        <div class="setup-section">
          <label>SELECT PLAYERS</label>
          <div class="setup-btn-group" id="group-player-count">
            <button class="setup-player-count-btn" data-count="2">2 PLAYERS</button>
            <button class="setup-player-count-btn" data-count="3">3 PLAYERS</button>
            <button class="setup-player-count-btn active" data-count="4">4 PLAYERS</button>
          </div>
        </div>

        <div class="setup-section">
          <label>OPPONENT MODE</label>
          <div class="setup-btn-group" id="group-opp-type">
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

    // Handle Player Count selection
    const countBtns = this.setupModal.querySelectorAll('.setup-player-count-btn');
    countBtns.forEach(b => {
      b.addEventListener('click', () => {
        sounds.playButtonClick();
        countBtns.forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        selectedPlayerCount = parseInt(b.dataset.count);
      });
    });

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
        this.callbacks.onStartGame({
          mode,
          playerCount: selectedPlayerCount,
          isAI: selectedOpponentType === 'ai'
        });
      }
    });
  }
}
