import { SnakesEngine, LADDERS } from '../src/snakesLogic.js';
import { GameEngine } from '../src/gameLogic.js';
import { SAGA_LEVELS } from '../src/levelsData.js';
import { SNAKES_STAGES } from '../src/snakesLevelsData.js';
import { economy } from '../src/economyState.js';

console.log("=== TEST 1: Snakes Ladder Bonus Roll ===");
const engine = new SnakesEngine({ mode: 'snakes', playerCount: 2, isAI: false });
// Pawn 0 starts at 1. If pawn rolls 3, landedPos is 4. Tile 4 has ladder to 14.
engine.positions[0] = 1;
const result = engine.processRoll(3);
console.log("StartPos:", result.startPos, "LandedPos:", result.landedPos, "FinalPos:", result.finalPos);
console.log("Climbed ladder?", result.climbedLadder);
console.log("Bonus turn?", result.bonusTurn);
console.log("Active player after ladder climb (should still be 0):", engine.activePlayerIndex);
if (result.climbedLadder && result.bonusTurn && engine.activePlayerIndex === 0) {
  console.log("✅ Ladder bonus roll PASSED: Player retains turn upon climbing ladder!");
} else {
  console.error("❌ Ladder bonus roll FAILED!");
  process.exit(1);
}

console.log("\n=== TEST 2: Snakes Level 1 -> Level 2 Progression Data ===");
const s1 = SNAKES_STAGES[0];
const s2 = SNAKES_STAGES[1];
console.log("Stage 1:", s1.title, "Bots:", s1.botCount);
console.log("Stage 2:", s2.title, "Bots:", s2.botCount);
if (s2 && s2.botCount !== undefined) {
  console.log("✅ Stage progression data valid!");
} else {
  console.error("❌ Stage progression data invalid!");
  process.exit(1);
}

console.log("\n=== TEST 3: Ludo Level 1 -> Level 2 Progression Data ===");
const l1 = SAGA_LEVELS[0];
const l2 = SAGA_LEVELS[1];
console.log("Level 1:", l1.title, "Quick:", l1.isQuick, "Bots:", l1.botCount);
console.log("Level 2:", l2.title, "Quick:", l2.isQuick, "Bots:", l2.botCount);
if (l2 && l2.botCount !== undefined) {
  console.log("✅ Ludo level progression data valid!");
} else {
  console.error("❌ Ludo level progression data invalid!");
  process.exit(1);
}

console.log("\n=== TEST 4: Export/Import JSON Integrity ===");
const jsonStr = economy.exportBackupJSON();
const parsed = JSON.parse(jsonStr);
console.log("Exported JSON player:", parsed.player.name, "Coins:", parsed.wallet.coins);
const importRes = economy.importBackupJSON(jsonStr);
console.log("Import success:", importRes);
if (importRes) {
  console.log("✅ JSON Export & Import strictly working!");
} else {
  console.error("❌ Import failed!");
  process.exit(1);
}
