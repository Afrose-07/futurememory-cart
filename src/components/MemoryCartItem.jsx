import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useMemoryCart } from '../context/MemoryCartContext';
import { useNotifications } from '../context/NotificationContext';
import PriceTag from './PriceTag';
import Button from './Button';
import Dropdown from './Dropdown';
import { formatDate, isReminderDue, getDaysRemaining, formatPrice } from '../utils/helpers';
import { REMINDER_OPTIONS } from '../utils/constants';
import './MemoryCartItem.css';

const MemoryCartItem = ({ item }) => {
  const { addToCart } = useCart();
  const { removeFromMemoryCart, editReminder, snoozeReminder, resetReminderCycle, markAsDueToday, simulatePriceDrop } = useMemoryCart();
  const { addNotification } = useNotifications();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState(item.reminderMonths || 2);
  const [actionMessage, setActionMessage] = useState('');

  const isDue = isReminderDue(item.nextReminder);
  const daysLeft = getDaysRemaining(item.nextReminder);
  const hasPriceDrop = item.savedPrice && item.price < item.savedPrice;
  const priceDropAmount = hasPriceDrop ? item.savedPrice - item.price : 0;

  const showToast = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 2500);
  };

  const handleAddToCart = () => {
    // Preserve quantity, size, color when moving to Cart
    addToCart(item, item.quantity || 1);
    resetReminderCycle(item.cartKey);
    addNotification({
      title: 'Item Added to Cart & Refill Cycle Reset',
      message: `${item.name} added to normal cart. Next reminder scheduled in ${item.reminderMonths} month(s).`,
      type: 'order',
      link: '/cart'
    });
    showToast('Moved to Cart & Cycle Reset! ️');
  };

  const handleSaveEdit = () => {
    editReminder(item.cartKey, selectedMonths);
    setIsEditing(false);
    showToast(`Updated to Every ${selectedMonths} Months!`);
  };

  const handleSnooze = () => {
    snoozeReminder(item.cartKey, 7);
    showToast('Snoozed reminder for 7 days! ');
  };

  return (
    <div className={`fm-memory-card ${isDue ? 'is-due' : ''}`}>
      {actionMessage && <div className="fm-memory-toast">{actionMessage}</div>}

      <div className="fm-memory-header">
        <div className="fm-memory-status-badge">
          {isDue ? (
            <span className="badge-due">️ Refill Due Today</span>
          ) : (
            <span className="badge-upcoming"> Next refill in {daysLeft > 0 ? `${daysLeft} days` : '1 day'}</span>
          )}
        </div>
        <button
          className="fm-memory-remove"
          onClick={() => removeFromMemoryCart(item.cartKey)}
          title="Remove from Memory Cart"
        >
          
        </button>
      </div>

      <div className="fm-memory-body">
        <Link to={`/product/${item.productId || item.id}`} className="fm-memory-img-link">
          <img src={item.images?.front || item.image} alt={item.name} className="fm-memory-img" />
        </Link>

        <div className="fm-memory-content">
          <div className="fm-memory-cat">{item.category}</div>
          <Link to={`/product/${item.productId || item.id}`} className="fm-memory-title">
            {item.name}
          </Link>
          
          {(item.color || item.size) && (
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px', marginBottom: '8px' }}>
              {item.color && <span>Colour: {typeof item.color === 'object' ? (item.color.name || item.color.label || '') : String(item.color)}</span>}
              {item.color && item.size && <span style={{ margin: '0 8px' }}>|</span>}
              {item.size && <span>Size: {typeof item.size === 'object' ? (item.size.name || item.size.label || '') : String(item.size)}</span>}
            </div>
          )}

          <div className="fm-memory-pricing-row">
            <PriceTag currentPrice={item.price} originalPrice={item.originalPrice} />
            {hasPriceDrop && (
              <span className="fm-memory-price-drop-pill">
                 Save {formatPrice(priceDropAmount)} vs saved price
              </span>
            )}
          </div>

          <div className="fm-memory-schedule-box">
            <div className="fm-schedule-info">
              <span className="schedule-label">Frequency:</span>
              <span className="schedule-val">Every {item.reminderMonths || 2} Month(s)</span>
            </div>
            <div className="fm-schedule-info">
              <span className="schedule-label">Target Date:</span>
              <span className="schedule-val">{formatDate(item.nextReminder)}</span>
            </div>
          </div>

          {isEditing && (
            <div className="fm-memory-edit-panel">
              <Dropdown
                label="Change Refill Interval:"
                options={REMINDER_OPTIONS}
                value={selectedMonths}
                onChange={setSelectedMonths}
              />
              <div className="fm-memory-edit-actions">
                <Button size="sm" variant="memory" onClick={handleSaveEdit}>
                  Save
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="fm-memory-actions">
            <Button
              variant={isDue ? 'primary' : 'secondary'}
              size="sm"
              onClick={handleAddToCart}
              icon="️"
            >
              {isDue ? 'Order Refill Now' : 'Move to Cart'}
            </Button>

            <div className="fm-memory-subactions">
              {isDue && (
                <button className="fm-subaction-btn" onClick={handleSnooze}>
                  ⏰ Snooze 7d
                </button>
              )}
              {!isDue && markAsDueToday && (
                <button 
                  className="fm-subaction-btn" 
                  onClick={() => { markAsDueToday(item.cartKey); showToast('Marked as Refill Due Today! ⚡'); }}
                  title="Test Due Today state (Fig 8.68)"
                >
                  ⚡ Trigger Due
                </button>
              )}
              {!hasPriceDrop && simulatePriceDrop && (
                <button 
                  className="fm-subaction-btn" 
                  onClick={() => { simulatePriceDrop(item.cartKey); showToast('Price Drop simulated! 📉'); }}
                  title="Test Price Drop Alert state (Fig 8.69)"
                >
                  📉 Test Price Drop
                </button>
              )}
              <button
                className="fm-subaction-btn"
                onClick={() => setIsEditing(!isEditing)}
              >
                ✏️ {isEditing ? 'Close Edit' : 'Edit Interval'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryCartItem;
