/**
 * Ludo 3D Pro - Snakes & Ladders Game Engine with Step-by-Step Movement
 * Distinguishes between landing tile and ladder/snake destination tile
 */

import { economy } from './economyState.js';

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
      { id: 0, name: p1Name, isAI: false, color: { primary: '#ef4444', textColor: '#dc2626' }, colorHex: 0xff1744, text: "#dc2626" },
      { id: 1, name: p2Name, isAI: this.isAI, color: { primary: '#10b981', textColor: '#15803d' }, colorHex: 0x00e676, text: "#15803d" },
      { id: 2, name: p3Name, isAI: this.isAI, color: { primary: '#f59e0b', textColor: '#b45309' }, colorHex: 0xffc400, text: "#b45309" },
      { id: 3, name: p4Name, isAI: this.isAI, color: { primary: '#06b6d4', textColor: '#0284c7' }, colorHex: 0x00b0ff, text: "#0284c7" }
    ].slice(0, this.playerCount);

    if (this.isTeam) {
      this.players.forEach(p => {
        p.team = (p.id % 2 === 0) ? 'A' : 'B';
        p.teamName = (p.id % 2 === 0) ? 'Team Solar 🔴🟡' : 'Team Cyber 🟢🔵';
      });
    }

    this.activePlayerIndex = 0;
    this.positions = Array(this.playerCount).fill(1); // all start at square 1
    this.winner = null;
    this.isOver = false;
    this.recentSnakeBite = Array(this.playerCount).fill(false);
  }

  getCurrentPlayer() {
    return this.players[this.activePlayerIndex];
  }

  // Dynamic Comeback Assist
  generateSmartRoll(playerIndex = this.activePlayerIndex) {
    const isHuman = (playerIndex === 0);
    // If recently bitten by a snake, grant exciting comeback roll
    if (isHuman && this.recentSnakeBite[playerIndex]) {
      this.recentSnakeBite[playerIndex] = false;
      const boostRolls = [4, 5, 6];
      return boostRolls[Math.floor(Math.random() * boostRolls.length)];
    }
    return Math.floor(Math.random() * 6) + 1;
  }

  processRoll(roll) {
    const curP = this.activePlayerIndex;
    const startPos = this.positions[curP];
    const landedPos = startPos + roll;

    // Must reach 100 exactly
    if (landedPos > 100) {
      return {
        action: 'NO_MOVE',
        startPos,
        landedPos: startPos,
        finalPos: startPos,
        roll
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

    if (finalPos === 100) {
      this.isOver = true;
      this.winner = this.getCurrentPlayer();
      const winningTeamMembers = this.isTeam ? this.players.filter(p => p.team === this.winner.team) : null;
      return {
        action: 'GAME_OVER',
        winner: this.winner,
        isTeam: this.isTeam,
        winningTeam: this.winner.teamName,
        winningTeamMembers,
        startPos,
        landedPos,
        finalPos: 100,
        climbedLadder,
        bittenBySnake
      };
    }

    const bonus = roll === 6;
    if (!bonus) {
      this.activePlayerIndex = (this.activePlayerIndex + 1) % this.playerCount;
    }

    return {
      action: 'MOVE_COMPLETE',
      startPos,
      landedPos,
      finalPos,
      climbedLadder,
      bittenBySnake,
      bonusTurn: bonus,
      nextPlayer: this.getCurrentPlayer()
    };
  }
}
