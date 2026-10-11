const fs = require('fs');
let code = fs.readFileSync('src/pages/ShopPage.jsx', 'utf8');

if (!code.includes('const groupedProducts =')) {
  code = code.replace(/const sortedProducts = useMemo\(\(\) => \{/, `
  const groupedProducts = useMemo(() => {
    const map = new Map();
    filteredProducts.forEach(p => {
      if (!map.has(p.modelId)) {
        const variantsCount = allProductsCatalog.filter(cp => cp.modelId === p.modelId).length;
        map.set(p.modelId, { ...p, variantsCount });
      }
    });
    return Array.from(map.values());
  }, [filteredProducts]);

  const sortedProducts = useMemo(() => {`);

  code = code.replace(/let sorted = \[\.\.\.filteredProducts\];/, 'let sorted = [...groupedProducts];');
  
  fs.writeFileSync('src/pages/ShopPage.jsx', code);
  console.log('Added grouping');
} else {
  console.log('Grouping already added');
}
