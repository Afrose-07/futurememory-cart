const fs = require('fs');
let code = fs.readFileSync('src/pages/ShopPage.jsx', 'utf8');

// 1. We replace the grid section
const oldGrid = /<ProductGrid products=\{filteredProducts\} columns=\{3\} \/>/;
const newGrid = `{filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#334155', marginBottom: '10px' }}>No products found</h2>
                <p style={{ color: '#64748b' }}>Try searching for shirts, dresses, jeans, watches or other products.</p>
              </div>
            ) : (
              <ProductGrid products={groupedProducts} columns={3} />
            )}`;

code = code.replace(oldGrid, newGrid);

// 2. Add groupedProducts right above filteredProducts or before the return
const beforeReturn = /const handleResetFilters =/;
const groupedLogic = `
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

  `;

code = code.replace(beforeReturn, groupedLogic + 'const handleResetFilters =');

fs.writeFileSync('src/pages/ShopPage.jsx', code);
console.log('Grouping and empty state added');
