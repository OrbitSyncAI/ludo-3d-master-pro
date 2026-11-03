# 🎲 Ludo 3D Master Pro (Google Play Store Ready)

A next-generation, high-performance 3D Ludo game built with modern **Three.js**, **WebGL**, **Web Audio API**, and **Capacitor**.

---

## 🌟 Live Local Preview

Your game is currently running live on your machine:

- **Local URL (PC Browser):** [http://localhost:5173/](http://localhost:5173/)
- **Network URL (Mobile Phone on same Wi-Fi):** `http://192.168.1.3:5173/`

> **Real-time Hot Reload:** Any code changes you request or edit will update live in your browser without restarting the server!

---

## 🚀 Key Features

1. **Stunning 3D / 4D Cyber-Luxury Visuals**:
   - Metallic chamfered board slab with gold trims.
   - 4 vibrant player yards: **Red**, **Green**, **Yellow**, **Blue**.
   - 52 standard continuous 3D pathway tiles.
   - 8 Safe Star Spots with 3D extruded golden stars.
   - Central Victory Crystal with rotating golden core.
   - Dynamic soft shadows and glowing neon ambiance.

2. **Realistic 3D Physics Dice**:
   - 3D cube with rounded beveled edges and contrasting inlaid pips (summing to 7).
   - High-velocity tumbling roll animation with bounce physics.
   - Web Audio synthesized dice clattering & landing sounds.
   - Tap directly on the 3D dice or use the bottom roll HUD.

3. **Complete Official Ludo Rules**:
   - Roll `6` to unlock a pawn out of the yard.
   - Rolling `6` awards a bonus turn (with standard 3-consecutive-sixes forfeiture).
   - Capturing / knocking out an opponent's token sends it back home and awards an instant bonus turn!
   - 8 Safe Star Zones prevent captures.
   - Multiple tokens on the same tile automatically stack with radial offset.
   - Exact roll required to reach the Victory slot (step 56).

4. **Multiplayer & Smart AI Bots**:
   - **Solo vs Smart AI**: AI calculates optimal moves (capturing threats, safe spots, goal runs, escaping danger).
   - **Pass & Play**: Local multiplayer for 2, 3, or 4 players on one screen.
   - **Game Modes**: Classic Mode (all 4 tokens home) vs Quick Mode (1st token home wins).

5. **Audio & VFX**:
   - Procedural Web Audio API sound effects (0 external lag, works 100% offline).
   - Multi-cannon 3D confetti celebration upon winning.
   - Victory fanfare trumpet melody.

6. **Camera Controls**:
   - **3D Perspective View** (Classic angled view).
   - **2D Top-Down View** (Clean aerial board view).
   - **Cinematic Follow View**.
   - **Free Orbit Drag**: Drag with mouse or swipe with touch to rotate/tilt the 3D board freely.

---

## 📱 Google Play Store Compilation Guide

This project is pre-configured with **Capacitor** (`@capacitor/core` and `@capacitor/cli`).

### Step 1: Build the production bundle
```bash
npm run build
```

### Step 2: Add Android Platform (run once)
```bash
npx cap add android
```

### Step 3: Sync Web assets to Android project
```bash
npx cap sync
```

### Step 4: Open in Android Studio & Generate Signed APK / AAB
```bash
npx cap open android
```
In Android Studio:
1. Go to `Build > Generate Signed Bundle / APK`.
2. Choose `Android App Bundle (.aab)` for Google Play Store upload.
3. Sign with your release keystore and upload directly to Google Play Console!
