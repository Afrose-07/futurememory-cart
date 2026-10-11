const fs = require('fs');

const wishlistContextCode = `import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  
  const getWishlistKeyForUser = (u) => {
    if (!u || !u.email) return 'fm_wishlist_guest';
    return \`fm_wishlist_\${u.email.toLowerCase().replace(/[^a-z0-9_]/g, '_')}\`;
  };

  const loadWishlist = (u) => {
    try {
      const stored = localStorage.getItem(getWishlistKeyForUser(u));
      return stored ? JSON.parse(stored) : [];
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
    return \`\${pId}-\${col}-\${sz}\`;
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
    setWishlist(prev => prev.filter(item => item.wishlistKey !== keyOrId && item.id !== keyOrId));
  };

  const isInWishlist = (productOrId, exactSizeMatch = true) => {
    if (typeof productOrId === 'object') {
      const pId = productOrId.productId || productOrId.id;
      const col = productOrId.color?.name || productOrId.color || 'none';
      if (!exactSizeMatch) {
         return wishlist.some(item => (item.productId || item.id) === pId && (item.color || 'none') === col);
      }
      const key = generateWishlistKey(productOrId);
      return wishlist.some(item => item.wishlistKey === key);
    }
    return wishlist.some(item => item.wishlistKey === productOrId || item.id === productOrId);
  };

  const toggleWishlist = (product, exactSizeMatch = true) => {
    if (isInWishlist(product, exactSizeMatch)) {
      // If not exact match, remove the first matching variant
      const pId = product.productId || product.id;
      const col = product.color?.name || product.color || 'none';
      
      let keyToRemove;
      if (exactSizeMatch) {
        keyToRemove = generateWishlistKey(product);
      } else {
        const matchingItem = wishlist.find(item => (item.productId || item.id) === pId && (item.color || 'none') === col);
        if (matchingItem) keyToRemove = matchingItem.wishlistKey;
      }
      
      if (keyToRemove) removeFromWishlist(keyToRemove);
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
`;

const wishlistPageCode = `import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import PriceTag from '../components/PriceTag';
import DiscountBadge from '../components/DiscountBadge';
import './WishlistPage.css';

const WishlistPage = () => {
  const { wishlist, clearWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleMoveAllToCart = () => {
    wishlist.forEach(p => {
      addToCart(p, 1);
    });
    clearWishlist();
  };

  const handleMoveToCart = (item) => {
    addToCart(item, 1);
    removeFromWishlist(item.wishlistKey);
  };

  return (
    <div className="fm-wishlist-page">
      <PageHeader
        title="️ My Saved Wishlist"
        subtitle="Keep track of your favorite products and move them to active cart or future plans whenever you are ready."
        breadcrumbs={[{ label: 'Wishlist' }]}
        badge={\`\${wishlist.length} Items\`}
        action={
          wishlist.length > 0 && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="primary" size="sm" onClick={handleMoveAllToCart} icon="️">
                Move All to Cart
              </Button>
              <Button variant="danger" size="sm" onClick={clearWishlist}>
                Clear All
              </Button>
            </div>
          )
        }
      />

      <div className="container">
        {wishlist.length === 0 ? (
          <EmptyState
            icon="️"
            title="Your Wishlist is Empty"
            description="Save your favorite products here and come back anytime."
            actionText="Continue Shopping"
            actionLink="/shop"
          />
        ) : (
          <div className="fm-wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {wishlist.map((item) => (
              <div key={item.wishlistKey} className="fm-product-card" style={{ position: 'relative' }}>
                <div className="fm-card-image-wrap">
                  <Link to={\`/product/\${item.productId || item.id}\`} className="fm-card-img-link">
                    <img
                      src={item.images?.front || item.image || item.images?.front}
                      alt={item.name}
                      className="fm-card-img"
                      loading="lazy"
                    />
                  </Link>
                  <div className="fm-card-top-badges">
                    {item.discount > 0 && <DiscountBadge discount={\`\${item.discount}% OFF\`} />}
                  </div>
                  <button 
                    className="fm-wishlist-toggle-btn active"
                    onClick={() => removeFromWishlist(item.wishlistKey)}
                    title="Remove from Wishlist"
                  >
                    ❤️
                  </button>
                </div>

                <div className="fm-card-details">
                  <Link to={\`/product/\${item.productId || item.id}\`} className="fm-card-title-link">
                    <h3 className="fm-card-title">{item.name}</h3>
                  </Link>
                  
                  {(item.color || item.size) && (
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                      {item.color && <span>Colour: {item.color}</span>}
                      {item.color && item.size && <span style={{ margin: '0 8px' }}>|</span>}
                      {item.size && <span>Size: {item.size}</span>}
                    </div>
                  )}

                  <div className="fm-card-price-row">
                    <PriceTag currentPrice={item.price} originalPrice={item.originalPrice} />
                  </div>
                  
                  <div className="fm-details-stock-status" style={{ marginTop: '8px', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                    {item.stock > 10 ? <span style={{color: '#16a34a'}}>In Stock</span> :
                     item.stock > 0 ? <span style={{color: '#ea580c'}}>Only {item.stock} left</span> :
                     <span style={{color: '#dc2626'}}>Out of Stock</span>}
                  </div>

                  <div className="fm-card-actions">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => handleMoveToCart(item)}
                      icon="️"
                    >
                      Move to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
`;

fs.writeFileSync('src/context/WishlistContext.jsx', wishlistContextCode);
fs.writeFileSync('src/pages/WishlistPage.jsx', wishlistPageCode);
