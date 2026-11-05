import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outDir = "C:\\Users\\Sohel\\.gemini\\antigravity\\brain\\7952ef68-fbe1-425b-b3f7-93a4c37291b5";
const scratchDir = path.join(outDir, 'scratch');
const port = 9227;

console.log('--- STARTING TARGETED LUDO LEVEL 1 -> LEVEL 2 TEST ---');

const chrome = spawn(chromePath, [
  `--remote-debugging-port=${port}`,
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=412,915',
  '--user-data-dir=' + path.join(scratchDir, 'chrome-profile-ludo-target')
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

    // Dismiss profile modal
    await evalCode(`
      const saveBtn = document.getElementById('btn-save-profile');
      if (saveBtn) saveBtn.click();
      const pOv = document.querySelector('.profile-modal-overlay');
      if (pOv) pOv.remove();
    `);
    await wait(500);

    // Open Ludo Saga tab
    console.log('Opening Ludo Saga tab...');
    await evalCode(`
      const ludoTab = document.querySelector('[data-tab="ludo_saga"]');
      if (ludoTab) ludoTab.click();
    `);
    await wait(600);

    // Click Level 1
    console.log('Clicking Level 1...');
    await evalCode(`
      const lvl1 = document.querySelector('[data-level="1"]');
      if (lvl1) lvl1.click();
    `);
    await wait(1200);

    const initTitle = await evalCode(`return document.getElementById('current-mode-label')?.textContent;`);
    console.log('Level 1 Mode Label:', initTitle);

    // Trigger Level 1 Victory
    console.log('Triggering Level 1 victory...');
    await evalCode(`
      window.app.onMatchVictory({ id: 0, name: 'Sohel', color: { textColor: '#dc2626' } });
      return 'Victory triggered';
    `);
    await wait(800);

    // Click Next Level
    console.log('Clicking NEXT LEVEL button...');
    const clickRes = await evalCode(`
      const nextBtn = document.getElementById('btn-win-next');
      if (nextBtn) {
        nextBtn.click();
        return 'Clicked nextBtn';
      }
      return 'nextBtn NOT FOUND';
    `);
    console.log('Next button click result:', clickRes);
    await wait(1500);

    const nextTitle = await evalCode(`return document.getElementById('current-mode-label')?.textContent;`);
    console.log('Level 2 Mode Label after transition:', nextTitle);
    await capture('proof_v1_3_4_ludo_level2_active_clean.png');

    // Roll dice in Level 2
    console.log('Rolling dice in Level 2...');
    const rollRes = await evalCode(`
      const rollBtn = document.getElementById('btn-roll');
      if (rollBtn) {
        rollBtn.click();
        return 'Roll clicked';
      }
      return 'Roll btn not found';
    `);
    console.log('Roll button result:', rollRes);
    await wait(1800);
    await capture('proof_v1_3_4_ludo_level2_after_roll_clean.png');

    console.log('--- LUDO TRANSITION TEST COMPLETE ---');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    if (ws) ws.close();
    chrome.kill();
    process.exit(0);
  }
}

run();
