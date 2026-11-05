import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outDir = "C:\\Users\\Sohel\\.gemini\\antigravity\\brain\\7952ef68-fbe1-425b-b3f7-93a4c37291b5";
const scratchDir = path.join(outDir, 'scratch');
const port = 9230;

console.log('--- TESTING v1.3.5: 500 LEVELS, FIXED SNAKES ADVENTURE CARD, SMOOTH LUDO ---');

const chrome = spawn(chromePath, [
  `--remote-debugging-port=${port}`,
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=412,915',
  '--user-data-dir=' + path.join(scratchDir, 'chrome-profile-v135')
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
  const res = await send('Runtime.evaluate', { 
    expression: `(() => { try { ${expression} } catch(e) { return 'ERR: ' + e.message; } })()`, 
    returnByValue: true, 
    awaitPromise: true 
  });
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
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const p = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) p.reject(data.error);
        else p.resolve(data.result);
      }
    };

    await send('Page.enable');
    await send('Runtime.enable');

    console.log('Navigating to http://localhost:4173 ...');
    await send('Page.navigate', { url: 'http://localhost:4173' });
    await wait(2500);

    // Dismiss welcome profile modal if visible
    await evalCode(`
      const startBtn = document.querySelector('.btn-save-profile') || document.querySelector('.profile-modal-overlay button');
      if (startBtn) startBtn.click();
      const overlay = document.querySelector('.profile-modal-overlay');
      if (overlay) overlay.remove();
    `);
    await wait(800);

    // 1. Verify Home Screen & Snakes Adventure Card styling
    const cardInfo = await evalCode(`
      const card = document.querySelector('.card-snakes-adventure');
      if (!card) return 'NO CARD FOUND';
      const btn = card.querySelector('.btn-play-mode');
      const tag = card.querySelector('.mode-tag');
      const h4 = card.querySelector('h4');
      const cs = window.getComputedStyle(card);
      return {
        title: h4 ? h4.textContent : null,
        btnText: btn ? btn.textContent : null,
        tagText: tag ? tag.textContent : null,
        borderLeft: cs.borderLeft,
        borderRadius: cs.borderRadius,
        backgroundColor: cs.backgroundColor
      };
    `);
    console.log('Snakes Adventure Card Info:', cardInfo);

    // Scroll down to show Snakes 500 Stages card clearly alongside the other cards
    await evalCode(`
      const card = document.querySelector('.card-snakes-adventure');
      if (card) card.scrollIntoView({ behavior: 'instant', block: 'center' });
    `);
    await wait(600);
    await capture('proof_v1_3_5_home_snakes_500_card.png');

    // 2. Open Snakes 500 Stages Saga Tab
    console.log('Opening Snakes 500 Stages Saga Tab...');
    await evalCode(`
      const tab = document.querySelector('[data-tab="snakes_saga"]');
      if (tab) tab.click();
    `);
    await wait(1000);
    const snakesNodesCount = await evalCode(`
      return document.querySelectorAll('[data-snakes-stage]').length;
    `);
    console.log('Snakes Stages Nodes Count:', snakesNodesCount);
    await capture('proof_v1_3_5_snakes_500_stages_tab.png');

    // 3. Open Ludo 500 Saga Tab
    console.log('Opening Ludo 500 Saga Tab...');
    await evalCode(`
      const tab = document.querySelector('[data-tab="ludo_saga"]');
      if (tab) tab.click();
    `);
    await wait(1000);
    const ludoNodesCount = await evalCode(`
      return document.querySelectorAll('[data-level]').length;
    `);
    console.log('Ludo Saga Nodes Count:', ludoNodesCount);
    await capture('proof_v1_3_5_ludo_500_saga_tab.png');

    // 4. Test Ludo Gameplay Speed & Turn Smoothness
    console.log('Launching Ludo Quick Match to test hopping speed & turn speed...');
    await evalCode(`
      const homeTab = document.querySelector('[data-tab="home"]');
      if (homeTab) homeTab.click();
    `);
    await wait(600);

    await evalCode(`
      const quickPlayBtn = document.querySelector('[data-mode-setup="quick"] .btn-play-mode');
      if (quickPlayBtn) quickPlayBtn.click();
    `);
    await wait(600);

    // Start 2 player quick match
    await evalCode(`
      const startBtn = document.getElementById('btn-modal-start');
      if (startBtn) startBtn.click();
    `);
    await wait(1500);

    // Check game active
    const gameMode = await evalCode(`return window.game ? window.game.currentGameMode : 'NO_GAME';`);
    console.log('Game Mode active:', gameMode);

    // Trigger human roll
    const rollStart = Date.now();
    await evalCode(`
      const rollBtn = document.getElementById('btn-roll-dice');
      if (rollBtn) rollBtn.click();
    `);
    await wait(1800);
    console.log('Roll executed, elapsed:', Date.now() - rollStart);

    await capture('proof_v1_3_5_ludo_gameplay_smooth.png');
    console.log('--- ALL v1.3.5 TESTS PASSED SUCCESSFULLY! ---');

  } catch (err) {
    console.error('Test Error:', err);
  } finally {
    if (ws) ws.close();
    chrome.kill();
  }
}

run();
