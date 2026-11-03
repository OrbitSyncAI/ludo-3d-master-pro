/**
 * Ludo 3D Pro - Board Geometry & Coordinate System
 * Standard 15x15 Ludo Board represented in 3D Space
 */

export const TILE_SIZE = 1.0;
export const BOARD_SIZE = 15;
export const BOARD_OFFSET = (BOARD_SIZE - 1) / 2; // 7

// Convert 2D grid coordinates (x: 0..14, y: 0..14) to 3D World Coordinates (X, Y, Z)
export function gridToWorld(x, y, elevation = 0.1) {
  return {
    x: (x - BOARD_OFFSET) * TILE_SIZE,
    y: elevation,
    z: (y - BOARD_OFFSET) * TILE_SIZE
  };
}

// 52 Common Perimeter Tiles (Clockwise Loop)
export const COMMON_PATH = [
  // Top-Left Arm (Green side moving right & up)
  { x: 1, y: 6 },  // 0 - GREEN START (Safe)
  { x: 2, y: 6 },  // 1
  { x: 3, y: 6 },  // 2
  { x: 4, y: 6 },  // 3
  { x: 5, y: 6 },  // 4
  { x: 6, y: 5 },  // 5
  { x: 6, y: 4 },  // 6
  { x: 6, y: 3 },  // 7
  { x: 6, y: 2 },  // 8 - Safe Star
  { x: 6, y: 1 },  // 9
  { x: 6, y: 0 },  // 10
  { x: 7, y: 0 },  // 11 - Turn Corner
  { x: 8, y: 0 },  // 12
  { x: 8, y: 1 },  // 13 - YELLOW START (Safe)
  { x: 8, y: 2 },  // 14
  { x: 8, y: 3 },  // 15
  { x: 8, y: 4 },  // 16
  { x: 8, y: 5 },  // 17
  { x: 9, y: 6 },  // 18
  { x: 10, y: 6 }, // 19
  { x: 11, y: 6 }, // 20
  { x: 12, y: 6 }, // 21 - Safe Star
  { x: 13, y: 6 }, // 22
  { x: 14, y: 6 }, // 23
  { x: 14, y: 7 }, // 24 - Turn Corner
  { x: 14, y: 8 }, // 25
  { x: 13, y: 8 }, // 26 - BLUE START (Safe)
  { x: 12, y: 8 }, // 27
  { x: 11, y: 8 }, // 28
  { x: 10, y: 8 }, // 29
  { x: 9, y: 8 },  // 30
  { x: 8, y: 9 },  // 31
  { x: 8, y: 10 }, // 32
  { x: 8, y: 11 }, // 33
  { x: 8, y: 12 }, // 34 - Safe Star
  { x: 8, y: 13 }, // 35
  { x: 8, y: 14 }, // 36
  { x: 7, y: 14 }, // 37 - Turn Corner
  { x: 6, y: 14 }, // 38
  { x: 6, y: 13 }, // 39 - RED START (Safe)
  { x: 6, y: 12 }, // 40
  { x: 6, y: 11 }, // 41
  { x: 6, y: 10 }, // 42
  { x: 6, y: 9 },  // 43
  { x: 5, y: 8 },  // 44
  { x: 4, y: 8 },  // 45
  { x: 3, y: 8 },  // 46
  { x: 2, y: 8 },  // 47 - Safe Star
  { x: 1, y: 8 },  // 48
  { x: 0, y: 8 },  // 49
  { x: 0, y: 7 },  // 50 - Turn Corner
  { x: 0, y: 6 }   // 51
];

// Star / Safe zone tile indices (no captures allowed)
export const SAFE_TILE_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

// Player definitions with colors, start/entry markers, and Home Streches
export const PLAYERS_CONFIG = [
  {
    id: 0,
    name: "Red",
    colorName: "red",
    hexColor: 0xff3366,
    glowColor: 0xff1744,
    textColor: "#ff3366",
    yardCenter: { x: 2.5, y: 11.5 },
    yardPositions: [
      { x: 1.5, y: 10.5 },
      { x: 3.5, y: 10.5 },
      { x: 1.5, y: 12.5 },
      { x: 3.5, y: 12.5 }
    ],
    startTileIndex: 39,
    entryTileIndex: 37, // enters home after tile 37
    homeStretch: [
      { x: 7, y: 13 },
      { x: 7, y: 12 },
      { x: 7, y: 11 },
      { x: 7, y: 10 },
      { x: 7, y: 9 }
    ],
    goalCoord: { x: 7, y: 8 } // center bottom triangle
  },
  {
    id: 1,
    name: "Green",
    colorName: "green",
    hexColor: 0x00e676,
    glowColor: 0x00c853,
    textColor: "#00e676",
    yardCenter: { x: 2.5, y: 2.5 },
    yardPositions: [
      { x: 1.5, y: 1.5 },
      { x: 3.5, y: 1.5 },
      { x: 1.5, y: 3.5 },
      { x: 3.5, y: 3.5 }
    ],
    startTileIndex: 0,
    entryTileIndex: 50, // enters home after tile 50
    homeStretch: [
      { x: 1, y: 7 },
      { x: 2, y: 7 },
      { x: 3, y: 7 },
      { x: 4, y: 7 },
      { x: 5, y: 7 }
    ],
    goalCoord: { x: 6, y: 7 } // center left triangle
  },
  {
    id: 2,
    name: "Yellow",
    colorName: "yellow",
    hexColor: 0xffd600,
    glowColor: 0xffab00,
    textColor: "#ffd600",
    yardCenter: { x: 11.5, y: 2.5 },
    yardPositions: [
      { x: 10.5, y: 1.5 },
      { x: 12.5, y: 1.5 },
      { x: 10.5, y: 3.5 },
      { x: 12.5, y: 3.5 }
    ],
    startTileIndex: 13,
    entryTileIndex: 11, // enters home after tile 11
    homeStretch: [
      { x: 7, y: 1 },
      { x: 7, y: 2 },
      { x: 7, y: 3 },
      { x: 7, y: 4 },
      { x: 7, y: 5 }
    ],
    goalCoord: { x: 7, y: 6 } // center top triangle
  },
  {
    id: 3,
    name: "Blue",
    colorName: "blue",
    hexColor: 0x00b0ff,
    glowColor: 0x2979ff,
    textColor: "#00b0ff",
    yardCenter: { x: 11.5, y: 11.5 },
    yardPositions: [
      { x: 10.5, y: 10.5 },
      { x: 12.5, y: 10.5 },
      { x: 10.5, y: 12.5 },
      { x: 12.5, y: 12.5 }
    ],
    startTileIndex: 26,
    entryTileIndex: 24, // enters home after tile 24
    homeStretch: [
      { x: 13, y: 7 },
      { x: 12, y: 7 },
      { x: 11, y: 7 },
      { x: 10, y: 7 },
      { x: 9, y: 7 }
    ],
    goalCoord: { x: 8, y: 7 } // center right triangle
  }
];

// Helper to get World 3D coordinates for a token at a given step
// Step -1 = In Yard
// Step 0..50 = On common track
// Step 51..55 = In Home stretch (5 tiles)
// Step 56 = Home Goal (Victory!)
export function getTokenWorldCoords(playerId, tokenIndex, step) {
  const cfg = PLAYERS_CONFIG[playerId];
  
  if (step === -1) {
    // In Yard
    const yp = cfg.yardPositions[tokenIndex];
    return gridToWorld(yp.x, yp.y, 0.25);
  }

  if (step >= 0 && step <= 50) {
    // On Common Path
    const commonIndex = (cfg.startTileIndex + step) % 52;
    const tile = COMMON_PATH[commonIndex];
    return gridToWorld(tile.x, tile.y, 0.25);
  }

  if (step >= 51 && step <= 55) {
    // In Home Stretch
    const homeIndex = step - 51;
    const tile = cfg.homeStretch[homeIndex];
    return gridToWorld(tile.x, tile.y, 0.25);
  }

  if (step >= 56) {
    // Goal (Home Triangle)
    return gridToWorld(cfg.goalCoord.x, cfg.goalCoord.y, 0.35);
  }

  return { x: 0, y: 0.25, z: 0 };
}
