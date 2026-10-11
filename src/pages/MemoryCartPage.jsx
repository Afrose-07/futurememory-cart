import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useMemoryCart } from '../context/MemoryCartContext';
import { useCart } from '../context/CartContext';
import MemoryCartItem from '../components/MemoryCartItem';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { formatPrice } from '../utils/helpers';
import './MemoryCartPage.css';

const MemoryCartPage = () => {
  const { memoryItems, getDueReminders, getPriceDropItems } = useMemoryCart();
  const { addToCart } = useCart();

  const dueReminders = getDueReminders();
  const priceDropItems = getPriceDropItems();

  const totalMonthlySpend = memoryItems.reduce((acc, item) => {
    const monthlyRatio = 1 / (item.reminderMonths || 2);
    return acc + (item.price * monthlyRatio);
  }, 0);

  const handleAddAllDueToCart = () => {
    dueReminders.forEach(item => {
      addToCart(item, 1);
    });
  };

  return (
    <div className="fm-memory-page">
      <PageHeader
        title=" Memory Cart Dashboard"
        subtitle="Your smart recurring repurchase hub. Track essential refill timelines and catch price drops automatically."
        breadcrumbs={[{ label: 'Memory Cart' }]}
        badge={`${memoryItems.length} Recurring Essentials`}
        action={
          dueReminders.length > 0 ? (
            <Button variant="primary" onClick={handleAddAllDueToCart} icon="">
              Add All {dueReminders.length} Due Items to Normal Cart
            </Button>
          ) : (
            <Link to="/shop?category=Beauty">
              <Button variant="memory" icon="+">Add More Essentials</Button>
            </Link>
          )
        }
      />

      <div className="container">
        {/* Metric Summary Cards */}
        <div className="fm-memory-metrics-grid">
          <div className="fm-metric-card">
            <span className="metric-icon"></span>
            <div className="metric-info">
              <span className="metric-title">Tracked Essentials</span>
              <strong className="metric-value">{memoryItems.length} Products</strong>
            </div>
          </div>

          <Link to="/memory-cart/reminders" className="fm-metric-card linkable-card">
            <span className="metric-icon">️</span>
            <div className="metric-info">
              <span className="metric-title">Refills Due Now</span>
              <strong className="metric-value due-color">{dueReminders.length} Items</strong>
            </div>
            <span className="metric-arrow">→</span>
          </Link>

          <Link to="/memory-cart/price-alerts" className="fm-metric-card linkable-card">
            <span className="metric-icon"></span>
            <div className="metric-info">
              <span className="metric-title">Price Drops Detected</span>
              <strong className="metric-value drop-color">{priceDropItems.length} Deals</strong>
            </div>
            <span className="metric-arrow">→</span>
          </Link>

          <div className="fm-metric-card">
            <span className="metric-icon"></span>
            <div className="metric-info">
              <span className="metric-title">Est. Monthly Refill Spend</span>
              <strong className="metric-value">{formatPrice(Math.round(totalMonthlySpend))}</strong>
            </div>
          </div>
        </div>

        {/* Tab Subnavigation */}
        <div className="fm-memory-tabs">
          <NavLink to="/memory-cart" end className={({ isActive }) => `fm-tab-btn ${isActive ? 'active' : ''}`}>
            All Scheduled Items ({memoryItems.length})
          </NavLink>
          <NavLink to="/memory-cart/reminders" className={({ isActive }) => `fm-tab-btn ${isActive ? 'active' : ''}`}>
            Due Reminders ({dueReminders.length})
          </NavLink>
          <NavLink to="/memory-cart/price-alerts" className={({ isActive }) => `fm-tab-btn ${isActive ? 'active' : ''}`}>
            Price Drop Alerts ({priceDropItems.length})
          </NavLink>
        </div>

        {/* Items Listing */}
        {memoryItems.length === 0 ? (
          <EmptyState
            icon=""
            title="Your Memory Cart is Empty"
            description="Add products like daily shampoo, skincare kits, or grooming essentials that you buy repeatedly. We'll track refill schedules and alert you when prices drop."
            actionText="Discover Daily Essentials"
            actionLink="/shop?category=Beauty"
            variant="memory"
          />
        ) : (
          <div className="fm-memory-items-grid">
            {memoryItems.map((item) => (
              <MemoryCartItem key={item.cartKey} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryCartPage;
