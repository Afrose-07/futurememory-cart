const fs = require('fs');

let code = fs.readFileSync('src/pages/ShopPage.jsx', 'utf8');

// Add selectedSize state
code = code.replace(/const \[selectedGender, setSelectedGender\] = useState\('All'\);/, "const [selectedGender, setSelectedGender] = useState('All');\n  const [selectedSize, setSelectedSize] = useState('All');\n  const [priceRange, setPriceRange] = useState('All');\n  const [minCustomPrice, setMinCustomPrice] = useState('');\n  const [maxCustomPrice, setMaxCustomPrice] = useState('');");

// Update availableColors and add availableSizes
code = code.replace(/const availableColors = \['All', \.\.\.new Set\(/, "const availableSizes = ['All', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', 'Free Size'];\n  const availableColors = ['All', ...new Set(");

// Update filteredProducts logic
const oldFilterStart = /const filteredProducts = useMemo\(\(\) => \{[\s\S]*?return true;\s*\}\)\s*\.sort/;
const newFilterLogic = `const filteredProducts = useMemo(() => {
    let parsedQuery = searchQuery.trim().toLowerCase();

    return allProductsCatalog
      .filter((p) => {
        // Gender filter
        if (selectedGender !== 'All' && p.gender !== selectedGender) return false;
        
        // Category/Subcategory filter
        if (selectedSubcategory !== 'All' && p.subcategory !== selectedSubcategory) return false;

        // Color filter
        if (selectedColor !== 'All' && p.color?.name !== selectedColor && p.color !== selectedColor) return false;

        // Size filter
        if (selectedSize !== 'All') {
          if (!p.sizes || !p.sizes.includes(selectedSize)) return false;
        }

        // Price filter (radio)
        if (priceRange !== 'All') {
          if (priceRange === 'Under 500' && p.price >= 500) return false;
          if (priceRange === '500-1000' && (p.price < 500 || p.price > 1000)) return false;
          if (priceRange === '1000-2000' && (p.price < 1000 || p.price > 2000)) return false;
          if (priceRange === '2000-5000' && (p.price < 2000 || p.price > 5000)) return false;
          if (priceRange === 'Above 5000' && p.price <= 5000) return false;
        }

        // Custom Price filter
        if (minCustomPrice !== '' && p.price < Number(minCustomPrice)) return false;
        if (maxCustomPrice !== '' && p.price > Number(maxCustomPrice)) return false;

        // Search filter
        if (parsedQuery) {
          const searchWords = parsedQuery.split(/\\s+/);
          const name = (p.name || '').toLowerCase();
          const cat = (p.category || '').toLowerCase();
          const sub = (p.subcategory || '').toLowerCase();
          const gender = (p.gender || '').toLowerCase();
          const color = (p.color?.name || p.color || '').toLowerCase();
          const tags = (p.tags || []).join(' ').toLowerCase();

          const isMatch = searchWords.every(word => {
            return name.includes(word) ||
                   cat.includes(word) ||
                   sub.includes(word) ||
                   gender.includes(word) ||
                   color.includes(word) ||
                   tags.includes(word);
          });
          
          if (!isMatch) return false;
        }

        return true;
      })
      .sort`;

code = code.replace(oldFilterStart, newFilterLogic);

// Add dependencies to useMemo
code = code.replace(/maxPrice, priceTier, selectedColor, selectedGender\]\);/, "priceRange, minCustomPrice, maxCustomPrice, selectedColor, selectedGender, selectedSize]);");

// Update handleResetFilters
const newReset = `const handleResetFilters = () => {
    setSelectedSubcategory('All');
    setSearchQuery('');
    setSortBy('featured');
    setPriceRange('All');
    setMinCustomPrice('');
    setMaxCustomPrice('');
    setSelectedColor('All');
    setSelectedGender('All');
    setSelectedSize('All');
    setSearchParams({});
  };`;
code = code.replace(/const handleResetFilters = \(\) => \{[\s\S]*?\};/, newReset);


// Replace the Sidebar UI
const oldSidebarContent = /\{!\(isMobile && !showMobileFilters\) && \([\s\S]*?<\/aside>/;

const newSidebarContent = `
{!(isMobile && !showMobileFilters) && (
          <aside className="fm-shop-sidebar">
            <div className="fm-sidebar-header">
              <h2>Filters</h2>
              <button onClick={handleResetFilters} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 600 }}>Clear All</button>
            </div>

            <div className="fm-sidebar-content">
              {/* Gender Filter */}
              <div className="fm-filter-group">
                <label className="fm-filter-title">Gender</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['All', 'Men', 'Women', 'Kids'].map(g => (
                    <button
                      key={g}
                      onClick={() => setSelectedGender(g)}
                      style={{ padding: '6px 12px', borderRadius: '20px', border: selectedGender === g ? '2px solid #4f46e5' : '1px solid #cbd5e1', background: selectedGender === g ? '#e0e7ff' : '#fff', color: selectedGender === g ? '#4f46e5' : '#475569', cursor: 'pointer' }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="fm-filter-group">
                <label className="fm-filter-title">Categories</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ cursor: 'pointer' }}><input type="radio" checked={selectedSubcategory === 'All'} onChange={() => setSelectedSubcategory('All')} /> All</label>
                  {['Shirts', 'T-Shirts', 'Jeans', 'Trousers', 'Dresses', 'Tops', 'Kurtis', 'Sarees', 'Jackets', 'Shorts'].map(cat => (
                    <label key={cat} style={{ cursor: 'pointer' }}><input type="radio" checked={selectedSubcategory === cat} onChange={() => setSelectedSubcategory(cat)} /> {cat}</label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="fm-filter-group">
                <label className="fm-filter-title">Price (₹)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {['All', 'Under 500', '500-1000', '1000-2000', '2000-5000', 'Above 5000'].map(pr => (
                    <label key={pr} style={{ cursor: 'pointer' }}><input type="radio" checked={priceRange === pr} onChange={() => setPriceRange(pr)} /> {pr}</label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <input type="number" placeholder="Min" value={minCustomPrice} onChange={e => setMinCustomPrice(e.target.value)} style={{ width: '45%', padding: '5px' }} />
                  <input type="number" placeholder="Max" value={maxCustomPrice} onChange={e => setMaxCustomPrice(e.target.value)} style={{ width: '45%', padding: '5px' }} />
                </div>
              </div>

              {/* Color Filter */}
              <div className="fm-filter-group">
                <label className="fm-filter-title">Color</label>
                <div className="fm-color-filter-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {availableColors.map((col) => (
                    <button
                      key={col}
                      className={\`fm-color-btn \${selectedColor === col ? 'active' : ''}\`}
                      onClick={() => setSelectedColor(col)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: selectedColor === col ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                        background: selectedColor === col ? '#e0e7ff' : '#f8fafc',
                        color: selectedColor === col ? '#4f46e5' : '#475569',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div className="fm-filter-group">
                <label className="fm-filter-title">Size</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: selectedSize === sz ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                        background: selectedSize === sz ? '#e0e7ff' : '#fff',
                        color: selectedSize === sz ? '#4f46e5' : '#475569',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}
`;

code = code.replace(oldSidebarContent, newSidebarContent);


// Replace the Active Filters Bar
const oldActiveFiltersBar = /\{\(selectedCategory \!\=\= 'All' \|\| searchQuery \|\| priceTier \!\=\= 'all'\) && \([\s\S]*?<\/div>\s*\)\}/;

const newActiveFiltersBar = `
            {(selectedSubcategory !== 'All' || selectedGender !== 'All' || selectedColor !== 'All' || selectedSize !== 'All' || priceRange !== 'All' || minCustomPrice || maxCustomPrice || searchQuery) && (
              <div className="fm-active-filters-bar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold' }}>Active Filters:</span>
                
                {selectedGender !== 'All' && (
                  <span className="active-chip" style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => setSelectedGender('All')}>
                    {selectedGender} <span style={{ color: '#ef4444', fontWeight: 'bold' }}>×</span>
                  </span>
                )}
                {selectedSubcategory !== 'All' && (
                  <span className="active-chip" style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => setSelectedSubcategory('All')}>
                    {selectedSubcategory} <span style={{ color: '#ef4444', fontWeight: 'bold' }}>×</span>
                  </span>
                )}
                {selectedColor !== 'All' && (
                  <span className="active-chip" style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => setSelectedColor('All')}>
                    Color: {selectedColor} <span style={{ color: '#ef4444', fontWeight: 'bold' }}>×</span>
                  </span>
                )}
                {selectedSize !== 'All' && (
                  <span className="active-chip" style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => setSelectedSize('All')}>
                    Size: {selectedSize} <span style={{ color: '#ef4444', fontWeight: 'bold' }}>×</span>
                  </span>
                )}
                {priceRange !== 'All' && (
                  <span className="active-chip" style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => setPriceRange('All')}>
                    {priceRange} <span style={{ color: '#ef4444', fontWeight: 'bold' }}>×</span>
                  </span>
                )}
                {(minCustomPrice || maxCustomPrice) && (
                  <span className="active-chip" style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => { setMinCustomPrice(''); setMaxCustomPrice(''); }}>
                    ₹{minCustomPrice || '0'} - ₹{maxCustomPrice || 'Max'} <span style={{ color: '#ef4444', fontWeight: 'bold' }}>×</span>
                  </span>
                )}
                {searchQuery && (
                  <span className="active-chip" style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => setSearchQuery('')}>
                    "{searchQuery}" <span style={{ color: '#ef4444', fontWeight: 'bold' }}>×</span>
                  </span>
                )}
                <button onClick={handleResetFilters} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, marginLeft: 'auto' }}>Clear All</button>
              </div>
            )}
`;

code = code.replace(oldActiveFiltersBar, newActiveFiltersBar);


fs.writeFileSync('src/pages/ShopPage.jsx', code);
console.log('ShopPage rewritten');
