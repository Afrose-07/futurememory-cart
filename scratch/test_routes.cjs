const http = require('http');

const routes = ['/', '/cart', '/profile', '/shop', '/settings', '/wishlist', '/admin/login'];

async function testAll() {
  for (const r of routes) {
    await new Promise(resolve => {
      http.get({ host: '127.0.0.1', port: 5173, path: r, headers: { 'Accept': 'text/html' } }, res => {
        console.log(`[ROUTE CHECK] ${r} -> HTTP ${res.statusCode} (content-type: ${res.headers['content-type']})`);
        resolve();
      }).on('error', e => {
        console.error(`[ROUTE CHECK] ${r} -> ERROR: ${e.message}`);
        resolve();
      });
    });
  }
}

testAll();
