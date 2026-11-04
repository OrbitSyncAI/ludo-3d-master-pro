# 🛠️ Ludo 3D Master Pro - Project Setup & Operations Guide

> **Quick-Start & Operational Handbook**  
> *Follow these instructions to start the dev server, build mobile binaries, run audits, or resume work anytime.*

---

## 1. 💻 Environment & Tooling Prerequisites

- **Operating System:** Windows 10/11 x64 (PowerShell 5.1 / 7)
- **Node.js:** v20.18.0+ (Located at `$env:USERPROFILE\node-v20.18.0-win-x64`)
- **Java Development Kit:** JDK 21 (Required by Capacitor 7 and Android Gradle Plugin 8.7)
- **Android SDK:** Platforms 34 / 35, Build Tools 34.0.0
- **GitHub CLI (`gh`):** Authenticated as `OrbitSyncAI`
- **Web Browser:** Google Chrome (used for interactive testing and headless CDP audits)

---

## 2. ⚡ How to Start the Local Development Server

Run the following commands in PowerShell from the project root (`D:\Antigravity\My Project Gaming`):

```powershell
# Set Node.js path for current session
$nodeDir = "$env:USERPROFILE\node-v20.18.0-win-x64"
$env:PATH = "$nodeDir;$env:PATH"

# Install dependencies (if not already installed)
npm install

# Start Vite live dev server
npm run dev
```

The game hub will be immediately accessible in any browser at:  
👉 **`http://localhost:5173/`**

---

## 3. 🧪 How to Run Automated Live CDP Audits

The project includes an automated Chrome DevTools Protocol (CDP) test script that boots headless Chrome, tests all 7 game components, captures screenshots, and asserts 0 console errors:

```powershell
$nodeDir = "$env:USERPROFILE\node-v20.18.0-win-x64"
$env:PATH = "$nodeDir;$env:PATH"

# Ensure dev server is running on localhost:5173, then run:
node --experimental-websocket audit_round2.mjs
```

### Verified Test Suite:
1. `Home Screen & Copyright`: Checks profile name, avatar, game mode cards, and copyright footer.
2. `Player Profile Modal`: Opens onboarding dialog, tests avatar selection, verifies DOM persistence.
3. `Store Pure Pricing & Insufficient Funds`: Confirms pure coins/diamonds, verifies custom in-game modal (zero native alerts).
4. `Lucky Wheel Live Ticking Seconds`: Confirms dual mythic themes and live 1-second interval countdown.
5. `Match Setup Modal Layout`: Validates that `PASS & PLAY (FRIENDS)` button does not overflow the 380px card.
6. `In-Game Custom Pause/Exit`: Validates in-game HUD, dice rolling, and in-game pause modal (zero browser confirm).
7. `Backup & Restore`: Validates JSON export and import modal.

---

## 4. 🤖 How to Build Android APK & AAB Locally

```powershell
$nodeDir = "$env:USERPROFILE\node-v20.18.0-win-x64"
$env:PATH = "$nodeDir;$env:PATH"

# 1. Build production web bundle
npm run build

# 2. Sync web assets into Android project
npx cap sync android

# 3. Compile Android Debug APK
cd android
./gradlew assembleDebug

# Output APK path:
# android\app\build\outputs\apk\debug\app-debug.apk

# 4. Compile Google Play Release Bundle (AAB)
./gradlew bundleRelease

# Output AAB path:
# android\app\build\outputs\bundle\release\app-release.aab
cd ..
```

---

## 5. ☁️ Cloud CI/CD Automation (GitHub Actions)

Every git push to `main` automatically triggers the GitHub Actions workflow [`.github/workflows/build-mobile-ota.yml`](file:///D:/Antigravity/My Project Gaming/.github/workflows/build-mobile-ota.yml):

1. **Android Job (Ubuntu Runner):**
   - Sets up Node 20 & Java JDK 21 (Zulu).
   - Builds web production assets with Vite.
   - Syncs Capacitor Android.
   - Executes `./gradlew assembleDebug` and `./gradlew bundleRelease`.
   - Uploads APK & AAB as workflow artifacts.
   - Automatically attaches `app-debug.apk` to the active GitHub Release.
2. **iOS Job (macOS Runner):**
   - Sets up Node 20 and syncs Capacitor iOS.
   - Builds the iOS Xcode project (`App.xcworkspace`).
   - Uploads the complete iOS bundle as a downloadable artifact.

### Useful GitHub CLI (`gh`) Commands:
```powershell
# Check current workflow status
gh run list --repo OrbitSyncAI/ludo-3d-master-pro

# Watch live build progress
gh run watch <run-id> --repo OrbitSyncAI/ludo-3d-master-pro

# Download compiled APK from GitHub Actions
gh run download <run-id> --name Ludo-3D-Master-Pro-Android-APK --dir ./downloaded_artifacts

# View latest release
gh release view v1.3.0 --repo OrbitSyncAI/ludo-3d-master-pro
```

---

## 6. 🔄 How to Resume Work Next Time

When returning to this project:
1. All specifications and rules are locked in [`project.md`](file:///D:/Antigravity/My Project Gaming/project.md).
2. Simply ask: *"Start dev server"* or *"Continue working on Ludo 3D Master Pro"*.
3. All code, assets, audio, 3D models, pricing data, and persistence states remain 100% intact and synced with GitHub.
