import fs from 'fs';

let code = fs.readFileSync('src/homeUI.js', 'utf8');

// 1. Default shop category
code = code.replace("this.shopCategory = this.shopCategory || 'mystery';", "this.shopCategory = this.shopCategory || 'ludoThemes';");

// 2. Remove mystery tab button from shop sub nav
code = code.replace(/<button class="shop-sub-tab [^"]*" data-shop-cat="mystery">[^<]*<\/button>\s*/, '');

// 3. Remove else if (this.shopCategory === 'mystery') block
const mStart = code.indexOf("} else if (this.shopCategory === 'mystery') {");
const mEnd = code.indexOf('return `\n      <div class="shop-container">');
if (mStart !== -1 && mEnd !== -1) {
  code = code.slice(0, mStart) + '}\n\n    ' + code.slice(mEnd);
  console.log('Removed mystery renderShop block');
} else {
  console.error('mStart or mEnd not found');
}

// 4. Remove triggerMysteryUnboxing and startMysteryTimerInterval
const uStart = code.indexOf('  // Suspenseful 3D Mystery Chest Unboxing');
const uEnd = code.indexOf('  // Backup Export: Dedicated Download');
if (uStart !== -1 && uEnd !== -1) {
  code = code.slice(0, uStart) + code.slice(uEnd);
  console.log('Removed triggerMysteryUnboxing & startMysteryTimerInterval');
} else {
  console.error('uStart or uEnd not found');
}

// 5. Remove mystery event listeners in attachEventListeners
const lStart = code.indexOf('    // Mystery Box Open Buttons');
const lEnd = code.indexOf('    // Spin Exclusive Buttons');
if (lStart !== -1 && lEnd !== -1) {
  code = code.slice(0, lStart) + code.slice(lEnd);
  console.log('Removed mystery event listeners');
} else {
  console.error('lStart or lEnd not found');
}

// 6. Update version chip to v1.3.9
code = code.replace(/<span class="version-chip">v1\.3\.\d+<\/span>/g, '<span class="version-chip">v1.3.9</span>');

fs.writeFileSync('src/homeUI.js', code, 'utf8');
console.log('src/homeUI.js updated successfully');
