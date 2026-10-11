import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Link, NavLink } from 'react-router-dom';
import { useFutureCart } from '../context/FutureCartContext';
import { useCart } from '../context/CartContext';
import FutureCartCard from '../components/FutureCartCard';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { formatPrice } from '../utils/helpers';
import './FutureCartPage.css';

const FutureCartDealAlertPage = () => {
  const { futureData } = useFutureCart();
  const { addToCart } = useCart();
  const { addNotification } = useNotifications();
  const [dealAlertSent, setDealAlertSent] = useState(null);

  const handleSendFutureDealAlert = () => {
    const pref = localStorage.getItem('customer_notification_pref') || 'whatsapp';
    const phone = (localStorage.getItem('customer_whatsapp_number') || '9876543210').replace(/\D/g, '');
    const fullPhone = phone.length === 10 ? '91' + phone : phone;

    const alertMsg = `Future Cart Deal Alert! 🎉\nMilestone: ${occasion}\n${dealItems.length} items in your future plan have matched active merchant discounts! Total savings: ₹${totalDealSavings}.\nCheck deals: http://localhost:5173/future-cart/deal-alerts`;

    setDealAlertSent({
      channel: pref,
      target: pref === 'whatsapp' ? `+${fullPhone}` : 'your registered Email',
      message: `Dispatched to ${pref.toUpperCase()} (${pref === 'whatsapp' ? '+' + fullPhone : 'Email'}): Total savings ₹${totalDealSavings}`,
      waLink: pref === 'whatsapp' ? `https://wa.me/${fullPhone}?text=${encodeURIComponent(alertMsg)}` : null
    });

    addNotification({
      title: 'Future Cart Deal Alert Dispatched! 🎯',
      message: `Sent to ${pref.toUpperCase()} for ${occasion}`,
      type: 'deal'
    });
  };

  const occasion = futureData.occasion || 'Milestone Plan';
  // Deals in planned products (discount > 0)
  const dealItems = futureData.plannedProducts.filter(p => p.discount > 0);

  const totalDealSavings = dealItems.reduce((acc, item) => {
    return acc + ((item.originalPrice || item.price) - item.price);
  }, 0);

  const handleBuyAllDeals = () => {
    dealItems.forEach(item => {
      addToCart(item, 1);
    });
  };

  return (
    <div className="fm-future-page">
      <PageHeader
        title={`️ ${occasion} Deal & Discount Alerts`}
        subtitle="Exclusive discounts detected on items in your active future cart."
        breadcrumbs={[
          { label: 'Future Cart', link: '/future-cart' },
          { label: `${occasion} Dashboard`, link: '/future-cart/dashboard' },
          { label: 'Deal Alerts' }
        ]}
        badge={`Total Savings: ${formatPrice(totalDealSavings)}`}
        action={
          dealItems.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleSendFutureDealAlert}
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
                Buy All Deal Items ({dealItems.length}) Now
              </Button>
            </div>
          )
        }
      />

      <div className="container">
        {dealAlertSent && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.8rem' }}>{dealAlertSent.channel === 'whatsapp' ? '💬' : '✉️'}</span>
              <div>
                <strong style={{ color: '#15803d', display: 'block' }}>Future Cart Deal Notification Dispatched!</strong>
                <span style={{ fontSize: '0.84rem', color: '#334155' }}>{dealAlertSent.message}</span>
              </div>
            </div>
            {dealAlertSent.waLink && (
              <a
                href={dealAlertSent.waLink}
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
          <NavLink to="/future-cart/dashboard" className={({ isActive }) => `fm-tab-btn ${isActive ? 'active' : ''}`}>
            Planned Items ({futureData.plannedProducts.length})
          </NavLink>
          <NavLink to={`/future-cart/recommendations?occasion=${encodeURIComponent(occasion)}`} className={({ isActive }) => `fm-tab-btn ${isActive ? 'active' : ''}`}>
            Curated Recommendations
          </NavLink>
          <NavLink to="/future-cart/deal-alerts" className={({ isActive }) => `fm-tab-btn ${isActive ? 'active' : ''}`}>
            Matched Deals & Discounts ({dealItems.length})
          </NavLink>
        </div>

        {dealItems.length === 0 ? (
          <EmptyState
            icon="️"
            title="No Active Discount Drops on Planned Items"
            description="Your planned items are currently at regular prices. We monitor live merchant flash sales and will notify you when discounts appear."
            actionText="View Future Cart Dashboard"
            actionLink="/future-cart/dashboard"
            variant="future"
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {dealItems.map((prod) => (
              <FutureCartCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FutureCartDealAlertPage;
