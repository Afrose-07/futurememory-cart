import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { allProductsCatalog, occasionsMetadata } from '../data/allOccasionsCatalog';
import { useLanguage } from '../context/LanguageContext';
import { translateCategory } from '../data/translations';
import ProductGrid from '../components/ProductGrid';
import PageHeader from '../components/PageHeader';
import Dropdown from '../components/Dropdown';
import SearchBar from '../components/SearchBar';
import SearchableOccasionDropdown from '../components/SearchableOccasionDropdown';
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
  const [selectedOccasion, setSelectedOccasion] = useState('All');

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
    setSelectedCategory(cat || 'All');

    const occ = searchParams.get('occasion');
    setSelectedOccasion(occ || 'All');

    const gen = searchParams.get('gender') || searchParams.get('department');
    setSelectedGender(gen || 'All');

    const s = searchParams.get('search');
    if (s) setSearchQuery(s);
  }, [searchParams]);

  const selectedOccasionObj = useMemo(() => {
    if (!selectedOccasion || selectedOccasion === 'All') return null;
    return occasionsMetadata.find(
      o => o.id === selectedOccasion || o.name.toLowerCase() === selectedOccasion.toLowerCase()
    );
  }, [selectedOccasion]);

  const handleOccasionSelect = (occId) => {
    setSelectedOccasion(occId);
    const newParams = new URLSearchParams(searchParams);
    if (occId && occId !== 'All') {
      newParams.set('occasion', occId);
    } else {
      newParams.delete('occasion');
    }
    setSearchParams(newParams);
  };

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

        if (selectedCategory !== 'All' && p.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
        if (selectedSubcategory !== 'All' && p.subcategory?.toLowerCase() !== selectedSubcategory.toLowerCase()) return false;
        if (selectedGender !== 'All' && p.gender?.toLowerCase() !== selectedGender.toLowerCase()) return false;

        // Occasion filter: strictly matches occasion IDs or names
        if (selectedOccasion !== 'All') {
          const occMatches = (p.occasion || []).some(
            o => o.toLowerCase() === selectedOccasion.toLowerCase()
          );
          if (!occMatches) return false;
        }

        if (parsedQuery) {
          const searchWords = parsedQuery.split(/\s+/);
          const name = (p.name || '').toLowerCase();
          const cat = (p.category || '').toLowerCase();
          const sub = (p.subcategory || '').toLowerCase();
          const gender = (p.gender || '').toLowerCase();
          const color = (p.color?.name || '').toLowerCase();
          const tags = (p.tags || []).join(' ').toLowerCase();
          const productType = (p.productType || '').toLowerCase();

          const isMatch = searchWords.every(word => {
            return (
              name.includes(word) ||
              cat.includes(word) ||
              sub.includes(word) ||
              gender.includes(word) ||
              color.includes(word) ||
              tags.includes(word) ||
              productType.includes(word)
            );
          });

          if (!isMatch) return false;
        }

        if (selectedColor !== 'All') {
          if (!p.colors?.some(c => c.toLowerCase() === selectedColor.toLowerCase()) && p.color?.name !== selectedColor) {
            return false;
          }
        }

        if (selectedSize !== 'All') {
          if (!p.sizes?.includes(selectedSize)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0);
        if (sortBy === 'newest') return (b.id || '').localeCompare(a.id || '');
        return 0; // recommended
      });
  }, [
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedGender,
    selectedOccasion,
    selectedColor,
    selectedSize,
    sortBy,
    priceTier,
    minPrice,
    maxPrice
  ]);

  // Group products by unique item
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
    setSelectedOccasion('All');
    
    if (searchQuery) {
      setSearchParams({ search: searchQuery });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="fm-shop-page">
      <PageHeader
        title={`🛍️ ${t('shop')}`}
        subtitle={selectedOccasionObj ? `Curated gifts for ${selectedOccasionObj.name}` : t('returnPickupSubtext')}
        breadcrumbs={[{ label: t('shop') }]}
        badge={`${groupedProducts.length} Products`}
      />

      <div className="container">
        <div className="fm-shop-layout">
          {/* Filters Sidebar */}
          <aside className="fm-shop-sidebar">
            <div className="fm-sidebar-card">
              <div className="flex-between mb-2">
                <h3 className="fm-filter-heading">{t('filters')}</h3>
                <button
                  className="fm-filter-reset-btn"
                  onClick={handleResetFilters}
                  style={{ color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', fontSize: '0.9rem' }}
                >
                  Clear All Filters
                </button>
              </div>

              {/* 10 Store Categories Filter */}
              <div className="fm-filter-group" style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="fm-filter-title" style={{ margin: 0, fontWeight: 700 }}>Store Categories</label>
                  {selectedCategory !== 'All' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('All');
                        const p = new URLSearchParams(searchParams);
                        p.delete('category');
                        setSearchParams(p);
                      }}
                      style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                  {CATEGORIES.map(cat => {
                    const isSelected = selectedCategory === cat;
                    const count = cat === 'All'
                      ? allProductsCatalog.length
                      : allProductsCatalog.filter(p => p.category?.toLowerCase() === cat.toLowerCase()).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          const p = new URLSearchParams(searchParams);
                          if (cat === 'All') p.delete('category');
                          else p.set('category', cat);
                          setSearchParams(p);
                        }}
                        style={{
                          textAlign: 'left',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: isSelected ? '1.5px solid var(--primary-color)' : '1px solid #e2e8f0',
                          background: isSelected ? '#f0fdf4' : '#ffffff',
                          color: isSelected ? 'var(--primary-color)' : '#334155',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{cat}</span>
                        <span style={{ fontSize: '0.72rem', opacity: 0.7, marginLeft: '4px' }}>({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Occasion Filter with Search & Category Groups */}
              <div className="fm-filter-group" style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="fm-filter-title" style={{ margin: 0, fontWeight: 700 }}>Filter by Occasion</label>
                  {selectedOccasion !== 'All' && (
                    <button
                      type="button"
                      onClick={() => handleOccasionSelect('All')}
                      style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <SearchableOccasionDropdown
                  selectedOccasion={selectedOccasion}
                  onChange={handleOccasionSelect}
                  placeholder="All Occasions (34 Events)"
                />
              </div>

              {/* Price Tier Selector */}
              <div className="fm-filter-group">
                <label className="fm-filter-title">Price Range</label>
                <div className="fm-price-tier-grid" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button type="button" className={`fm-tier-btn ${priceTier === 'all' ? 'active' : ''}`} style={{ textAlign: 'left', padding: '6px 12px', borderRadius: '6px', border: priceTier === 'all' ? '2px solid var(--primary-color)' : '1px solid #cbd5e1', background: priceTier === 'all' ? 'var(--primary-light)' : '#f8fafc' }} onClick={() => setPriceTier('all')}>All Prices</button>
                  <button type="button" className={`fm-tier-btn ${priceTier === 'under500' ? 'active' : ''}`} style={{ textAlign: 'left', padding: '6px 12px', borderRadius: '6px', border: priceTier === 'under500' ? '2px solid var(--primary-color)' : '1px solid #cbd5e1', background: priceTier === 'under500' ? 'var(--primary-light)' : '#f8fafc' }} onClick={() => setPriceTier('under500')}>Under ₹500</button>
                  <button type="button" className={`fm-tier-btn ${priceTier === '500to1000' ? 'active' : ''}`} style={{ textAlign: 'left', padding: '6px 12px', borderRadius: '6px', border: priceTier === '500to1000' ? '2px solid var(--primary-color)' : '1px solid #cbd5e1', background: priceTier === '500to1000' ? 'var(--primary-light)' : '#f8fafc' }} onClick={() => setPriceTier('500to1000')}>₹500 - ₹1,000</button>
                  <button type="button" className={`fm-tier-btn ${priceTier === '1000to2000' ? 'active' : ''}`} style={{ textAlign: 'left', padding: '6px 12px', borderRadius: '6px', border: priceTier === '1000to2000' ? '2px solid var(--primary-color)' : '1px solid #cbd5e1', background: priceTier === '1000to2000' ? 'var(--primary-light)' : '#f8fafc' }} onClick={() => setPriceTier('1000to2000')}>₹1,000 - ₹2,000</button>
                  <button type="button" className={`fm-tier-btn ${priceTier === '2000to5000' ? 'active' : ''}`} style={{ textAlign: 'left', padding: '6px 12px', borderRadius: '6px', border: priceTier === '2000to5000' ? '2px solid var(--primary-color)' : '1px solid #cbd5e1', background: priceTier === '2000to5000' ? 'var(--primary-light)' : '#f8fafc' }} onClick={() => setPriceTier('2000to5000')}>₹2,000 - ₹5,000</button>
                  <button type="button" className={`fm-tier-btn ${priceTier === 'above5000' ? 'active' : ''}`} style={{ textAlign: 'left', padding: '6px 12px', borderRadius: '6px', border: priceTier === 'above5000' ? '2px solid var(--primary-color)' : '1px solid #cbd5e1', background: priceTier === 'above5000' ? 'var(--primary-light)' : '#f8fafc' }} onClick={() => setPriceTier('above5000')}>Above ₹5,000</button>
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

              {/* Department Filter */}
              <div className="fm-filter-group" style={{ marginTop: '20px' }}>
                <label className="fm-filter-title">Department</label>
                <div className="fm-hierarchy-filter">
                  {Object.keys(hierarchy).map(gender => {
                    const isActiveGender = selectedGender === gender;
                    return (
                      <div key={gender} style={{ marginBottom: '10px' }}>
                        <button
                          className={`fm-filter-pill ${isActiveGender ? 'active' : ''}`}
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
                                  className={`fm-filter-pill ${selectedSubcategory === sub ? 'active' : ''}`}
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

              {/* 7-days Return Trust Shield */}
              <div className="fm-sidebar-trust-box" style={{ marginTop: '30px' }}>
                <span className="trust-icon">🛡️</span>
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
            <div className="fm-shop-toolbar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="fm-shop-search-wrap" style={{ flex: '1', minWidth: '220px' }}>
                <SearchBar
                  onSearch={(q) => setSearchQuery(q)}
                  initialQuery={searchQuery}
                  placeholder="Search products..."
                />
              </div>

              {/* Quick Occasion Dropdown in Toolbar */}
              <div style={{ minWidth: '220px', maxWidth: '300px' }}>
                <SearchableOccasionDropdown
                  selectedOccasion={selectedOccasion}
                  onChange={handleOccasionSelect}
                  placeholder="Filter by Occasion"
                />
              </div>

              <div className="fm-shop-sort-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>Sort:</span>
                <Dropdown
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                  placeholder="Sort By"
                />
              </div>
            </div>

            {/* Occasion Spotlight Banner */}
            {selectedOccasionObj && (
              <div
                className="fm-occ-spotlight-banner"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                  border: '1.5px solid #c4b5fd',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{selectedOccasionObj.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e1b4b', fontWeight: 800 }}>
                        {selectedOccasionObj.name}
                      </h2>
                      <span style={{ fontSize: '0.75rem', background: '#6366f1', color: '#ffffff', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
                        {groupedProducts.length} Dedicated Products
                      </span>
                      <span style={{ fontSize: '0.75rem', background: '#ffffff', color: '#6d28d9', border: '1px solid #c4b5fd', padding: '3px 10px', borderRadius: '12px', fontWeight: 600 }}>
                        {selectedOccasionObj.group}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#475569' }}>
                      {selectedOccasionObj.description}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOccasionSelect('All')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  Show All Products
                </button>
              </div>
            )}

            {/* Active Filters Display */}
            {(selectedCategory !== 'All' || selectedSubcategory !== 'All' || selectedOccasion !== 'All' || priceTier !== 'all' || minPrice || maxPrice || selectedColor !== 'All' || selectedSize !== 'All' || selectedGender !== 'All') && (
              <div className="fm-active-filters-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '20px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#334155', marginRight: '8px' }}>Active Filters:</span>
                
                {selectedOccasion !== 'All' && (
                  <span
                    className="active-chip"
                    onClick={() => handleOccasionSelect('All')}
                    style={{
                      padding: '4px 10px',
                      background: '#ede9fe',
                      color: '#5b21b6',
                      fontWeight: 700,
                      borderRadius: '16px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Occasion: {selectedOccasionObj?.name || selectedOccasion} ×
                  </span>
                )}

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
