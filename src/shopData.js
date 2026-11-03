/**
 * Ludo 3D Pro - Complete Customization & Diamond Store Catalog
 * Separated Categories: Ludo Themes, Snakes Themes, Dice Skins, Pawns, and Coin-to-Diamond Exchange
 * Tiers: COMMON, RARE, EPIC, LEGENDARY, MYTHIC
 */

export const SHOP_CATALOG = {
  // 1. LUDO BOARD THEMES
  ludoThemes: [
    {
      id: 'classic_royal',
      name: 'Royal Classic Ivory',
      desc: 'The official tournament look with polished Carrara marble & gold trims.',
      rarity: 'COMMON',
      priceCoins: 0,
      priceGems: 0,
      icon: '🏛️',
      previewColor: '#ffffff',
      sceneBg: 0x10192d,
      boardColor: 0x16233b,
      trimColor: 0xffd700,
      surfaceColor: 0x1e293b,
      pathwayColor: 0xf8fafc,
      innerYardColor: 0xffffff,
      starColor: 0xffea00
    },
    {
      id: 'wood',
      name: 'Carved Teakwood',
      desc: 'Handcrafted antique wooden board with warm brass inlays.',
      rarity: 'RARE',
      priceCoins: 5000,
      priceGems: 0,
      icon: '🌲',
      previewColor: '#8d6e63',
      sceneBg: 0x22130b,
      boardColor: 0x4a2c17,
      trimColor: 0xd4af37,
      surfaceColor: 0x2e180d,
      pathwayColor: 0xdfd3c3,
      innerYardColor: 0xf3ece2,
      starColor: 0xb8860b,
      yardColor: 0x543219
    },
    {
      id: 'candy_kingdom',
      name: 'Candy Sweet Kingdom',
      desc: 'Delightful strawberry candy board with sugar crystal borders.',
      rarity: 'RARE',
      priceCoins: 10000,
      priceGems: 10,
      icon: '🍬',
      previewColor: '#ec4899',
      sceneBg: 0x2b1029,
      boardColor: 0x9d174d,
      trimColor: 0xf472b6,
      surfaceColor: 0x500724,
      pathwayColor: 0xfdf2f8,
      innerYardColor: 0xffe4e6,
      starColor: 0xfbbf24,
      yardColor: 0x831843
    },
    {
      id: 'emerald',
      name: 'Diamond Emerald Jade',
      desc: 'Luxury high-roller theme forged from pure green jade & diamonds.',
      rarity: 'EPIC',
      priceCoins: 18000,
      priceGems: 35,
      icon: '💎',
      previewColor: '#10b981',
      sceneBg: 0x031c12,
      boardColor: 0x064e3b,
      trimColor: 0x10b981,
      surfaceColor: 0x022c22,
      pathwayColor: 0xd1fae5,
      innerYardColor: 0xecfdf5,
      starColor: 0x34d399,
      yardColor: 0x065f46
    },
    {
      id: 'ocean_atlantis',
      name: 'Deep Ocean Atlantis',
      desc: 'Lost kingdom of Atlantis with pearlescent turquoise & deep sea sapphire.',
      rarity: 'EPIC',
      priceCoins: 24000,
      priceGems: 45,
      icon: '🌊',
      previewColor: '#0ea5e9',
      sceneBg: 0x071e33,
      boardColor: 0x0c4a6e,
      trimColor: 0x38bdf8,
      surfaceColor: 0x082f49,
      pathwayColor: 0xe0f2fe,
      innerYardColor: 0xf0f9ff,
      starColor: 0x38bdf8,
      yardColor: 0x075985
    },
    {
      id: 'neon',
      name: 'Cyber Neon Arena',
      desc: 'Electric slate with high-glow neon laser tracks & cyber borders.',
      rarity: 'LEGENDARY',
      priceCoins: 35000,
      priceGems: 60,
      icon: '⚡',
      previewColor: '#00e5ff',
      sceneBg: 0x05070e,
      boardColor: 0x0f172a,
      trimColor: 0x00f0ff,
      surfaceColor: 0x020617,
      pathwayColor: 0x1e293b,
      innerYardColor: 0x0f172a,
      starColor: 0x00f0ff,
      yardColor: 0x111827
    },
    {
      id: 'volcano_lava',
      name: 'Volcanic Magma Chamber',
      desc: 'Forged in subterranean molten lava with glowing obsidian borders.',
      rarity: 'LEGENDARY',
      priceCoins: 48000,
      priceGems: 80,
      icon: '🌋',
      previewColor: '#ef4444',
      sceneBg: 0x1c0707,
      boardColor: 0x450a0a,
      trimColor: 0xf97316,
      surfaceColor: 0x1c1917,
      pathwayColor: 0x292524,
      innerYardColor: 0x1c1917,
      starColor: 0xff5722,
      yardColor: 0x3f1010
    },
    {
      id: 'galaxy_starlight',
      name: 'Cosmic Galaxy Void',
      desc: 'Celestial deep space with swirling nebula dust and starlight tracks.',
      rarity: 'LEGENDARY',
      priceCoins: 60000,
      priceGems: 120,
      icon: '🌌',
      previewColor: '#a855f7',
      sceneBg: 0x0d051a,
      boardColor: 0x2e1065,
      trimColor: 0xc084fc,
      surfaceColor: 0x090514,
      pathwayColor: 0x3b0764,
      innerYardColor: 0x1e1035,
      starColor: 0xf472b6,
      yardColor: 0x3b126e
    },
    {
      id: 'mythic_emperor',
      name: 'Mythic Emperor 24K Gold',
      desc: 'The pinnacle of triumph: pure celestial 24K gold with imperial diamonds.',
      rarity: 'MYTHIC',
      priceCoins: 90000,
      priceGems: 180,
      isUltraRare: true,
      icon: '👑',
      previewColor: '#eab308',
      sceneBg: 0x1a0f02,
      boardColor: 0x713f12,
      trimColor: 0xfacc15,
      surfaceColor: 0x422006,
      pathwayColor: 0xfefce8,
      innerYardColor: 0xfef08a,
      starColor: 0xffea00,
      yardColor: 0x582c07
    }
  ],

  // 2. SNAKES & LADDERS BOARD THEMES
  snakesThemes: [
    {
      id: 'snakes_classic',
      name: 'Carnival Classic Cartoon',
      desc: 'Bright, high-contrast 100-tile board with cute expressive cartoon snakes.',
      rarity: 'COMMON',
      priceCoins: 0,
      priceGems: 0,
      icon: '🐍',
      previewColor: '#22c55e',
      sceneBg: 0x10192d,
      boardColor: 0x16233b,
      trimColor: 0xffd700
    },
    {
      id: 'snakes_jungle',
      name: 'Lush Jungle Rainforest',
      desc: 'Amazon jungle canopy with golden bamboo ladders and emerald anacondas.',
      rarity: 'RARE',
      priceCoins: 6500,
      priceGems: 0,
      icon: '🌴',
      previewColor: '#16a34a',
      sceneBg: 0x052e16,
      boardColor: 0x14532d,
      trimColor: 0x4ade80
    },
    {
      id: 'snakes_candy',
      name: 'Sugar Rush Candy Land',
      desc: 'Sweet peppermint ladders and delicious gummy fruit snakes!',
      rarity: 'RARE',
      priceCoins: 11000,
      priceGems: 15,
      icon: '🍭',
      previewColor: '#f43f5e',
      sceneBg: 0x2b1029,
      boardColor: 0x881337,
      trimColor: 0xfb7185
    },
    {
      id: 'snakes_desert',
      name: 'Desert Mirage Cobra',
      desc: 'Golden Sahara sand dunes with royal hieroglyphic cobras.',
      rarity: 'EPIC',
      priceCoins: 19000,
      priceGems: 30,
      icon: '🏜️',
      previewColor: '#f97316',
      sceneBg: 0x261205,
      boardColor: 0x7c2d12,
      trimColor: 0xfb923c
    },
    {
      id: 'snakes_ocean',
      name: 'Deep Sea Atlantis Serpents',
      desc: 'Coral reef ocean floor with glowing electric sea vipers and brass ladders.',
      rarity: 'EPIC',
      priceCoins: 28000,
      priceGems: 45,
      icon: '🐬',
      previewColor: '#06b6d4',
      sceneBg: 0x071e33,
      boardColor: 0x164e63,
      trimColor: 0x22d3ee
    },
    {
      id: 'snakes_cyber',
      name: 'Cyberpunk Matrix Neon',
      desc: 'Holographic laser beam ladders and cybernetic viper robots in the grid.',
      rarity: 'LEGENDARY',
      priceCoins: 38000,
      priceGems: 65,
      icon: '⚡',
      previewColor: '#8b5cf6',
      sceneBg: 0x05070e,
      boardColor: 0x1e1b4b,
      trimColor: 0xa78bfa
    },
    {
      id: 'snakes_magma',
      name: 'Volcanic Lava Fissures',
      desc: 'Charred basalt stone with fiery molten magma snakes crawling from the earth.',
      rarity: 'LEGENDARY',
      priceCoins: 52000,
      priceGems: 90,
      icon: '🌋',
      previewColor: '#dc2626',
      sceneBg: 0x1c0707,
      boardColor: 0x450a0a,
      trimColor: 0xf87171
    },
    {
      id: 'snakes_galaxy',
      name: 'Cosmic Starlight Serpents',
      desc: 'Swirling celestial void with starlight beam ladders and cosmic vipers.',
      rarity: 'LEGENDARY',
      priceCoins: 68000,
      priceGems: 130,
      icon: '🌌',
      previewColor: '#d946ef',
      sceneBg: 0x0d051a,
      boardColor: 0x3b0764,
      trimColor: 0xe879f9
    },
    {
      id: 'snakes_dragon',
      name: 'Golden Dragon Emperor',
      desc: 'Grandmaster imperial temple with 24K gold ladders and mythical golden dragons.',
      rarity: 'MYTHIC',
      priceCoins: 95000,
      priceGems: 200,
      icon: '🐉',
      previewColor: '#eab308',
      sceneBg: 0x1a0f02,
      boardColor: 0x713f12,
      trimColor: 0xfacc15
    }
  ],

  // 3. DICE SKINS
  dice: [
    {
      id: 'classic',
      name: 'Classic Tournament Ivory',
      desc: 'Precision balanced ivory cube with ruby red center pip.',
      rarity: 'COMMON',
      priceCoins: 0,
      priceGems: 0,
      icon: '🎲',
      baseColor: '#ffffff',
      pipRed: '#ea2b2b',
      pipDark: '#1a2536'
    },
    {
      id: 'gold',
      name: '24K Golden Royale',
      desc: 'Solid heavy pure gold die with diamond-cut black pips.',
      rarity: 'RARE',
      priceCoins: 5000,
      priceGems: 0,
      icon: '✨',
      baseColor: '#ffd700',
      pipRed: '#b71c1c',
      pipDark: '#212121'
    },
    {
      id: 'neon_cube',
      name: 'Cyber Neon Cube',
      desc: 'High-tech obsidian die with electric cyan laser pips.',
      rarity: 'RARE',
      priceCoins: 10000,
      priceGems: 10,
      icon: '⚡',
      baseColor: '#0f172a',
      pipRed: '#06b6d4',
      pipDark: '#38bdf8'
    },
    {
      id: 'amethyst',
      name: 'Mystic Amethyst Crystal',
      desc: 'Deep violet translucent crystal die cut from pure royal quartz.',
      rarity: 'EPIC',
      priceCoins: 18000,
      priceGems: 25,
      icon: '🔮',
      baseColor: '#7e22ce',
      pipRed: '#f43f5e',
      pipDark: '#e9d5ff'
    },
    {
      id: 'diamond_gem',
      name: 'Sapphire Diamond Dice',
      desc: 'Refractive blue crystal die forged from flawless sapphire gems.',
      rarity: 'EPIC',
      priceCoins: 25000,
      priceGems: 40,
      icon: '💎',
      baseColor: '#0284c7',
      pipRed: '#ff0055',
      pipDark: '#e0f2fe'
    },
    {
      id: 'magma',
      name: 'Volcanic Magma Fire',
      desc: 'Forged in volcanic lava with glowing molten amber spots.',
      rarity: 'LEGENDARY',
      priceCoins: 40000,
      priceGems: 60,
      icon: '🔥',
      baseColor: '#c2410c',
      pipRed: '#facc15',
      pipDark: '#451a03'
    },
    {
      id: 'rainbow_holo',
      name: 'Holographic Prismatic',
      desc: 'Shimmering iridescent die that shifts colors dynamically in light.',
      rarity: 'MYTHIC',
      priceCoins: 75000,
      priceGems: 120,
      icon: '🌈',
      baseColor: '#ec4899',
      pipRed: '#3b82f6',
      pipDark: '#fef08a'
    }
  ],

  // 4. PAWNS / TOKENS
  pawns: [
    {
      id: 'crown',
      name: 'Royal Crown Pawn',
      desc: 'Glossy chess pawn with 24K gold collar ring and crystal finial.',
      rarity: 'COMMON',
      priceCoins: 0,
      priceGems: 0,
      icon: '👑'
    },
    {
      id: 'mecha_bot',
      name: 'Mecha Cyber Bot',
      desc: 'Armored titanium combat bot with neon optic visor.',
      rarity: 'RARE',
      priceCoins: 6000,
      priceGems: 0,
      icon: '🤖'
    },
    {
      id: 'crystal',
      name: 'Diamond King Statue',
      desc: 'Precision-cut diamond crystal with glowing internal prismatic reflections.',
      rarity: 'EPIC',
      priceCoins: 16000,
      priceGems: 25,
      icon: '💎'
    },
    {
      id: 'lion_crest',
      name: 'Royal Lion Crest',
      desc: 'Imperial heraldic golden lion crest representing courage and victory.',
      rarity: 'EPIC',
      priceCoins: 26000,
      priceGems: 40,
      icon: '🦁'
    },
    {
      id: 'dragon_sigil',
      name: 'Imperial Dragon Sigil',
      desc: 'Ancient jade & gold dragon emblem that commands the board.',
      rarity: 'LEGENDARY',
      priceCoins: 45000,
      priceGems: 70,
      icon: '🐉'
    },
    {
      id: 'gold_statue',
      name: 'Emperor Solid Gold Trophy',
      desc: 'Pure polished bullion gold trophy pawns for supreme grandmasters.',
      rarity: 'MYTHIC',
      priceCoins: 85000,
      priceGems: 150,
      icon: '🏆'
    }
  ],

  // 5. BUY DIAMONDS WITH COINS (1,000 Coins = 50 Diamonds)
  coinToDiamondPacks: [
    { coins: 1000, gems: 50, label: "50 Diamonds Pack", icon: "💎", bonus: "Standard Rate (1k = 50)" },
    { coins: 2000, gems: 100, label: "100 Diamonds Pack", icon: "💎💎", bonus: "Standard Rate (2k = 100)" },
    { coins: 5000, gems: 275, label: "275 Diamonds Pack", icon: "💎✨", bonus: "+25 Bonus Diamonds!" },
    { coins: 10000, gems: 600, label: "600 Diamonds Pack", icon: "💎👑", bonus: "+100 Bonus Diamonds!" },
    { coins: 25000, gems: 1600, label: "1,600 Diamonds Pack", icon: "💎🔥", bonus: "+350 Super Bonus!" }
  ]
};

// Backward-compatible alias for existing imports
SHOP_CATALOG.themes = SHOP_CATALOG.ludoThemes;
