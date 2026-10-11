const fs = require('fs');

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
      return null; // Don't replace if it's invalid UTF-8
  }
}

let content = fs.readFileSync('src/data/translations.js', 'utf8');

// Match everything inside quotes
content = content.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match, p1) => {
    const fixed = fixString(p1);
    if (fixed) {
        return '"' + fixed + '"';
    }
    return match;
});

// Also match template literals if needed, or single quotes
content = content.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, (match, p1) => {
    const fixed = fixString(p1);
    if (fixed) {
        return "'" + fixed + "'";
    }
    return match;
});

fs.writeFileSync('src/data/translations.js', content, 'utf8');
console.log('Fixed strings in translations.js');
