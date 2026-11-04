/**
 * Ludo 3D Master Pro - Economy & Persistence Engine (Real Wallet, Strict Validation & Bonus Spins)
 * Supports 300 Ludo Saga Levels + 300 Snakes Adventure Stages + Full Themes Inventory
 * Developer: Sohel | Raebareli, UP - 229001
 */

const STORAGE_KEY = 'ludo_3d_player_save_v3';
const PERMANENT_VAULT_KEY = 'ludo_3d_permanent_progress_vault';
const LEGACY_KEYS = [
  'ludo_3d_player_save_v3',
  'ludo_3d_permanent_progress_vault',
  'ludo_3d_player_save_v2',
  'ludo_3d_player_save_v1',
  'ludo_3d_player_save',
  'ludo_3d_master_save',
  'ludo_3d_backup_auto'
];

const DEFAULT_STATE = {
  playerName: 'Sohel',
  avatar: '👑',
  isProfileSetupDone: true,
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
        let bestParsed = null;
        for (const key of LEGACY_KEYS) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const p = JSON.parse(raw);
              if (p && typeof p === 'object') {
                if (!bestParsed) {
                  bestParsed = p;
                } else {
                  // Merge progress to guarantee zero loss across updates
                  bestParsed.coins = Math.max(bestParsed.coins || 0, p.coins || 0);
                  bestParsed.gems = Math.max(bestParsed.gems || 0, p.gems || 0);
                  bestParsed.level = Math.max(bestParsed.level || 1, p.level || 1);
                  bestParsed.xp = Math.max(bestParsed.xp || 0, p.xp || 0);
                  bestParsed.playerName = bestParsed.playerName || p.playerName;
                  bestParsed.avatar = bestParsed.avatar || p.avatar;
                  bestParsed.completedLevels = { ...(p.completedLevels || {}), ...(bestParsed.completedLevels || {}) };
                  bestParsed.completedSnakesStages = { ...(p.completedSnakesStages || {}), ...(bestParsed.completedSnakesStages || {}) };
                  
                  // Merge inventory arrays
                  const pThemes = Array.isArray(p.inventory?.themes) ? p.inventory.themes : [];
                  const curThemes = Array.isArray(bestParsed.inventory?.themes) ? bestParsed.inventory.themes : [];
                  bestParsed.inventory = bestParsed.inventory || {};
                  bestParsed.inventory.themes = Array.from(new Set([...curThemes, ...pThemes]));

                  const pSnakes = Array.isArray(p.inventory?.snakesThemes) ? p.inventory.snakesThemes : [];
                  const curSnakes = Array.isArray(bestParsed.inventory?.snakesThemes) ? bestParsed.inventory.snakesThemes : [];
                  bestParsed.inventory.snakesThemes = Array.from(new Set([...curSnakes, ...pSnakes]));

                  const pDice = Array.isArray(p.inventory?.dice) ? p.inventory.dice : [];
                  const curDice = Array.isArray(bestParsed.inventory?.dice) ? bestParsed.inventory.dice : [];
                  bestParsed.inventory.dice = Array.from(new Set([...curDice, ...pDice]));

                  const pPawns = Array.isArray(p.inventory?.pawns) ? p.inventory.pawns : [];
                  const curPawns = Array.isArray(bestParsed.inventory?.pawns) ? bestParsed.inventory.pawns : [];
                  bestParsed.inventory.pawns = Array.from(new Set([...curPawns, ...pPawns]));
                }
              }
            } catch (err) {}
          }
        }

        if (bestParsed) {
          const state = { ...DEFAULT_STATE, ...bestParsed };

          // Defensive array check to prevent undefined errors
          state.inventory = {
            themes: Array.isArray(bestParsed.inventory?.themes) ? bestParsed.inventory.themes : ['classic_royal'],
            snakesThemes: Array.isArray(bestParsed.inventory?.snakesThemes) ? bestParsed.inventory.snakesThemes : ['snakes_classic'],
            dice: Array.isArray(bestParsed.inventory?.dice) ? bestParsed.inventory.dice : ['classic'],
            pawns: Array.isArray(bestParsed.inventory?.pawns) ? bestParsed.inventory.pawns : ['crown']
          };

          // Ensure default items always owned
          if (!state.inventory.themes.includes('classic_royal')) state.inventory.themes.push('classic_royal');
          if (!state.inventory.snakesThemes.includes('snakes_classic')) state.inventory.snakesThemes.push('snakes_classic');
          if (!state.inventory.dice.includes('classic')) state.inventory.dice.push('classic');
          if (!state.inventory.pawns.includes('crown')) state.inventory.pawns.push('crown');

          state.equipped = {
            theme: bestParsed.equipped?.theme || 'classic_royal',
            snakesTheme: bestParsed.equipped?.snakesTheme || 'snakes_classic',
            dice: bestParsed.equipped?.dice || 'classic',
            pawn: bestParsed.equipped?.pawn || 'crown'
          };

          state.playerName = bestParsed.playerName || DEFAULT_STATE.playerName;
          state.avatar = bestParsed.avatar || DEFAULT_STATE.avatar;
          state.isProfileSetupDone = (bestParsed.isProfileSetupDone !== undefined) ? bestParsed.isProfileSetupDone : true;

          state.completedLevels = bestParsed.completedLevels || {};
          state.completedSnakesStages = bestParsed.completedSnakesStages || {};
          state.claimedMilestones = Array.isArray(bestParsed.claimedMilestones) ? bestParsed.claimedMilestones : [];
          state.claimedSnakesMilestones = Array.isArray(bestParsed.claimedSnakesMilestones) ? bestParsed.claimedSnakesMilestones : [];

          return state;
        }
      }
    } catch (e) {
      console.warn('Failed to load state', e);
    }
    const fresh = JSON.parse(JSON.stringify(DEFAULT_STATE));
    fresh.isProfileSetupDone = false; // Prompt for first time install!
    return fresh;
  }

  saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const payload = JSON.stringify(this.data);
        localStorage.setItem(STORAGE_KEY, payload);
        localStorage.setItem(PERMANENT_VAULT_KEY, payload);
      }
    } catch (e) {
      console.warn('Failed to save state', e);
    }
  }

  setPlayerProfile(name, avatar) {
    if (name && name.trim()) {
      this.data.playerName = name.trim();
    }
    if (avatar) {
      this.data.avatar = avatar;
    }
    this.data.isProfileSetupDone = true;
    this.saveState();
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

  // Strict Store Purchase Validation (Pure Coins or Pure Diamonds)
  purchaseItem(type, itemId, priceCoins = 0, priceGems = 0) {
    if (this.data.coins < priceCoins || this.data.gems < priceGems) {
      return {
        success: false,
        reason: (this.data.coins < priceCoins) ? `Need ${priceCoins - this.data.coins} more Coins` : `Need ${priceGems - this.data.gems} more Diamonds`
      };
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

  unlockItem(type, itemId) {
    if (!this.data.inventory[type]) {
      this.data.inventory[type] = [];
    }
    if (!this.data.inventory[type].includes(itemId)) {
      this.data.inventory[type].push(itemId);
    }
    this.saveState();
  }

  // Export Progress to Clean Sanitized Player Progress JSON (Zero internal code / Zero secrets)
  exportBackupJSON() {
    const cleanProgress = {
      app: 'Ludo 3D Master Pro',
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      player: {
        name: this.data.playerName || 'Sohel',
        avatar: this.data.avatar || '👑',
        level: this.data.level || 1,
        xp: this.data.xp || 0
      },
      wallet: {
        coins: this.data.coins || 0,
        gems: this.data.gems || 0,
        bonusSpins: this.data.bonusSpinsAvailable || 0
      },
      sagaProgress: {
        completedLevels: this.data.completedLevels || {},
        completedSnakesStages: this.data.completedSnakesStages || {},
        claimedMilestones: this.data.claimedMilestones || [],
        claimedSnakesMilestones: this.data.claimedSnakesMilestones || []
      },
      inventory: {
        themes: this.data.inventory?.themes || ['classic_royal'],
        snakesThemes: this.data.inventory?.snakesThemes || ['snakes_classic'],
        dice: this.data.inventory?.dice || ['classic'],
        pawns: this.data.inventory?.pawns || ['crown']
      },
      equipped: {
        theme: this.data.equipped?.theme || 'classic_royal',
        snakesTheme: this.data.equipped?.snakesTheme || 'snakes_classic',
        dice: this.data.equipped?.dice || 'classic',
        pawn: this.data.equipped?.pawn || 'crown'
      },
      stats: this.data.stats || {
        matchesPlayed: 0,
        matchesWon: 0,
        snakesWon: 0
      }
    };
    return JSON.stringify(cleanProgress, null, 2);
  }

  // Import Progress from JSON string (supports sanitized format and legacy state)
  importBackupJSON(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed !== 'object' || !parsed) return false;

      // Check if sanitized format
      if (parsed.player || parsed.sagaProgress) {
        this.data = {
          ...DEFAULT_STATE,
          playerName: parsed.player?.name || this.data.playerName,
          avatar: parsed.player?.avatar || this.data.avatar,
          level: parsed.player?.level || this.data.level,
          xp: parsed.player?.xp || this.data.xp,
          coins: parsed.wallet?.coins !== undefined ? parsed.wallet.coins : this.data.coins,
          gems: parsed.wallet?.gems !== undefined ? parsed.wallet.gems : this.data.gems,
          bonusSpinsAvailable: parsed.wallet?.bonusSpins !== undefined ? parsed.wallet.bonusSpins : this.data.bonusSpinsAvailable,
          completedLevels: parsed.sagaProgress?.completedLevels || {},
          completedSnakesStages: parsed.sagaProgress?.completedSnakesStages || {},
          claimedMilestones: parsed.sagaProgress?.claimedMilestones || [],
          claimedSnakesMilestones: parsed.sagaProgress?.claimedSnakesMilestones || [],
          inventory: {
            themes: Array.isArray(parsed.inventory?.themes) ? parsed.inventory.themes : ['classic_royal'],
            snakesThemes: Array.isArray(parsed.inventory?.snakesThemes) ? parsed.inventory.snakesThemes : ['snakes_classic'],
            dice: Array.isArray(parsed.inventory?.dice) ? parsed.inventory.dice : ['classic'],
            pawns: Array.isArray(parsed.inventory?.pawns) ? parsed.inventory.pawns : ['crown']
          },
          equipped: {
            theme: parsed.equipped?.theme || 'classic_royal',
            snakesTheme: parsed.equipped?.snakesTheme || 'snakes_classic',
            dice: parsed.equipped?.dice || 'classic',
            pawn: parsed.equipped?.pawn || 'crown'
          },
          stats: parsed.stats || this.data.stats
        };
      } else {
        // Legacy flat format
        this.data = {
          ...DEFAULT_STATE,
          ...parsed,
          inventory: {
            themes: Array.isArray(parsed.inventory?.themes) ? parsed.inventory.themes : ['classic_royal'],
            snakesThemes: Array.isArray(parsed.inventory?.snakesThemes) ? parsed.inventory.snakesThemes : ['snakes_classic'],
            dice: Array.isArray(parsed.inventory?.dice) ? parsed.inventory.dice : ['classic'],
            pawns: Array.isArray(parsed.inventory?.pawns) ? parsed.inventory.pawns : ['crown']
          },
          equipped: {
            theme: parsed.equipped?.theme || 'classic_royal',
            snakesTheme: parsed.equipped?.snakesTheme || 'snakes_classic',
            dice: parsed.equipped?.dice || 'classic',
            pawn: parsed.equipped?.pawn || 'crown'
          }
        };
      }

      this.data.isProfileSetupDone = true;
      this.saveState();
      return true;
    } catch (e) {
      console.error('Failed to import backup JSON', e);
      return false;
    }
  }
}

export const economy = new EconomyManager();
