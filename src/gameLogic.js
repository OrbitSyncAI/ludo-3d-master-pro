/**
 * Ludo 3D Pro - Complete Official Game Engine & State Machine
 */

import { PLAYERS_CONFIG, SAFE_TILE_INDICES, COMMON_PATH } from './boardData.js';
import { economy } from './economyState.js';

export const GAME_STATES = {
  MENU: 'MENU',
  WAITING_FOR_ROLL: 'WAITING_FOR_ROLL',
  ROLLING: 'ROLLING',
  WAITING_FOR_MOVE: 'WAITING_FOR_MOVE',
  MOVING: 'MOVING',
  GAME_OVER: 'GAME_OVER'
};

export class GameEngine {
  constructor(config = {}) {
    // Mode: 'classic', 'quick', or 'team2v2' (2v2 Team Battle)
    this.mode = config.mode || 'classic';
    this.isTeam = (this.mode === 'team2v2' || config.isTeam === true);
    this.playerCount = this.isTeam ? 4 : (config.playerCount || 4); // 2v2 requires strictly 4 players
    this.isAI = config.isAI !== false;
    
    // Players setup: [{ id, name, isAI, difficulty: 'medium', team, teamName }]
    this.players = this.initPlayers(config.players);
    this.activePlayerIndex = 0;
    this.state = GAME_STATES.WAITING_FOR_ROLL;

    // Turn tracking
    this.currentRoll = 0;
    this.consecutiveSixes = 0;
    this.bonusTurn = false;
    this.winner = null;

    // Token states: [playerIndex][tokenIndex] = step (-1 = yard, 0..50 = track, 51..55 = home, 56 = won)
    this.tokens = Array.from({ length: 4 }, () => [-1, -1, -1, -1]);
    this.turnsWithoutSix = [0, 0, 0, 0];

    // Statistics
    this.stats = {
      totalTurns: 0,
      kills: [0, 0, 0, 0],
      sixesRolled: [0, 0, 0, 0]
    };
  }

  initPlayers(customPlayers) {
    if (customPlayers && customPlayers.length > 0) {
      return customPlayers;
    }
    const isBot = this.isAI;
    const p1Name = economy?.data?.playerName || "Player 1";
    const basePlayers = [
      { id: 0, name: p1Name, isAI: false, color: PLAYERS_CONFIG[0] },
      { id: 1, name: isBot ? "Cyber Green" : "Player 2", isAI: isBot, color: PLAYERS_CONFIG[1] },
      { id: 2, name: isBot ? "Neon Yellow" : "Player 3", isAI: isBot, color: PLAYERS_CONFIG[2] },
      { id: 3, name: isBot ? "Alpha Blue" : "Player 4", isAI: isBot, color: PLAYERS_CONFIG[3] }
    ].slice(0, this.playerCount);

    if (this.isTeam) {
      basePlayers.forEach(p => {
        p.team = (p.id % 2 === 0) ? 'A' : 'B';
        p.teamName = (p.id % 2 === 0) ? 'Team Solar 🔴🟡' : 'Team Cyber 🟢🔵';
      });
    }

    return basePlayers;
  }

  getCurrentPlayer() {
    return this.players[this.activePlayerIndex];
  }

  // Get common tile index for a token on track (step 0..50)
  getCommonTileIndex(playerId, step) {
    if (step < 0 || step > 50) return -1;
    const cfg = PLAYERS_CONFIG[playerId];
    return (cfg.startTileIndex + step) % 52;
  }

  // Calculate valid moves for current roll
  getValidMoves() {
    const pId = this.getCurrentPlayer().id;
    const playerTokens = this.tokens[pId];
    const valid = [];

    playerTokens.forEach((step, tokenIdx) => {
      // 1. Token in Yard: Requires 6 to enter
      if (step === -1) {
        if (this.currentRoll === 6) {
          valid.push({
            tokenIndex: tokenIdx,
            currentStep: step,
            targetStep: 0,
            isSpawn: true
          });
        }
      } 
      // 2. Token on Track or Home Stretch: Requires step + roll <= 56
      else if (step >= 0 && step < 56) {
        const target = step + this.currentRoll;
        if (target <= 56) {
          valid.push({
            tokenIndex: tokenIdx,
            currentStep: step,
            targetStep: target,
            isGoal: target === 56
          });
        }
      }
    });

    return valid;
  }

  // Dynamic Anti-Frustration Smart Roll Algorithm (Ludo King Balanced Luck)
  generateSmartRoll(playerIndex = this.activePlayerIndex) {
    const player = this.players[playerIndex];
    if (!player) return Math.floor(Math.random() * 6) + 1;
    const isHuman = !player.isAI;
    const tokens = this.tokens[player.id];
    const allInYard = tokens.every(s => s === -1);

    // Anti-frustration rule 1: If human has all 4 tokens trapped in yard and hasn't rolled a 6 for 2+ turns
    if (isHuman && allInYard && (this.turnsWithoutSix[player.id] || 0) >= 2) {
      if (Math.random() < 0.45) {
        this.turnsWithoutSix[player.id] = 0;
        return 6;
      }
    }

    // Anti-frustration rule 2: Prevent accidental 3rd consecutive six forfeit for human player
    if (isHuman && this.consecutiveSixes === 2) {
      return Math.floor(Math.random() * 5) + 1; // Roll 1..5 safely
    }

    // Fair standard roll (1..6)
    const roll = Math.floor(Math.random() * 6) + 1;
    if (roll === 6) {
      this.turnsWithoutSix[player.id] = 0;
    } else {
      this.turnsWithoutSix[player.id] = (this.turnsWithoutSix[player.id] || 0) + 1;
    }
    return roll;
  }

  // Process a roll value
  onDiceRolled(value) {
    this.currentRoll = value;
    this.stats.totalTurns++;

    if (value === 6) {
      this.consecutiveSixes++;
      this.stats.sixesRolled[this.getCurrentPlayer().id]++;
    } else {
      this.consecutiveSixes = 0;
    }

    // Rule: 3 consecutive 6s cancels the turn!
    if (this.consecutiveSixes === 3) {
      this.consecutiveSixes = 0;
      return { action: 'FORFEIT_THREE_SIXES', validMoves: [] };
    }

    const validMoves = this.getValidMoves();

    if (validMoves.length === 0) {
      // No moves possible -> turn ends
      return { action: 'NO_MOVES', validMoves: [] };
    }

    this.state = GAME_STATES.WAITING_FOR_MOVE;
    return { action: 'SELECT_MOVE', validMoves };
  }

  // Execute a selected move
  executeMove(move) {
    const pId = this.getCurrentPlayer().id;
    const prevStep = this.tokens[pId][move.tokenIndex];
    this.tokens[pId][move.tokenIndex] = move.targetStep;

    let capturedOpponent = null;

    // Check capture if targetStep is on the common path (0..50)
    if (move.targetStep >= 0 && move.targetStep <= 50) {
      const targetCommonTile = this.getCommonTileIndex(pId, move.targetStep);
      const isSafeTile = SAFE_TILE_INDICES.includes(targetCommonTile);

      if (!isSafeTile) {
        // Check if any opponent is sitting on this tile
        this.players.forEach((opp) => {
          if (opp.id !== pId) {
            // In 2v2 Team Battle: Teammates never capture each other (Cooperative safe sharing)
            if (this.isTeam && opp.team === this.getCurrentPlayer().team) {
              return;
            }

            this.tokens[opp.id].forEach((oppStep, oppTokenIdx) => {
              if (oppStep >= 0 && oppStep <= 50) {
                const oppCommonTile = this.getCommonTileIndex(opp.id, oppStep);
                if (oppCommonTile === targetCommonTile) {
                  // Capture! Send back to yard
                  this.tokens[opp.id][oppTokenIdx] = -1;
                  capturedOpponent = {
                    playerId: opp.id,
                    tokenIndex: oppTokenIdx
                  };
                  this.stats.kills[pId]++;
                }
              }
            });
          }
        });
      }
    }

    // Check win condition
    const hasWon = this.checkWin(pId);
    if (hasWon) {
      this.winner = this.getCurrentPlayer();
      const winningTeamMembers = this.isTeam ? this.players.filter(p => p.team === this.winner.team) : null;
      this.state = GAME_STATES.GAME_OVER;
      return {
        action: 'GAME_OVER',
        winner: this.winner,
        isTeam: this.isTeam,
        winningTeam: this.winningTeam,
        winningTeamMembers,
        capturedOpponent
      };
    }

    // Determine bonus turn:
    // 1. Rolled a 6 -> Bonus turn!
    // 2. Captured an opponent -> Bonus turn!
    // 3. Reached home goal -> Bonus turn!
    const earnedBonus = (this.currentRoll === 6) || (capturedOpponent !== null) || (move.targetStep === 56);
    this.bonusTurn = earnedBonus;

    if (!this.bonusTurn) {
      this.nextPlayer();
    } else {
      this.state = GAME_STATES.WAITING_FOR_ROLL;
    }

    return {
      action: 'MOVE_COMPLETE',
      capturedOpponent,
      bonusTurn: this.bonusTurn,
      nextPlayer: this.getCurrentPlayer()
    };
  }

  // Advance turn to next player
  nextPlayer() {
    this.consecutiveSixes = 0;
    this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
    this.state = GAME_STATES.WAITING_FOR_ROLL;
  }

  // Check if player has satisfied victory criteria
  checkWin(playerId) {
    if (this.isTeam) {
      const p = this.players.find(x => x.id === playerId);
      if (!p) return false;
      const myTeam = p.team;
      let teamCompletedTokens = 0;
      this.players.filter(x => x.team === myTeam).forEach(tp => {
        teamCompletedTokens += this.tokens[tp.id].filter(s => s === 56).length;
      });
      if (teamCompletedTokens >= 4) {
        this.winningTeam = p.teamName;
        this.winningTeamId = myTeam;
        return true;
      }
      return false;
    }

    const tokens = this.tokens[playerId];
    const completed = tokens.filter(s => s === 56).length;

    if (this.mode === 'quick') {
      return completed >= 1; // 1 token home to win
    }
    return completed === 4; // All 4 tokens home
  }
}
