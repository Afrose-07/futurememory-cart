const https = require('https');
const fs = require('fs');
const path = require('path');

https.get('https://dummyjson.com/products?limit=100', (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const products = JSON.parse(data).products;
    const formattedProducts = products.map((p) => {
      const currentPrice = Math.round(p.price * 80); // convert to INR approx
      const orig = Math.round(currentPrice / (1 - p.discountPercentage / 100));
      return {
        id: p.id,
        name: p.title,
        occasionId: 'all',
        occasionName: 'All Occasions',
        category: p.category,
        description: p.description,
        image: p.thumbnail,
        rating: p.rating,
        reviewsCount: p.reviews ? p.reviews.length * 15 : Math.floor(Math.random() * 500),
        originalPrice: orig,
        currentPrice: currentPrice,
        discount: Math.round(p.discountPercentage),
        color: 'Standard',
        occasionTags: [p.category],
        features: ["10 Days Easy Return & Replacement Guarantee", "100% Genuine Quality"],
        inStock: p.stock > 0,
        sku: `FM-PROD-${p.id}`
      };
    });

    const fileContent = `export const realProducts = ${JSON.stringify(formattedProducts, null, 2)};\n`;
    fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'realProducts.js'), fileContent);
    console.log('Real products generated successfully.');
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});
