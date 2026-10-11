import React from 'react';
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
        badge={`${wishlist.length} Items`}
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
                  <Link to={`/product/${item.productId || item.id}`} className="fm-card-img-link">
                    <img
                      src={item.images?.front || item.image || item.images?.front}
                      alt={item.name}
                      className="fm-card-img"
                      loading="lazy"
                    />
                  </Link>
                  <div className="fm-card-top-badges">
                    {item.discount > 0 && <DiscountBadge discount={`${item.discount}% OFF`} />}
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
                  <Link to={`/product/${item.productId || item.id}`} className="fm-card-title-link">
                    <h3 className="fm-card-title">{item.name}</h3>
                  </Link>
                  
                  {(item.color || item.size) && (
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                      {item.color && <span>Colour: {typeof item.color === 'object' ? (item.color.name || item.color.label || '') : String(item.color)}</span>}
                      {item.color && item.size && <span style={{ margin: '0 8px' }}>|</span>}
                      {item.size && <span>Size: {typeof item.size === 'object' ? (item.size.name || item.size.label || '') : String(item.size)}</span>}
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
