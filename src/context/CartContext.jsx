import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  
  const getStorageKey = (u) => {
    if (!u || !u.email) return 'fm_cart_guest';
    return `fm_cart_${u.email.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
  };

  const loadCart = (u) => {
    try {
      const stored = localStorage.getItem(getStorageKey(u));
      const parsed = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(item => item && (item.id || item.productId));
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
    const col = item.color?.name || (typeof item.color === 'string' ? item.color : 'none');
    const sz = item.size?.name || (typeof item.size === 'string' ? item.size : 'none');
    return `${pId}-${col}-${sz}`;
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
    return cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return total + (price * qty);
    }, 0);
  };

  const getOriginalTotal = () => {
    return cartItems.reduce((total, item) => {
      const orig = Number(item.originalPrice) || Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return total + (orig * qty);
    }, 0);
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
    return cartItems.reduce((count, item) => count + (Number(item.quantity) || 1), 0);
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
