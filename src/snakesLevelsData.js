/**
 * Ludo 3D Pro - Snakes & Ladders 300-Stage Adventure Campaign & Milestones
 * Candy Crush Saga style progressive unlocking with Boss Chests every 25 stages
 */

export const SNAKES_MILESTONES = {
  25: {
    title: "Jungle Safari Rainforest Theme",
    icon: "🌴",
    itemType: "snakesThemes",
    itemId: "snakes_jungle",
    coins: 6500,
    gems: 30,
    desc: "Unlocks Lush Amazon Rainforest Board Artwork + 6,500 Coins!"
  },
  50: {
    title: "Sugar Rush Candy Land Theme",
    icon: "🍭",
    itemType: "snakesThemes",
    itemId: "snakes_candy",
    coins: 12000,
    gems: 50,
    desc: "Unlocks Gummy Worms & Candy Cane Board Artwork!"
  },
  75: {
    title: "Desert Mirage Cobra Theme",
    icon: "🏜️",
    itemType: "snakesThemes",
    itemId: "snakes_desert",
    coins: 18000,
    gems: 75,
    desc: "Unlocks Sahara Sand Dunes & Golden Egyptian Cobras!"
  },
  100: {
    title: "Deep Sea Atlantis Serpents Theme",
    icon: "🐬",
    itemType: "snakesThemes",
    itemId: "snakes_ocean",
    coins: 25000,
    gems: 100,
    desc: "Century Milestone: Electric Sea Vipers & Deep Ocean Coral!"
  },
  125: {
    title: "Cyber Neon Cube Die",
    icon: "⚡",
    itemType: "dice",
    itemId: "neon_cube",
    coins: 30000,
    gems: 125,
    desc: "Unlocks High-Tech Obsidian Laser Pip Die!"
  },
  150: {
    title: "Cyberpunk Matrix Neon Theme",
    icon: "⚡",
    itemType: "snakesThemes",
    itemId: "snakes_cyber",
    coins: 38000,
    gems: 150,
    desc: "Halfway Champion: Holographic Laser Ladders & Neon Grid!"
  },
  175: {
    title: "Mystic Amethyst Crystal Die",
    icon: "🔮",
    itemType: "dice",
    itemId: "amethyst",
    coins: 45000,
    gems: 175,
    desc: "Unlocks Deep Violet Translucent Crystal Die!"
  },
  200: {
    title: "Volcanic Lava Fissures Theme",
    icon: "🌋",
    itemType: "snakesThemes",
    itemId: "snakes_magma",
    coins: 55000,
    gems: 200,
    desc: "Unlocks Charred Basalt & Fiery Molten Magma Serpents!"
  },
  225: {
    title: "Imperial Dragon Sigil Pawns",
    icon: "🐉",
    itemType: "pawns",
    itemId: "dragon_sigil",
    coins: 65000,
    gems: 225,
    desc: "Unlocks Ancient Jade & Gold Dragon Emblem!"
  },
  250: {
    title: "Cosmic Starlight Serpents Theme",
    icon: "🌌",
    itemType: "snakesThemes",
    itemId: "snakes_galaxy",
    coins: 80000,
    gems: 250,
    desc: "Unlocks Swirling Celestial Nebula & Cosmic Vipers!"
  },
  275: {
    title: "Holographic Prismatic Die",
    icon: "🌈",
    itemType: "dice",
    itemId: "rainbow_holo",
    coins: 95000,
    gems: 300,
    desc: "Unlocks Color-Shifting Prismatic Hologram Die!"
  },
  300: {
    title: "Golden Dragon Emperor Theme",
    icon: "🐉",
    itemType: "snakesThemes",
    itemId: "snakes_dragon",
    coins: 150000,
    gems: 500,
    desc: "Grandmaster Finale: 150,000 Coins + 500 Gems + Mythic Golden Dragon Emperor!"
  }
};

export function generateSnakesStages() {
  const stages = [];
  for (let i = 1; i <= 300; i++) {
    const isMilestone = i % 25 === 0;
    const botCount = i <= 25 ? 1 : (i <= 100 ? 2 : 3);
    const difficulty = i <= 50 ? 'Novice' : (i <= 150 ? 'Challenger' : (i <= 250 ? 'Master' : 'Grandmaster'));

    stages.push({
      number: i,
      title: isMilestone ? `👑 Boss Stage ${i}` : `Stage ${i}`,
      objective: `Reach tile 100 before the AI Robots!`,
      botCount,
      difficulty,
      isMilestone,
      reward: isMilestone ? SNAKES_MILESTONES[i] : null
    });
  }
  return stages;
}

export const SNAKES_STAGES = generateSnakesStages();
