import fs from 'fs';

const content = fs.readFileSync('src/data/canonicalCatalog.js', 'utf8');
const catalog = JSON.parse(content.slice(content.indexOf('['), content.lastIndexOf(']') + 1));

const sample = [
  catalog.find(p => p.id === 'WF-01'), // Kurti Set
  catalog.find(p => p.id === 'WF-03'), // Silk Saree
  catalog.find(p => p.id === 'MF-01'), // Formal Shirt
  catalog.find(p => p.id === 'MF-02'), // Casual Shirt
  catalog.find(p => p.id === 'MF-06'), // Jeans
  catalog.find(p => p.id === 'GC-01'), // Personalized Mug
  catalog.find(p => p.id === 'GC-04'), // Gift Hamper
  catalog.find(p => p.id === 'WT-01'), // Watch
  catalog.find(p => p.id === 'BG-01'), // Handbag
  catalog.find(p => p.id === 'EG-05')  // Earbuds
];

async function check() {
  console.log('Testing sample product images:');
  for (const p of sample) {
    if (!p) continue;
    try {
      const res = await fetch(p.image, { method: 'HEAD' });
      console.log(`- [${p.id}] ${p.name} (${p.category}) -> HTTP ${res.status}`);
    } catch(e) {
      console.log(`- [${p.id}] ${p.name} -> Error: ${e.message}`);
    }
  }
}
check();
