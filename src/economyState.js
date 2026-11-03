/**
 * Ludo 3D Pro - Economy & Persistence Engine (Real Wallet, Strict Validation & Bonus Spins)
 * Supports 300 Ludo Saga Levels + 300 Snakes Adventure Stages + Full Themes Inventory
 * Developer: Sohel | Raebareli, UP - 229001
 */

const STORAGE_KEY = 'ludo_3d_player_save_v3';

const DEFAULT_STATE = {
  playerName: 'Sohel',
  avatar: '👑',
  level: 1,
  xp: 0,
  coins: 5000,
  gems: 50,
  completedLevels: {}, // { [levelNum]: stars } for Ludo 300 Saga
  completedSnakesStages: {}, // { [stageNum]: stars } for Snakes 300 Stages
  claimedMilestones: [],
  claimedSnakesMilestones: [],
  lastDailySpinTime: 0, // timestamp
  bonusSpinsAvailable: 1, // earned 1 every 5 levels
  equipped: {
    theme: 'classic_royal',
    snakesTheme: 'snakes_classic',
    dice: 'classic',
    pawn: 'crown'
  },
  inventory: {
    themes: ['classic_royal'],
    snakesThemes: ['snakes_classic'],
    dice: ['classic'],
    pawns: ['crown']
  },
  stats: {
    matchesPlayed: 0,
    matchesWon: 0,
    snakesWon: 0
  }
};

class EconomyManager {
  constructor() {
    this.data = this.loadState();
  }

  loadState() {
    try {
      if (typeof localStorage !== 'undefined') {
        // Try v3 first, fallback to v2
        let saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('ludo_3d_player_save_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          const state = { ...DEFAULT_STATE, ...parsed };

          // Defensive array check to prevent undefined errors
          state.inventory = {
            themes: Array.isArray(parsed.inventory?.themes) ? parsed.inventory.themes : ['classic_royal'],
            snakesThemes: Array.isArray(parsed.inventory?.snakesThemes) ? parsed.inventory.snakesThemes : ['snakes_classic'],
            dice: Array.isArray(parsed.inventory?.dice) ? parsed.inventory.dice : ['classic'],
            pawns: Array.isArray(parsed.inventory?.pawns) ? parsed.inventory.pawns : ['crown']
          };

          // Ensure default items always owned
          if (!state.inventory.themes.includes('classic_royal')) state.inventory.themes.push('classic_royal');
          if (!state.inventory.snakesThemes.includes('snakes_classic')) state.inventory.snakesThemes.push('snakes_classic');
          if (!state.inventory.dice.includes('classic')) state.inventory.dice.push('classic');
          if (!state.inventory.pawns.includes('crown')) state.inventory.pawns.push('crown');

          state.equipped = {
            theme: parsed.equipped?.theme || 'classic_royal',
            snakesTheme: parsed.equipped?.snakesTheme || 'snakes_classic',
            dice: parsed.equipped?.dice || 'classic',
            pawn: parsed.equipped?.pawn || 'crown'
          };

          state.completedLevels = parsed.completedLevels || {};
          state.completedSnakesStages = parsed.completedSnakesStages || {};
          state.claimedMilestones = Array.isArray(parsed.claimedMilestones) ? parsed.claimedMilestones : [];
          state.claimedSnakesMilestones = Array.isArray(parsed.claimedSnakesMilestones) ? parsed.claimedSnakesMilestones : [];

          return state;
        }
      }
    } catch (e) {
      console.warn('Failed to load state', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      }
    } catch (e) {
      console.warn('Failed to save state', e);
    }
  }

  addCoins(amount) {
    this.data.coins = Math.max(0, this.data.coins + amount);
    this.saveState();
  }

  addGems(amount) {
    this.data.gems = Math.max(0, this.data.gems + amount);
    this.saveState();
  }

  addXP(amount) {
    this.data.xp += amount;
    const needed = this.data.level * 100;
    if (this.data.xp >= needed && this.data.level < 300) {
      this.data.level++;
      this.data.xp -= needed;
      this.addCoins(500);
      this.addGems(5);
    }
    this.saveState();
  }

  // Ludo 300 Level Saga Progression (Award Free Bonus Spin every 5 levels)
  completeLevel(levelNum, stars = 3) {
    const isFirstTime = !this.data.completedLevels[levelNum];
    if (isFirstTime || this.data.completedLevels[levelNum] < stars) {
      this.data.completedLevels[levelNum] = stars;
    }

    if (isFirstTime) {
      this.addCoins(500 * stars);
      this.addGems(stars * 3);
      this.addXP(200);

      // Award 1 Free Bonus Spin every 5 levels!
      if (levelNum % 5 === 0) {
        this.data.bonusSpinsAvailable = (this.data.bonusSpinsAvailable || 0) + 1;
      }
    }

    this.saveState();
  }

  // Snakes & Ladders 300-Stage Adventure Mode Progression
  completeSnakesStage(stageNum, stars = 3) {
    if (!this.data.completedSnakesStages) this.data.completedSnakesStages = {};
    const isFirstTime = !this.data.completedSnakesStages[stageNum];
    if (isFirstTime || this.data.completedSnakesStages[stageNum] < stars) {
      this.data.completedSnakesStages[stageNum] = stars;
    }

    if (isFirstTime) {
      this.addCoins(400 * stars);
      this.addGems(stars * 2);
      this.addXP(150);

      // Award 1 Free Bonus Spin every 5 stages!
      if (stageNum % 5 === 0) {
        this.data.bonusSpinsAvailable = (this.data.bonusSpinsAvailable || 0) + 1;
      }
    }

    this.saveState();
  }

  claimMilestone(levelNum) {
    if (!this.data.claimedMilestones) this.data.claimedMilestones = [];
    if (!this.data.claimedMilestones.includes(levelNum)) {
      this.data.claimedMilestones.push(levelNum);
      this.saveState();
      return true;
    }
    return false;
  }

  isMilestoneClaimed(levelNum) {
    if (!this.data.claimedMilestones) return false;
    return this.data.claimedMilestones.includes(levelNum);
  }

  claimSnakesMilestone(stageNum) {
    if (!this.data.claimedSnakesMilestones) this.data.claimedSnakesMilestones = [];
    if (!this.data.claimedSnakesMilestones.includes(stageNum)) {
      this.data.claimedSnakesMilestones.push(stageNum);
      this.saveState();
      return true;
    }
    return false;
  }

  isSnakesMilestoneClaimed(stageNum) {
    if (!this.data.claimedSnakesMilestones) return false;
    return this.data.claimedSnakesMilestones.includes(stageNum);
  }

  // Spin availability: 24h cooldown OR bonus spins
  canSpin() {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const isDailyReady = !this.data.lastDailySpinTime || (now - this.data.lastDailySpinTime >= twentyFourHours);
    const hasBonus = (this.data.bonusSpinsAvailable || 0) > 0;
    return isDailyReady || hasBonus;
  }

  getSpinCountdown() {
    if ((this.data.bonusSpinsAvailable || 0) > 0) return 0;
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const elapsed = now - (this.data.lastDailySpinTime || 0);
    return Math.max(0, twentyFourHours - elapsed);
  }

  recordSpinUsed() {
    if ((this.data.bonusSpinsAvailable || 0) > 0) {
      this.data.bonusSpinsAvailable--;
    } else {
      this.data.lastDailySpinTime = Date.now();
    }
    this.saveState();
  }

  // Check if item is owned
  isItemOwned(type, itemId) {
    if (!this.data.inventory || !this.data.inventory[type]) return false;
    return this.data.inventory[type].includes(itemId);
  }

  // Strict Store Purchase Validation
  purchaseItem(type, itemId, priceCoins = 0, priceGems = 0) {
    if (this.data.coins < priceCoins || this.data.gems < priceGems) {
      return { success: false, reason: "Insufficient funds!" };
    }

    this.data.coins -= priceCoins;
    this.data.gems -= priceGems;

    if (!this.data.inventory[type]) {
      this.data.inventory[type] = [];
    }
    if (!this.data.inventory[type].includes(itemId)) {
      this.data.inventory[type].push(itemId);
    }
    // Auto equip upon purchase
    const equipKey = type === 'snakesThemes' ? 'snakesTheme' : (type === 'themes' ? 'theme' : (type === 'dice' ? 'dice' : 'pawn'));
    this.data.equipped[equipKey] = itemId;
    this.saveState();
    return { success: true };
  }

  // Equip already owned item
  equipItem(type, itemId) {
    if (!this.data.inventory[type]) this.data.inventory[type] = [];
    if (this.data.inventory[type].includes(itemId)) {
      const equipKey = type === 'snakesThemes' ? 'snakesTheme' : (type === 'themes' ? 'theme' : (type === 'dice' ? 'dice' : 'pawn'));
      this.data.equipped[equipKey] = itemId;
      this.saveState();
      return true;
    }
    return false;
  }

  // Buy Diamonds (Gems) with Coins: 1,000 Coins = 50 Diamonds
  exchangeCoinsForGems(coinsAmount, gemsAmount) {
    if (this.data.coins < coinsAmount) {
      return false;
    }
    this.data.coins -= coinsAmount;
    this.data.gems += gemsAmount;
    this.saveState();
    return true;
  }

  // Legacy fallback: Exchange Gems for Coins
  exchangeGemsForCoins(gemsAmount, coinsAmount) {
    if (this.data.gems < gemsAmount) {
      return false;
    }
    this.data.gems -= gemsAmount;
    this.data.coins += coinsAmount;
    this.saveState();
    return true;
  }

  unlockItem(type, itemId) {
    if (!this.data.inventory[type]) {
      this.data.inventory[type] = [];
    }
    if (!this.data.inventory[type].includes(itemId)) {
      this.data.inventory[type].push(itemId);
    }
    this.saveState();
  }
}

export const economy = new EconomyManager();
