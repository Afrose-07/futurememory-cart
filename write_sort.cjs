const fs = require('fs');

const newContent = `import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { allProductsCatalog } from '../data/allOccasionsCatalog';
import { useLanguage } from '../context/LanguageContext';
import { translateCategory } from '../data/translations';
import ProductGrid from '../components/ProductGrid';
import PageHeader from '../components/PageHeader';
import Dropdown from '../components/Dropdown';
import SearchBar from '../components/SearchBar';
import { CATEGORIES } from '../utils/constants';
import './ShopPage.css';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang } = useLanguage();

  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('recommended');
  const [priceTier, setPriceTier] = useState('all'); 
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  const [selectedColor, setSelectedColor] = useState('All');
  const availableColors = ['All', 'Black', 'White', 'Red', 'Blue', 'Navy Blue', 'Sky Blue', 'Green', 'Olive Green', 'Maroon', 'Brown', 'Pink', 'Yellow'];
  
  const [selectedSize, setSelectedSize] = useState('All');
  const availableSizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38'];

  const [selectedGender, setSelectedGender] = useState('All');
  const hierarchy = {
    Men: ['Shirts', 'T-Shirts', 'Jeans', 'Trousers', 'Hoodies', 'Jackets', 'Blazers', 'Kurta', 'Ethnic Wear', 'Shorts'],
    Women: ['Dresses', 'Tops', 'T-Shirts', 'Jeans', 'Trousers', 'Skirts', 'Kurtis', 'Sarees', 'Jackets', 'Ethnic Wear'],
    Kids: ['T-Shirts', 'Shirts', 'Dresses', 'Jeans', 'Shorts', 'Ethnic Wear']
  };

  const sortOptions = useMemo(() => [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'reviews', label: 'Most Reviewed' },
    { value: 'newest', label: 'Newest' }
  ], []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);

    const s = searchParams.get('search');
    if (s) setSearchQuery(s);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let parsedQuery = searchQuery.trim().toLowerCase();
    
    return allProductsCatalog
      .filter(p => {
        if (priceTier === 'under500' && p.price >= 500) return false;
        if (priceTier === '500to1000' && (p.price < 500 || p.price > 1000)) return false;
        if (priceTier === '1000to2000' && (p.price < 1000 || p.price > 2000)) return false;
        if (priceTier === '2000to5000' && (p.price < 2000 || p.price > 5000)) return false;
        if (priceTier === 'above5000' && p.price <= 5000) return false;

        const pMin = parseFloat(minPrice);
        const pMax = parseFloat(maxPrice);
        if (!isNaN(pMin) && p.price < pMin) return false;
        if (!isNaN(pMax) && p.price > pMax) return false;

        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
        if (selectedSubcategory !== 'All' && p.subcategory !== selectedSubcategory) return false;
        if (selectedGender !== 'All' && p.gender !== selectedGender) return false;
        if (selectedColor !== 'All' && p.color?.name !== selectedColor) return false;
        
        if (selectedSize !== 'All') {
          if (!p.sizes || !p.sizes.includes(selectedSize)) return false;
        }

        if (parsedQuery) {
          const searchWords = parsedQuery.split(/\\s+/);
          const name = (p.name || '').toLowerCase();
          const cat = (p.category || '').toLowerCase();
          const sub = (p.subcategory || '').toLowerCase();
          const gender = (p.gender || '').toLowerCase();
          const color = (p.color?.name || '').toLowerCase();
          const tags = (p.tags || []).join(' ').toLowerCase();
          const productType = (p.productType || '').toLowerCase();

          const isMatch = searchWords.every(word => {
            return name.includes(word) ||
                   cat.includes(word) ||
                   sub.includes(word) ||
                   gender.includes(word) ||
                   color.includes(word) ||
                   tags.includes(word) ||
                   productType.includes(word);
          });
          
          if (!isMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (parsedQuery && sortBy === 'recommended') {
          const scoreMatch = (p) => {
            let score = 0;
            const words = parsedQuery.split(/\\s+/);
            words.forEach(word => {
              const w = word.trim();
              if (!w) return;
              if ((p.name || '').toLowerCase().includes(w)) score += 10;
              else if ((p.category || '').toLowerCase().includes(w)) score += 8;
              else if ((p.subcategory || '').toLowerCase().includes(w)) score += 8;
              else if ((p.color?.name || '').toLowerCase().includes(w)) score += 6;
              else if ((p.gender || '').toLowerCase().includes(w)) score += 4;
              else if ((p.tags || []).join(' ').toLowerCase().includes(w)) score += 2;
            });
            return score;
          };
          const scoreA = scoreMatch(a);
          const scoreB = scoreMatch(b);
          if (scoreA !== scoreB) return scoreB - scoreA;
        }
        
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0);
        if (sortBy === 'newest') return b.id.localeCompare(a.id);
        
        return 0; // Default stable order for recommended when no search query
      });
  }, [selectedSubcategory, selectedCategory, searchQuery, sortBy, minPrice, maxPrice, priceTier, selectedColor, selectedGender, selectedSize]);

  const groupedProducts = useMemo(() => {
    const map = new Map();
    filteredProducts.forEach(p => {
      const groupId = p.modelId || p.id;
      if (!map.has(groupId)) {
        const variantsCount = p.modelId ? allProductsCatalog.filter(cp => cp.modelId === p.modelId).length : 1;
        map.set(groupId, { ...p, variantsCount });
      }
    });
    return Array.from(map.values());
  }, [filteredProducts]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedSubcategory('All');
    setSortBy('recommended');
    setPriceTier('all');
    setMinPrice('');
    setMaxPrice('');
    setSelectedColor('All');
    setSelectedGender('All');
    setSelectedSize('All');
    
    if (searchQuery) {
      setSearchParams({ search: searchQuery });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="fm-shop-page">
      <PageHeader
        title={\`️ \${t('shop')}\`}
        subtitle={t('returnPickupSubtext')}
        breadcrumbs={[{ label: t('shop') }]}
        badge={\`\${groupedProducts.length} Products\`}
      />

      <div className="container">
        <div className="fm-shop-layout">
          {/* Filters Sidebar */}
          <aside className="fm-shop-sidebar">
            <div className="fm-sidebar-card">
              <div className="flex-between mb-2">
                <h3 className="fm-filter-heading">{t('filters')}</h3>
                <button className="fm-filter-reset-btn" onClick={handleResetFilters} style={{ color: '#4f46e5', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', fontSize: '0.9rem' }}>
                  Clear All Filters
                </button>
              </div>

              {/* Price Tier Selector */}
              <div className="fm-filter-group">
                <label className="fm-filter-title">️ Price Range</label>
                <div className="fm-price-tier-grid" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button type="button" className={\`fm-tier-btn \${priceTier === 'all' ? 'active' : ''}\`} style={{ textAlign: 'left', padding: '6px 12px', borderRadius: '6px', border: priceTier === 'all' ? '2px solid #4f46e5' : '1px solid #cbd5e1', background: priceTier === 'all' ? '#e0e7ff' : '#f8fafc' }} onClick={() => setPriceTier('all')}>All Prices</button>
                  <button type="button" className={\`fm-tier-btn \${priceTier === 'under500' ? 'active' : ''}\`} style={{ textAlign: 'left', padding: '6px 12px', borderRadius: '6px', border: priceTier === 'under500' ? '2px solid #4f46e5' : '1px solid #cbd5e1', background: priceTier === 'under500' ? '#e0e7ff' : '#f8fafc' }} onClick={() => setPriceTier('under500')}>Under ₹500</button>
                  <button type="button" className={\`fm-tier-btn \${priceTier === '500to1000' ? 'active' : ''}\`} style={{ textAlign: 'left', padding: '6px 12px', borderRadius: '6px', border: priceTier === '500to1000' ? '2px solid #4f46e5' : '1px solid #cbd5e1', background: priceTier === '500to1000' ? '#e0e7ff' : '#f8fafc' }} onClick={() => setPriceTier('500to1000')}>₹500 - ₹1,000</button>
                  <button type="button" className={\`fm-tier-btn \${priceTier === '1000to2000' ? 'active' : ''}\`} style={{ textAlign: 'left', padding: '6px 12px', borderRadius: '6px', border: priceTier === '1000to2000' ? '2px solid #4f46e5' : '1px solid #cbd5e1', background: priceTier === '1000to2000' ? '#e0e7ff' : '#f8fafc' }} onClick={() => setPriceTier('1000to2000')}>₹1,000 - ₹2,000</button>
                  <button type="button" className={\`fm-tier-btn \${priceTier === '2000to5000' ? 'active' : ''}\`} style={{ textAlign: 'left', padding: '6px 12px', borderRadius: '6px', border: priceTier === '2000to5000' ? '2px solid #4f46e5' : '1px solid #cbd5e1', background: priceTier === '2000to5000' ? '#e0e7ff' : '#f8fafc' }} onClick={() => setPriceTier('2000to5000')}>₹2,000 - ₹5,000</button>
                  <button type="button" className={\`fm-tier-btn \${priceTier === 'above5000' ? 'active' : ''}\`} style={{ textAlign: 'left', padding: '6px 12px', borderRadius: '6px', border: priceTier === 'above5000' ? '2px solid #4f46e5' : '1px solid #cbd5e1', background: priceTier === 'above5000' ? '#e0e7ff' : '#f8fafc' }} onClick={() => setPriceTier('above5000')}>Above ₹5,000</button>
                </div>
              </div>

              {/* Custom Price Range */}
              <div className="fm-filter-group" style={{ marginTop: '15px' }}>
                <label className="fm-filter-title" style={{ fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Custom Price Range (₹)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="number" placeholder="Min ₹" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ width: '45%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
                  <span>-</span>
                  <input type="number" placeholder="Max ₹" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: '45%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
              </div>

              {/* Gender & Category Filter */}
              <div className="fm-filter-group" style={{ marginTop: '20px' }}>
                <label className="fm-filter-title">Department</label>
                <div className="fm-hierarchy-filter">
                  {Object.keys(hierarchy).map(gender => {
                    const isActiveGender = selectedGender === gender;
                    return (
                      <div key={gender} style={{ marginBottom: '10px' }}>
                        <button
                          className={\`fm-filter-pill \${isActiveGender ? 'active' : ''}\`}
                          style={{ fontWeight: 'bold', width: '100%', textAlign: 'left', borderRadius: '4px', padding: '8px 12px', background: isActiveGender ? '#f1f5f9' : 'transparent', border: 'none', cursor: 'pointer' }}
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
                              if (count === 0) return null;
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

              {/* Size Filter */}
              <div className="fm-filter-group" style={{ marginTop: '20px' }}>
                <label className="fm-filter-title">Size</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {availableSizes.map(sz => {
                    if (sz !== 'All') {
                      const hasSize = allProductsCatalog.some(p => {
                        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
                        if (selectedGender !== 'All' && p.gender !== selectedGender) return false;
                        if (selectedSubcategory !== 'All' && p.subcategory !== selectedSubcategory) return false;
                        return p.sizes && p.sizes.includes(sz);
                      });
                      if (!hasSize) return null;
                    }

                    return (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        style={{
                          padding: '4px 10px',
                          border: selectedSize === sz ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                          borderRadius: '4px',
                          background: selectedSize === sz ? '#e0e7ff' : '#fff',
                          color: selectedSize === sz ? '#4f46e5' : '#475569',
                          fontWeight: selectedSize === sz ? 600 : 400,
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        {sz}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Color Filter */}
              <div className="fm-filter-group" style={{ marginTop: '20px' }}>
                <label className="fm-filter-title">Color</label>
                <div className="fm-color-filter-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {availableColors.map((col) => {
                    if (col !== 'All') {
                      const hasColor = allProductsCatalog.some(p => {
                        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
                        if (selectedGender !== 'All' && p.gender !== selectedGender) return false;
                        if (selectedSubcategory !== 'All' && p.subcategory !== selectedSubcategory) return false;
                        return p.color?.name === col;
                      });
                      if (!hasColor) return null;
                    }

                    return (
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
                        {col === 'All' ? 'All' : col}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 7-days Return Trust Shield */}
              <div className="fm-sidebar-trust-box" style={{ marginTop: '30px' }}>
                <span className="trust-icon">️</span>
                <div className="trust-content">
                  <strong>{t('tenDaysReturnTitle')}</strong>
                  <p>{t('returnPickupSubtext')}</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Listing Main Area */}
          <main className="fm-shop-main">
            {/* Top Toolbar */}
            <div className="fm-shop-toolbar">
              <div className="fm-shop-search-wrap">
                <SearchBar
                  onSearch={(q) => setSearchQuery(q)}
                  initialQuery={searchQuery}
                  placeholder="Search products..."
                />
              </div>

              <div className="fm-shop-sort-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>Sort By:</span>
                <Dropdown
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                  placeholder="Sort By"
                />
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedCategory !== 'All' || selectedSubcategory !== 'All' || priceTier !== 'all' || minPrice || maxPrice || selectedColor !== 'All' || selectedSize !== 'All' || selectedGender !== 'All') && (
              <div className="fm-active-filters-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '20px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#334155', marginRight: '8px' }}>Active Filters:</span>
                {selectedCategory !== 'All' && (
                  <span className="active-chip" onClick={() => setSelectedCategory('All')} style={{ padding: '4px 10px', background: '#e2e8f0', borderRadius: '16px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {translateCategory(selectedCategory, t)} ×
                  </span>
                )}
                {selectedSubcategory !== 'All' && (
                  <span className="active-chip" onClick={() => setSelectedSubcategory('All')} style={{ padding: '4px 10px', background: '#e2e8f0', borderRadius: '16px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {selectedSubcategory} ×
                  </span>
                )}
                {priceTier !== 'all' && (
                  <span className="active-chip" onClick={() => setPriceTier('all')} style={{ padding: '4px 10px', background: '#e2e8f0', borderRadius: '16px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {priceTier === 'under500' ? 'Under ₹500' :
                     priceTier === '500to1000' ? '₹500 - ₹1,000' :
                     priceTier === '1000to2000' ? '₹1,000 - ₹2,000' :
                     priceTier === '2000to5000' ? '₹2,000 - ₹5,000' :
                     'Above ₹5,000'} ×
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="active-chip" onClick={() => { setMinPrice(''); setMaxPrice(''); }} style={{ padding: '4px 10px', background: '#e2e8f0', borderRadius: '16px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ₹{minPrice || 0} - ₹{maxPrice || 'Any'} ×
                  </span>
                )}
                {selectedColor !== 'All' && (
                  <span className="active-chip" onClick={() => setSelectedColor('All')} style={{ padding: '4px 10px', background: '#e2e8f0', borderRadius: '16px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {selectedColor} ×
                  </span>
                )}
                {selectedSize !== 'All' && (
                  <span className="active-chip" onClick={() => setSelectedSize('All')} style={{ padding: '4px 10px', background: '#e2e8f0', borderRadius: '16px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Size: {selectedSize} ×
                  </span>
                )}
                {selectedGender !== 'All' && (
                  <span className="active-chip" onClick={() => setSelectedGender('All')} style={{ padding: '4px 10px', background: '#e2e8f0', borderRadius: '16px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {selectedGender} ×
                  </span>
                )}
              </div>
            )}

            {/* Grid */}
            {groupedProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#334155', marginBottom: '10px' }}>No products found</h2>
                <p style={{ color: '#64748b' }}>Try changing or clearing your filters.</p>
              </div>
            ) : (
              <ProductGrid products={groupedProducts} columns={3} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
`;

fs.writeFileSync('src/pages/ShopPage.jsx', newContent);
