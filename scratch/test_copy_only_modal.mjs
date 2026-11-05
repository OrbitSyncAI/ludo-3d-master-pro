import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outDir = "C:\\Users\\Sohel\\.gemini\\antigravity\\brain\\7952ef68-fbe1-425b-b3f7-93a4c37291b5";
const scratchDir = path.join(outDir, 'scratch');
const port = 9228;

console.log('--- CAPTURING ONLY COPY CODE & ONLY PASTE CODE MODALS ---');

const chrome = spawn(chromePath, [
  `--remote-debugging-port=${port}`,
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=412,915',
  '--user-data-dir=' + path.join(scratchDir, 'chrome-profile-copy-only')
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

    // Dismiss onboarding modal
    await evalCode(`
      const saveBtn = document.getElementById('btn-save-profile');
      if (saveBtn) saveBtn.click();
      const pOv = document.querySelector('.profile-modal-overlay');
      if (pOv) pOv.remove();
    `);
    await wait(500);

    // 1. CAPTURE ONLY COPY CODE EXPORT MODAL
    console.log('Opening Export Modal (Only Copy Code)...');
    await evalCode(`
      const hamburger = document.getElementById('btn-hamburger');
      if (hamburger) hamburger.click();
    `);
    await wait(400);

    await evalCode(`
      const exportBtn = document.querySelector('[data-drawer-action="export-backup"]');
      if (exportBtn) exportBtn.click();
    `);
    await wait(600);
    await capture('proof_only_copy_code_export_modal.png');

    // Click Copy button to test
    console.log('Clicking Copy Code button...');
    await evalCode(`
      const copyBtn = document.getElementById('btn-trigger-copy');
      if (copyBtn) copyBtn.click();
    `);
    await wait(400);
    await capture('proof_only_copy_code_export_copied.png');

    // Close export modal
    await evalCode(`
      const closeBtn = document.getElementById('btn-close-export');
      if (closeBtn) closeBtn.click();
    `);
    await wait(400);

    // 2. CAPTURE ONLY PASTE CODE IMPORT MODAL
    console.log('Opening Import Modal (Only Paste Code)...');
    await evalCode(`
      const hamburger = document.getElementById('btn-hamburger');
      if (hamburger) hamburger.click();
    `);
    await wait(400);

    await evalCode(`
      const importBtn = document.querySelector('[data-drawer-action="import-backup"]');
      if (importBtn) importBtn.click();
    `);
    await wait(600);
    await capture('proof_only_paste_code_import_modal.png');

    console.log('--- ALL MODAL SCREENSHOTS CAPTURED ---');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    if (ws) ws.close();
    chrome.kill();
    process.exit(0);
  }
}

run();
