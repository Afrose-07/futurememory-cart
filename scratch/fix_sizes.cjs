const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductDetailsPage.jsx', 'utf8');

// 1. Change initial selectedSize to null
code = code.replace(/const \[selectedSize, setSelectedSize\] = useState\('M'\);/, 'const [selectedSize, setSelectedSize] = useState(null);');

// 2. Change isApparel check to rely on product.sizes
code = code.replace(/const isApparel = \['Ethnic'.*?;/, 'const hasSizes = product.sizes && product.sizes.length > 0;');

// 3. Update size selector UI
const oldSizeSelector = /\{isApparel && \([\s\S]*?<\/div>\s*\)\}/;
const newSizeSelector = `{hasSizes && (
              <div className="fm-details-size-selector" style={{ margin: '15px 0' }}>
                <h4 style={{ marginBottom: '10px', color: '#334155', fontSize: '0.95rem' }}>Select Size: {selectedSize || ''}</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {product.sizes.map(sz => {
                    const stock = product.stockBySize?.[sz] || 0;
                    const isOutOfStock = stock === 0;
                    return (
                      <button
                        key={sz}
                        onClick={() => !isOutOfStock && setSelectedSize(sz)}
                        disabled={isOutOfStock}
                        title={isOutOfStock ? 'Out of Stock' : \`\${stock} left\`}
                        style={{
                          padding: '8px 16px',
                          border: selectedSize === sz ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                          borderRadius: '6px',
                          background: isOutOfStock ? '#f1f5f9' : (selectedSize === sz ? '#eff6ff' : '#fff'),
                          color: isOutOfStock ? '#94a3b8' : (selectedSize === sz ? '#4f46e5' : '#475569'),
                          fontWeight: selectedSize === sz ? '700' : '500',
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          textDecoration: isOutOfStock ? 'line-through' : 'none',
                          opacity: isOutOfStock ? 0.6 : 1
                        }}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}`;
code = code.replace(oldSizeSelector, newSizeSelector);

// 4. Update handleAddToCart to validate size
const oldAddToCart = /const handleAddToCart = \(\) => \{[\s\S]*?showToast\(`Added \$\{quantity\} item\(s\) to Cart! ️`\);\s*\};/;
const newAddToCart = `const handleAddToCart = () => {
    if (!checkAuth('add items to Cart')) return;
    if (hasSizes && !selectedSize) {
      alert('Please select a size.');
      return;
    }
    addToCart({ ...product, selectedSize }, quantity);
    showToast(\`Added \${quantity} item(s) to Cart! ️\`);
  };`;
code = code.replace(oldAddToCart, newAddToCart);

fs.writeFileSync('src/pages/ProductDetailsPage.jsx', code);
console.log('ProductDetailsPage updated for sizes');
