/**
 * Ludo 3D Pro - 300 Level Saga Campaign Data & Milestone Rewards
 * Candy Crush Saga style progression with milestone chests every 25 levels
 */

export const MILESTONES = {
  25: {
    title: "Golden Royale Dice",
    icon: "🎲",
    itemType: "dice",
    itemId: "gold",
    coins: 5000,
    gems: 25,
    desc: "Unlocks the gleaming 24K Gold Die + 5,000 Coins!"
  },
  50: {
    title: "Carved Teakwood Board",
    icon: "🌲",
    itemType: "themes",
    itemId: "wood",
    coins: 10000,
    gems: 50,
    desc: "Unlocks Century-Old Handcrafted Teakwood Board + 10,000 Coins!"
  },
  75: {
    title: "Candy Sweet Kingdom Theme",
    icon: "🍬",
    itemType: "themes",
    itemId: "candy_kingdom",
    coins: 15000,
    gems: 75,
    desc: "Unlocks Candy Sweet Strawberry Kingdom Theme!"
  },
  100: {
    title: "Cyber Crystal Pawns",
    icon: "💎",
    itemType: "pawns",
    itemId: "crystal",
    coins: 20000,
    gems: 100,
    desc: "Century Milestone: Unlocks Prismatic Diamond Crystal Pawns!"
  },
  125: {
    title: "Diamond Emerald Theme",
    icon: "💎",
    itemType: "themes",
    itemId: "emerald",
    coins: 25000,
    gems: 125,
    desc: "Unlocks Diamond Emerald Jade Luxury Board!"
  },
  150: {
    title: "Deep Ocean Atlantis Theme",
    icon: "🌊",
    itemType: "themes",
    itemId: "ocean_atlantis",
    coins: 30000,
    gems: 150,
    desc: "Halfway Hero: Lost City of Atlantis Sapphire Board!"
  },
  175: {
    title: "Royal Lion Crest Pawns",
    icon: "🦁",
    itemType: "pawns",
    itemId: "lion_crest",
    coins: 35000,
    gems: 175,
    desc: "Unlocks Imperial Golden Lion Crest Pawns!"
  },
  200: {
    title: "Cyber Neon Arena Theme",
    icon: "⚡",
    itemType: "themes",
    itemId: "neon",
    coins: 45000,
    gems: 200,
    desc: "Unlocks Cyber Neon Arena Theme + 45,000 Coins!"
  },
  225: {
    title: "Volcanic Magma Chamber Theme",
    icon: "🌋",
    itemType: "themes",
    itemId: "volcano_lava",
    coins: 55000,
    gems: 225,
    desc: "Unlocks Subterranean Volcanic Molten Chamber!"
  },
  250: {
    title: "Imperial Dragon Sigil Pawns",
    icon: "🐉",
    itemType: "pawns",
    itemId: "dragon_sigil",
    coins: 65000,
    gems: 250,
    desc: "Quarter-Thousand Legend: Ancient Imperial Dragon Sigil!"
  },
  275: {
    title: "Cosmic Galaxy Void Theme",
    icon: "🌌",
    itemType: "themes",
    itemId: "galaxy_starlight",
    coins: 80000,
    gems: 300,
    desc: "Unlocks Swirling Nebula Galaxy Board!"
  },
  300: {
    title: "Supreme Emperor 24K Gold & Trophy",
    icon: "👑",
    itemType: "themes",
    itemId: "mythic_emperor",
    coins: 150000,
    gems: 500,
    desc: "Grandmaster Finale: 150,000 Coins + 500 Gems + Mythic Emperor Gold & Trophy!"
  },
  325: {
    title: "Astral Crystal Pawns",
    icon: "✨",
    itemType: "pawns",
    itemId: "astral_crystal",
    coins: 160000,
    gems: 550,
    desc: "Unlocks Celestial Starlight Crystal Pawns + 160,000 Coins!"
  },
  350: {
    title: "Quantum Cyber Matrix Theme",
    icon: "🔮",
    itemType: "themes",
    itemId: "cyber_quantum",
    coins: 180000,
    gems: 600,
    desc: "Unlocks Holographic Quantum Cyber Board + 180,000 Coins!"
  },
  375: {
    title: "Obsidian Void Die",
    icon: "🎲",
    itemType: "dice",
    itemId: "obsidian_void",
    coins: 200000,
    gems: 650,
    desc: "Unlocks Dark Matter Obsidian Laser Die + 200,000 Coins!"
  },
  400: {
    title: "Solar Titan Citadel Theme",
    icon: "☀️",
    itemType: "themes",
    itemId: "solar_titan",
    coins: 220000,
    gems: 700,
    desc: "Quad-Century Master: Sun-Forged Golden Marble Arena!"
  },
  425: {
    title: "Royal Solar Crest Pawns",
    icon: "👑",
    itemType: "pawns",
    itemId: "solar_crest",
    coins: 240000,
    gems: 750,
    desc: "Unlocks Mythical Solar Emperor Crest Pawns!"
  },
  450: {
    title: "Supernova Starlight Cosmos Theme",
    icon: "🌌",
    itemType: "themes",
    itemId: "celestial_supernova",
    coins: 260000,
    gems: 800,
    desc: "Unlocks Swirling Supernova Starlight Galaxy Board!"
  },
  475: {
    title: "Chrono Steampunk Time-Warp Theme",
    icon: "⏳",
    itemType: "themes",
    itemId: "chrono_timewarp",
    coins: 280000,
    gems: 900,
    desc: "Unlocks Antique Brass Clockwork Chrono Board!"
  },
  500: {
    title: "Apex Celestial Sovereign Crown & Trophy",
    icon: "👑",
    itemType: "themes",
    itemId: "apex_sovereign",
    coins: 300000,
    gems: 1000,
    desc: "Supreme 500-Level Grandmaster Finale: 300,000 Coins + 1,000 Gems + Apex Celestial Sovereign 24K Gold & Crown Trophy!"
  }
};

export function generateSagaLevels() {
  const levels = [];
  for (let i = 1; i <= 500; i++) {
    const isBoss = i % 25 === 0;
    const isQuick = i % 3 === 0 && !isBoss;
    const botCount = i <= 30 ? 1 : (i <= 100 ? 2 : 3);
    const difficulty = i <= 50 ? 'Novice' : (i <= 150 ? 'Challenger' : (i <= 250 ? 'Master' : (i <= 400 ? 'Grandmaster' : 'Apex Legend')));

    levels.push({
      number: i,
      title: isBoss ? `👑 Milestone ${i}` : (isQuick ? `⚡ Blitz Level ${i}` : `Level ${i}`),
      objective: isQuick ? 'First pawn to reach Home wins!' : 'Navigate all pawns to Home!',
      isQuick,
      isBoss,
      botCount,
      difficulty,
      reward: isBoss ? MILESTONES[i] : null
    });
  }
  return levels;
}

export const SAGA_LEVELS = generateSagaLevels();
export const LEVELS = SAGA_LEVELS;
