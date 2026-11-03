/**
 * Ludo 3D Master Pro - Silent Background OTA Live Updater
 * Checks for latest releases and updates assets seamlessly in the background without disturbing user gameplay.
 * Developer: Sohel | Raebareli, UP - 229001
 */

import { PUBLISHER_INFO } from './privacyAndTerms.js';

export class LiveUpdater {
  constructor() {
    this.repoOwner = 'OrbitSyncAI';
    this.repoName = 'ludo-3d-master-pro';
    this.currentVersion = PUBLISHER_INFO.version;
    this.updateAvailable = false;
    this.latestRelease = null;
  }

  // Start silent background update check
  initSilentUpdate() {
    // 1. Silent ServiceWorker Cache Updater
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update().catch(() => {});
      }).catch(() => {});
    }

    // 2. Silent GitHub Releases OTA Check
    setTimeout(() => {
      this.checkGitHubReleaseSilently();
    }, 15000); // 15s after boot to ensure smooth start
  }

  async checkGitHubReleaseSilently() {
    try {
      const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/releases/latest`;
      const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
      if (!res.ok) return;

      const data = await res.json();
      if (data && data.tag_name) {
        this.latestRelease = data;
        const remoteTag = data.tag_name.replace(/^v/, '');
        const localTag = this.currentVersion.replace(/^v/, '');

        if (this.compareSemver(remoteTag, localTag) > 0) {
          this.updateAvailable = true;
          // Silently cache/download metadata
          try {
            localStorage.setItem('ludo_3d_latest_ota_version', data.tag_name);
            if (data.assets && data.assets.length > 0) {
              const apkAsset = data.assets.find(a => a.name.endsWith('.apk'));
              if (apkAsset) {
                localStorage.setItem('ludo_3d_latest_apk_url', apkAsset.browser_download_url);
              }
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      // Completely silent - never disrupt player
    }
  }

  compareSemver(v1, v2) {
    const p1 = v1.split('.').map(n => parseInt(n) || 0);
    const p2 = v2.split('.').map(n => parseInt(n) || 0);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const num1 = p1[i] || 0;
      const num2 = p2[i] || 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  }
}

export const liveUpdater = new LiveUpdater();
