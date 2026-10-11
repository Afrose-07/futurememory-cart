const fs = require('fs');

const path = 'src/pages/ProductDetailsPage.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /className=\{\`details-wishlist-btn \$\{isInWishlist\(product\.id\) \? 'active' : ''\}\`\}/g,
  "className={`details-wishlist-btn ${isInWishlist({ ...product, size: selectedSize }) ? 'active' : ''}`}"
);

content = content.replace(
  /toggleWishlist\(product\);/g,
  "toggleWishlist({ ...product, size: selectedSize });"
);

content = content.replace(
  /\{isInWishlist\(product\.id\) \? '(.*?)' : '(.*?)'\}/g,
  "{isInWishlist({ ...product, size: selectedSize }) ? '$1' : '$2'}"
);

fs.writeFileSync(path, content);
console.log('Updated PDP successfully');
