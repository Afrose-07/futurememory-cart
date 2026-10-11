const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductDetailsPage.jsx', 'utf8');

code = code.replace(/const product = allProductsCatalog\.find\(p => p\.id === parseInt\(id, 10\)\) \|\| allProductsCatalog\[0\];/, `
  const initialProduct = allProductsCatalog.find(p => String(p.id) === String(id)) || allProductsCatalog[0];
  const [product, setProduct] = useState(initialProduct);

  const modelVariants = allProductsCatalog.filter(p => p.modelId === product.modelId);
`);

const colorHtml = `
            {modelVariants.length > 1 && (
              <div className="fm-details-color-selector" style={{ margin: '15px 0' }}>
                <h4 style={{ marginBottom: '10px', color: '#334155', fontSize: '0.95rem' }}>Select Colour: {product.color?.name}</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {modelVariants.map(variant => (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setProduct(variant);
                        setActiveImage('front');
                      }}
                      title={variant.color?.name}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: variant.color?.value || '#ccc',
                        border: product.id === variant.id ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                        boxShadow: product.id === variant.id ? '0 0 0 2px #fff inset' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
`;

code = code.replace(/\{isApparel && \(/, colorHtml + '\n            {isApparel && (');

fs.writeFileSync('src/pages/ProductDetailsPage.jsx', code);
console.log('Product details updated');
