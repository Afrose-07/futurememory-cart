const fs = require('fs');

const structure = {
  'Men': ['Shirts', 'T-Shirts', 'Jeans', 'Trousers', 'Hoodies', 'Jackets', 'Blazers', 'Kurta', 'Ethnic Wear', 'Shorts'],
  'Women': ['Dresses', 'Tops', 'T-Shirts', 'Jeans', 'Trousers', 'Skirts', 'Kurtis', 'Sarees', 'Jackets', 'Ethnic Wear'],
  'Kids': ['T-Shirts', 'Shirts', 'Dresses', 'Jeans', 'Shorts', 'Ethnic Wear']
};

const imageMap = {
  'Shirts': 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=500',
  'T-Shirts': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
  'Jeans': 'https://images.unsplash.com/photo-1542272604-780c8d52a5ce?w=500',
  'Trousers': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500',
  'Hoodies': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
  'Jackets': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
  'Blazers': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500',
  'Kurta': 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=500',
  'Ethnic Wear': 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500',
  'Shorts': 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500',
  'Dresses': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
  'Tops': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500',
  'Skirts': 'https://images.unsplash.com/photo-1583496661160-c5a882a8ec86?w=500',
  'Kurtis': 'https://images.unsplash.com/photo-1583391733959-b148fa75f469?w=500',
  'Sarees': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500'
};

const sizesMap = {
  'Jeans': ['28', '30', '32', '34', '36', '38'],
  'Trousers': ['28', '30', '32', '34', '36', '38'],
  'Shorts': ['28', '30', '32', '34', '36', '38']
};
const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL'];

const newProducts = [];
let idCounter = 1;

for (const [gender, subcats] of Object.entries(structure)) {
  for (const sub of subcats) {
    // Generate 4 unique products for each subcategory
    for (let i = 1; i <= 4; i++) {
      const code = `${gender.substring(0,3).toUpperCase()}-${sub.substring(0,4).toUpperCase().replace(/-/g,'')}-${String(i).padStart(3, '0')}`;
      const model = `${gender.substring(0,1)}${sub.substring(0,1)}${String(idCounter).padStart(3, '0')}`;
      
      let price = Math.floor(Math.random() * 2000) + 500;
      let orig = price + 500;
      let disc = Math.round(((orig - price)/orig)*100);
      
      let image = imageMap[sub] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500';
      
      newProducts.push({
        id: code,
        modelId: model,
        name: `${gender}'s ${sub} Edition ${i}`,
        gender: gender,
        category: 'Clothing',
        subcategory: sub,
        description: `Premium quality ${gender.toLowerCase()} ${sub.toLowerCase()} perfect for every day.`,
        price: price,
        originalPrice: orig,
        discount: disc,
        images: {
          front: image,
          back: image,
          side: image,
          design: image
        },
        colors: ['Black', 'Blue', 'White'],
        sizes: sizesMap[sub] || defaultSizes,
        rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
        reviewCount: Math.floor(Math.random() * 300) + 10,
        stock: Math.floor(Math.random() * 100) + 10,
        occasion: ['casual', 'party'],
        tags: [gender.toLowerCase(), sub.toLowerCase()]
      });
      idCounter++;
    }
  }
}

fs.writeFileSync('src/data/realProducts.js', 'export const realProducts = ' + JSON.stringify(newProducts, null, 2) + ';\n');
console.log('Products created: ' + newProducts.length);
