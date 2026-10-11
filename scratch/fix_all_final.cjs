const fs = require('fs');
const path = require('path');

const decoder = new TextDecoder('windows-1252');
const reverseMap = new Map();
for (let i = 0; i < 256; i++) {
  const char = decoder.decode(new Uint8Array([i]));
  reverseMap.set(char, i);
}

function fixString(str) {
  let bytes = [];
  let i = 0;
  while (i < str.length) {
    let char = str[i];
    if (reverseMap.has(char)) {
        bytes.push(reverseMap.get(char));
    } else {
        const utf8Bytes = new TextEncoder().encode(str[i]);
        for(let b of utf8Bytes) bytes.push(b);
    }
    i++;
  }
  
  try {
      return new TextDecoder('utf-8', {fatal: true}).decode(new Uint8Array(bytes));
  } catch (e) {
      return null;
  }
}

function fixFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Match everything inside quotes
    content = content.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match, p1) => {
        const fixed = fixString(p1);
        if (fixed && fixed !== p1) {
            changed = true;
            return '"' + fixed + '"';
        }
        return match;
    });

    // Also match template literals or single quotes
    content = content.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, (match, p1) => {
        const fixed = fixString(p1);
        if (fixed && fixed !== p1) {
            changed = true;
            return "'" + fixed + "'";
        }
        return match;
    });
    
    // Also match backticks
    content = content.replace(/`([^`\\]*(\\.[^`\\]*)*)`/g, (match, p1) => {
        const fixed = fixString(p1);
        if (fixed && fixed !== p1) {
            changed = true;
            return "`" + fixed + "`";
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
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

walkSync('src');
console.log('Done scanning all files in src.');
