/**
 * Ludo 3D Pro - Snakes & Ladders Game Engine & Board Coordinate Mapping
 * Authentic 100-tile numbered layout with progressive climbing & dynamic comeback luck
 * Multi-rank finish (1st, 2nd, 3rd, 4th) & strict snake bite bonus cancellation
 */

import { economy } from './economyState.js';

// Classic Authentic Board Mapping (10 Ladders, 8 Snakes)
export const LADDERS = {
  4: 14,
  9: 31,
  20: 38,
  28: 84,
  40: 59,
  51: 67,
  63: 81,
  71: 91
};

export const SNAKES = {
  17: 7,
  54: 34,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  99: 78
};

// 15.2 unit board divided by 10 tiles = 1.52 tile pitch
export const TILE_PITCH = 1.52;

// Convert tile number (1 to 100) to 3D world coordinates matching 2048x2048 canvas
export function tileToGrid(tileNum) {
  if (tileNum < 1) tileNum = 1;
  if (tileNum > 100) tileNum = 100;

  const row = Math.floor((tileNum - 1) / 10);
  const remainder = (tileNum - 1) % 10;
  const col = (row % 2 === 0) ? remainder : (9 - remainder);

  return {
    x: (col - 4.5) * TILE_PITCH,
    y: 0.12,
    z: (4.5 - row) * TILE_PITCH
  };
}

export class SnakesEngine {
  constructor(config = {}) {
    this.isTeam = (config.mode === 'team2v2' || config.isTeam === true);
    this.playerCount = this.isTeam ? 4 : (config.playerCount || 2);
    this.isAI = config.isAI !== false;
    this.levelNumber = config.levelNumber || null;

    const isBot = this.isAI;
    const isTeam = this.isTeam;
    const p1Name = economy?.data?.playerName || "Player 1";
    const p2Name = (isTeam || !isBot) ? "Player 2" : "Cyber Green";
    const p3Name = (isTeam || !isBot) ? "Player 3" : "Neon Yellow";
    const p4Name = (isTeam || !isBot) ? "Player 4" : "Alpha Blue";

    this.players = [
      { id: 0, name: p1Name, isAI: false, color: { primary: '#ef4444', textColor: '#dc2626' }, colorHex: 0xff1744, text: "#dc2626", hasFinished: false },
      { id: 1, name: p2Name, isAI: this.isAI, color: { primary: '#10b981', textColor: '#15803d' }, colorHex: 0x00e676, text: "#15803d", hasFinished: false },
      { id: 2, name: p3Name, isAI: this.isAI, color: { primary: '#f59e0b', textColor: '#b45309' }, colorHex: 0xffc400, text: "#b45309", hasFinished: false },
      { id: 3, name: p4Name, isAI: this.isAI, color: { primary: '#06b6d4', textColor: '#0284c7' }, colorHex: 0x00b0ff, text: "#0284c7", hasFinished: false }
    ].slice(0, this.playerCount);

    if (this.isTeam) {
      this.players.forEach(p => {
        p.team = (p.id % 2 === 0) ? 'A' : 'B';
        p.teamName = (p.id % 2 === 0) ? 'Team Solar 🔴🟡' : 'Team Cyber 🟢🔵';
      });
    }

    this.activePlayerIndex = 0;
    this.positions = Array(this.playerCount).fill(1); // all start at square 1
    this.rankings = []; // Ordered list of players who reached 100
    this.finishedPlayers = new Set();
    this.winner = null;
    this.isOver = false;
    this.recentSnakeBite = Array(this.playerCount).fill(false);
  }

  getCurrentPlayer() {
    return this.players[this.activePlayerIndex];
  }

  nextPlayer() {
    if (this.finishedPlayers.size >= this.playerCount - 1) {
      this.isOver = true;
      return;
    }
    let nextIdx = (this.activePlayerIndex + 1) % this.playerCount;
    let loopCount = 0;
    while (this.finishedPlayers.has(nextIdx) && loopCount < this.playerCount) {
      nextIdx = (nextIdx + 1) % this.playerCount;
      loopCount++;
    }
    this.activePlayerIndex = nextIdx;
  }

  // Dynamic Balanced Smart Roll Algorithm (Comeback & Photo-Finish Assist)
  generateSmartRoll(playerIndex = this.activePlayerIndex) {
    const isHuman = (playerIndex === 0);
    const myPos = this.positions[playerIndex];
    const maxOppPos = Math.max(...this.positions.filter((_, idx) => idx !== playerIndex));

    // 1. If recently bitten by a snake, grant exciting comeback roll
    if (isHuman && this.recentSnakeBite[playerIndex]) {
      this.recentSnakeBite[playerIndex] = false;
      const boostRolls = [4, 5, 6];
      return boostRolls[Math.floor(Math.random() * boostRolls.length)];
    }

    // 2. Trailing Comeback Assist: If human is > 20 tiles behind the leader
    if (isHuman && (maxOppPos - myPos >= 20) && Math.random() < 0.35) {
      const comebackRolls = [4, 5, 6];
      return comebackRolls[Math.floor(Math.random() * comebackRolls.length)];
    }

    // Standard fair roll for both human and AI (No artificial bot insta-win at tile 94-99)
    return Math.floor(Math.random() * 6) + 1;
  }

  processRoll(roll) {
    const curP = this.activePlayerIndex;
    const startPos = this.positions[curP];
    const landedPos = startPos + roll;

    // Must reach 100 exactly
    if (landedPos > 100) {
      const bonus = (roll === 6);
      if (!bonus) {
        this.nextPlayer();
      }
      return {
        action: 'NO_MOVE',
        startPos,
        landedPos: startPos,
        finalPos: startPos,
        roll,
        bonusTurn: bonus,
        nextPlayer: this.getCurrentPlayer()
      };
    }

    let climbedLadder = false;
    let bittenBySnake = false;
    let finalPos = landedPos;

    // Check if landed tile has a Ladder
    if (LADDERS[landedPos]) {
      climbedLadder = true;
      finalPos = LADDERS[landedPos];
    }
    // Check if landed tile has a Snake
    else if (SNAKES[landedPos]) {
      bittenBySnake = true;
      this.recentSnakeBite[curP] = true;
      finalPos = SNAKES[landedPos];
    }

    // Save final position
    this.positions[curP] = finalPos;

    // If player reaches tile 100
    if (finalPos === 100) {
      const curPlayer = this.getCurrentPlayer();
      if (!this.finishedPlayers.has(curP)) {
        this.finishedPlayers.add(curP);
        curPlayer.hasFinished = true;
        curPlayer.rank = this.rankings.length + 1;
        this.rankings.push(curPlayer);
      }

      // Check if match is fully completed
      // (For 2-player: finishes as soon as 1st player finishes. For 3-4 players: finishes when all but 1 finish)
      const shouldFinishMatch = (this.playerCount <= 2) || (this.finishedPlayers.size >= this.playerCount - 1);

      if (shouldFinishMatch) {
        // Assign rank to last remaining player if any
        if (this.finishedPlayers.size < this.playerCount) {
          for (let i = 0; i < this.playerCount; i++) {
            if (!this.finishedPlayers.has(i)) {
              this.finishedPlayers.add(i);
              this.players[i].hasFinished = true;
              this.players[i].rank = this.rankings.length + 1;
              this.rankings.push(this.players[i]);
              break;
            }
          }
        }

        this.isOver = true;
        this.winner = this.rankings[0];
        const winningTeamMembers = this.isTeam ? this.players.filter(p => p.team === this.winner.team) : null;
        return {
          action: 'GAME_OVER',
          winner: this.winner,
          rankings: this.rankings,
          isTeam: this.isTeam,
          winningTeam: this.winner.teamName,
          winningTeamMembers,
          startPos,
          landedPos,
          finalPos: 100,
          climbedLadder,
          bittenBySnake
        };
      } else {
        // Match continues for 2nd/3rd place!
        this.nextPlayer();
        return {
          action: 'PLAYER_FINISHED',
          finishedPlayer: curPlayer,
          rank: curPlayer.rank,
          rankings: this.rankings,
          startPos,
          landedPos,
          finalPos: 100,
          climbedLadder,
          bittenBySnake,
          nextPlayer: this.getCurrentPlayer()
        };
      }
    }

    // BONUS TURN RULE:
    // User Directive: When bitten by a snake, NO BONUS TURN UNDER ANY CIRCUMSTANCES (even if 6 was rolled)!
    const bonus = !bittenBySnake && (roll === 6 || climbedLadder);
    if (!bonus) {
      this.nextPlayer();
    }

    return {
      action: 'MOVE_COMPLETE',
      startPos,
      landedPos,
      finalPos,
      climbedLadder,
      bittenBySnake,
      bonusTurn: bonus,
      ladderBonus: !bittenBySnake && climbedLadder,
      sixBonus: !bittenBySnake && (roll === 6),
      nextPlayer: this.getCurrentPlayer()
    };
  }
}
