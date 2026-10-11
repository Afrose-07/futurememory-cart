import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Link, NavLink } from 'react-router-dom';
import { useMemoryCart } from '../context/MemoryCartContext';
import { useCart } from '../context/CartContext';
import MemoryCartItem from '../components/MemoryCartItem';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { formatPrice } from '../utils/helpers';
import './MemoryCartPage.css';

const MemoryCartPriceAlertPage = () => {
  const { memoryItems, getDueReminders, getPriceDropItems } = useMemoryCart();
  const { addToCart } = useCart();
  const { addNotification } = useNotifications();
  const [alertDispatched, setAlertDispatched] = useState(null);

  const handleSendPriceDropAlert = () => {
    const pref = localStorage.getItem('customer_notification_pref') || 'whatsapp';
    const phone = (localStorage.getItem('customer_whatsapp_number') || '9876543210').replace(/\D/g, '');
    const fullPhone = phone.length === 10 ? '91' + phone : phone;

    const alertMsg = `Memory Cart Price Drop Alert! 🎉\n${priceDropItems.length} items on your essentials list have dropped in price! Total savings: ₹${totalSavings}.\nOrder now before prices reset: http://localhost:5173/memory-cart/price-alerts`;

    setAlertDispatched({
      channel: pref,
      target: pref === 'whatsapp' ? `+${fullPhone}` : 'your registered Email',
      message: `Dispatched to ${pref.toUpperCase()} (${pref === 'whatsapp' ? '+' + fullPhone : 'Email'}): Total savings ₹${totalSavings}`,
      waLink: pref === 'whatsapp' ? `https://wa.me/${fullPhone}?text=${encodeURIComponent(alertMsg)}` : null
    });

    addNotification({
      title: 'Price Drop Alert Sent! 📉',
      message: `Notified via ${pref.toUpperCase()} for ₹${totalSavings} savings`,
      type: 'deal'
    });
  };

  const dueReminders = getDueReminders();
  const priceDropItems = getPriceDropItems();

  const totalSavings = priceDropItems.reduce((acc, item) => {
    return acc + ((item.savedPrice || item.price) - item.price);
  }, 0);

  const handleBuyAllDeals = () => {
    priceDropItems.forEach(item => {
      addToCart(item, 1);
    });
  };

  return (
    <div className="fm-memory-page">
      <PageHeader
        title=" Memory Cart Price Drop Alerts"
        subtitle="Automatic savings detection on your saved recurring essentials."
        breadcrumbs={[
          { label: 'Memory Cart', link: '/memory-cart' },
          { label: 'Price Alerts' }
        ]}
        badge={`Total Savings: ${formatPrice(totalSavings)}`}
        action={
          priceDropItems.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleSendPriceDropAlert}
                style={{
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🔔 Notify Me on WhatsApp / Email
              </button>
              <Button variant="success" onClick={handleBuyAllDeals} icon="">
                Claim Deals ({priceDropItems.length}) - Add to Cart
              </Button>
            </div>
          )
        }
      />

      <div className="container">
        {alertDispatched && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.8rem' }}>{alertDispatched.channel === 'whatsapp' ? '💬' : '✉️'}</span>
              <div>
                <strong style={{ color: '#15803d', display: 'block' }}>Price Drop Notification Dispatched!</strong>
                <span style={{ fontSize: '0.84rem', color: '#334155' }}>{alertDispatched.message}</span>
              </div>
            </div>
            {alertDispatched.waLink && (
              <a
                href={alertDispatched.waLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: '#16a34a', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 700, textDecoration: 'none' }}
              >
                Open in WhatsApp ↗
              </a>
            )}
          </div>
        )}
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

        {priceDropItems.length === 0 ? (
          <EmptyState
            icon="️"
            title="No Active Price Drops Right Now"
            description="We continuously track price changes on all your Memory Cart items. As soon as a seller applies a discount, you will see it here and receive an in-app notification!"
            actionText="View Scheduled Essentials"
            actionLink="/memory-cart"
            variant="memory"
          />
        ) : (
          <div className="fm-memory-items-grid">
            {priceDropItems.map((item) => (
              <MemoryCartItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryCartPriceAlertPage;
