/**
 * Ludo 3D Master Pro - Main Coordinator
 * Fixed Non-Draggable Camera, Home Screen Hub, 200 Level Saga, Snakes & Ladders
 */

import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { Board3D } from './board3D.js';
import { Dice3D } from './dice3D.js';
import { Token3D } from './token3D.js';
import { GameEngine, GAME_STATES } from './gameLogic.js';
import { LudoAI } from './ai.js';
import { UIManager } from './ui.js';
import { HomeUIManager } from './homeUI.js';
import { SnakesBoard3D } from './snakes3D.js';
import { SnakesEngine } from './snakesLogic.js';
import { sounds } from './audio.js';
import { SAFE_TILE_INDICES } from './boardData.js';
import { calculateLudoKingCamera } from './cameraHelper.js';
import { economy } from './economyState.js';

class LudoApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.tokens = []; // [playerIndex][tokenIndex]
    this.validMoves = [];
    this.isProcessingTurn = false;
    this.currentGameMode = null; // 'classic', 'quick', 'snakes'
    this.currentLevelNum = null;

    this.initThree();
    this.initLighting();
    this.initUI();
    this.initTapRaycasting();

    window.addEventListener('resize', () => this.onWindowResize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    // Start on Home Screen by default!
    this.homeUI.show();
  }

  // 1. Three.js Scene & Strictly Fixed Camera (Zero Drag / Zero Wobble)
  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x184b7a); // Royal Blue Casual Atmosphere

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const aspect = width / height;

    // FOV 38 for crisp perspective with zero distortion
    this.camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 150);
    this.updateFixedCamera(width, height);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
  }

  // 100% Flat Top-Down Orthogonal View like Ludo King (No Perspective Tilt)
  updateFixedCamera(width, height) {
    const camConfig = calculateLudoKingCamera(width, height);
    this.camera.position.set(camConfig.position.x, camConfig.position.y, camConfig.position.z);
    this.camera.lookAt(camConfig.lookAt.x, camConfig.lookAt.y, camConfig.lookAt.z);
  }

  // 2. High-Contrast Studio Lighting (Vibrant colors with rich contrast - NO washed out whites)
  initLighting() {
    // Balanced ambient light preserving depth and tile borders
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    // Warm directional sun light casting crisp, soft shadows
    const sunLight = new THREE.DirectionalLight(0xfffdf5, 1.25);
    sunLight.position.set(10, 28, 14);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.near = 1;
    sunLight.shadow.far = 50;
    sunLight.shadow.left = -12;
    sunLight.shadow.right = 12;
    sunLight.shadow.top = 12;
    sunLight.shadow.bottom = -12;
    sunLight.shadow.bias = -0.0003;
    this.scene.add(sunLight);

    // Gentle cool fill light from opposite angle
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.35);
    fillLight.position.set(-10, 18, -14);
    this.scene.add(fillLight);
  }

  // 3. UI Managers (Home Hub & In-Game HUD)
  initUI() {
    // In-game HUD
    this.inGameUI = new UIManager({
      onRoll: () => this.handleRollClick(),
      onExitToHome: () => this.exitToHome(),
      onRestartMatch: () => this.restartMatch()
    });

    // Home Screen Hub
    this.homeUI = new HomeUIManager({
      onStartGame: (config) => this.startMatch(config),
      onEquip: (type, id) => {
        if (type === 'themes' || type === 'ludoThemes') {
          const theme = SHOP_CATALOG.ludoThemes?.find(t => t.id === id);
          if (this.scene && theme && theme.sceneBg) {
            this.scene.background = new THREE.Color(theme.sceneBg);
          }
          if (this.board3D) {
            this.board3D.applyCurrentTheme();
          }
        }
        if (type === 'snakesThemes') {
          const theme = SHOP_CATALOG.snakesThemes?.find(t => t.id === id);
          if (this.scene && theme && theme.sceneBg) {
            this.scene.background = new THREE.Color(theme.sceneBg);
          }
        }
        if (this.dice3D && type === 'dice') {
          this.dice3D.applySkin();
        }
      }
    });
  }

  // 4. Start a Match from Home
  startMatch(config) {
    this.currentGameMode = config.mode || 'classic';
    this.currentLevelNum = (this.currentGameMode !== 'snakes') ? (config.levelNumber || null) : null;
    this.currentSnakesLevelNum = (this.currentGameMode === 'snakes') ? (config.levelNumber || null) : null;

    // Clear old boards if any
    this.cleanupBoards();

    if (!this.dice3D) {
      this.dice3D = new Dice3D(this.scene);
    } else {
      this.dice3D.applySkin();
    }

    if (this.currentGameMode === 'snakes') {
      this.startSnakesMatch(config);
    } else {
      this.startLudoMatch(config);
    }
  }

  cleanupBoards() {
    if (this.board3D) {
      this.board3D.destroy();
      this.board3D = null;
    }
    if (this.snakesBoard3D) {
      this.snakesBoard3D.destroy();
      this.snakesBoard3D = null;
    }
    if (this.tokens.length > 0) {
      this.tokens.forEach(playerTokens => {
        playerTokens.forEach(t => {
          this.scene.remove(t.mesh);
          this.scene.remove(t.selectionRing);
        });
      });
      this.tokens = [];
    }
  }

  // Start Ludo (Classic or Quick)
  startLudoMatch(config) {
    this.currentConfig = config;
    const curThemeId = economy.data.equipped?.theme || 'classic_royal';
    const themeObj = SHOP_CATALOG.ludoThemes?.find(t => t.id === curThemeId);
    if (this.scene && themeObj && themeObj.sceneBg) {
      this.scene.background = new THREE.Color(themeObj.sceneBg);
    }
    this.board3D = new Board3D(this.scene);
    this.engine = new GameEngine(config);

    this.tokens = [];
    for (let p = 0; p < 4; p++) {
      const pTokens = [];
      for (let t = 0; t < 4; t++) {
        pTokens.push(new Token3D(p, t, this.scene));
      }
      this.tokens.push(pTokens);
    }

    this.validMoves = [];
    this.isProcessingTurn = false;

    const label = this.currentLevelNum ? `LEVEL ${this.currentLevelNum}` : (this.currentGameMode === 'quick' ? 'LUDO QUICK' : 'LUDO CLASSIC');
    this.inGameUI.showInGameUI(label);
    this.inGameUI.renderPlayerCards(this.engine.players, this.engine.activePlayerIndex, this.engine.tokens);
    this.updateTurnUI();
  }

  // Start Snakes & Ladders
  startSnakesMatch(config) {
    this.currentConfig = config;
    const snakesThemeId = economy.data.equipped?.snakesTheme || 'snakes_classic';
    const snakesThemeObj = SHOP_CATALOG.snakesThemes?.find(t => t.id === snakesThemeId);
    if (this.scene && snakesThemeObj && snakesThemeObj.sceneBg) {
      this.scene.background = new THREE.Color(snakesThemeObj.sceneBg);
    }
    this.snakesBoard3D = new SnakesBoard3D(this.scene, snakesThemeId);
    this.snakesEngine = new SnakesEngine(config);
    this.snakesBoard3D.createPawns(this.snakesEngine.players);

    const title = this.currentSnakesLevelNum ? `STAGE ${this.currentSnakesLevelNum}` : "SNAKES & LADDERS 3D";
    this.inGameUI.showInGameUI(title);
    this.inGameUI.renderPlayerCards(this.snakesEngine.players, this.snakesEngine.activePlayerIndex, null, this.snakesEngine.positions);
    this.updateSnakesTurnUI();
  }

  restartMatch() {
    if (this.currentConfig) {
      const cfg = { ...this.currentConfig };
      const levelNum = this.currentLevelNum;
      const snakesLevelNum = this.currentSnakesLevelNum;
      this.cleanupCurrentGame();
      this.currentLevelNum = levelNum;
      this.currentSnakesLevelNum = snakesLevelNum;
      if (cfg.mode === 'snakes') {
        this.startSnakesMatch(cfg);
      } else {
        this.startLudoMatch(cfg);
      }
    } else {
      this.exitToHome();
    }
  }

  // Exit Match and Return to Home Menu
  exitToHome() {
    this.cleanupBoards();
    this.inGameUI.hideInGameUI();
    this.homeUI.show();
  }

  // 5. Tap Raycasting (Only for tapping Dice and Tokens - NO dragging!)
  initTapRaycasting() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    const handleTap = (event) => {
      if (event.target.closest('.hud-btn, .roll-btn, .modal-card, .player-card, .desktop-only-btn, .home-screen-container')) return;

      const rect = this.container.getBoundingClientRect();
      const clientX = event.clientX || (event.changedTouches && event.changedTouches[0].clientX);
      const clientY = event.clientY || (event.changedTouches && event.changedTouches[0].clientY);
      if (clientX === undefined || clientY === undefined) return;

      this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      for (let hit of intersects) {
        let cur = hit.object;
        while (cur && cur !== this.scene) {
          if (cur.userData && cur.userData.isDice) {
            this.handleRollClick();
            return;
          }
          if (cur.userData && cur.userData.isToken) {
            this.handleTokenClick(cur.userData.playerId, cur.userData.tokenIndex);
            return;
          }
          cur = cur.parent;
        }
      }
    };

    const screen = document.getElementById('game-screen');
    screen.addEventListener('pointerup', handleTap);
  }

  // 6. Turn Controller (Ludo)
  async updateTurnUI() {
    if (!this.engine || this.engine.state === GAME_STATES.GAME_OVER) return;
    const curPlayer = this.engine.getCurrentPlayer();
    this.inGameUI.renderPlayerCards(this.engine.players, this.engine.activePlayerIndex, this.engine.tokens);

    if (curPlayer.isAI) {
      this.inGameUI.setRollButtonEnabled(false);
      this.inGameUI.updateStatus(`${curPlayer.name} is rolling...`);
      this.scheduleLudoAITurn();
    } else {
      this.inGameUI.setRollButtonEnabled(true);
      this.inGameUI.updateStatus(`${curPlayer.name}'s turn - Tap to Roll!`);
    }
  }

  async handleRollClick() {
    if (this.currentGameMode === 'snakes') {
      this.handleSnakesRoll();
      return;
    }

    const curPlayer = this.engine.getCurrentPlayer();
    if (curPlayer.isAI || this.isProcessingTurn || this.engine.state !== GAME_STATES.WAITING_FOR_ROLL) return;

    this.executeLudoRoll();
  }

  async executeLudoRoll() {
    this.isProcessingTurn = true;
    this.inGameUI.setRollButtonEnabled(false);
    this.engine.state = GAME_STATES.ROLLING;
    this.inGameUI.updateDiceDisplay(null, true);

    const rollValue = await this.dice3D.roll();
    this.inGameUI.updateDiceDisplay(rollValue, false);

    const result = this.engine.onDiceRolled(rollValue);

    if (result.action === 'FORFEIT_THREE_SIXES') {
      this.inGameUI.updateStatus(`3 Sixes in a row! Turn forfeited!`, true);
      await this.sleep(1000);
      this.engine.nextPlayer();
      this.isProcessingTurn = false;
      this.updateTurnUI();
      return;
    }

    if (result.action === 'NO_MOVES') {
      this.inGameUI.updateStatus(`Rolled ${rollValue} - No valid moves!`);
      await this.sleep(900);
      this.engine.nextPlayer();
      this.isProcessingTurn = false;
      this.updateTurnUI();
      return;
    }

    this.validMoves = result.validMoves;
    const curPlayer = this.engine.getCurrentPlayer();

    if (!curPlayer.isAI) {
      if (this.validMoves.length === 1) {
        this.inGameUI.updateStatus(`Rolled ${rollValue} - Moving token...`);
        await this.sleep(350);
        await this.executeLudoMove(this.validMoves[0]);
      } else {
        this.inGameUI.updateStatus(`Rolled ${rollValue} - Tap a glowing token!`);
        this.highlightMovableTokens(curPlayer.id, this.validMoves);
        this.isProcessingTurn = false;
      }
    }
  }

  highlightMovableTokens(playerId, moves) {
    const pTokens = this.tokens[playerId];
    pTokens.forEach(t => t.setSelectable(false));
    moves.forEach(m => {
      pTokens[m.tokenIndex].setSelectable(true);
    });
  }

  async handleTokenClick(playerId, tokenIndex) {
    const curPlayer = this.engine.getCurrentPlayer();
    if (curPlayer.isAI || this.engine.state !== GAME_STATES.WAITING_FOR_MOVE) return;
    if (playerId !== curPlayer.id) return;

    const matchedMove = this.validMoves.find(m => m.tokenIndex === tokenIndex);
    if (!matchedMove) return;

    this.tokens[playerId].forEach(t => t.setSelectable(false));
    this.isProcessingTurn = true;
    await this.executeLudoMove(matchedMove);
  }

  async executeLudoMove(move) {
    this.engine.state = GAME_STATES.MOVING;
    const curPlayer = this.engine.getCurrentPlayer();
    const tokenObj = this.tokens[curPlayer.id][move.tokenIndex];

    await tokenObj.moveAlongPath(move.targetStep, (t) => this.getStackOffset(t));

    if (move.targetStep >= 0 && move.targetStep <= 50) {
      const tileIdx = this.engine.getCommonTileIndex(curPlayer.id, move.targetStep);
      if (SAFE_TILE_INDICES.includes(tileIdx)) {
        sounds.playSafeZone();
      }
    }

    const result = this.engine.executeMove(move);

    if (result.capturedOpponent) {
      const oppToken = this.tokens[result.capturedOpponent.playerId][result.capturedOpponent.tokenIndex];
      this.inGameUI.updateStatus(`💥 Knockout! Opponent captured! Bonus turn!`, true);
      await oppToken.animateCaptured();
      await this.sleep(300);
    }

    if (result.action === 'GAME_OVER') {
      this.onMatchVictory(result.winner);
      return;
    }

    this.updateAllStackOffsets();

    if (result.bonusTurn) {
      const reason = result.capturedOpponent ? 'Capture' : (this.engine.currentRoll === 6 ? 'Six' : 'Goal');
      this.inGameUI.updateStatus(`🎉 ${reason}! Bonus turn!`, true);
      await this.sleep(600);
    }

    this.validMoves = [];
    this.isProcessingTurn = false;
    this.updateTurnUI();
  }

  async scheduleLudoAITurn() {
    await this.sleep(600);
    if (this.engine.state === GAME_STATES.GAME_OVER) return;

    this.isProcessingTurn = true;
    this.inGameUI.updateDiceDisplay(null, true);

    const rollValue = await this.dice3D.roll();
    this.inGameUI.updateDiceDisplay(rollValue, false);

    const result = this.engine.onDiceRolled(rollValue);

    if (result.action === 'FORFEIT_THREE_SIXES') {
      this.inGameUI.updateStatus(`3 Sixes! Turn forfeited!`);
      await this.sleep(900);
      this.engine.nextPlayer();
      this.isProcessingTurn = false;
      this.updateTurnUI();
      return;
    }

    if (result.action === 'NO_MOVES') {
      this.inGameUI.updateStatus(`${this.engine.getCurrentPlayer().name} rolled ${rollValue} - No moves!`);
      await this.sleep(800);
      this.engine.nextPlayer();
      this.isProcessingTurn = false;
      this.updateTurnUI();
      return;
    }

    const bestMove = LudoAI.chooseBestMove(this.engine, result.validMoves);
    await this.sleep(400);
    await this.executeLudoMove(bestMove);
  }

  // 7. Snakes & Ladders Turn Handler
  async updateSnakesTurnUI() {
    if (!this.snakesEngine || this.snakesEngine.isOver) return;
    const curP = this.snakesEngine.getCurrentPlayer();
    this.inGameUI.renderPlayerCards(this.snakesEngine.players, this.snakesEngine.activePlayerIndex, null, this.snakesEngine.positions);

    if (curP.isAI) {
      this.inGameUI.setRollButtonEnabled(false);
      this.inGameUI.updateStatus(`${curP.name} is rolling...`);
      await this.sleep(700);
      this.handleSnakesRoll();
    } else {
      this.inGameUI.setRollButtonEnabled(true);
      this.inGameUI.updateStatus(`${curP.name}'s turn - Tap to Roll!`);
    }
  }

  async handleSnakesRoll() {
    if (this.isProcessingTurn) return;
    this.isProcessingTurn = true;
    this.inGameUI.setRollButtonEnabled(false);
    this.inGameUI.updateDiceDisplay(null, true);

    const rollValue = await this.dice3D.roll();
    this.inGameUI.updateDiceDisplay(rollValue, false);

    const curPIdx = this.snakesEngine.activePlayerIndex;
    const curP = this.snakesEngine.getCurrentPlayer();
    const result = this.snakesEngine.processRoll(rollValue);

    if (result.action === 'NO_MOVE') {
      this.inGameUI.updateStatus(`Rolled ${rollValue} - Need exact roll to reach 100!`);
      await this.sleep(900);
      this.isProcessingTurn = false;
      this.updateSnakesTurnUI();
      return;
    }

    // Step 1: Animate Pawn Walk Step-by-Step (Tile-by-Tile from start to landedPos)
    await this.snakesBoard3D.animatePawnWalk(curPIdx, result.startPos, result.landedPos);

    // Step 2: Now the pawn is standing on landedPos - trigger Ladder or Snake if hit!
    if (result.climbedLadder) {
      sounds.playSafeZone();
      this.inGameUI.updateStatus(`🪜 WOW! ${curP.name} hit Ladder at ${result.landedPos}! Climbing to ${result.finalPos}!`, true);
      await this.sleep(350);
      await this.snakesBoard3D.animateLadderClimb(curPIdx, result.landedPos, result.finalPos);
    } else if (result.bittenBySnake) {
      sounds.playTokenCapture();
      this.inGameUI.updateStatus(`🐍 OH NO! ${curP.name} bitten by Snake at ${result.landedPos}! Slid down to ${result.finalPos}!`, true);
      await this.sleep(350);
      await this.snakesBoard3D.animateSnakeSlide(curPIdx, result.landedPos, result.finalPos);
    }

    if (result.action === 'GAME_OVER') {
      this.onMatchVictory(result.winner);
      return;
    }

    if (result.bonusTurn) {
      this.inGameUI.updateStatus(`🎉 Rolled 6! ${curP.name} gets a BONUS ROLL!`, true);
      await this.sleep(500);
    }

    this.isProcessingTurn = false;
    this.updateSnakesTurnUI();
  }

  // 8. Victory Handler (Differentiated Rewards: High for Levels, Medium for Bots, 0 for Pass & Play)
  onMatchVictory(winner) {
    let rewardInfo = null;

    if (this.currentLevelNum) {
      // 1. Ludo 300 Saga Mode
      const stars = 3;
      economy.completeLevel(this.currentLevelNum, stars);
      rewardInfo = {
        isLevel: true,
        title: `LUDO SAGA LEVEL ${this.currentLevelNum} CLEARED!`,
        coins: 1500,
        gems: 10,
        xp: 250,
        stars
      };
      this.currentLevelNum = null;
    } else if (this.currentSnakesLevelNum) {
      // 2. Snakes 300 Stage Mode
      const stars = 3;
      economy.completeSnakesStage(this.currentSnakesLevelNum, stars);
      rewardInfo = {
        isLevel: true,
        title: `SNAKES STAGE ${this.currentSnakesLevelNum} CONQUERED!`,
        coins: 1200,
        gems: 8,
        xp: 200,
        stars
      };
      this.currentSnakesLevelNum = null;
    } else if (this.currentConfig && this.currentConfig.isAI) {
      // 3. Match vs AI Bot
      const isUserWinner = winner.id === 0;
      if (isUserWinner) {
        economy.addCoins(250);
        economy.addGems(2);
        economy.addXP(60);
        rewardInfo = {
          isLevel: false,
          title: 'VICTORY OVER CYBER BOT!',
          coins: 250,
          gems: 2,
          xp: 60
        };
      } else {
        economy.addCoins(50);
        economy.addXP(20);
        rewardInfo = {
          isLevel: false,
          title: 'BOT WON - CONSOLATION REWARD',
          coins: 50,
          gems: 0,
          xp: 20
        };
      }
    } else {
      // 4. Pass & Play (Human Friends on same device) -> Zero farming
      rewardInfo = {
        isFriendly: true
      };
    }

    // Confetti
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    this.inGameUI.showVictoryModal(winner, this.engine ? this.engine.stats : null, rewardInfo, () => {
      this.exitToHome();
    });
  }

  getStackOffset(targetToken) {
    const pId = targetToken.playerId;
    const step = targetToken.step;
    if (step === -1 || step === 56) return { x: 0, z: 0 };

    const sharingTokens = [];
    this.tokens.forEach((pTokens) => {
      pTokens.forEach((t) => {
        if (t !== targetToken && t.step === step && t.playerId === pId) {
          sharingTokens.push(t);
        }
      });
    });

    if (sharingTokens.length === 0) return { x: 0, z: 0 };

    const index = sharingTokens.length;
    const angle = (index * Math.PI * 2) / (sharingTokens.length + 1);
    return {
      x: Math.cos(angle) * 0.22,
      z: Math.sin(angle) * 0.22
    };
  }

  updateAllStackOffsets() {
    for (let p = 0; p < 4; p++) {
      for (let t = 0; t < 4; t++) {
        const token = this.tokens[p][t];
        if (!token.isMoving) {
          token.updatePositionInstant(this.getStackOffset(token));
        }
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  onWindowResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.updateFixedCamera(width, height);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();

    if (this.board3D) this.board3D.update(delta);
    if (this.dice3D) this.dice3D.update(delta);

    this.tokens.forEach(playerTokens => {
      playerTokens.forEach(token => token.update(delta));
    });

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new LudoApp();
});
