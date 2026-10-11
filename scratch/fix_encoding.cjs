const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../src');

const replacements = {
  'â‚¹': '₹',
  'â€¢': '•',
  'â€”': '—',
  'â†’': '→',
  'âœ“': '✓',
  'à®¤à®®à®¿à®´à¯ ': 'தமிழ்',
  'à´®à´²à´¯à´¾à´³à´‚': 'മലയാളം',
  'à²•à²¨à³ à²¨à²¡': 'ಕನ್ನಡ',
  'à°¤à±†à°²à± à°—à± ': 'తెలుగు',
  'Ã¢â\x82¬': '—',
  'Ã¢â\x82¬â\x84¢': "'",
  'Ã¢â\x82¬Å\x93': '"',
  'Ã¢â\x82¬Â\x9D': '"',
  'ï¸ ': '' // just remove the broken variation selector
};

// Also let's handle the specific subtitle in HomePage
// "CURATED GIFTS Ã¢â‚¬ 7-DAYS RETURN"
// wait, the 'Ã¢â‚¬' is because '—' (UTF-8 E2 80 94) -> 'â€”' -> 'Ã¢â‚¬â€\x9d' ... it's getting mangled twice.
// Let's just fix the files one by one by searching for these strings.

function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walkSync(filepath, filelist);
    } else if (filepath.endsWith('.js') || filepath.endsWith('.jsx') || filepath.endsWith('.ts') || filepath.endsWith('.tsx') || filepath.endsWith('.css')) {
      filelist.push(filepath);
    }
  }
  return filelist;
}

const allFiles = walkSync(srcPath);
let changedFiles = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Add an extra pass for the double-mangled dash
  content = content.replace(/Ã¢â‚¬/g, '—');
  content = content.replace(/Ã¢â¬/g, '—');
  
  for (const [bad, good] of Object.entries(replacements)) {
    content = content.split(bad).join(good);
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
    changedFiles++;
  }
});

console.log(`Fixed ${changedFiles} files`);
