import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useMemoryCart } from '../context/MemoryCartContext';
import { useNotifications } from '../context/NotificationContext';
import { useReviews } from '../context/ReviewContext';
import { useLanguage } from '../context/LanguageContext';
import { translateCategory } from '../data/translations';
import PriceTag from './PriceTag';
import DiscountBadge from './DiscountBadge';
import Modal from './Modal';
import Button from './Button';
import { REMINDER_OPTIONS } from '../utils/constants';
import { Heart } from 'lucide-react';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToMemoryCart, isInMemoryCart } = useMemoryCart();
  const { addNotification } = useNotifications();
  const { getRatingStats } = useReviews();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  if (!product) return null;
  const ratingStats = (getRatingStats && product.modelId) ? getRatingStats(product.modelId) : { average: 0, count: 0 };
  const CATEGORY_FALLBACKS = {
    "Women's Fashion": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80",
    "Men's Fashion": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80",
    "Kids' Fashion": "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&auto=format&fit=crop&q=80",
    "Bags & Luggage": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
    "Electronics & Gadgets": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    "Home & Kitchen": "https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?w=600&auto=format&fit=crop&q=80",
    "Beauty & Personal Care": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    "Watches": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
    "Accessories": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80",
    "Gifts & Greeting Cards": "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600&auto=format&fit=crop&q=80"
  };

  const prodImage = product.images?.front || product.image || product.images?.[0] || CATEGORY_FALLBACKS[product.category] || CATEGORY_FALLBACKS["Men's Fashion"];
  const prodRating = ratingStats?.count > 0 ? ratingStats.average : (product.rating || '4.8');
  const location = useLocation();

  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState(2);
  const [isAddedToast, setIsAddedToast] = useState('');

  const showToast = (msg) => {
    setIsAddedToast(msg);
    setTimeout(() => setIsAddedToast(''), 2500);
  };

  const checkAuth = (actionName) => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: location,
          message: ` Please sign in to ${actionName}.`
        }
      });
      return false;
    }
    return true;
  };

  const handleProductClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login', {
        state: {
          from: location,
          message: ' Please sign in or create an account to view product details and shop.'
        }
      });
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!checkAuth('add items to your Cart')) return;
    addToCart(product, 1);
    showToast('Added to Cart! ️');
  };

  const isWishlisted = isInWishlist(product);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!checkAuth('save items to your Wishlist')) return;
    const willBeWishlisted = !isWishlisted;
    toggleWishlist(product);
    showToast(willBeWishlisted ? 'Saved to Wishlist! ❤️' : 'Removed from Wishlist');
  };

  const handleOpenMemoryModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!checkAuth('schedule items in your Memory Cart')) return;
    setIsMemoryModalOpen(true);
  };

  const handleSaveMemoryCart = () => {
    addToMemoryCart(product, selectedInterval);
    addNotification({
      title: 'Memory Cart Schedule Set! ',
      message: `${product.name} scheduled for repurchase reminder every ${selectedInterval} month(s).`,
      type: 'reminder',
      link: '/memory-cart'
    });
    setIsMemoryModalOpen(false);
    showToast(`Saved to Memory Cart (${selectedInterval}m)!`);
  };

  return (
    <>
      <div className="fm-product-card">
        {isAddedToast && (
          <div className="fm-card-toast">{isAddedToast}</div>
        )}
        
        <div className="fm-card-image-wrap">
          <Link to={`/product/${product.id}`} onClick={handleProductClick} className="fm-card-img-link">
            <img
              src={prodImage}
              alt={product.name}
              className="fm-card-img"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = CATEGORY_FALLBACKS[product.category] || CATEGORY_FALLBACKS["Men's Fashion"];
              }}
            />
          </Link>
          <div className="fm-card-top-badges">
            <DiscountBadge discount={`${product.discount}% OFF`} />
          </div>
          <button 
            className={`fm-wishlist-toggle-btn ${isWishlisted ? 'active' : ''}`}
            onClick={handleToggleWishlist}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            aria-label="Wishlist"
          >
            <Heart 
              size={18} 
              fill={isWishlisted ? "#ef4444" : "transparent"} 
              color={isWishlisted ? "#ef4444" : "#64748b"} 
              strokeWidth={2.2}
            />
          </button>
        </div>

        <div className="fm-card-details">
          <div className="fm-card-meta">
            <span className="fm-card-category">{translateCategory(product.category, t)}</span>
            <div className="fm-card-rating">
              <span>⭐</span>
              <strong>{prodRating}</strong>
            </div>
          </div>

          <Link to={`/product/${product.id}`} onClick={handleProductClick} className="fm-card-title-link">
            <h3 className="fm-card-title">{product.name}</h3>
          </Link>
          
          {product.variantsCount > 1 && (
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
              Available in {product.variantsCount} colours
            </div>
          )}

          <p className="fm-card-desc">
            {lang === 'ta'
              ? 'உயர்தர பிரீமியம் தரம். 10-நாட்கள் எளிதான ரிட்டர்ன் உத்தரவாதம் & விரைவு டெலிவரி.'
              : (product.description || 'Premium quality craftsmanship with 7-days doorstep return guarantee.')}
          </p>

          <div className="fm-card-guarantee-badge">
            <span className="guarantee-icon">️</span>
            <span>{t('daysReturnGuarantee')}</span>
          </div>

          <div className="fm-card-price-row">
            <PriceTag currentPrice={product.price} originalPrice={product.originalPrice} />
          </div>

          {/* Primary & Special Cart Actions */}
          <div className="fm-card-actions">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={handleAddToCart}
              icon="️"
            >
              {t('addToCart')}
            </Button>

            <button
              className={`fm-special-btn memory-btn full-w ${isInMemoryCart(product.id) ? 'is-active' : ''}`}
              onClick={handleOpenMemoryModal}
              title="Add recurring repurchase reminder"
              style={{
                width: '100%',
                marginTop: '6px',
                padding: '8px 12px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: isInMemoryCart(product.id) ? '#0284c7' : 'rgba(2, 132, 199, 0.1)',
                color: isInMemoryCart(product.id) ? '#ffffff' : '#0284c7',
                border: '1.5px solid #0284c7',
                transition: 'all 0.2s'
              }}
            >
               {isInMemoryCart(product.id) ? t('savedInMemoryCart') : t('addToMemoryCart')}
            </button>
          </div>
        </div>
      </div>

      {/* Memory Cart Modal */}
      <Modal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        title=" Set Memory Cart Repurchase Interval"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsMemoryModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="memory" onClick={handleSaveMemoryCart}>
              Save Recurring Reminder
            </Button>
          </>
        }
      >
        <div className="memory-modal-content">
          <div className="memory-modal-product-summary">
            <img src={product.images.front} alt={product.name} />
            <div>
              <h4>{product.name}</h4>
              <p className="memory-modal-price"><PriceTag currentPrice={product.price} originalPrice={product.originalPrice} /></p>
            </div>
          </div>

          <div className="memory-modal-explanation">
            <p><strong>How Memory Cart works:</strong> We'll actively track price drops. If the price drops during your selected timeframe, we will immediately alert you via your preferred channel (WhatsApp/Email).</p>
          </div>

          <div className="memory-modal-selector">
            <label><strong>How often do you repurchase this item?</strong></label>
            <div className="memory-options-grid">
              {REMINDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`memory-opt-btn ${selectedInterval === opt.value ? 'selected' : ''}`}
                  onClick={() => setSelectedInterval(opt.value)}
                >
                  <span className="opt-duration">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProductCard;
