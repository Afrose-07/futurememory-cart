const fs = require('fs');

const decoder = new TextDecoder('windows-1252');
const reverseMap = new Map();
for (let i = 0; i < 256; i++) {
  const char = decoder.decode(new Uint8Array([i]));
  // some bytes map to same char? 0x81, 0x8D, 0x8F, 0x90, 0x9D are undefined in windows-1252
  // TextDecoder maps them to replacement char U+FFFD.
  // Wait, if it was U+FFFD, the information is lost!
  reverseMap.set(char, i);
}
// Let's add the raw bytes for the undefined ones just in case Node mapped them to control chars or something.
// Actually, let's see what Node does:
for (let i of [0x81, 0x8D, 0x8F, 0x90, 0x9D]) {
    // they might have been mapped to themselves? Or to something else?
}

function fixString(str) {
  let bytes = [];
  let i = 0;
  while (i < str.length) {
    let char = str[i];
    if (reverseMap.has(char) && char !== 'ï' && char !== '¿' && char !== '½') { 
        // Wait, U+FFFD is ''.
        if (char === '') {
             // We can't know what byte it was, assume it was one of the undefined ones, but which one?
             // Usually it's not present.
        }
        bytes.push(reverseMap.get(char));
    } else {
        // If it's not in the map (e.g. it was added after garbling, or it's a surrogate pair)
        // just encode it as UTF-8 bytes and push them
        const utf8Bytes = new TextEncoder().encode(str[i]);
        for(let b of utf8Bytes) bytes.push(b);
    }
    i++;
  }
  
  // Now try to decode the bytes as UTF-8
  try {
      // we might have invalid utf-8 sequences if we mixed things up.
      return new TextDecoder('utf-8', {fatal: true}).decode(new Uint8Array(bytes));
  } catch (e) {
      return null;
  }
}

const content = fs.readFileSync('src/data/translations.js', 'utf8');
const fixed = fixString(content);
if (fixed) {
    fs.writeFileSync('src/data/translations.js', fixed, 'utf8');
    console.log("Success");
} else {
    console.log("Failed to decode cleanly");
}
