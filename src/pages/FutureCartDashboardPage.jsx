import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useFutureCart } from '../context/FutureCartContext';
import { useCart } from '../context/CartContext';
import FutureCartCard from '../components/FutureCartCard';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { formatPrice, formatDate, getDaysRemaining } from '../utils/helpers';
import './FutureCartPage.css';

const FutureCartDashboardPage = () => {
  const { futureData, getPlannedTotal, resetFutureCart } = useFutureCart();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const occasion = futureData.occasion || 'Milestone Event';
  const plannedTotal = getPlannedTotal();
  const budgetGoal = futureData.budgetGoal || 15000;
  const budgetPercent = Math.min(100, Math.round((plannedTotal / (budgetGoal || 1)) * 100));
  const daysLeft = getDaysRemaining(futureData.targetDate);

  const handleBuyAllPlanned = () => {
    futureData.plannedProducts.forEach(item => {
      addToCart(item, 1);
    });
    navigate('/cart');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your current Future Cart plan?')) {
      resetFutureCart();
      navigate('/future-cart');
    }
  };

  return (
    <div className="fm-future-page">
      <PageHeader
        title={` ${occasion} Planning Dashboard`}
        subtitle="Manage timeline milestones, monitor budget allocation, and execute purchases ahead of your event."
        breadcrumbs={[
          { label: 'Future Cart', link: '/future-cart' },
          { label: `${occasion} Dashboard` }
        ]}
        badge={`${futureData.plannedProducts.length} Items Planned`}
        action={
          futureData.plannedProducts.length > 0 ? (
            <Button variant="primary" onClick={handleBuyAllPlanned} icon="">
              Move All {futureData.plannedProducts.length} Items to Active Cart
            </Button>
          ) : (
            <Link to="/future-cart">
              <Button variant="future">Start New Occasion Plan</Button>
            </Link>
          )
        }
      />

      <div className="container">
        {/* Dashboard Metrics Grid */}
        <div className="fm-memory-metrics-grid">
          <div className="fm-metric-card">
            <span className="metric-icon"></span>
            <div className="metric-info">
              <span className="metric-title">Target Date</span>
              <strong className="metric-value">{futureData.targetDate ? formatDate(futureData.targetDate) : 'Not Set'}</strong>
              <span style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>
                {daysLeft > 0 ? `${daysLeft} days remaining` : 'Planned Horizon'}
              </span>
            </div>
          </div>

          <div className="fm-metric-card">
            <span className="metric-icon"></span>
            <div className="metric-info">
              <span className="metric-title">Planned Items Value</span>
              <strong className="metric-value">{formatPrice(plannedTotal)}</strong>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {futureData.plannedProducts.length} Products Allocated
              </span>
            </div>
          </div>

          <div className="fm-metric-card">
            <span className="metric-icon"></span>
            <div className="metric-info">
              <span className="metric-title">Budget Ceiling</span>
              <strong className="metric-value">{formatPrice(budgetGoal)}</strong>
              <span style={{ fontSize: '0.75rem', color: budgetPercent > 90 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                {budgetPercent}% Utilized
              </span>
            </div>
          </div>

          <Link to="/future-cart/deal-alerts" className="fm-metric-card linkable-card">
            <span className="metric-icon">️</span>
            <div className="metric-info">
              <span className="metric-title">Occasion Deal Alerts</span>
              <strong className="metric-value" style={{ color: '#7c3aed' }}>Active</strong>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Early-bird offers</span>
            </div>
            <span className="metric-arrow">→</span>
          </Link>
        </div>

        {/* Budget Progress Bar */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
          marginBottom: '32px'
        }}>
          <div className="flex-between mb-1">
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
              Budget Allocation Progress: {formatPrice(plannedTotal)} of {formatPrice(budgetGoal)}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#7c3aed' }}>
              {budgetPercent}%
            </span>
          </div>
          <div style={{
            height: '10px',
            background: '#f1f5f9',
            borderRadius: '9999px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${budgetPercent}%`,
              height: '100%',
              background: budgetPercent > 90 ? '#ef4444' : 'linear-gradient(90deg, #7c3aed, var(--primary-color))',
              borderRadius: '9999px',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Tab Subnavigation */}
        <div className="fm-memory-tabs">
          <NavLink to="/future-cart/dashboard" className={({ isActive }) => `fm-tab-btn ${isActive ? 'active' : ''}`}>
            Planned Items ({futureData.plannedProducts.length})
          </NavLink>
          <NavLink to={`/future-cart/recommendations?occasion=${encodeURIComponent(occasion)}`} className={({ isActive }) => `fm-tab-btn ${isActive ? 'active' : ''}`}>
            Curated Recommendations
          </NavLink>
          <NavLink to="/future-cart/deal-alerts" className={({ isActive }) => `fm-tab-btn ${isActive ? 'active' : ''}`}>
            Matched Deals & Discounts
          </NavLink>
        </div>

        {/* Products Grid */}
        {futureData.plannedProducts.length === 0 ? (
          <EmptyState
            icon=""
            title="No Items Added to This Plan Yet"
            description={`Explore recommendations curated specifically for your upcoming ${occasion} and add them to your planner.`}
            actionText="View Curated Recommendations"
            actionLink={`/future-cart/recommendations?occasion=${encodeURIComponent(occasion)}`}
            variant="future"
          />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
              {futureData.plannedProducts.map((prod) => (
                <FutureCartCard key={prod.id} product={prod} />
              ))}
            </div>

            <div className="flex-between" style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link to={`/future-cart/recommendations?occasion=${encodeURIComponent(occasion)}`}>
                  <Button variant="outline" size="sm">+ Add More Products</Button>
                </Link>
                <Link to="/shop">
                  <Button variant="secondary" size="sm">Explore Full Catalog</Button>
                </Link>
              </div>

              <button
                onClick={handleReset}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                ️ Clear & Reset Plan
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FutureCartDashboardPage;
