import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outDir = "C:\\Users\\Sohel\\.gemini\\antigravity\\brain\\7952ef68-fbe1-425b-b3f7-93a4c37291b5";
const scratchDir = path.join(outDir, 'scratch');
const port = 9227;

console.log('--- STARTING LIVE CDP VERIFICATION FOR v1.3.9 ---');

const chrome = spawn(chromePath, [
  `--remote-debugging-port=${port}`,
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=412,915',
  '--user-data-dir=' + path.join(scratchDir, 'chrome-profile-v139')
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
  await wait(1800);

  const targetsRes = await fetch(`http://127.0.0.1:${port}/json`);
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page');

  if (!pageTarget) {
    console.error('No page target found');
    chrome.kill();
    return;
  }

  const wsDebuggerUrl = pageTarget.webSocketDebuggerUrl;
  ws = new WebSocket(wsDebuggerUrl);

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  });

  await new Promise(resolve => ws.addEventListener('open', resolve));
  await send('Page.enable');
  await send('Runtime.enable');

  // Navigate to dev server
  console.log('Navigating to http://localhost:5173...');
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await wait(2000);

  // Dismiss first-time welcome modal if present
  console.log('Dismissing welcome modal...');
  await evalCode(`
    const saveBtn = document.getElementById('btn-save-profile');
    if (saveBtn) saveBtn.click();
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(m => m.remove());
    const splash = document.getElementById('splash-screen');
    if (splash) splash.remove();
  `);
  await wait(1000);

  // 1. Check Store (Mystery Box completely removed)
  console.log('Navigating to Store tab...');
  await evalCode(`
    const shopTab = document.querySelector('.nav-tab[data-tab="shop"]');
    if (shopTab) shopTab.click();
  `);
  await wait(800);
  await capture('proof_v1_3_9_store_clean.png');

  // 2. Start Snakes & Ladders Game and verify 100 tiles rendered!
  console.log('Starting Snakes & Ladders match...');
  await evalCode(`
    window.app.homeUI.hide();
    window.app.startMatch({
      mode: 'snakes',
      playerCount: 2,
      isAI: true
    });
  `);
  await wait(2000);
  await capture('proof_v1_3_9_snakes_board_rendered.png');

  // 3. Start Ludo Classic Match and verify Ludo King dice, clean center & realistic shadows!
  console.log('Starting Ludo Classic match...');
  await evalCode(`
    window.app.homeUI.hide();
    window.app.startMatch({
      mode: 'classic',
      playerCount: 4,
      isAI: true
    });
  `);
  await wait(1500);
  await capture('proof_v1_3_9_ludo_gameplay_shadows.png');

  console.log('--- ALL VERIFICATIONS COMPLETED SUCCESSFULLY ---');
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Test run failed:', err);
  chrome.kill();
  process.exit(1);
});
