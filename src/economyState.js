/**
 * Ludo 3D Master Pro - Economy & Persistence Engine (Real Wallet, Strict Validation & Bonus Spins)
 * Supports 500 Ludo Saga Levels + 500 Snakes Adventure Stages + Full Themes Inventory
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
  lastMysteryBoxFreeClaimTime: 0, // 24-hour daily free mystery box
  mysteryBoxesOpened: 0,
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
  },
  graphicsSettings: {
    preset: 'balanced', // 'smooth', 'balanced', 'hd', 'ultra'
    shadows: true,
    fps: 60
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
    if (this.data.xp >= needed && this.data.level < 500) {
      this.data.level++;
      this.data.xp -= needed;
      this.addCoins(500);
      this.addGems(5);
    }
    this.saveState();
  }

  getGraphicsSettings() {
    return this.data.graphicsSettings || {
      preset: 'balanced',
      shadows: true,
      fps: 60
    };
  }

  setGraphicsSettings(settings) {
    this.data.graphicsSettings = {
      ...this.getGraphicsSettings(),
      ...settings
    };
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

  // --- MYSTERY BOXES (Royal 24h Daily Free / 500 Coins & Cosmic 100 Diamonds) ---
  canClaimFreeMysteryBox() {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return !this.data.lastMysteryBoxFreeClaimTime || (now - this.data.lastMysteryBoxFreeClaimTime >= twentyFourHours);
  }

  getFreeMysteryBoxCountdown() {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const elapsed = now - (this.data.lastMysteryBoxFreeClaimTime || 0);
    return Math.max(0, twentyFourHours - elapsed);
  }

  openMysteryBox(boxType = 'royal', isFree = false) {
    if (boxType === 'royal') {
      if (isFree) {
        if (!this.canClaimFreeMysteryBox()) {
          return { success: false, reason: 'Free Royal Box is recharging' };
        }
        this.data.lastMysteryBoxFreeClaimTime = Date.now();
      } else {
        if (this.data.coins < 500) {
          return { success: false, reason: 'Need 500 Coins to open Royal Mystery Box' };
        }
        this.data.coins -= 500;
      }

      // Dynamic Drop Algorithm: Balanced luck with exciting jackpots
      const roll = Math.random();
      let reward = null;

      if (roll < 0.08) {
        // 8% Grand Royal Jackpot
        const coins = 10000;
        const gems = 75;
        const xp = 150;
        this.addCoins(coins);
        this.addGems(gems);
        this.addXP(xp);
        reward = {
          boxType: 'royal',
          tier: 'MYTHIC',
          tierName: 'ROYAL GRAND JACKPOT',
          title: '👑 Royal Treasury Jackpot!',
          desc: 'Incredible fortune! You unlocked the entire royal treasury cache!',
          icon: '👑',
          coins,
          gems,
          xp,
          isJackpot: true
        };
      } else if (roll < 0.23) {
        // 15% Epic Reward (Rare Dice/Pawn unlock OR rich Diamond stash)
        const candidateDice = ['gold', 'amethyst', 'magma', 'rainbow_holo'];
        const candidatePawns = ['thunder_hammer', 'sorcerer_orb', 'spartan_helmet'];
        const unownedDice = candidateDice.filter(id => !this.isItemOwned('dice', id));
        const unownedPawns = candidatePawns.filter(id => !this.isItemOwned('pawns', id));

        if (unownedDice.length > 0 && Math.random() < 0.5) {
          const unlockedId = unownedDice[Math.floor(Math.random() * unownedDice.length)];
          this.data.inventory.dice.push(unlockedId);
          const gems = 25;
          const xp = 60;
          this.addGems(gems);
          this.addXP(xp);
          reward = {
            boxType: 'royal',
            tier: 'EPIC',
            tierName: 'EPIC REWARD',
            title: `🎲 Rare Dice Unlocked: ${unlockedId.replace(/_/g, ' ').toUpperCase()}`,
            desc: `Congratulations! Added new luxury dice to your inventory!`,
            icon: '🎲',
            itemType: 'dice',
            itemId: unlockedId,
            coins: 0,
            gems,
            xp
          };
        } else if (unownedPawns.length > 0) {
          const unlockedPawn = unownedPawns[Math.floor(Math.random() * unownedPawns.length)];
          this.data.inventory.pawns.push(unlockedPawn);
          const gems = 25;
          const xp = 60;
          this.addGems(gems);
          this.addXP(xp);
          reward = {
            boxType: 'royal',
            tier: 'EPIC',
            tierName: 'EPIC REWARD',
            title: `👑 Rare Pawn Unlocked: ${unlockedPawn.replace(/_/g, ' ').toUpperCase()}`,
            desc: `Epic pawn added directly to your armory inventory!`,
            icon: '👑',
            itemType: 'pawns',
            itemId: unlockedPawn,
            coins: 0,
            gems,
            xp
          };
        } else {
          const coins = 3500;
          const gems = 30;
          const xp = 75;
          this.addCoins(coins);
          this.addGems(gems);
          this.addXP(xp);
          reward = {
            boxType: 'royal',
            tier: 'EPIC',
            tierName: 'EPIC REWARD',
            title: '💎 Royal Gold & Diamond Stash',
            desc: 'A hefty bundle of gleaming gold coins and sparkling gems!',
            icon: '💎',
            coins,
            gems,
            xp
          };
        }
      } else if (roll < 0.55) {
        // 32% Rare Reward
        const coins = Math.floor(Math.random() * 1300) + 1200; // 1,200 - 2,500
        const gems = Math.floor(Math.random() * 12) + 15;     // 15 - 26
        const xp = 40;
        this.addCoins(coins);
        this.addGems(gems);
        this.addXP(xp);
        reward = {
          boxType: 'royal',
          tier: 'RARE',
          tierName: 'RARE REWARD',
          title: '✨ Knight\'s Treasure Cache',
          desc: 'Generous rewards to boost your progression and upgrades!',
          icon: '🪙',
          coins,
          gems,
          xp
        };
      } else {
        // 45% Common Reward
        const coins = Math.floor(Math.random() * 400) + 400; // 400 - 800
        const gems = Math.floor(Math.random() * 6) + 5;      // 5 - 10
        const xp = 20;
        this.addCoins(coins);
        this.addGems(gems);
        this.addXP(xp);
        reward = {
          boxType: 'royal',
          tier: 'COMMON',
          tierName: 'COMMON REWARD',
          title: '🪙 Traveler\'s Coin Pouch',
          desc: 'Solid purse of coins ready for your next tournament entry!',
          icon: '🪙',
          coins,
          gems,
          xp
        };
      }

      this.data.mysteryBoxesOpened = (this.data.mysteryBoxesOpened || 0) + 1;
      this.saveState();
      return { success: true, reward };

    } else if (boxType === 'cosmic') {
      // Cosmic Legendary Mystery Box (100 Diamonds)
      if (this.data.gems < 100) {
        return { success: false, reason: 'Need 100 Diamonds to open Cosmic Mystery Box' };
      }
      this.data.gems -= 100;

      const roll = Math.random();
      let reward = null;

      if (roll < 0.15) {
        // 15% Mythic Emperor Jackpot!
        const coins = 50000;
        const gems = 250;
        const xp = 500;
        this.addCoins(coins);
        this.addGems(gems);
        this.addXP(xp);
        reward = {
          boxType: 'cosmic',
          tier: 'MYTHIC',
          tierName: 'COSMIC SUPERNOVA JACKPOT',
          title: '🌌 Cosmic Supernova Jackpot!',
          desc: 'Celestial fortune! You won the grand 50,000 Coin & 250 Diamond vault!',
          icon: '🌌',
          coins,
          gems,
          xp,
          isJackpot: true
        };
      } else if (roll < 0.45) {
        // 30% Legendary/Mythic Dice or Board Theme
        const candidateDice = ['galactic_nebula_die', 'cyber_matrix_neon', 'dragon_inferno_die', 'apex_sovereign_die', 'starlight_prism', 'diamond_prism_die'];
        const candidateThemes = ['mythic_emperor', 'celestial_nebula', 'snakes_dragon', 'snakes_hyperdrive'];
        const unownedDice = candidateDice.filter(id => !this.isItemOwned('dice', id));
        const unownedThemes = candidateThemes.filter(id => !this.isItemOwned('themes', id) && !this.isItemOwned('snakesThemes', id));

        if (unownedDice.length > 0 && Math.random() < 0.6) {
          const unlockedDie = unownedDice[Math.floor(Math.random() * unownedDice.length)];
          this.data.inventory.dice.push(unlockedDie);
          const coins = 5000;
          const xp = 150;
          this.addCoins(coins);
          this.addXP(xp);
          reward = {
            boxType: 'cosmic',
            tier: 'LEGENDARY',
            tierName: 'LEGENDARY DIE UNLOCKED',
            title: `🎲 Legendary Die: ${unlockedDie.replace(/_/g, ' ').toUpperCase()}`,
            desc: 'Spectacular 3D Legendary Die unlocked directly into your equipment!',
            icon: '🎲',
            itemType: 'dice',
            itemId: unlockedDie,
            coins,
            gems: 0,
            xp
          };
        } else if (unownedThemes.length > 0) {
          const unlockedTheme = unownedThemes[Math.floor(Math.random() * unownedThemes.length)];
          const isSnakes = unlockedTheme.startsWith('snakes_');
          if (isSnakes) {
            this.data.inventory.snakesThemes.push(unlockedTheme);
          } else {
            this.data.inventory.themes.push(unlockedTheme);
          }
          const coins = 5000;
          const xp = 150;
          this.addCoins(coins);
          this.addXP(xp);
          reward = {
            boxType: 'cosmic',
            tier: 'LEGENDARY',
            tierName: 'LEGENDARY THEME UNLOCKED',
            title: `🎨 Luxury Theme: ${unlockedTheme.replace(/_/g, ' ').toUpperCase()}`,
            desc: 'Exclusive tournament board theme added to your collection!',
            icon: '🎨',
            itemType: isSnakes ? 'snakesThemes' : 'themes',
            itemId: unlockedTheme,
            coins,
            gems: 0,
            xp
          };
        } else {
          const coins = 25000;
          const gems = 80;
          const xp = 200;
          this.addCoins(coins);
          this.addGems(gems);
          this.addXP(xp);
          reward = {
            boxType: 'cosmic',
            tier: 'LEGENDARY',
            tierName: 'LEGENDARY VAULT',
            title: '🌠 Celestial Gold & Diamond Hoard',
            desc: 'Astounding 25,000 Coins and 80 Diamonds added to your wallet!',
            icon: '🌠',
            coins,
            gems,
            xp
          };
        }
      } else if (roll < 0.70) {
        // 25% Legendary Pawn
        const candidatePawns = ['astral_dragon_pawn', 'cyber_samurai_blade', 'horus_falcon_pawn', 'bengal_tiger_pawn', 'dragon_sigil'];
        const unownedPawns = candidatePawns.filter(id => !this.isItemOwned('pawns', id));

        if (unownedPawns.length > 0) {
          const unlockedPawn = unownedPawns[Math.floor(Math.random() * unownedPawns.length)];
          this.data.inventory.pawns.push(unlockedPawn);
          const coins = 5000;
          const xp = 150;
          this.addCoins(coins);
          this.addXP(xp);
          reward = {
            boxType: 'cosmic',
            tier: 'LEGENDARY',
            tierName: 'LEGENDARY PAWN UNLOCKED',
            title: `👑 Mythic Pawn: ${unlockedPawn.replace(/_/g, ' ').toUpperCase()}`,
            desc: 'Fierce battle pawn forged in cosmic starlight unlocked!',
            icon: '👑',
            itemType: 'pawns',
            itemId: unlockedPawn,
            coins,
            gems: 0,
            xp
          };
        } else {
          const coins = 20000;
          const gems = 60;
          const xp = 150;
          this.addCoins(coins);
          this.addGems(gems);
          this.addXP(xp);
          reward = {
            boxType: 'cosmic',
            tier: 'LEGENDARY',
            tierName: 'LEGENDARY CACHE',
            title: '⚡ Astral Diamond Treasure',
            desc: 'Powerful cosmic energy converted into massive wealth!',
            icon: '⚡',
            coins,
            gems,
            xp
          };
        }
      } else {
        // 30% Cosmic Treasure Vault
        const coins = Math.floor(Math.random() * 14000) + 18000; // 18,000 - 32,000
        const gems = Math.floor(Math.random() * 50) + 60;        // 60 - 110
        const xp = 100;
        this.addCoins(coins);
        this.addGems(gems);
        this.addXP(xp);
        reward = {
          boxType: 'cosmic',
          tier: 'EPIC',
          tierName: 'COSMIC VAULT',
          title: '💎 Stellar Diamond Hoard',
          desc: 'Tremendous stash of sparkling diamonds and royal currency!',
          icon: '💎',
          coins,
          gems,
          xp
        };
      }

      this.data.mysteryBoxesOpened = (this.data.mysteryBoxesOpened || 0) + 1;
      this.saveState();
      return { success: true, reward };
    }

    return { success: false, reason: 'Unknown mystery box type' };
  }
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
