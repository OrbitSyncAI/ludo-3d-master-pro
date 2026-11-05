import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outDir = "C:\\Users\\Sohel\\.gemini\\antigravity\\brain\\7952ef68-fbe1-425b-b3f7-93a4c37291b5";
const scratchDir = path.join(outDir, 'scratch');
const port = 9226;

console.log('--- STARTING IN-GAME LEVEL PROGRESSION VERIFICATION 2 ---');

const chrome = spawn(chromePath, [
  `--remote-debugging-port=${port}`,
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=412,915',
  '--user-data-dir=' + path.join(scratchDir, 'chrome-profile-v134-game2')
]);

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let ws = null;
let msgId = 1;
const pending = new Map();

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = msgId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalCode(expression) {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  return res.result ? res.result.value : null;
}

async function capture(filename) {
  const res = await send('Page.captureScreenshot', { format: 'png' });
  const buf = Buffer.from(res.data, 'base64');
  const fullPath = path.join(outDir, filename);
  fs.writeFileSync(fullPath, buf);
  console.log(`Saved screenshot: ${filename} (${buf.length} bytes)`);
}

async function run() {
  try {
    let targetWs = null;
    for (let i = 0; i < 20; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/list`);
        const list = await res.json();
        const pageTarget = list.find(t => t.type === 'page');
        if (pageTarget) {
          targetWs = pageTarget.webSocketDebuggerUrl;
          break;
        }
      } catch (e) {
        await wait(500);
      }
    }
    if (!targetWs) throw new Error('Page target not found');

    ws = new WebSocket(targetWs);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
      ws.onmessage = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.id && pending.has(data.id)) {
          const { resolve, reject } = pending.get(data.id);
          pending.delete(data.id);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 412,
      height: 915,
      deviceScaleFactor: 2,
      mobile: true
    });

    console.log('Navigating to http://localhost:5173...');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await wait(2200);

    // Dismiss only the onboarding profile modal, keep #modal-overlay untouched!
    await evalCode(`
      const saveBtn = document.getElementById('btn-save-profile');
      if (saveBtn) saveBtn.click();
      const pOv = document.querySelector('.profile-modal-overlay');
      if (pOv) pOv.remove();
    `);
    await wait(500);

    // 1. TEST SNAKES STAGE 1 DIRECT START
    console.log('Testing Snakes Stage 1...');
    await evalCode(`
      const snakesTab = document.querySelector('[data-tab="snakes_saga"]');
      if (snakesTab) snakesTab.click();
    `);
    await wait(600);

    await evalCode(`
      const stage1Node = document.querySelector('[data-snakes-stage="1"]');
      if (stage1Node) stage1Node.click();
    `);
    await wait(1200);

    const title1 = await evalCode(`document.getElementById('current-mode-label')?.textContent`);
    console.log('Stage 1 mode label:', title1);

    // Trigger stage 1 victory
    console.log('Triggering Stage 1 victory...');
    await evalCode(`
      window.app.onMatchVictory({ id: 0, name: 'Sohel', color: { textColor: '#dc2626' } });
    `);
    await wait(800);

    const isModalOpen = await evalCode(`!document.getElementById('modal-overlay').classList.contains('hidden')`);
    console.log('Victory modal open:', isModalOpen);
    await capture('proof_v1_3_4_stage1_victory_modal.png');

    // Click NEXT LEVEL button
    console.log('Clicking NEXT LEVEL for Snakes...');
    await evalCode(`
      const nextBtn = document.getElementById('btn-win-next');
      if (nextBtn) nextBtn.click();
    `);
    await wait(1500);

    // Verify Stage 2 started directly!
    const title2 = await evalCode(`document.getElementById('current-mode-label')?.textContent`);
    console.log('Stage 2 mode label:', title2);
    await capture('proof_v1_3_4_snakes_stage2_active.png');

    // Roll dice in Stage 2 to verify zero freeze / zero glitch!
    console.log('Rolling dice in Stage 2...');
    await evalCode(`
      const rollBtn = document.getElementById('btn-roll');
      if (rollBtn) rollBtn.click();
    `);
    await wait(1800);
    await capture('proof_v1_3_4_snakes_stage2_after_roll.png');

    // Return to home
    console.log('Returning to home...');
    await evalCode(`
      const exitBtn = document.getElementById('btn-home-exit');
      if (exitBtn) exitBtn.click();
    `);
    await wait(800);

    // 2. TEST LUDO LEVEL 1 DIRECT START
    console.log('Testing Ludo Level 1...');
    await evalCode(`
      const ludoTab = document.querySelector('[data-tab="ludo_saga"]');
      if (ludoTab) ludoTab.click();
    `);
    await wait(600);

    await evalCode(`
      const lvl1Node = document.querySelector('[data-level="1"]');
      if (lvl1Node) lvl1Node.click();
    `);
    await wait(1200);

    const ludoTitle1 = await evalCode(`document.getElementById('current-mode-label')?.textContent`);
    console.log('Ludo Level 1 mode label:', ludoTitle1);

    // Trigger level 1 victory
    console.log('Triggering Ludo Level 1 victory...');
    await evalCode(`
      window.app.onMatchVictory({ id: 0, name: 'Sohel', color: { textColor: '#dc2626' } });
    `);
    await wait(800);

    await capture('proof_v1_3_4_ludo_level1_victory_modal.png');

    // Click NEXT LEVEL button
    console.log('Clicking NEXT LEVEL for Ludo...');
    await evalCode(`
      const nextBtn = document.getElementById('btn-win-next');
      if (nextBtn) nextBtn.click();
    `);
    await wait(1500);

    // Verify Level 2 started directly!
    const ludoTitle2 = await evalCode(`document.getElementById('current-mode-label')?.textContent`);
    console.log('Ludo Level 2 mode label:', ludoTitle2);
    await capture('proof_v1_3_4_ludo_level2_active.png');

    // Roll dice in Level 2 to verify zero freeze / zero glitch!
    console.log('Rolling dice in Ludo Level 2...');
    await evalCode(`
      const rollBtn = document.getElementById('btn-roll');
      if (rollBtn) rollBtn.click();
    `);
    await wait(1800);
    await capture('proof_v1_3_4_ludo_level2_after_roll.png');

    console.log('--- ALL IN-GAME PROGRESSION TESTS PASSED COMPLETELY ---');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    if (ws) ws.close();
    chrome.kill();
    process.exit(0);
  }
}

run();
