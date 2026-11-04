# 🎲 Ludo 3D Master Pro - Master Project Specification & Architecture

> **Official Permanent Project Memory & Knowledge Base**  
> *Notice: Do not delete or overwrite this specification. It serves as the single source of truth across all sessions.*

---

## 1. 📌 Executive Summary & Project Identification

- **Project Name:** Ludo 3D Master Pro
- **Current Version:** `1.3.1` (Production Commercial Release)
- **Developer / Publisher:** Sohel
- **Publisher Address:** Bathuwa Khas, Raebareli, Uttar Pradesh - 229001, India
- **Publisher Email:** `sk9026053036@gmail.com`
- **Publisher Phone:** `+91 9026053036`
- **GitHub Repository:** [`https://github.com/OrbitSyncAI/ludo-3d-master-pro`](https://github.com/OrbitSyncAI/ludo-3d-master-pro)
- **Current Live Release:** [`v1.3.1 (Commercial Android APK & iOS Bundle)`](https://github.com/OrbitSyncAI/ludo-3d-master-pro/releases/tag/v1.3.1)
- **Compiled Artifacts (Android & iOS):**
  - Local Storage Folder: `D:\Download\`
  - Android APK: `D:\Download\app-debug.apk`
  - Android AAB: `D:\Download\app-release.aab`
  - iOS IPA Package: `D:\Download\Ludo-3D-Master-Pro-iOS.ipa`
  - iOS App Zip: `D:\Download\Ludo-3D-Master-Pro-iOS-App.zip`
  - Cloud Direct Release: [`https://github.com/OrbitSyncAI/ludo-3d-master-pro/releases/tag/v1.3.1`](https://github.com/OrbitSyncAI/ludo-3d-master-pro/releases/tag/v1.3.1)

---

## 2. 🎮 Game Modes & Rules

### 1. Classic Ludo 3D
- Official tournament rules with 4-color high-contrast board.
- 4 pawns per player starting in corner yards.
- Rolling a **6** spawns a pawn onto the starting square and awards an extra roll.
- Rolling three consecutive 6s skips the turn to prevent exploit.
- Star tiles (`SAFE_TILE_INDICES: [0, 8, 13, 21, 26, 34, 39, 47]`) protect pawns from being captured.
- Capturing an opponent pawn sends it back to the yard and awards a bonus turn.
- Winning condition: All 4 pawns must enter the home triangle.

### 2. Quick Ludo 3D (Fast 5-Min)
- Same official rules as Classic Ludo, but designed for high-intensity mobile gameplay.
- First pawn to successfully reach home wins the entire match instantly.

### 3. Ludo 300 Saga Mode
- 300 progressive levels arranged on a vertical road track.
- **Level 1 is strictly positioned at the BOTTOM**; players climb upwards towards Level 300.
- Royal Milestone Chests at every 25 levels (Level 25, 50, 75, 100... 300) rewarding coins, gems, and themes.
- Earning 3 stars on a level awards bonus coins, gems, XP, and **+1 Free Bonus Spin every 5 levels**.

### 4. Snakes & Ladders 3D
- Authentic 100-tile illustrated 3D board rendered with procedural textures, cartoon snakes, and 3D ladders.
- Step-by-step token movement with sound effects.
- Landing on a ladder base climbs to the ladder top.
- Landing on a snake head slides down to the snake tail.
- Supports 2, 3, or 4 players (vs Smart AI or Pass & Play).

### 5. Snakes 300 Stages Adventure Mode
- 300-stage campaign mode.
- Boss stages with custom themed boards at stages 25, 50, 75, 100, etc.
- Milestone rewards and bonus spin awards every 5 stages.

---

## 3. 🛍️ Royal Customization Store & Strict Pricing Rules

> [!IMPORTANT]
> **Strict Pricing Policy (Never Mix Currencies):**
> - Every store item MUST be EITHER:
>   1. **Pure Coins** (`priceCoins > 0, priceGems: 0`)
>   2. **Pure Diamonds** (`priceCoins: 0, priceGems >= 100`) - Diamonds start at minimum 100 💎!
>   3. **Spin Exclusive** (`isSpinExclusive: true, priceCoins: 0, priceGems: 0`) - Cannot be purchased directly; won only on Lucky Wheel.
>   4. **Starter Free** (`priceCoins: 0, priceGems: 0`)
> - **Zero Browser Alerts:** Never trigger native browser `alert()` or `confirm()`. All dialogs use custom styled in-game modals.

### Catalog Summary:

#### A. Ludo Board Themes
- `classic_royal` (Royal Classic Ivory): FREE Starter
- `wood` (Carved Teakwood): `🪙 5,000` (Coins)
- `candy_kingdom` (Candy Sweet Kingdom): `🪙 12,000` (Coins)
- `ocean_atlantis` (Deep Ocean Atlantis): `🪙 25,000` (Coins)
- `emerald` (Diamond Emerald Jade): `💎 100` (Diamonds)
- `neon` (Cyber Neon Arena): `💎 150` (Diamonds)
- `volcano_lava` (Volcanic Magma Chamber): `💎 200` (Diamonds)
- `galaxy_starlight` (Cosmic Galaxy Void): `💎 300` (Diamonds)
- `mythic_emperor` (Mythic Emperor 24K Gold): `🎡 WIN IN SPIN` (Spin Exclusive)

#### B. Snakes & Ladders Themes
- `snakes_classic` (Carnival Classic Cartoon): FREE Starter
- `snakes_jungle` (Lush Jungle Rainforest): `🪙 6,500` (Coins)
- `snakes_candy` (Sugar Rush Candy Land): `🪙 12,000` (Coins)
- `snakes_desert` (Desert Mirage Cobra): `🪙 22,000` (Coins)
- `snakes_ocean` (Deep Sea Atlantis Serpents): `🪙 35,000` (Coins)
- `snakes_cyber` (Cyberpunk Matrix Neon): `💎 100` (Diamonds)
- `snakes_magma` (Volcanic Lava Fissures): `💎 150` (Diamonds)
- `snakes_galaxy` (Cosmic Starlight Serpents): `💎 250` (Diamonds)
- `snakes_dragon` (Golden Dragon Emperor): `🎡 WIN IN SPIN` (Spin Exclusive)

#### C. Dice Skins
- `classic` (Classic Tournament Ivory): FREE Starter
- `gold` (24K Golden Royale): `🪙 5,000` (Coins)
- `neon_cube` (Cyber Neon Cube): `🪙 15,000` (Coins)
- `amethyst` (Mystic Amethyst Crystal): `💎 100` (Diamonds)
- `diamond_gem` (Sapphire Diamond Dice): `💎 150` (Diamonds)
- `magma` (Volcanic Magma Fire): `💎 200` (Diamonds)
- `rainbow_holo` (Holographic Prismatic): `💎 300` (Diamonds)

#### D. Pawns & Tokens
- `crown` (Royal Crown Pawn): FREE Starter
- `mecha_bot` (Mecha Cyber Bot): `🪙 6,000` (Coins)
- `crystal` (Diamond King Statue): `🪙 18,000` (Coins)
- `lion_crest` (Royal Lion Crest): `💎 100` (Diamonds)
- `dragon_sigil` (Imperial Dragon Sigil): `💎 150` (Diamonds)
- `gold_statue` (Emperor Solid Gold Trophy): `💎 250` (Diamonds)

#### E. Coin-to-Diamond Exchange Packs
- `🪙 1,000 Coins` ➔ `💎 50 Diamonds`
- `🪙 2,000 Coins` ➔ `💎 100 Diamonds`
- `🪙 5,000 Coins` ➔ `💎 275 Diamonds` (+25 Bonus)
- `🪙 10,000 Coins` ➔ `💎 600 Diamonds` (+100 Bonus)
- `🪙 25,000 Coins` ➔ `💎 1,600 Diamonds` (+350 Super Bonus)

---

## 4. 🎡 Daily Lucky Wheel & Casino Features

- **8 Wheel Sectors:**
  1. `🪙 100 Coins`
  2. `💎 10 Diamonds`
  3. `👑 LUDO MYTHIC` (`mythic_emperor` Jackpot!)
  4. `🪙 250 Coins`
  5. `💎 25 Diamonds`
  6. `🐉 SNAKE MYTHIC` (`snakes_dragon` Jackpot!)
  7. `🪙 500 Coins`
  8. `💎 50 Diamonds`
- **Dual Jackpot Engine:** Winning sector 2 equips Ludo 24K Gold; winning sector 5 equips Snakes Golden Dragon.
- **Live Ticking Seconds:** Cooldown timer updates every second (`XXh XXm XXs`).
- **Casino Gold Styling:** Deep navy gradient card with 2px gold border, gold bulb LEDs, and clean rule bullet points.

---

## 5. 👤 Profile & User Experience

- **First-Time Install:** Welcomes player with dialog prompting for Champion Name and avatar selection (12 royal avatars).
- **Profile Editing:** Tapping the user avatar/name on the home header opens the profile modal anytime.
- **Cold Start:** App always opens directly to the Home screen on launch.
- **Minimize / Resume:** Backgrounding/minimizing the browser or app preserves the ongoing match without reset.
- **Match Setup:** Vertical stacked buttons for `🤖 VS SMART BOTS` and `👥 PASS & PLAY (FRIENDS)` to ensure 100% containment on any screen width without right overflow.
- **In-Game Pause/Exit:** Custom modal with `▶️ RESUME MATCH`, `🔄 RESTART MATCH`, and `🚪 QUIT TO HOME MENU`.
- **Local Persistence & Backup:**
  - Auto-saved to `localStorage` key `ludo_3d_player_save_v3`.
  - Hamburger menu contains **Export Progress Backup** (JSON file download) and **Import Progress Backup** (JSON file or text restore).

---

## 6. 🌐 Silent Background OTA Live Updater

- **Module:** `src/liveUpdater.js`
- **Operation:** Silently queries GitHub Releases API (`https://api.github.com/repos/OrbitSyncAI/ludo-3d-master-pro/releases/latest`) 15 seconds after app launch.
- Compares semantic versioning without interrupting gameplay or showing warning dialogs.
- Caches update metadata and prepares service worker updates in the background.

---

## 7. 📁 File Architecture Map

```
D:\Antigravity\My Project Gaming\
├── .github\workflows\
│   └── build-mobile-ota.yml    # CI/CD: Android APK/AAB + iOS Archive + Release Upload
├── android\                    # Capacitor Android Studio Project (Gradle 8, JDK 21)
├── ios\                        # Capacitor iOS Xcode Project
├── src\
│   ├── ai.js                   # Rule-based Ludo AI engine
│   ├── audio.js                # Web Audio API sound synthesizers
│   ├── board3D.js              # Three.js 3D Ludo board generator & theme applicator
│   ├── boardData.js            # Path coordinate definitions & safe star indices
│   ├── cameraHelper.js         # Top-down orthographic/perspective camera math (FOV 38)
│   ├── dice3D.js               # Physics-driven rolling 3D dice with custom skins
│   ├── economyState.js         # Persistence, wallet balance, backup import/export
│   ├── gameLogic.js            # Ludo state machine, turn manager, kill rules
│   ├── homeUI.js               # Hub UI, saga map, store, lucky spin, setup modals
│   ├── levelsData.js           # 300 Ludo Saga level configs & milestone chests
│   ├── liveUpdater.js          # Silent background OTA updater
│   ├── luckyWheel.js           # Canvas 2D rotating wheel with dual jackpots
│   ├── main.js                 # App coordinator, Three.js renderer loop
│   ├── privacyAndTerms.js      # Publisher metadata, privacy policy & terms
│   ├── shopData.js             # Single-currency store catalog & themes
│   ├── snakes3D.js             # Three.js Snakes & Ladders 3D board
│   ├── snakesLevelsData.js     # 300 Snakes Adventure stage configs
│   ├── snakesLogic.js          # Snakes game engine & movement rules
│   ├── snakesTexture.js        # Dynamic 2048x2048 cartoon board texture generator
│   ├── style.css               # Mobile responsive stylesheet & modal themes
│   ├── token3D.js              # 3D pawns with hop animations & star indicators
│   └── ui.js                   # In-game HUD, player pods, pause modal
├── capacitor.config.json       # Mobile app identity config (com.ludo3d.masterpro)
├── package.json                # Dependencies: Three.js, Canvas-Confetti, Capacitor 7
├── project.md                  # Permanent specification and rules memory
├── project_setup.md            # Complete deployment and execution guide
└── vite.config.js              # Build bundler configuration
```
