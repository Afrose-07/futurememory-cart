const fs = require('fs');
const p = 'src/pages/OrderHistoryPage.jsx';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/const handleBuyAgain = \(item\) => \{[\s\S]*?alert\(\`Added \$\{item\.name\} to Cart!\`\);\r?\n  \};/,
`const handleBuyAgain = (item) => {
    let liveProduct = allProductsCatalog.find(p => String(p.id) === String(item.productId || item.id));
    let currentStock = liveProduct ? liveProduct.stock : item.stock;
    
    if (liveProduct && item.size && liveProduct.stockBySize) {
      currentStock = liveProduct.stockBySize[item.size] !== undefined ? liveProduct.stockBySize[item.size] : currentStock;
    }

    if (currentStock === 0) {
      alert(\`Sorry, \${item.name} is currently out of stock.\`);
      return;
    }
    
    addToCart(item, 1);
    alert(\`Added \${item.name} to Cart!\`);
  };`
);
fs.writeFileSync(p, c);
