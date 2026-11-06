/**
 * Ludo 3D Pro - Smart AI Bot Decision Engine
 * Evaluates tactical positions: captures, safe spots, escaping danger, goal entry, quick blitz & team synergy
 */

import { SAFE_TILE_INDICES } from './boardData.js';

export class LudoAI {
  static chooseBestMove(engine, validMoves) {
    if (!validMoves || validMoves.length === 0) return null;
    if (validMoves.length === 1) return validMoves[0];

    const curP = engine.getCurrentPlayer();
    const pId = curP.id;
    const isQuickMode = engine.mode === 'quick';

    const scoredMoves = validMoves.map((move) => {
      let score = 0;

      // 1. Instantly Score Goal (Reaching 56)
      if (move.targetStep === 56) {
        score += isQuickMode ? 3000 : 1200; // In Quick mode, 1 goal wins the entire match!
      }

      // 2. Entering Safe Home Stretch (51..55)
      if (move.targetStep >= 51 && move.targetStep < 56) {
        score += (isQuickMode ? 600 : 400) + (move.targetStep - 51) * 35;
      }

      // 3. Capturing an Opponent's Token (High Value Target Hunting)
      if (move.targetStep >= 0 && move.targetStep <= 50) {
        const targetTile = engine.getCommonTileIndex(pId, move.targetStep);
        const isSafeTile = SAFE_TILE_INDICES.includes(targetTile);

        if (!isSafeTile) {
          // Check if opponent is sitting on this tile
          engine.players.forEach((opp) => {
            if (opp.id !== pId) {
              if (engine.isTeam && opp.team === curP.team) return;
              engine.tokens[opp.id].forEach((oppStep) => {
                if (oppStep >= 0 && oppStep <= 50) {
                  const oppTile = engine.getCommonTileIndex(opp.id, oppStep);
                  if (oppTile === targetTile) {
                    // Check if human opponent is struggling (fair anti-bullying balance)
                    const isOppHuman = !opp.isAI;
                    const oppActiveTokens = engine.tokens[opp.id].filter(s => s >= 0 && s < 56).length;
                    const oppHomeTokens = engine.tokens[opp.id].filter(s => s === 56).length;
                    const myHomeTokens = engine.tokens[pId].filter(s => s === 56).length;

                    // If human is trailing or only has 1 token in play, reduce predatory aggression
                    const isHumanTrailing = isOppHuman && (oppActiveTokens <= 1 || (myHomeTokens > oppHomeTokens));
                    const baseCapture = isHumanTrailing ? 420 : 850;
                    const advanceBonus = oppStep >= 25 ? (isHumanTrailing ? 120 : 300) : 0;
                    score += baseCapture + advanceBonus;
                  }
                }
              });
            }
          });
        }

        // 4. Reaching a Safe Star Tile
        if (isSafeTile) {
          score += 440;
        }
      }

      // 5. Spawning a New Token from Yard
      if (move.isSpawn) {
        const activeTokensCount = engine.tokens[pId].filter(s => s >= 0 && s < 56).length;
        if (activeTokensCount === 0) {
          score += 900; // Immediate top priority to enter board if all locked in yard!
        } else if (isQuickMode && activeTokensCount >= 1) {
          score += 180; // Focus on the running token in blitz
        } else {
          score += 380;
        }
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
              if (engine.isTeam && opp.team === curP.team) return;
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
            score += 480; // High priority to flee threat!
          }
        }
      }

      // 7. Danger Evaluation on Destination (Avoid landing directly in front of enemy)
      if (move.targetStep >= 0 && move.targetStep <= 50) {
        const destTile = engine.getCommonTileIndex(pId, move.targetStep);
        if (!SAFE_TILE_INDICES.includes(destTile)) {
          let enemyCloseBehind = false;
          engine.players.forEach((opp) => {
            if (opp.id !== pId) {
              if (engine.isTeam && opp.team === curP.team) return;
              engine.tokens[opp.id].forEach((oppStep) => {
                if (oppStep >= 0 && oppStep <= 50) {
                  const oppTile = engine.getCommonTileIndex(opp.id, oppStep);
                  const dist = (destTile - oppTile + 52) % 52;
                  if (dist >= 1 && dist <= 4) {
                    enemyCloseBehind = true;
                  }
                }
              });
            }
          });
          if (enemyCloseBehind) {
            score -= 120; // Tactical caution: avoid hazardous tiles when safer moves exist
          }
        }
      }

      // 8. General Progress Bonus (Prefer advancing tokens further ahead)
      const stepProgression = move.currentStep >= 0 ? move.currentStep : 0;
      score += isQuickMode ? (stepProgression * 6) : (stepProgression * 3.5);

      // 9. Natural slight variance to prevent predictable mechanical play
      score += Math.random() * 20;

      return { move, score };
    });

    // Sort moves by score descending
    scoredMoves.sort((a, b) => b.score - a.score);

    // Instant Goal Completion: If top move scores a direct goal, always take it!
    if (scoredMoves[0].move.targetStep === 56) {
      return scoredMoves[0].move;
    }

    // Ludo King Casual Human Realism:
    // Real players do not execute optimal minimax moves 100% of the time.
    // ~72% optimal choice, ~23% viable second-best move (progress/spawn), ~5% third-best move.
    if (scoredMoves.length >= 2) {
      const roll = Math.random();
      if (roll > 0.72 && scoredMoves[1].score > 0) {
        return scoredMoves[1].move;
      }
      if (roll > 0.95 && scoredMoves.length >= 3 && scoredMoves[2].score > 0) {
        return scoredMoves[2].move;
      }
    }

    return scoredMoves[0].move;
  }
}
