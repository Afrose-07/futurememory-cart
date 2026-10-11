const fs = require('fs');

let content = fs.readFileSync('src/data/realProducts.js', 'utf8');
const arrayStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
let products = eval(arrayStr);

products.forEach(p => {
  const sub = p.subcategory || '';
  
  if (['Shirts', 'T-Shirts', 'Hoodies', 'Jackets', 'Tops', 'Kurtis'].includes(sub)) {
    p.sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  } else if (['Dresses'].includes(sub)) {
    p.sizes = ['XS', 'S', 'M', 'L', 'XL'];
  } else if (['Trousers', 'Jeans', 'Shorts', 'Bottoms', 'Skirts'].includes(sub)) {
    p.sizes = ['28', '30', '32', '34', '36', '38'];
  } else if (['Sarees', 'Ethnic Wear', 'Kurta'].includes(sub)) {
    p.sizes = ['Free Size'];
  } else if (p.category === 'Clothing' || p.category === "Men's Clothing" || p.category === "Women's Clothing") {
    p.sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  } else {
    delete p.sizes;
    delete p.stockBySize;
  }
  
  if (p.sizes && p.sizes.length > 0) {
    p.stockBySize = {};
    let totalStock = 0;
    p.sizes.forEach(sz => {
      // Randomly make some sizes out of stock
      const isOut = Math.random() < 0.15;
      const stock = isOut ? 0 : Math.floor(Math.random() * 20) + 1;
      p.stockBySize[sz] = stock;
      totalStock += stock;
    });
    p.stock = totalStock;
  }
});

fs.writeFileSync('src/data/realProducts.js', 'export const realProducts = ' + JSON.stringify(products, null, 2) + ';\n');
console.log('Updated sizes and stockBySize');
