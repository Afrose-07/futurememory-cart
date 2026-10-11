const fs = require('fs');
const path = require('path');

const decoder = new TextDecoder('windows-1252');
const reverseMap = new Map();
for (let i = 0; i < 256; i++) {
  reverseMap.set(decoder.decode(new Uint8Array([i])), i);
}

function fixFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    let bytes = [];
    for (let i = 0; i < content.length; i++) {
        let char = content[i];
        if (reverseMap.has(char)) {
            bytes.push(reverseMap.get(char));
        } else {
            const utf8Bytes = new TextEncoder().encode(char);
            for(let b of utf8Bytes) bytes.push(b);
        }
    }
    
    try {
        let fixed = new TextDecoder('utf-8', {fatal: true}).decode(new Uint8Array(bytes));
        if (fixed !== content) {
            fs.writeFileSync(file, fixed, 'utf8');
            console.log('Fixed entire file:', file);
        }
    } catch (e) {
        // If it throws, it means our assumption was wrong for this file (e.g., intentional Latin-1 chars).
        // Let's fallback to regex approach just for the garbled symbols the user mentioned
        console.log('Could not blanket decode', file, '- fallback to specific replacements');
        
        let c = content;
        c = c.replace(/ï¸/g, '️'); // This is U+FE0F, but wait, usually it's preceded by something.
        // Actually, let's just do exact string replacements for the emojis in the screenshots
        // "ï¸ Add to Cart" -> "🛍️ Add to Cart" (Wait, Add to Cart has 🛒 or 🛍️)
        // Let's replace 'ï¸' with '' and let the icon component render, or replace the whole string.
        // In the screenshot, it's a generic shopping bag/cart.
        // rating is "â˜…" which is ★.
        c = c.replace(/â˜…/g, '★');
        c = c.replace(/ðŸ¤–/g, '🤖');
        c = c.replace(/ï¸/g, '️'); 
        
        if (c !== content) {
            fs.writeFileSync(file, c, 'utf8');
            console.log('Fixed specifically:', file);
        }
    }
}

function walkSync(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walkSync(filepath);
    } else if (filepath.endsWith('.js') || filepath.endsWith('.jsx') || filepath.endsWith('.ts') || filepath.endsWith('.tsx')) {
      fixFile(filepath);
    }
  }
}

walkSync('src/components');
walkSync('src/pages');
console.log('Done.');
