const fs = require('fs');
let c = fs.readFileSync('src/components/ProductCard.jsx', 'utf8');
c = c.replace(/\{isInWishlist\(product\.id\) \? '❤️' : '[^']+'\}/, "{isInWishlist(product.id) ? '❤️' : '🤍'}");
fs.writeFileSync('src/components/ProductCard.jsx', c, 'utf8');
console.log('Fixed ProductCard heart');
