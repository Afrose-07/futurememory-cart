import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  
  const getWishlistKeyForUser = (u) => {
    if (!u || !u.email) return 'fm_wishlist_guest';
    return `fm_wishlist_${u.email.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
  };

  const loadWishlist = (u) => {
    try {
      const stored = localStorage.getItem(getWishlistKeyForUser(u));
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  };

  const [wishlist, setWishlist] = useState(() => loadWishlist(user));

  useEffect(() => {
    setWishlist(loadWishlist(user));
  }, [user?.email]);

  useEffect(() => {
    try {
      localStorage.setItem(getWishlistKeyForUser(user), JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist, user?.email]);

  const generateWishlistKey = (item) => {
    const pId = item.productId || item.id;
    const col = item.color?.name || item.color || 'none';
    const sz = item.size || 'none';
    return `${pId}-${col}-${sz}`;
  };

  const addToWishlist = (product) => {
    const key = generateWishlistKey(product);
    if (!wishlist.find(item => item.wishlistKey === key)) {
      setWishlist(prev => [{
        ...product,
        productId: product.productId || product.id,
        color: product.color?.name || product.color,
        wishlistKey: key,
        addedAt: new Date().toISOString()
      }, ...prev]);
    }
  };

  const removeFromWishlist = (keyOrId) => {
    if (!keyOrId) return;
    const targetStr = String(keyOrId);
    setWishlist(prev => prev.filter(item => 
      item.wishlistKey !== targetStr && 
      String(item.id) !== targetStr && 
      String(item.productId) !== targetStr
    ));
  };

  const isInWishlist = (productOrId, exactSizeMatch = false) => {
    if (!productOrId) return false;
    if (typeof productOrId === 'object') {
      const pId = String(productOrId.productId || productOrId.id || '');
      if (exactSizeMatch && (productOrId.size || productOrId.color)) {
        const key = generateWishlistKey(productOrId);
        return wishlist.some(item => item.wishlistKey === key);
      }
      return wishlist.some(item => 
        String(item.productId || item.id) === pId ||
        item.wishlistKey === pId
      );
    }
    const target = String(productOrId);
    return wishlist.some(item => 
      item.wishlistKey === target || 
      String(item.id) === target || 
      String(item.productId) === target
    );
  };

  const toggleWishlist = (product, exactSizeMatch = false) => {
    if (!product) return;
    if (isInWishlist(product, exactSizeMatch)) {
      const pId = String(product.productId || product.id || '');
      const key = generateWishlistKey(product);
      setWishlist(prev => prev.filter(item => 
        item.wishlistKey !== key && 
        String(item.id) !== pId && 
        String(item.productId) !== pId
      ));
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    localStorage.removeItem(getWishlistKeyForUser(user));
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      toggleWishlist,
      clearWishlist,
      generateWishlistKey
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
