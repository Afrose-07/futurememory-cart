const fs = require('fs');

const cartContextCode = `import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  
  const getStorageKey = (u) => {
    if (!u || !u.email) return 'fm_cart_guest';
    return \`fm_cart_\${u.email.toLowerCase().replace(/[^a-z0-9_]/g, '_')}\`;
  };

  const loadCart = (u) => {
    try {
      const stored = localStorage.getItem(getStorageKey(u));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const [cartItems, setCartItems] = useState(() => loadCart(user));
  const [appliedPromo, setAppliedPromo] = useState(null);

  useEffect(() => {
    setCartItems(loadCart(user));
  }, [user?.email]);

  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(user), JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems, user?.email]);

  const generateCartKey = (item) => {
    const pId = item.productId || item.id;
    const col = item.color || 'none';
    const sz = item.size || 'none';
    return \`\${pId}-\${col}-\${sz}\`;
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const cartKey = generateCartKey(product);
      const existing = prev.find(item => item.cartKey === cartKey);
      if (existing) {
        return prev.map(item =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, cartKey, quantity }];
    });
  };

  const removeFromCart = (cartKey) => {
    setCartItems(prev => prev.filter(item => item.cartKey !== cartKey));
  };

  const updateQuantity = (cartKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.cartKey === cartKey ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedPromo(null);
    localStorage.removeItem(getStorageKey(user));
  };

  const applyPromoCode = (code) => {
    if (!code) return { success: false, message: 'Please enter a coupon code' };
    const clean = code.trim().toUpperCase();
    if (clean === 'FUTURE20') {
      setAppliedPromo({ code: 'FUTURE20', discountPercent: 20 });
      return { success: true, message: '20% Special Discount Applied!' };
    } else if (clean === 'WELCOME10') {
      setAppliedPromo({ code: 'WELCOME10', discountPercent: 10 });
      return { success: true, message: '10% Welcome Discount Applied!' };
    }
    return { success: false, message: 'Invalid coupon code. Try FUTURE20 or WELCOME10' };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
  };

  const getOriginalTotal = () => {
    return cartItems.reduce((total, item) => 
      total + ((item.originalPrice || item.price) * item.quantity), 0
    );
  };

  const getDiscountAmount = () => {
    const subtotal = getSubtotal();
    if (!appliedPromo) return 0;
    return Math.round((subtotal * appliedPromo.discountPercent) / 100);
  };

  const getCartTotal = () => {
    const subtotal = getSubtotal();
    const promoDiscount = getDiscountAmount();
    const finalAmount = subtotal - promoDiscount;
    return finalAmount > 0 ? finalAmount : 0;
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      appliedPromo,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      applyPromoCode,
      removePromoCode,
      getSubtotal,
      getOriginalTotal,
      getDiscountAmount,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
`;

const memoryCartContextCode = `import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getNextReminderDate, isReminderDue } from '../utils/helpers';

const MemoryCartContext = createContext();

export const MemoryCartProvider = ({ children }) => {
  const { user } = useAuth();

  const getMemoryKey = (u) => {
    if (!u || !u.email) return 'fm_memory_guest';
    return \`fm_memory_\${u.email.toLowerCase().replace(/[^a-z0-9_]/g, '_')}\`;
  };

  const loadMemory = (u) => {
    try {
      const stored = localStorage.getItem(getMemoryKey(u));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const [memoryItems, setMemoryItems] = useState(() => loadMemory(user));

  useEffect(() => {
    setMemoryItems(loadMemory(user));
  }, [user?.email]);

  useEffect(() => {
    try {
      localStorage.setItem(getMemoryKey(user), JSON.stringify(memoryItems));
    } catch (e) {
      console.error(e);
    }
  }, [memoryItems, user?.email]);

  const generateCartKey = (item) => {
    const pId = item.productId || item.id;
    const col = item.color || 'none';
    const sz = item.size || 'none';
    return \`\${pId}-\${col}-\${sz}\`;
  };

  const addToMemoryCart = (product, reminderMonths = 2) => {
    const months = parseInt(reminderMonths, 10) || 2;
    const savedDate = new Date().toISOString();
    const nextReminder = getNextReminderDate(months);
    const cartKey = generateCartKey(product);
    
    setMemoryItems(prev => {
      const existing = prev.find(item => item.cartKey === cartKey);
      if (existing) {
        return prev.map(item =>
          item.cartKey === cartKey
            ? {
                ...item,
                ...product,
                reminderMonths: months,
                savedDate,
                nextReminder,
                usageFrequency: \`Every \${months} Month\${months > 1 ? 's' : ''}\`
              }
            : item
        );
      }
      return [
        {
          ...product,
          cartKey,
          savedDate,
          reminderMonths: months,
          nextReminder,
          savedPrice: product.savedPrice || product.price,
          usageFrequency: \`Every \${months} Month\${months > 1 ? 's' : ''}\`,
          autoNotification: true
        },
        ...prev
      ];
    });
  };

  const removeFromMemoryCart = (cartKey) => {
    setMemoryItems(prev => prev.filter(item => item.cartKey !== cartKey));
  };

  const editReminder = (cartKey, months) => {
    const m = parseInt(months, 10) || 1;
    setMemoryItems(prev =>
      prev.map(item =>
        item.cartKey === cartKey
          ? {
              ...item,
              reminderMonths: m,
              nextReminder: getNextReminderDate(m),
              usageFrequency: \`Every \${m} Month\${m > 1 ? 's' : ''}\`
            }
          : item
      )
    );
  };

  const snoozeReminder = (cartKey, days = 7) => {
    setMemoryItems(prev =>
      prev.map(item => {
        if (item.cartKey === cartKey) {
          const snoozed = new Date();
          snoozed.setDate(snoozed.getDate() + days);
          return {
            ...item,
            nextReminder: snoozed.toISOString()
          };
        }
        return item;
      })
    );
  };

  const resetReminderCycle = (cartKey) => {
    setMemoryItems(prev =>
      prev.map(item => {
        if (item.cartKey === cartKey) {
          return {
            ...item,
            savedDate: new Date().toISOString(),
            nextReminder: getNextReminderDate(item.reminderMonths || 2)
          };
        }
        return item;
      })
    );
  };

  const isInMemoryCart = (idOrKey) => {
    // Just a fallback check if we pass id or cartKey
    return memoryItems.some(item => item.cartKey === idOrKey || item.id === idOrKey);
  };

  const getDueReminders = () => {
    return memoryItems.filter(item => isReminderDue(item.nextReminder));
  };

  const getPriceDropItems = () => {
    return memoryItems.filter(item => item.savedPrice && item.price < item.savedPrice);
  };

  const clearMemoryCart = () => {
    setMemoryItems([]);
    localStorage.removeItem(getMemoryKey(user));
  };

  return (
    <MemoryCartContext.Provider value={{
      memoryItems,
      addToMemoryCart,
      removeFromMemoryCart,
      editReminder,
      snoozeReminder,
      resetReminderCycle,
      isInMemoryCart,
      getDueReminders,
      getPriceDropItems,
      clearMemoryCart
    }}>
      {children}
    </MemoryCartContext.Provider>
  );
};

export const useMemoryCart = () => useContext(MemoryCartContext);
`;

const cartItemCode = `import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useMemoryCart } from '../context/MemoryCartContext';
import { useLanguage } from '../context/LanguageContext';
import PriceTag from './PriceTag';
import { formatPrice } from '../utils/helpers';
import './CartItem.css';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToMemoryCart } = useMemoryCart();
  const { t } = useLanguage();

  const handleMoveToMemoryCart = () => {
    addToMemoryCart(item, 2);
    removeFromCart(item.cartKey);
  };

  const handleMoveToWishlist = () => {
    if (!isInWishlist(item.id)) {
      toggleWishlist(item);
    }
    removeFromCart(item.cartKey);
  };

  return (
    <div className="fm-cart-item">
      <Link to={\`/product/\${item.productId || item.id}\`} className="fm-cart-item-img-link">
        <img src={item.images?.front || item.image} alt={item.name} className="fm-cart-item-img" />
      </Link>

      <div className="fm-cart-item-info">
        <div className="fm-cart-item-header">
          <Link to={\`/product/\${item.productId || item.id}\`} className="fm-cart-item-title">
            {item.name}
          </Link>
          <button
            className="fm-cart-item-delete"
            onClick={() => removeFromCart(item.cartKey)}
            title={t('removeFromCart') || 'Remove from cart'}
          >
            ️
          </button>
        </div>

        <div className="fm-cart-item-category">{item.category}</div>
        
        {(item.color || item.size) && (
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            {item.color && <span>Colour: {item.color}</span>}
            {item.color && item.size && <span style={{ margin: '0 8px' }}>|</span>}
            {item.size && <span>Size: {item.size}</span>}
          </div>
        )}

        <div className="fm-cart-item-pricing" style={{ marginTop: '8px' }}>
          <PriceTag currentPrice={item.price} originalPrice={item.originalPrice} size="small" />
        </div>

        <div className="fm-cart-item-controls">
          <div className="fm-qty-control">
            <button
              className="fm-qty-btn"
              onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="fm-qty-display">{item.quantity}</span>
            <button
              className="fm-qty-btn"
              onClick={() => updateQuantity(item.cartKey, Math.min(item.stock || 99, item.quantity + 1))}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="fm-cart-item-subtotal">
            <span className="subtotal-label">{t('totalLabel') || 'Total:'}</span>
            <span className="subtotal-val">{formatPrice(item.price * item.quantity)}</span>
          </div>
        </div>

        <div className="fm-cart-item-quick-moves">
          <button className="fm-move-btn" onClick={handleMoveToWishlist}>
            Move to Wishlist
          </button>
          <span className="dot-sep">•</span>
          <button className="fm-move-btn memory-color" onClick={handleMoveToMemoryCart}>
             Move to Memory Cart (Repurchase)
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
`;

const memoryCartItemCode = `import React, { useState } from 'react';
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
  const { removeFromMemoryCart, editReminder, snoozeReminder, resetReminderCycle } = useMemoryCart();
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
      message: \`\${item.name} added to normal cart. Next reminder scheduled in \${item.reminderMonths} month(s).\`,
      type: 'order',
      link: '/cart'
    });
    showToast('Moved to Cart & Cycle Reset! ️');
  };

  const handleSaveEdit = () => {
    editReminder(item.cartKey, selectedMonths);
    setIsEditing(false);
    showToast(\`Updated to Every \${selectedMonths} Months!\`);
  };

  const handleSnooze = () => {
    snoozeReminder(item.cartKey, 7);
    showToast('Snoozed reminder for 7 days! ');
  };

  return (
    <div className={\`fm-memory-card \${isDue ? 'is-due' : ''}\`}>
      {actionMessage && <div className="fm-memory-toast">{actionMessage}</div>}

      <div className="fm-memory-header">
        <div className="fm-memory-status-badge">
          {isDue ? (
            <span className="badge-due">️ Refill Due Today</span>
          ) : (
            <span className="badge-upcoming"> Next refill in {daysLeft > 0 ? \`\${daysLeft} days\` : '1 day'}</span>
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
        <Link to={\`/product/\${item.productId || item.id}\`} className="fm-memory-img-link">
          <img src={item.images?.front || item.image} alt={item.name} className="fm-memory-img" />
        </Link>

        <div className="fm-memory-content">
          <div className="fm-memory-cat">{item.category}</div>
          <Link to={\`/product/\${item.productId || item.id}\`} className="fm-memory-title">
            {item.name}
          </Link>
          
          {(item.color || item.size) && (
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px', marginBottom: '8px' }}>
              {item.color && <span>Colour: {item.color}</span>}
              {item.color && item.size && <span style={{ margin: '0 8px' }}>|</span>}
              {item.size && <span>Size: {item.size}</span>}
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
                   Snooze 7d
                </button>
              )}
              <button
                className="fm-subaction-btn"
                onClick={() => setIsEditing(!isEditing)}
              >
                ️ {isEditing ? 'Close Edit' : 'Edit Interval'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryCartItem;
`;

fs.writeFileSync('src/context/CartContext.jsx', cartContextCode);
fs.writeFileSync('src/context/MemoryCartContext.jsx', memoryCartContextCode);
fs.writeFileSync('src/components/CartItem.jsx', cartItemCode);
fs.writeFileSync('src/components/MemoryCartItem.jsx', memoryCartItemCode);
