/**
 * Ludo 3D Pro - Smart AI Bot Decision Engine
 * Evaluates tactical positions: captures, safe spots, escaping danger, goal entry
 */

import { SAFE_TILE_INDICES } from './boardData.js';

export class LudoAI {
  static chooseBestMove(engine, validMoves) {
    if (!validMoves || validMoves.length === 0) return null;
    if (validMoves.length === 1) return validMoves[0];

    const scoredMoves = validMoves.map((move) => {
      let score = 0;
      const pId = engine.getCurrentPlayer().id;

      // 1. Instantly Score Goal (Reaching 56)
      if (move.targetStep === 56) {
        score += 1000;
      }

      // 2. Entering Safe Home Stretch (51..55)
      if (move.targetStep >= 51 && move.targetStep < 56) {
        score += 350 + (move.targetStep - 51) * 30;
      }

      // 3. Capturing an Opponent's Token
      if (move.targetStep >= 0 && move.targetStep <= 50) {
        const targetTile = engine.getCommonTileIndex(pId, move.targetStep);
        const isSafeTile = SAFE_TILE_INDICES.includes(targetTile);

        if (!isSafeTile) {
          // Check if opponent is sitting on this tile
          engine.players.forEach((opp) => {
            if (opp.id !== pId) {
              engine.tokens[opp.id].forEach((oppStep) => {
                if (oppStep >= 0 && oppStep <= 50) {
                  const oppTile = engine.getCommonTileIndex(opp.id, oppStep);
                  if (oppTile === targetTile) {
                    score += 850; // Huge priority to capture!
                  }
                }
              });
            }
          });

          // 4. Reaching a Safe Star Tile
          if (isSafeTile) {
            score += 400;
          }
        }
      }

      // 5. Spawning a New Token from Yard
      if (move.isSpawn) {
        score += 300;
      }

      // 6. Escaping from Threat
      if (move.currentStep >= 0 && move.currentStep <= 50) {
        const curTile = engine.getCommonTileIndex(pId, move.currentStep);
        const isSafeCurrent = SAFE_TILE_INDICES.includes(curTile);

        if (!isSafeCurrent) {
          // Check if any opponent is 1-6 squares behind
          let inDanger = false;
          engine.players.forEach((opp) => {
            if (opp.id !== pId) {
              engine.tokens[opp.id].forEach((oppStep) => {
                if (oppStep >= 0 && oppStep <= 50) {
                  const oppTile = engine.getCommonTileIndex(opp.id, oppStep);
                  const dist = (curTile - oppTile + 52) % 52;
                  if (dist >= 1 && dist <= 6) {
                    inDanger = true;
                  }
                }
              });
            }
          });
          if (inDanger) {
            score += 450; // Priority to flee!
          }
        }
      }

      // 7. General Progress Bonus (Prefer advancing tokens further ahead)
      score += (move.currentStep >= 0 ? move.currentStep * 3 : 0);

      // 8. Natural variance
      score += Math.random() * 25;

      return { move, score };
    });

    // Pick highest scored move
    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves[0].move;
  }
}
