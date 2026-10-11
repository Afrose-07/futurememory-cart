import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useFutureCart } from '../context/FutureCartContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { allProductsCatalog, occasionsMetadata } from '../data/allOccasionsCatalog';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import PriceTag from '../components/PriceTag';
import DiscountBadge from '../components/DiscountBadge';
import { formatPrice, formatDate, getNextReminderDate } from '../utils/helpers';
import SearchableOccasionDropdown from '../components/SearchableOccasionDropdown';
import './FutureCartPage.css';

const BUDGET_PRESETS = [
  { label: 'Under ₹2,500', value: 2500 },
  { label: 'Under ₹5,000', value: 5000 },
  { label: 'Under ₹10,000', value: 10000 },
  { label: 'Under ₹25,000', value: 25000 },
  { label: 'Luxury ₹50,000', value: 50000 }
];

const TIMELINE_PRESETS = [
  { label: '1 Month', months: 1 },
  { label: '2 Months', months: 2 },
  { label: '3 Months (Quarter)', months: 3 },
  { label: '6 Months (Half Year)', months: 6 },
  { label: '12 Months (Annual)', months: 12 }
];

const POPULAR_OCCASIONS = [
  { id: 'birthday', label: '🎂 Birthday' },
  { id: 'wedding', label: '💍 Wedding' },
  { id: 'anniversary', label: '❤️ Anniversary' },
  { id: 'diwali', label: '🪔 Diwali' },
  { id: 'pongal', label: '🌾 Pongal' },
  { id: 'graduation', label: '🎓 Graduation' },
  { id: 'housewarming', label: '🏡 Housewarming' },
  { id: 'travel_adventure', label: '✈️ Travel' }
];

const FutureCartPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOccId = searchParams.get('occasion') || 'festival';
  const {
    futureData,
    setOccasion,
    setMonths,
    setBudgetGoal,
    addPlannedProduct,
    removePlannedProduct,
    isInFuturePlan,
    getPlannedTotal
  } = useFutureCart();

  const { addToCart } = useCart();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  // Local state for interactive occasion planner
  const [selectedOccId, setSelectedOccId] = useState(() => {
    if (futureData.occasion) {
      const existing = occasionsMetadata.find(o => o.name === futureData.occasion || o.id === futureData.occasion);
      if (existing) return existing.id;
    }
    return searchParams.get('occasion') || ''; // Start empty by default!
  });

  const [selectedMonths, setSelectedMonths] = useState(futureData.months || null);
  const [selectedBudget, setSelectedBudget] = useState(futureData.budgetGoal || '');
  const [filterWithinBudget, setFilterWithinBudget] = useState(false);
  const [priceTierFilter, setPriceTierFilter] = useState('all'); // 'all' | 'under2500' | '2500to5000' | 'above5000' | 'budgetGoal'
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Find active occasion metadata
  const currentOccasion = useMemo(() => {
    return occasionsMetadata.find(o => o.id === selectedOccId) || null;
  }, [selectedOccId]);

  const targetDate = useMemo(() => {
    return selectedMonths ? getNextReminderDate(selectedMonths) : null;
  }, [selectedMonths]);

  // Query all items belonging to this occasion
  const occasionProducts = useMemo(() => {
    const directMatches = allProductsCatalog.filter(p => 
      p.occasion && p.occasion.some(occ => occ.toLowerCase() === selectedOccId.toLowerCase())
    );
    if (directMatches.length > 0) return directMatches;

    // Graceful fallback to tag or name search
    const tagMatches = allProductsCatalog.filter(p => 
      p.tags?.some(tag => tag?.toLowerCase() === selectedOccId.toLowerCase())
    );
    if (tagMatches.length > 0) return tagMatches;

    return allProductsCatalog.slice(0, 4); // Fallback to a few if none match
  }, [selectedOccId]);

  // Filtered by selected price tier and/or budget goal
  const displayedProducts = useMemo(() => {
    let list = [...occasionProducts];

    // 1. Price Tier Filter
    if (priceTierFilter === 'under500') {
      list = list.filter(p => p.price < 500);
    } else if (priceTierFilter === '500to1000') {
      list = list.filter(p => p.price >= 500 && p.price <= 1000);
    } else if (priceTierFilter === '1000to2500') {
      list = list.filter(p => p.price > 1000 && p.price <= 2500);
    } else if (priceTierFilter === 'under2500') {
      list = list.filter(p => p.price <= 2500);
    } else if (priceTierFilter === '2500to5000') {
      list = list.filter(p => p.price > 2500 && p.price <= 5000);
    } else if (priceTierFilter === 'above5000') {
      list = list.filter(p => p.price > 5000);
    } else if (priceTierFilter === 'budgetGoal' || filterWithinBudget) {
      list = list.filter(p => p.price <= selectedBudget);
    }

    // If filter strictly yields 0 items, fallback to the closest budget items so user is never stuck
    if (list.length === 0) {
      return occasionProducts.slice(0, 8);
    }

    return list;
  }, [occasionProducts, priceTierFilter, filterWithinBudget, selectedBudget]);

  const plannedTotal = getPlannedTotal();
  const budgetUtilization = selectedBudget ? Math.min(100, Math.round((plannedTotal / selectedBudget) * 100)) : 0;
  const monthlySavingsPlan = selectedMonths && selectedBudget ? Math.ceil(selectedBudget / selectedMonths) : 0;

  const handleOccasionChange = (newOccId) => {
    setSelectedOccId(newOccId);
    setSearchParams({ occasion: newOccId });
    const occ = occasionsMetadata.find(o => o.id === newOccId);
    if (occ) {
      setOccasion(occ.name);
    }
  };

  const handleTimelineChange = (months) => {
    setSelectedMonths(months);
    setMonths(months);
  };

  const handleBudgetChange = (budget) => {
    setSelectedBudget(budget);
    setBudgetGoal(budget);
  };

  const handleTogglePlanItem = (product) => {
    if (!currentOccasion) return;
    setOccasion(currentOccasion.name);
    setMonths(selectedMonths || 2);
    setBudgetGoal(selectedBudget || 5000);

    if (isInFuturePlan(product.id)) {
      removePlannedProduct(product.id);
      showToast(`Removed from ${currentOccasion.name} plan`);
    } else {
      addPlannedProduct(product, 'High');
      showToast(`Added "${product.name}" to ${currentOccasion.name} plan! `);
    }
  };

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    showToast(`Added "${product.name}" to Active Cart! ️`);
  };

  const handleSaveAndGoToDashboard = () => {
    if (currentOccasion) setOccasion(currentOccasion.name);
    if (selectedMonths) setMonths(selectedMonths);
    if (selectedBudget) setBudgetGoal(selectedBudget);
    navigate('/future-cart/dashboard');
  };

  return (
    <div className="fm-future-page">
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#1e1b4b',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          fontWeight: 700,
          zIndex: 99999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
        }}>
          {toastMsg}
        </div>
      )}

      <PageHeader
        title={lang === 'ta' ? ' பியூச்சர் கார்ட்: நிகழ்வு & பட்ஜெட் திட்டமிடுபவர்' : ' Future Cart: Occasion & Budget Planner'}
        subtitle={lang === 'ta'
          ? 'நிகழ்வைத் தேர்வு செய்து, மாத காலக்கெடு மற்றும் பட்ஜெட்டை நிர்ணயித்து, பொருத்தமான பரிசுகளைத் தேர்ந்தெடுக்கவும்.'
          : 'Select an event, set your timeline and budget, then receive curated matching suggestions.'}
        breadcrumbs={[{ label: 'Future Cart' }]}
        badge="AI Occasion Planner"
        action={
          futureData.plannedProducts?.length > 0 && (
            <Link to="/future-cart/dashboard">
              <Button variant="future" size="sm">
                View Active Plan ({futureData.plannedProducts.length} Items) →
              </Button>
            </Link>
          )
        }
      />

      <div className="container">
        {/* Interactive Occasion & Budget Configuration Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #e2e8f0',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            alignItems: 'flex-start'
          }}>
            {/* 1. Occasion Dropdown & Quick Pills */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>
                1. {lang === 'ta' ? 'நிகழ்வைத் தேர்வுசெய்க' : 'Select Occasion (Curated Events)'}
              </label>
              
              <div style={{ marginBottom: '10px' }}>
                <SearchableOccasionDropdown
                  selectedOccasion={selectedOccId}
                  onChange={handleOccasionChange}
                  placeholder="Select Occasion (34 Events)"
                />
              </div>

              {/* Popular Occasion Quick Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {POPULAR_OCCASIONS.map(pop => (
                  <button
                    key={pop.id}
                    type="button"
                    onClick={() => handleOccasionChange(pop.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: selectedOccId === pop.id ? '1.5px solid #6366f1' : '1px solid #cbd5e1',
                      background: selectedOccId === pop.id ? '#6366f1' : '#ffffff',
                      color: selectedOccId === pop.id ? '#ffffff' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {pop.label}
                  </button>
                ))}
              </div>

              {currentOccasion && (
                <p style={{ margin: '8px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  {currentOccasion.description}
                </p>
              )}
            </div>

            {/* 2. Timeline / Target Month */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>
                2. {lang === 'ta' ? 'திட்டமிடும் காலக்கெடு (மாதம்)' : 'Target Timeline (Estimated Date)'}
              </label>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                {TIMELINE_PRESETS.map(tOption => (
                  <button
                    key={tOption.months}
                    type="button"
                    onClick={() => handleTimelineChange(tOption.months)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      border: selectedMonths === tOption.months ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                      background: selectedMonths === tOption.months ? '#7c3aed' : '#ffffff',
                      color: selectedMonths === tOption.months ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {tOption.label}
                  </button>
                ))}
              </div>

              {selectedMonths ? (
                <div style={{
                  background: '#faf5ff',
                  border: '1px solid #e9d5ff',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '0.82rem'
                }}>
                  <div style={{ color: '#7c3aed', fontWeight: 700, marginBottom: '2px' }}>
                     {lang === 'ta' ? 'இலக்கு தேதி:' : 'Target Milestone Date:'} {formatDate(targetDate)}
                  </div>
                  <div style={{ color: '#6b21a8' }}>
                     {lang === 'ta' ? `மாத சேமிப்பு திட்டம்: மாதம் ₹${monthlySavingsPlan.toLocaleString('en-IN')}` : `Savings Target: Save ₹${monthlySavingsPlan.toLocaleString('en-IN')}/month over ${selectedMonths} month(s)`}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '8px', fontSize: '0.82rem', color: '#94a3b8' }}>
                  Please select a timeline.
                </div>
              )}
            </div>

            {/* 3. Budget Goal */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>
                3. {lang === 'ta' ? 'பட்ஜெட் நிர்ணயம்' : 'Milestone Budget Goal'}
              </label>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                {BUDGET_PRESETS.map(b => (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => handleBudgetChange(b.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: selectedBudget === b.value ? '2px solid #16a34a' : '1px solid #cbd5e1',
                      background: selectedBudget === b.value ? '#16a34a' : '#ffffff',
                      color: selectedBudget === b.value ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Custom (₹):</span>
                <input
                  type="number"
                  value={selectedBudget}
                  onChange={(e) => handleBudgetChange(Number(e.target.value) || 0)}
                  style={{
                    width: '120px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: 700
                  }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#475569', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filterWithinBudget}
                    onChange={(e) => setFilterWithinBudget(e.target.checked)}
                  />
                  {lang === 'ta' ? 'பட்ஜெட்டுக்குள் மட்டும்' : 'Only within budget'}
                </label>
              </div>
            </div>
          </div>

          {currentOccasion && selectedMonths && selectedBudget && (
            <div style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span>Budget Allocation ({futureData.plannedProducts.length} Items Planned):</span>
                  <span>{formatPrice(plannedTotal)} / {formatPrice(selectedBudget)} ({budgetUtilization}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${budgetUtilization}%`,
                    height: '100%',
                    background: budgetUtilization > 90 ? '#dc2626' : 'linear-gradient(90deg, #6366f1, #7c3aed)',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>

              <Button
                variant="future"
                onClick={handleSaveAndGoToDashboard}
                icon=""
              >
                Go to {currentOccasion.name} Dashboard ({futureData.plannedProducts.length}) →
              </Button>
            </div>
          )}
        </div>

        {!currentOccasion || !selectedMonths || !selectedBudget ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#334155', marginBottom: '10px' }}>
              Select your planner details above to get started
            </h3>
            <p style={{ color: '#64748b' }}>Choose an Occasion, Timeline, and Budget to see curated AI gift recommendations.</p>
          </div>
        ) : (
          <>
            {/* Dynamic Price Range Selector Bar */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '16px',
          padding: '14px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155' }}>
              ️ {lang === 'ta' ? 'விலை வரம்பு ஃபில்டர்:' : 'Filter Price Range:'}
            </span>
            {[
              { id: 'all', label: `All Items (${occasionProducts.length})` },
              { id: 'under500', label: 'Under ₹500' },
              { id: '500to1000', label: '₹500 - ₹1,000' },
              { id: '1000to2500', label: '₹1,000 - ₹2,500' },
              { id: '2500to5000', label: '₹2,500 - ₹5,000' },
              { id: 'above5000', label: 'Above ₹5,000' },
              { id: 'budgetGoal', label: `≤ Budget (₹${selectedBudget.toLocaleString('en-IN')})` }
            ].map(tier => (
              <button
                key={tier.id}
                type="button"
                onClick={() => setPriceTierFilter(tier.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: priceTierFilter === tier.id ? '1.5px solid var(--primary-color)' : '1px solid #cbd5e1',
                  background: priceTierFilter === tier.id ? 'var(--primary-color)' : '#ffffff',
                  color: priceTierFilter === tier.id ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {tier.label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)', background: '#eef2ff', padding: '6px 12px', borderRadius: '8px' }}>
            Showing {displayedProducts.length} curated gift items
          </span>
        </div>

        {/* Curated Gifts Section Title */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {currentOccasion.icon} {lang === 'ta' ? `${currentOccasion.name} பிரத்யேக தேர்வுகள்` : `Curated Recommendations for ${currentOccasion.name}`}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#64748b' }}>
            {lang === 'ta'
              ? 'உங்கள் நிகழ்வு மற்றும் பட்ஜெட்டுக்கு ஏற்றவாறு தேர்ந்தெடுக்கப்பட்ட பொருட்கள்.'
              : `Handpicked suggestions tailored for your ${selectedMonths}-month milestone. Add to future plan or buy now.`}
          </p>
        </div>

        {/* Product Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {displayedProducts.map((product) => {
            const isPlanned = isInFuturePlan(product.id);
            const fitsBudget = product.price <= selectedBudget;
            const monthlyCost = Math.ceil(product.price / selectedMonths);

            return (
              <div
                key={product.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: isPlanned ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                  boxShadow: isPlanned ? '0 8px 24px rgba(124, 58, 237, 0.15)' : '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ position: 'relative', height: '190px', background: '#f8fafc' }}>
                  <img
                    src={product.images?.front || product.image || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                  {product.discount > 0 && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                      <DiscountBadge discount={`${product.discount}% OFF`} />
                    </div>
                  )}
                  {isPlanned && (
                    <span style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: '#7c3aed',
                      color: '#ffffff',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}>
                       IN PLAN
                    </span>
                  )}
                </div>

                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                      <span>{product.category}</span>
                      <span>⭐ {product.rating}</span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.35 }}>
                      {product.name}
                    </h4>

                    <div style={{ marginBottom: '8px' }}>
                      <PriceTag currentPrice={product.price} originalPrice={product.originalPrice} />
                    </div>

                    {/* Timeline & Budget Fit Micro-badges */}
                    <div style={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '0.75rem',
                      marginBottom: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4338ca', fontWeight: 700 }}>
                        <span>️ Monthly Goal:</span>
                        <span>₹{monthlyCost.toLocaleString('en-IN')}/mo</span>
                      </div>
                      <div style={{
                        color: fitsBudget ? '#15803d' : '#b45309',
                        fontWeight: 700,
                        fontSize: '0.72rem'
                      }}>
                        {fitsBudget
                          ? `🎯 Within ₹${selectedBudget.toLocaleString('en-IN')} Budget`
                          : `⚠️ +₹${(product.price - selectedBudget).toLocaleString('en-IN')} over target`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleTogglePlanItem(product)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: isPlanned ? '1.5px solid #dc2626' : '1.5px solid #7c3aed',
                        background: isPlanned ? 'rgba(220, 38, 38, 0.08)' : '#7c3aed',
                        color: isPlanned ? '#dc2626' : '#ffffff',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s'
                      }}
                    >
                      {isPlanned ? ' Remove from Future Plan' : ' Add to Future Plan'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveToCart(product)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        color: '#334155',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      ️ Add to Active Cart ({formatPrice(product.price)})
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FutureCartPage;
