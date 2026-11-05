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
  },
  325: {
    title: "Jurassic Dinosaur Jungle Theme",
    icon: "🦖",
    itemType: "snakesThemes",
    itemId: "snakes_jurassic",
    coins: 160000,
    gems: 550,
    desc: "Unlocks Primordial Ferns & Giant Raptor Serpents + 160,000 Coins!"
  },
  350: {
    title: "Chrono Steampunk Clocks Theme",
    icon: "⏳",
    itemType: "snakesThemes",
    itemId: "snakes_chrono",
    coins: 180000,
    gems: 600,
    desc: "Unlocks Gearwork Cog Ladders & Clockwork Serpents!"
  },
  375: {
    title: "Solar Titan Colosseum Theme",
    icon: "☀️",
    itemType: "snakesThemes",
    itemId: "snakes_solar_titan",
    coins: 200000,
    gems: 650,
    desc: "Unlocks Sun-Forged Bronze Pillars & Solar Wyrms!"
  },
  400: {
    title: "Abyssal Deep Void Theme",
    icon: "🐉",
    itemType: "snakesThemes",
    itemId: "snakes_deep_void",
    coins: 220000,
    gems: 700,
    desc: "Quad-Century Master: Bioluminescent Trench Leviathans!"
  },
  425: {
    title: "Prismatic Starlight Die",
    icon: "✨",
    itemType: "dice",
    itemId: "starlight_prism",
    coins: 240000,
    gems: 750,
    desc: "Unlocks Radiant Prismatic Rainbow Laser Die!"
  },
  450: {
    title: "Neon Hyperdrive Grid Theme",
    icon: "⚡",
    itemType: "snakesThemes",
    itemId: "snakes_hyperdrive",
    coins: 260000,
    gems: 800,
    desc: "Unlocks Cybernetic Speed-of-Light Neon Grid!"
  },
  475: {
    title: "Phoenix Feather Pawns",
    icon: "🪶",
    itemType: "pawns",
    itemId: "phoenix_pawn",
    coins: 280000,
    gems: 900,
    desc: "Unlocks Mythical Blazing Phoenix Feather Pawns!"
  },
  500: {
    title: "Apex Mythic Dragon Overlord Finale",
    icon: "👑",
    itemType: "snakesThemes",
    itemId: "snakes_apex_dragon",
    coins: 300000,
    gems: 1000,
    desc: "Supreme 500-Stage Grandmaster Finale: 300,000 Coins + 1,000 Gems + Mythic Dragon Overlord Theme!"
  }
};

export function generateSnakesStages() {
  const stages = [];
  for (let i = 1; i <= 500; i++) {
    const isMilestone = i % 25 === 0;
    const botCount = i <= 25 ? 1 : (i <= 100 ? 2 : 3);
    const difficulty = i <= 50 ? 'Novice' : (i <= 150 ? 'Challenger' : (i <= 250 ? 'Master' : (i <= 400 ? 'Grandmaster' : 'Apex Legend')));

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
