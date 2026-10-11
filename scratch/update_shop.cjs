const fs = require('fs');

let content = fs.readFileSync('src/pages/ShopPage.jsx', 'utf8');

// Replace state variables
content = content.replace(
  /const \[selectedCategory, setSelectedCategory\] = useState\(initialCategory\);/,
  'const [selectedSubcategory, setSelectedSubcategory] = useState(initialCategory);'
);

content = content.replace(
  /const availableGenders = \['All', 'Men', 'Women', 'Kids', 'Unisex'\];/,
  `const hierarchy = {
    Men: ['Shirts', 'T-Shirts', 'Jeans', 'Trousers', 'Hoodies', 'Jackets', 'Blazers', 'Kurta', 'Ethnic Wear', 'Shorts'],
    Women: ['Dresses', 'Tops', 'T-Shirts', 'Jeans', 'Trousers', 'Skirts', 'Kurtis', 'Sarees', 'Jackets', 'Ethnic Wear'],
    Kids: ['T-Shirts', 'Shirts', 'Dresses', 'Jeans', 'Shorts', 'Ethnic Wear']
  };`
);

// Add selectedSubcategory to useEffect dependencies (optional, but good practice)
content = content.replace(
  /selectedCategory, searchQuery, sortBy, maxPrice, priceTier, selectedColor, selectedGender\]\);/,
  'selectedSubcategory, searchQuery, sortBy, maxPrice, priceTier, selectedColor, selectedGender]);'
);

// Replace category filter logic
content = content.replace(
  /\/\/ Category filter[\s\S]*?\/\/ Price Tier filter/,
  `// Subcategory filter
        if (selectedSubcategory !== 'All' && p.subcategory !== selectedSubcategory) {
          return false;
        }

        // Price Tier filter`
);

// Replace gender filter logic
content = content.replace(
  /\/\/ Gender filter logic[\s\S]*?\/\/ Search query filter/,
  `// Gender filter logic
        if (selectedGender !== 'All' && p.gender !== selectedGender) {
          return false;
        }

        // Search query filter`
);

// Replace the UI for Category and Gender filters
const uiRegex = /\{\/\* Category Filter \*\/\}[\s\S]*?\{\/\* Color Filter \*\/\}/;
const newUI = `{/* Gender & Category Hierarchy Filter */}
              <div className="fm-filter-group">
                <label className="fm-filter-title">{lang === 'ta' ? 'வகைகள் (Categories)' : 'Categories'}</label>
                <div className="fm-hierarchy-filter">
                  {Object.keys(hierarchy).map(gender => {
                    const isActiveGender = selectedGender === gender;
                    return (
                      <div key={gender} style={{ marginBottom: '10px' }}>
                        <button
                          className={\`fm-filter-pill \${isActiveGender ? 'active' : ''}\`}
                          style={{ fontWeight: 'bold', width: '100%', textAlign: 'left', borderRadius: '4px', padding: '8px 12px' }}
                          onClick={() => {
                            if (isActiveGender) {
                              setSelectedGender('All');
                              setSelectedSubcategory('All');
                            } else {
                              setSelectedGender(gender);
                              setSelectedSubcategory('All');
                            }
                          }}
                        >
                          {gender}
                        </button>
                        {isActiveGender && (
                          <div style={{ paddingLeft: '16px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {hierarchy[gender].map(sub => {
                              const count = allProductsCatalog.filter(p => p.gender === gender && p.subcategory === sub).length;
                              return (
                                <button
                                  key={sub}
                                  className={\`fm-filter-pill \${selectedSubcategory === sub ? 'active' : ''}\`}
                                  style={{ textAlign: 'left', fontSize: '0.9rem', padding: '4px 8px', borderRadius: '4px', background: selectedSubcategory === sub ? '#fdf2f8' : 'transparent', border: 'none', color: selectedSubcategory === sub ? '#be185d' : '#64748b', cursor: 'pointer' }}
                                  onClick={() => setSelectedSubcategory(sub)}
                                >
                                  {sub} ({count})
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Color Filter */}`;

content = content.replace(uiRegex, newUI);

// Replace handleResetFilters
content = content.replace(
  /setSelectedCategory\('All'\);/,
  "setSelectedSubcategory('All');"
);

fs.writeFileSync('src/pages/ShopPage.jsx', content, 'utf8');
console.log('ShopPage updated successfully');
