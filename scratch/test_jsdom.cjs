const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = `<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>`;
const dom = new JSDOM(html, {
  url: 'http://localhost:5173/home',
  runScripts: 'dangerously',
  resources: 'usable'
});

dom.window.addEventListener('error', (event) => {
  console.error('CAPTURE ERROR:', event.error || event.message);
  if (event.error?.stack) console.error(event.error.stack);
});

// Set mock localStorage for logged in user 'afrose'
dom.window.localStorage.setItem('fm_user', JSON.stringify({
  name: 'afrose',
  email: 'afromalik07@gmail.com',
  role: 'customer'
}));

const distFiles = fs.readdirSync('dist/assets');
const jsFile = distFiles.find(f => f.endsWith('.js'));
const code = fs.readFileSync(`dist/assets/${jsFile}`, 'utf8');

try {
  dom.window.eval(code);
  setTimeout(() => {
    const root = dom.window.document.getElementById('root');
    console.log('ROOT HTML:', root ? root.innerHTML.slice(0, 300) : 'NO ROOT');
    process.exit(0);
  }, 1000);
} catch (err) {
  console.error('EVAL ERROR:', err);
  process.exit(1);
}
