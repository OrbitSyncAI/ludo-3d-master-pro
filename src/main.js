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
import { SHOP_CATALOG } from './shopData.js';
import { liveUpdater } from './liveUpdater.js';
import { LEVELS } from './levelsData.js';
import { SNAKES_STAGES } from './snakesLevelsData.js';
import { SplashScreen } from './splashScreen.js';

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
    this.applyGraphicsSettings();
    this.initUI();
    this.initTapRaycasting();

    window.addEventListener('resize', () => this.onWindowResize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    // Start on Home Screen by default!
    this.homeUI.show();

    // AAA Game Opening Splash Loading Screen
    const screenEl = document.getElementById('game-screen');
    if (screenEl) {
      const splash = new SplashScreen(screenEl);
      splash.show();
    }

    // Silent Background OTA Live Updater
    liveUpdater.initSilentUpdate();
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
      powerPreference: 'high-performance',
      precision: 'mediump'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
  }

  // 100% Flat Top-Down Orthogonal View like Ludo King (No Perspective Tilt)
  updateFixedCamera(width, height) {
    const camConfig = calculateLudoKingCamera(width, height);
    this.camera.position.set(camConfig.position.x, camConfig.position.y, camConfig.position.z);
    this.camera.up.set(0, 0, -1);
    this.camera.lookAt(camConfig.lookAt.x, camConfig.lookAt.y, camConfig.lookAt.z);
  }

  // 2. High-Contrast Studio Lighting with Realistic Directional Shadows
  initLighting() {
    // Balanced ambient light preserving depth and rich shadow contrast
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.62);
    this.scene.add(this.ambientLight);

    // Warm directional sun light casting realistic shadows at 45 degree angle
    this.sunLight = new THREE.DirectionalLight(0xfffef0, 1.55);
    this.sunLight.position.set(11, 22, 11);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.near = 1;
    this.sunLight.shadow.far = 50;
    this.sunLight.shadow.left = -13;
    this.sunLight.shadow.right = 13;
    this.sunLight.shadow.top = 13;
    this.sunLight.shadow.bottom = -13;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.normalBias = 0.02;
    this.scene.add(this.sunLight);

    // Gentle cool fill light from opposite angle
    this.fillLight = new THREE.DirectionalLight(0xdbeafe, 0.25);
    this.fillLight.position.set(-10, 16, -12);
    this.scene.add(this.fillLight);
  }

  // Live Real-Time Graphics Quality & Realistic Shadows Controller (PUBG Style)
  applyGraphicsSettings(settings = null) {
    const config = settings || economy.getGraphicsSettings();
    const preset = config.preset || 'balanced';
    const enableShadows = config.shadows !== false && preset !== 'smooth';

    if (this.renderer) {
      this.renderer.shadowMap.enabled = enableShadows;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      let pixelRatio = 1.0;
      let mapSize = 1024;
      let ambientIntensity = 0.62;
      let sunIntensity = 1.55;

      if (preset === 'smooth') {
        pixelRatio = 1.0;
        mapSize = 512;
        ambientIntensity = 0.85;
        sunIntensity = 1.1;
      } else if (preset === 'balanced') {
        pixelRatio = Math.min(window.devicePixelRatio, 1.25);
        mapSize = 1024;
        ambientIntensity = 0.62;
        sunIntensity = 1.55;
      } else if (preset === 'hd') {
        pixelRatio = Math.min(window.devicePixelRatio, 1.5);
        mapSize = 1024;
        ambientIntensity = 0.52;
        sunIntensity = 1.70;
      } else if (preset === 'ultra') {
        pixelRatio = Math.min(window.devicePixelRatio, 1.75);
        mapSize = 2048;
        ambientIntensity = 0.46;
        sunIntensity = 1.88;
      }

      this.renderer.setPixelRatio(pixelRatio);

      if (this.ambientLight) {
        this.ambientLight.intensity = ambientIntensity;
      }

      if (this.sunLight) {
        this.sunLight.castShadow = enableShadows;
        this.sunLight.intensity = sunIntensity;
        this.sunLight.shadow.mapSize.width = mapSize;
        this.sunLight.shadow.mapSize.height = mapSize;
        if (this.sunLight.shadow.map) {
          this.sunLight.shadow.map.dispose();
          this.sunLight.shadow.map = null;
        }
      }

      this.renderer.shadowMap.needsUpdate = true;
    }
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

  // 4. Start a Match from Home or Progression
  startMatch(config) {
    if (this.homeUI) this.homeUI.hide();
    this.currentGameMode = config.mode || 'classic';
    this.currentLevelNum = (this.currentGameMode !== 'snakes') ? (config.levelNumber || null) : null;
    this.currentSnakesLevelNum = (this.currentGameMode === 'snakes') ? (config.levelNumber || null) : null;
    this.currentConfig = { ...config };

    // Clear old boards and reset state cleanly
    this.cleanupBoards();

    if (!this.dice3D) {
      this.dice3D = new Dice3D(this.scene);
    } else {
      this.dice3D.isRolling = false;
      this.dice3D.applySkin();
    }

    if (this.currentGameMode === 'snakes') {
      this.startSnakesMatch(config);
    } else {
      this.startLudoMatch(config);
    }
  }

  cleanupBoards() {
    this.isProcessingTurn = false;
    if (this.dice3D) {
      this.dice3D.isRolling = false;
    }
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
    this.engine = null;
    this.snakesEngine = null;
    this.validMoves = [];
  }

  // Start Ludo (Classic or Quick)
  startLudoMatch(config) {
    this.currentGameMode = (config.mode === 'quick' ? 'quick' : (config.mode === 'team2v2' ? 'team2v2' : 'classic'));
    this.currentConfig = config;
    this.isProcessingTurn = false;

    if (!this.dice3D) {
      this.dice3D = new Dice3D(this.scene);
    } else {
      this.dice3D.isRolling = false;
      this.dice3D.applySkin();
    }
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

    const label = this.currentLevelNum ? `LEVEL ${this.currentLevelNum}` : 
      ((config.mode === 'team2v2' || config.isTeam) ? '2v2 LUDO' : 
      (this.currentGameMode === 'quick' ? 'LUDO QUICK' : 'LUDO CLASSIC'));
    this.inGameUI.showInGameUI(label);
    this.inGameUI.renderPlayerCards(this.engine.players, this.engine.activePlayerIndex, this.engine.tokens);
    this.updateTurnUI();
  }

  // Start Snakes & Ladders
  startSnakesMatch(config) {
    this.currentGameMode = 'snakes';
    this.currentConfig = config;
    this.isProcessingTurn = false;

    if (!this.dice3D) {
      this.dice3D = new Dice3D(this.scene);
    } else {
      this.dice3D.isRolling = false;
      this.dice3D.applySkin();
    }
    const snakesThemeId = economy.data.equipped?.snakesTheme || 'snakes_classic';
    const snakesThemeObj = SHOP_CATALOG.snakesThemes?.find(t => t.id === snakesThemeId);
    if (this.scene && snakesThemeObj && snakesThemeObj.sceneBg) {
      this.scene.background = new THREE.Color(snakesThemeObj.sceneBg);
    }
    this.snakesBoard3D = new SnakesBoard3D(this.scene, snakesThemeId);
    this.snakesEngine = new SnakesEngine(config);
    this.snakesBoard3D.createPawns(this.snakesEngine.players);

    const title = this.currentSnakesLevelNum ? `STAGE ${this.currentSnakesLevelNum}` : 
      ((config.mode === 'team2v2' || config.isTeam) ? '2v2 SNAKES' : 'SNAKES 3D');
    this.inGameUI.showInGameUI(title);
    this.inGameUI.renderPlayerCards(this.snakesEngine.players, this.snakesEngine.activePlayerIndex, null, this.snakesEngine.positions);
    this.updateSnakesTurnUI();
  }

  restartMatch() {
    if (this.currentConfig) {
      this.startMatch({ ...this.currentConfig });
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

  // 5. Tap Raycasting (Instant, Generous Hit Radius for Dice and Movable Tokens)
  initTapRaycasting() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    const getIntersectedDiceOrToken = (event) => {
      const rect = this.container.getBoundingClientRect();
      const clientX = event.clientX !== undefined ? event.clientX : (event.changedTouches && event.changedTouches[0]?.clientX);
      const clientY = event.clientY !== undefined ? event.clientY : (event.changedTouches && event.changedTouches[0]?.clientY);
      if (clientX === undefined || clientY === undefined) return null;

      this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      // 1. Direct Token Mesh Intersection
      for (let hit of intersects) {
        let cur = hit.object;
        while (cur && cur !== this.scene) {
          if (cur.userData && cur.userData.isToken) {
            return { type: 'token', playerId: cur.userData.playerId, tokenIndex: cur.userData.tokenIndex };
          }
          cur = cur.parent;
        }
      }

      // 2. Direct Dice Mesh Intersection OR Generous Center Board Hit Zone (Radius 2.5)
      for (let hit of intersects) {
        let cur = hit.object;
        while (cur && cur !== this.scene) {
          if (cur.userData && cur.userData.isDice) return { type: 'dice' };
          cur = cur.parent;
        }
        // Center home tile radius check: tapping anywhere within 2.5 units of board center rolls dice!
        if (hit.point && Math.hypot(hit.point.x, hit.point.z) < 2.5) {
          return { type: 'dice' };
        }
      }

      // 3. Generous Proximity Hit-Test for Selectable Tokens (Effortless mobile finger touch)
      if (this.engine && this.engine.state === GAME_STATES.WAITING_FOR_MOVE) {
        const curP = this.engine.getCurrentPlayer();
        if (!curP.isAI && this.tokens[curP.id]) {
          for (let hit of intersects) {
            if (hit.point) {
              for (let t = 0; t < 4; t++) {
                const token3D = this.tokens[curP.id][t];
                if (token3D && token3D.isSelectable && token3D.mesh) {
                  const dist = Math.hypot(hit.point.x - token3D.mesh.position.x, hit.point.z - token3D.mesh.position.z);
                  if (dist < 1.1) {
                    return { type: 'token', playerId: curP.id, tokenIndex: t };
                  }
                }
              }
            }
          }
        }
      }

      return null;
    };

    const handlePointerDown = (event) => {
      if (event.target.closest('.hud-btn, .modal-card, .desktop-only-btn, .home-screen-container, .hud-drawer-panel')) return;
      if (event.target.closest('.roll-btn, .corner-dice-btn, .match-status-pill')) {
        if (this.dice3D) this.dice3D.onPointerPress();
        return;
      }
      const hit = getIntersectedDiceOrToken(event);
      if (hit && hit.type === 'dice') {
        if (this.dice3D) this.dice3D.onPointerPress();
      }
    };

    let lastTapRegistered = 0;
    const handleTap = (event) => {
      if (this.dice3D) this.dice3D.onPointerRelease();
      if (event.target.closest('.hud-btn, .modal-card, .desktop-only-btn, .home-screen-container, .hud-drawer-panel')) return;

      const now = Date.now();
      if (now - lastTapRegistered < 300) return;

      const hit = getIntersectedDiceOrToken(event);
      if (hit) {
        lastTapRegistered = now;
        if (hit.type === 'dice') {
          this.handleRollClick();
        } else if (hit.type === 'token') {
          this.handleTokenClick(hit.playerId, hit.tokenIndex);
        }
      }
    };

    const screen = document.getElementById('game-screen');
    screen.addEventListener('pointerdown', handlePointerDown);
    screen.addEventListener('pointerup', handleTap);
    screen.addEventListener('pointercancel', () => {
      if (this.dice3D) this.dice3D.onPointerRelease();
    });
  }

  // 6. Turn Controller (Ludo)
  async updateTurnUI() {
    if (!this.engine || this.engine.state === GAME_STATES.GAME_OVER) return;
    const curPlayer = this.engine.getCurrentPlayer();
    this.inGameUI.renderPlayerCards(this.engine.players, this.engine.activePlayerIndex, this.engine.tokens);

    if (curPlayer.isAI) {
      this.inGameUI.setRollButtonEnabled(false);
      this.inGameUI.updateStatus(`${curPlayer.name} is rolling...`);
      await this.sleep(180); // Quick, lively delay before AI roll
      if (this.engine.state === GAME_STATES.GAME_OVER) return;
      this.scheduleLudoAITurn();
    } else {
      this.inGameUI.setRollButtonEnabled(true);
      this.inGameUI.updateStatus(`${curPlayer.name}'s turn - Tap to Roll`);
    }
  }

  async handleRollClick() {
    if (this.currentGameMode === 'snakes') {
      this.handleSnakesRoll();
      return;
    }

    if (!this.engine) return;
    const curPlayer = this.engine.getCurrentPlayer();
    if (!curPlayer || curPlayer.isAI || this.isProcessingTurn || this.engine.state !== GAME_STATES.WAITING_FOR_ROLL) return;

    this.executeLudoRoll();
  }

  async executeLudoRoll() {
    this.isProcessingTurn = true;
    this.inGameUI.setRollButtonEnabled(false);
    this.engine.state = GAME_STATES.ROLLING;
    this.inGameUI.updateDiceDisplay(null, true);

    const smartTarget = this.engine.generateSmartRoll(this.engine.activePlayerIndex);
    const rollValue = await this.dice3D.roll(smartTarget);
    this.inGameUI.updateDiceDisplay(rollValue, false, this.engine.activePlayerIndex);

    const result = this.engine.onDiceRolled(rollValue);

    if (result.action === 'FORFEIT_THREE_SIXES') {
      this.inGameUI.updateStatus(`3 Sixes in a row - Turn forfeited`, true);
      await this.sleep(300);
      this.engine.nextPlayer();
      this.isProcessingTurn = false;
      this.updateTurnUI();
      return;
    }

    if (result.action === 'NO_MOVES') {
      this.inGameUI.updateStatus(`Rolled ${rollValue} - No valid moves`);
      await this.sleep(250);
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
        await this.sleep(60);
        await this.executeLudoMove(this.validMoves[0]);
      } else {
        this.inGameUI.updateStatus(`Rolled ${rollValue} - Tap a glowing token`);
        this.highlightMovableTokens(curPlayer.id, this.validMoves);
        this.isProcessingTurn = false;
      }
    }
  }

  highlightMovableTokens(playerId, moves) {
    // Unconditionally turn off selection glow across ALL tokens across ALL players first
    for (let p = 0; p < this.tokens.length; p++) {
      for (let t = 0; t < this.tokens[p].length; t++) {
        this.tokens[p][t].setSelectable(false);
      }
    }
    const pTokens = this.tokens[playerId];
    if (!pTokens) return;
    moves.forEach(m => {
      if (pTokens[m.tokenIndex] && pTokens[m.tokenIndex].step < 56) {
        pTokens[m.tokenIndex].setSelectable(true);
      }
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
      await this.sleep(120);
    }

    if (result.action === 'GAME_OVER') {
      this.onMatchVictory(result.winner, result.rankings);
      return;
    }

    if (result.action === 'PLAYER_FINISHED') {
      sounds.playSafeZone();
      const rankSuffix = result.rank === 1 ? '1st' : (result.rank === 2 ? '2nd' : '3rd');
      this.inGameUI.updateStatus(`🏆 ${result.finishedPlayer.name} finished ${rankSuffix} Place! Remaining players continue...`, true);
      this.updateAllStackOffsets();
      this.validMoves = [];
      await this.sleep(800);
      this.isProcessingTurn = false;
      this.updateTurnUI();
      return;
    }

    this.updateAllStackOffsets();

    if (result.bonusTurn) {
      const reason = result.capturedOpponent ? 'Capture' : (this.engine.currentRoll === 6 ? 'Six' : 'Goal');
      this.inGameUI.updateStatus(`🎉 ${reason}! Bonus turn!`, true);
      await this.sleep(180);
    }

    this.validMoves = [];
    await this.sleep(160); // Crisp, snappy transition to next player
    this.isProcessingTurn = false;
    this.updateTurnUI();
  }

  async scheduleLudoAITurn() {
    if (this.engine.state === GAME_STATES.GAME_OVER) return;

    this.isProcessingTurn = true;
    this.inGameUI.updateDiceDisplay(null, true);

    const smartTarget = this.engine.generateSmartRoll(this.engine.activePlayerIndex);
    const rollValue = await this.dice3D.roll(smartTarget);
    this.inGameUI.updateDiceDisplay(rollValue, false, this.engine.activePlayerIndex);

    const result = this.engine.onDiceRolled(rollValue);

    if (result.action === 'FORFEIT_THREE_SIXES') {
      this.inGameUI.updateStatus(`3 Sixes! Turn forfeited!`);
      await this.sleep(220);
      this.engine.nextPlayer();
      this.isProcessingTurn = false;
      this.updateTurnUI();
      return;
    }

    if (result.action === 'NO_MOVES') {
      this.inGameUI.updateStatus(`${this.engine.getCurrentPlayer().name} rolled ${rollValue} - No moves`);
      await this.sleep(220);
      this.engine.nextPlayer();
      this.isProcessingTurn = false;
      this.updateTurnUI();
      return;
    }

    const bestMove = LudoAI.chooseBestMove(this.engine, result.validMoves);
    await this.sleep(100);
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
      await this.sleep(450); // Natural, smooth delay before AI roll
      if (this.snakesEngine.isOver) return;
      this.handleSnakesRoll();
    } else {
      this.inGameUI.setRollButtonEnabled(true);
      this.inGameUI.updateStatus(`${curP.name}'s turn - Tap to Roll`);
    }
  }

  async handleSnakesRoll() {
    if (this.isProcessingTurn) return;
    this.isProcessingTurn = true;
    this.inGameUI.setRollButtonEnabled(false);
    this.inGameUI.updateDiceDisplay(null, true);

    const smartTarget = this.snakesEngine.generateSmartRoll(this.snakesEngine.activePlayerIndex);
    const rollValue = await this.dice3D.roll(smartTarget);
    this.inGameUI.updateDiceDisplay(rollValue, false, curPIdx);

    const curPIdx = this.snakesEngine.activePlayerIndex;
    const curP = this.snakesEngine.getCurrentPlayer();
    const result = this.snakesEngine.processRoll(rollValue);

    if (result.action === 'NO_MOVE') {
      if (result.bonusTurn) {
        this.inGameUI.updateStatus(`Rolled 6 - Need exact roll to reach 100. Bonus roll`);
      } else {
        this.inGameUI.updateStatus(`Rolled ${rollValue} - Need exact roll to reach 100`);
      }
      await this.sleep(900);
      this.isProcessingTurn = false;
      this.updateSnakesTurnUI();
      return;
    }

    // Step 1: Animate Pawn Walk Step-by-Step (Tile-by-Tile with centered tile offsets)
    await this.snakesBoard3D.animatePawnWalk(curPIdx, result.startPos, result.landedPos, this.snakesEngine.positions);

    // Step 2: Now the pawn is standing on landedPos - trigger Ladder or Snake if hit!
    if (result.climbedLadder) {
      sounds.playSafeZone();
      this.inGameUI.updateStatus(`🪜 Ladder bonus: ${curP.name} climbed to tile ${result.finalPos} and earned a BONUS ROLL`, true);
      await this.sleep(200);
      await this.snakesBoard3D.animateLadderClimb(curPIdx, result.landedPos, result.finalPos, this.snakesEngine.positions);
    } else if (result.bittenBySnake) {
      sounds.playTokenCapture();
      this.inGameUI.updateStatus(`🐍 Snake bite: ${curP.name} slid down to tile ${result.finalPos}. No bonus roll!`, true);
      await this.sleep(200);
      await this.snakesBoard3D.animateSnakeSlide(curPIdx, result.landedPos, result.finalPos, this.snakesEngine.positions);
    }

    // Step 3: Strictly center all pawns on their current tiles without spilling
    this.snakesBoard3D.updateAllPawnTilePositions(this.snakesEngine.positions);

    if (result.action === 'GAME_OVER') {
      this.onMatchVictory(result.winner, result.rankings);
      return;
    }

    if (result.action === 'PLAYER_FINISHED') {
      sounds.playSafeZone();
      const rankSuffix = result.rank === 1 ? '1st' : (result.rank === 2 ? '2nd' : '3rd');
      this.inGameUI.updateStatus(`🏆 ${result.finishedPlayer.name} reached 100 (${rankSuffix} Place)! Remaining players continue...`, true);
      this.snakesBoard3D.updateAllPawnTilePositions(this.snakesEngine.positions);
      await this.sleep(800);
      this.isProcessingTurn = false;
      this.updateSnakesTurnUI();
      return;
    }

    if (result.bonusTurn && !result.bittenBySnake) {
      if (result.ladderBonus && result.sixBonus) {
        this.inGameUI.updateStatus(`🎉 Rolled 6 & climbed ladder: ${curP.name} gets a bonus roll`, true);
      } else if (result.ladderBonus) {
        this.inGameUI.updateStatus(`🪜 Ladder bonus: ${curP.name} earned an extra roll`, true);
      } else {
        this.inGameUI.updateStatus(`🎲 Rolled 6: ${curP.name} gets a bonus roll`, true);
      }
      await this.sleep(300);
    }

    await this.sleep(380); // Natural delay before switching to next player
    this.isProcessingTurn = false;
    this.updateSnakesTurnUI();
  }

  // Compute Olympic Podium / Tournament Standings
  computeMatchRankings(winner, officialRankings = null) {
    if (officialRankings && officialRankings.length > 0) {
      return officialRankings.map((p, idx) => ({
        id: p.id,
        name: p.name,
        colorHex: p.colorHex || (p.color ? p.color.hexColor : 0xffffff),
        text: p.text || (p.color ? p.color.textColor : '#0f172a'),
        isAI: p.isAI,
        team: p.team,
        rank: idx + 1,
        isWinner: idx === 0,
        isRunnerUp: idx === 1 && officialRankings.length > 2,
        isDefeated: idx === officialRankings.length - 1 && officialRankings.length >= 2,
        scoreLabel: p.hasFinished ? `Rank ${idx + 1} Finish` : 'Defeated'
      }));
    }

    if (this.currentConfig && (this.currentConfig.mode === 'snakes' || this.snakesEngine)) {
      const players = this.snakesEngine.players;
      const positions = this.snakesEngine.positions;
      const list = players.map(p => ({
        id: p.id,
        name: p.name,
        colorHex: p.colorHex,
        text: p.text,
        isAI: p.isAI,
        team: p.team,
        scoreVal: (p.id === winner.id ? 1000 : (positions[p.id] || 1)),
        scoreLabel: `Tile ${positions[p.id] || 1}`
      }));
      list.sort((a, b) => b.scoreVal - a.scoreVal);
      return list.map((item, idx) => ({
        ...item,
        rank: idx + 1,
        isWinner: idx === 0,
        isRunnerUp: idx === 1 && list.length > 2,
        isDefeated: idx === list.length - 1 && list.length >= 2
      }));
    } else if (this.engine) {
      const players = this.engine.players;
      const tokens = this.engine.tokens;
      const list = players.map(p => {
        const pTokens = tokens[p.id] || [];
        const homeCount = pTokens.filter(s => s === 56).length;
        const totalSteps = pTokens.reduce((sum, s) => sum + (s >= 0 ? s : 0), 0);
        const scoreVal = (p.id === winner.id ? 10000 : (homeCount * 1000 + totalSteps));
        return {
          id: p.id,
          name: p.name,
          color: p.color,
          isAI: p.isAI,
          team: p.team,
          homeCount,
          scoreVal,
          scoreLabel: `🏆 ${homeCount}/4 Home (${totalSteps} steps)`
        };
      });
      list.sort((a, b) => b.scoreVal - a.scoreVal);
      return list.map((item, idx) => ({
        ...item,
        rank: idx + 1,
        isWinner: idx === 0,
        isRunnerUp: idx === 1 && list.length > 2,
        isDefeated: idx === list.length - 1 && list.length >= 2
      }));
    }
    return [];
  }

  // 8. Victory & Defeat Handler (Strict: Only User Wins Award Stars & Progress)
  onMatchVictory(winner, officialRankings = null) {
    let rewardInfo = null;
    const isUserWinner = (winner.id === 0);
    const isTeamMode = (this.engine && this.engine.isTeam) || (this.snakesEngine && this.snakesEngine.isTeam);
    const rankings = this.computeMatchRankings(winner, officialRankings);
    const winningTeam = winner.teamName || (this.engine?.winningTeam) || (winner.team === 'A' ? 'Team Solar 🔴🟡' : 'Team Cyber 🟢🔵');
    const winningTeamMembers = (this.engine?.winningTeamMembers) || 
      (this.engine ? this.engine.players.filter(p => p.team === winner.team) : 
      (this.snakesEngine ? this.snakesEngine.players.filter(p => p.team === winner.team) : []));
    const isUserTeamWinner = (winner.team === 'A');

    if (this.currentLevelNum) {
      // 1. Ludo 500 Saga Mode
      if (isUserWinner) {
        const stars = 3;
        economy.completeLevel(this.currentLevelNum, stars);
        rewardInfo = {
          isDefeat: false,
          isLevel: true,
          hasNextLevel: (this.currentLevelNum < 500),
          rankings,
          title: `LUDO SAGA LEVEL ${this.currentLevelNum} CLEARED!`,
          coins: 1500,
          gems: 10,
          xp: 250,
          stars
        };
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      } else {
        // Bot won -> DEFEAT! Level remains uncleared
        rewardInfo = {
          isDefeat: true,
          isLevel: true,
          hasNextLevel: false,
          rankings,
          title: `LEVEL ${this.currentLevelNum} FAILED`,
          coins: 40,
          gems: 0,
          xp: 20,
          stars: 0
        };
      }
    } else if (this.currentSnakesLevelNum) {
      // 2. Snakes 500 Stage Mode
      if (isUserWinner) {
        const stars = 3;
        economy.completeSnakesStage(this.currentSnakesLevelNum, stars);
        rewardInfo = {
          isDefeat: false,
          isLevel: true,
          hasNextLevel: (this.currentSnakesLevelNum < 500),
          rankings,
          title: `SNAKES STAGE ${this.currentSnakesLevelNum} CONQUERED!`,
          coins: 1200,
          gems: 8,
          xp: 200,
          stars
        };
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      } else {
        // Bot won -> DEFEAT! Stage remains uncleared
        rewardInfo = {
          isDefeat: true,
          isLevel: true,
          hasNextLevel: false,
          rankings,
          title: `STAGE ${this.currentSnakesLevelNum} FAILED`,
          coins: 30,
          gems: 0,
          xp: 15,
          stars: 0
        };
      }
    } else if (this.currentConfig && this.currentConfig.isAI) {
      // 3. Match vs AI Bot (Solo or Team)
      const userWon = isTeamMode ? isUserTeamWinner : isUserWinner;
      if (userWon) {
        economy.addCoins(300);
        economy.addGems(3);
        economy.addXP(70);
        rewardInfo = {
          isDefeat: false,
          isLevel: false,
          isTeam: isTeamMode,
          winningTeam,
          teamMembers: winningTeamMembers,
          rankings,
          title: isTeamMode ? `${winningTeam} WINS!` : 'VICTORY OVER CYBER BOT!',
          coins: 300,
          gems: 3,
          xp: 70
        };
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      } else {
        economy.addCoins(40);
        economy.addXP(15);
        rewardInfo = {
          isDefeat: true,
          isLevel: false,
          isTeam: isTeamMode,
          winningTeam,
          teamMembers: winningTeamMembers,
          rankings,
          title: isTeamMode ? `${winningTeam} WON` : 'DEFEAT - BOT WON',
          coins: 40,
          gems: 0,
          xp: 15,
          stars: 0
        };
      }
    } else {
      // 4. Pass & Play (Human Friends on same device) -> Zero wallet farming
      rewardInfo = {
        isDefeat: false,
        isFriendly: true,
        isTeam: isTeamMode,
        winningTeam,
        teamMembers: winningTeamMembers,
        rankings,
        title: isTeamMode ? `${winningTeam} WINS!` : `${winner.name} WINS!`
      };
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }

    this.inGameUI.showVictoryModal(
      winner,
      this.engine ? this.engine.stats : null,
      rewardInfo,
      () => {
        this.currentLevelNum = null;
        this.currentSnakesLevelNum = null;
        this.exitToHome();
      },
      () => {
        this.restartMatch();
      },
      () => {
        // Advance to next level directly and seamlessly (500 total stages & levels)
        if (this.currentSnakesLevelNum && this.currentSnakesLevelNum < 500) {
          const nextStage = this.currentSnakesLevelNum + 1;
          const stageData = SNAKES_STAGES[nextStage - 1] || SNAKES_STAGES[0];
          this.startMatch({
            mode: 'snakes',
            playerCount: stageData.botCount + 1,
            levelNumber: nextStage,
            isAI: true
          });
        } else if (this.currentLevelNum && this.currentLevelNum < 500) {
          const nextLvl = this.currentLevelNum + 1;
          const levelData = LEVELS[nextLvl - 1] || LEVELS[0];
          this.startMatch({
            mode: levelData.isQuick ? 'quick' : 'classic',
            playerCount: levelData.botCount + 1,
            levelNumber: nextLvl,
            isAI: true
          });
        } else {
          this.exitToHome();
        }
      }
    );
  }

  getStackOffset(targetToken) {
    const pId = targetToken.playerId;
    const step = targetToken.step;
    if (step === -1 || step >= 56) return { x: 0, z: 0 };

    // Identify location key: on common path (0..50) vs in personal home stretch (51..55)
    let locKey = null;
    if (step >= 0 && step <= 50) {
      const commonTile = this.engine ? this.engine.getCommonTileIndex(pId, step) : -1;
      locKey = `common_${commonTile}`;
    } else if (step >= 51 && step <= 55) {
      locKey = `homestretch_${pId}_${step}`;
    }

    if (!locKey) return { x: 0, z: 0 };

    // Collect all tokens across all players sharing this exact location
    const sharing = [];
    for (let p = 0; p < this.tokens.length; p++) {
      for (let t = 0; t < this.tokens[p].length; t++) {
        const candidate = this.tokens[p][t];
        if (candidate.step === -1 || candidate.step >= 56) continue;
        let candKey = null;
        if (candidate.step >= 0 && candidate.step <= 50) {
          candKey = `common_${this.engine ? this.engine.getCommonTileIndex(p, candidate.step) : -1}`;
        } else if (candidate.step >= 51 && candidate.step <= 55) {
          candKey = `homestretch_${p}_${candidate.step}`;
        }
        if (candKey === locKey) {
          sharing.push(candidate);
        }
      }
    }

    if (sharing.length <= 1) return { x: 0, z: 0 };

    // Deterministic ordering so offsets remain completely stable
    sharing.sort((a, b) => (a.playerId * 10 + a.tokenIndex) - (b.playerId * 10 + b.tokenIndex));
    const myIndex = sharing.indexOf(targetToken);
    if (myIndex === -1) return { x: 0, z: 0 };

    const count = sharing.length;
    const radius = count === 2 ? 0.20 : 0.26;
    const angle = (myIndex * (Math.PI * 2) / count) + Math.PI / 4;
    return {
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius
    };
  }

  updateAllStackOffsets() {
    for (let p = 0; p < this.tokens.length; p++) {
      for (let t = 0; t < this.tokens[p].length; t++) {
        const token = this.tokens[p][t];
        if (!token.isMoving && token.step >= 0 && token.step < 56) {
          token.smoothOffsetTo(this.getStackOffset(token));
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
