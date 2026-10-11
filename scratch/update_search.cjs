const fs = require('fs');
let code = fs.readFileSync('src/pages/ShopPage.jsx', 'utf8');

const oldSearchBlock = /if \(parsedQuery\) \{[\s\S]*?return true;\s*\}/;
const newSearchBlock = `if (parsedQuery) {
          const searchWords = parsedQuery.split(/\\s+/);
          
          const name = (p.name || '').toLowerCase();
          const cat = (p.category || '').toLowerCase();
          const sub = (p.subcategory || '').toLowerCase();
          const gender = (p.gender || '').toLowerCase();
          const color = (p.color?.name || '').toLowerCase();
          const tags = (p.tags || []).join(' ').toLowerCase();

          const isMatch = searchWords.every(word => {
            return name.includes(word) ||
                   cat.includes(word) ||
                   sub.includes(word) ||
                   gender.includes(word) ||
                   color.includes(word) ||
                   tags.includes(word);
          });
          
          if (!isMatch) return false;
        }

        return true;`;

code = code.replace(oldSearchBlock, newSearchBlock);

fs.writeFileSync('src/pages/ShopPage.jsx', code);
console.log('Search logic updated');
