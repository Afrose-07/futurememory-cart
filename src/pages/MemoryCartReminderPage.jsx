import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useMemoryCart } from '../context/MemoryCartContext';
import { useCart } from '../context/CartContext';
import MemoryCartItem from '../components/MemoryCartItem';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import './MemoryCartPage.css';

const MemoryCartReminderPage = () => {
  const { memoryItems, getDueReminders, getPriceDropItems } = useMemoryCart();
  const { addToCart } = useCart();

  const dueReminders = getDueReminders();
  const priceDropItems = getPriceDropItems();

  const handleRefillAll = () => {
    dueReminders.forEach(item => {
      addToCart(item, 1);
    });
  };

  return (
    <div className="fm-memory-page">
      <PageHeader
        title=" Memory Cart Refill Reminders"
        subtitle="Items currently due or approaching their replenishment cycle."
        breadcrumbs={[
          { label: 'Memory Cart', link: '/memory-cart' },
          { label: 'Due Reminders' }
        ]}
        badge={`${dueReminders.length} Due for Refill`}
        action={
          dueReminders.length > 0 && (
            <Button variant="primary" onClick={handleRefillAll} icon="️">
              Refill All to Active Cart
            </Button>
          )
        }
      />

      <div className="container">
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

        {dueReminders.length === 0 ? (
          <EmptyState
            icon=""
            title="No Items Due for Refill Today!"
            description="You are fully stocked! Your recurring essentials in Memory Cart will alert you automatically as soon as their target refill date arrives."
            actionText="View All Scheduled Items"
            actionLink="/memory-cart"
            variant="memory"
          />
        ) : (
          <div className="fm-memory-items-grid">
            {dueReminders.map((item) => (
              <MemoryCartItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryCartReminderPage;
