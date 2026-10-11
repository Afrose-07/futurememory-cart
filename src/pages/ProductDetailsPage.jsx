import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { allProductsCatalog } from '../data/allOccasionsCatalog';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useMemoryCart } from '../context/MemoryCartContext';
import { useNotifications } from '../context/NotificationContext';
import { useReviews } from '../context/ReviewContext';
import PriceTag from '../components/PriceTag';
import DiscountBadge from '../components/DiscountBadge';
import Button from '../components/Button';
import Dropdown from '../components/Dropdown';
import ProductGrid from '../components/ProductGrid';
import { REMINDER_OPTIONS } from '../utils/constants';
import { Heart } from 'lucide-react';
import './ProductDetailsPage.css';

const colorHexMap = {
  'Black': '#111827',
  'White': '#ffffff',
  'Navy Blue': '#1e3a8a',
  'Blue': '#2563eb',
  'Olive Green': '#3f6212',
  'Green': '#15803d',
  'Red': '#dc2626',
  'Maroon': '#881337',
  'Pink': '#ec4899',
  'Brown': '#78350f',
  'Grey': '#64748b',
  'Gold': '#d97706',
  'Silver': '#94a3b8',
  'Rose Gold': '#fb7185',
  'Beige': '#d6d3d1'
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { t, lang } = useLanguage();
  
  const initialProduct = allProductsCatalog.find(p => String(p.id) === String(id)) || allProductsCatalog[0];
  const [product, setProduct] = useState(initialProduct);

  const modelVariants = allProductsCatalog.filter(p => p.modelId === product.modelId);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToMemoryCart, isInMemoryCart } = useMemoryCart();
  const { addNotification } = useNotifications();

  const [quantity, setQuantity] = useState(1);
  const [reminderMonths, setReminderMonths] = useState(2);
  const [feedbackToast, setFeedbackToast] = useState('');
  
  const hasSizes = product.sizes && product.sizes.length > 0;
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState('');
  
  const [activeImage, setActiveImage] = useState('front');

  const [selectedColor, setSelectedColor] = useState(() => {
    return initialProduct.color?.name || (Array.isArray(initialProduct.colors) && initialProduct.colors[0]) || 'Standard';
  });
  const [selectedColorImage, setSelectedColorImage] = useState(() => {
    const initCol = initialProduct.color?.name || (Array.isArray(initialProduct.colors) && initialProduct.colors[0]);
    if (initCol && initialProduct.colorImages && initialProduct.colorImages[initCol]) {
      return initialProduct.colorImages[initCol];
    }
    return null;
  });

  useEffect(() => {
    const found = allProductsCatalog.find(p => String(p.id) === String(id));
    if (found) {
      setProduct(found);
      const col = found.color?.name || (Array.isArray(found.colors) && found.colors[0]) || 'Standard';
      setSelectedColor(col);
      if (found.colorImages && found.colorImages[col]) {
        setSelectedColorImage(found.colorImages[col]);
      } else {
        setSelectedColorImage(null);
      }
      setSelectedSize(null);
      setSizeError('');
    }
  }, [id]);

  const handleColorSelect = (col) => {
    setSelectedColor(col);
    if (product.colorImages && product.colorImages[col]) {
      setSelectedColorImage(product.colorImages[col]);
    } else {
      const match = modelVariants.find(v => v.color?.name?.toLowerCase() === col.toLowerCase());
      if (match) {
        setProduct(match);
        setSelectedColorImage(match.images?.front || match.image);
      } else {
        setSelectedColorImage(null);
      }
    }
  };

  const isWishlisted = isInWishlist(product);

  const handleWishlistToggle = () => {
    if (!checkAuth('save items to Wishlist')) return;
    const willBeWishlisted = !isWishlisted;
    toggleWishlist({ ...product, color: selectedColor, size: selectedSize });
    showToast(willBeWishlisted ? 'Saved to Wishlist! ❤️' : 'Removed from Wishlist');
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: location,
          message: 'Please sign in or create an account to view product details and purchase.'
        }
      });
    }
  }, [isAuthenticated, navigate, location]);

  const CATEGORY_FALLBACKS = {
    "Women's Fashion": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
    "Men's Fashion": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
    "Kids' Fashion": "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&auto=format&fit=crop&q=80",
    "Bags & Luggage": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
    "Electronics & Gadgets": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    "Home & Kitchen": "https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?w=800&auto=format&fit=crop&q=80",
    "Beauty & Personal Care": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
    "Watches": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
    "Accessories": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
    "Gifts & Greeting Cards": "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&auto=format&fit=crop&q=80"
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = CATEGORY_FALLBACKS[product.category] || CATEGORY_FALLBACKS["Men's Fashion"];
  };
  
  // Reviews State
  const { getReviewsForModel, canUserReview, hasUserReviewed, addReview, getRatingStats } = useReviews();
    const [reviewFormOpen, setReviewFormOpen] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
    const [reviewSort, setReviewSort] = useState('newest');

    const modelReviews = getReviewsForModel(product.modelId);
    const ratingStats = getRatingStats(product.modelId);
    
    const sortedReviews = [...modelReviews].sort((a, b) => {
      if (reviewSort === 'highest') return b.rating - a.rating;
      if (reviewSort === 'lowest') return a.rating - b.rating;
      return new Date(b.date) - new Date(a.date);
    });

    const showToast = (msg) => {
      setFeedbackToast(msg);
      setTimeout(() => setFeedbackToast(''), 3000);
    };

    const handleReviewSubmit = (e) => {
      e.preventDefault();
      if (!reviewForm.comment.trim() || !reviewForm.title.trim()) {
        alert('Please fill out both the title and review text.');
        return;
      }
      
      addReview({
        productId: product.id,
        modelId: product.modelId,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
        colour: product.color?.name,
        size: selectedSize || null
      });
      
      setReviewFormOpen(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      showToast('Review submitted successfully!');
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

  const handleAddToCart = () => {
    if (!checkAuth('add items to Cart')) return;
    if (hasSizes && !selectedSize) {
      setSizeError('Please select a size.');
      return;
    }
    setSizeError('');
    
    // Pass strictly requested payload fields explicitly via spread or mapping
    addToCart({ 
      ...product,
      productId: product.id,
      modelId: product.modelId,
      name: product.name,
      image: product.images[activeImage] || product.images.front,
      price: product.price,
      color: product.color?.name,
      size: selectedSize,
      quantity
    }, quantity);
    
    showToast(`Added ${quantity} item(s) to Cart! ️`);
  };

  const handleSaveToMemory = () => {
    if (!checkAuth('schedule items in Memory Cart')) return;
    if (hasSizes && !selectedSize) {
      setSizeError('Please select a size.');
      return;
    }
    setSizeError('');
    
    addToMemoryCart({
      ...product,
      color: product.color?.name,
      size: selectedSize,
      quantity
    }, reminderMonths);
    
    addNotification({
      title: 'Memory Cart Refill Scheduled! ',
      message: `${product.name} will trigger repurchase reminder every ${reminderMonths} month(s).`,
      type: 'reminder',
      link: '/memory-cart'
    });
    showToast(`Scheduled in Memory Cart (${reminderMonths}m)!`);
  };

  // Related products logic (Category, Subcategory, Gender filtering)
  const relatedProducts = allProductsCatalog
    .filter(p => p.id !== product.id && p.modelId !== product.modelId && p.category === product.category && p.gender === product.gender)
    .slice(0, 4);

  return (
    <div className="fm-details-page">
      {feedbackToast && <div className="fm-details-toast">{feedbackToast}</div>}

      <div className="container">
        {/* Breadcrumb */}
        <div className="fm-details-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
          <Link to="/" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Home</Link>
          <span>&gt;</span>
          {product.gender && (
            <>
              <Link to={`/shop?gender=${encodeURIComponent(product.gender)}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>{product.gender}</Link>
              <span>&gt;</span>
            </>
          )}
          {product.subcategory ? (
            <>
              <Link to={`/shop?subcategory=${encodeURIComponent(product.subcategory)}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>{product.subcategory}</Link>
              <span>&gt;</span>
            </>
          ) : (
            <>
              <Link to={`/shop?category=${encodeURIComponent(product.category)}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>{product.category}</Link>
              <span>&gt;</span>
            </>
          )}
          <span className="current" style={{ color: '#334155', fontWeight: 500 }}>{product.name}</span>
        </div>

        {/* Main Grid */}
        <div className="fm-details-layout">
          {/* Image & Badges */}
          <div className="fm-details-gallery">
            <div className="fm-details-main-img-wrap" style={{ position: 'relative' }}>
              <img 
                src={selectedColorImage || product.images[activeImage] || product.images.front} 
                alt={product.name} 
                className="fm-details-main-img" 
                onError={handleImageError}
              />
              <div className="fm-details-badge-float">
                <DiscountBadge discount={product.discount} />
              </div>
              <button
                className={`details-gallery-wish-btn ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlistToggle}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                aria-label="Wishlist"
              >
                <Heart 
                  size={22} 
                  fill={isWishlisted ? "#ef4444" : "transparent"} 
                  color={isWishlisted ? "#ef4444" : "#475569"} 
                  strokeWidth={2.2}
                />
              </button>
            </div>
            
            {/* Multi-Angle Presentation Gallery (Front, Back, Side, Detail) */}
            {product.images && Object.keys(product.images).length > 0 && (
              <div className="fm-details-thumbnails" style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                {Object.entries(product.images).map(([angle, imgUrl]) => {
                  const isCurrent = (!selectedColorImage && activeImage === angle) || (Object.keys(product.images).length === 1 && !selectedColorImage);
                  return (
                    <button
                      key={angle}
                      type="button"
                      onClick={() => {
                        setActiveImage(angle);
                        setSelectedColorImage(null);
                      }}
                      style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: isCurrent ? '2px solid var(--primary-color)' : '1px solid #cbd5e1',
                        background: '#fff',
                        cursor: 'pointer',
                        padding: '2px',
                        position: 'relative',
                        boxShadow: isCurrent ? '0 2px 8px rgba(79, 70, 229, 0.2)' : 'none',
                        transition: 'all 0.2s'
                      }}
                      title={`${angle.toUpperCase()} View`}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`${product.name} ${angle}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '7px' }} 
                        onError={handleImageError}
                      />
                      <span style={{ position: 'absolute', bottom: '2px', left: '2px', right: '2px', background: 'rgba(15,23,42,0.75)', color: '#fff', fontSize: '0.62rem', fontWeight: 600, textTransform: 'capitalize', textAlign: 'center', borderRadius: '4px', padding: '1px 0' }}>
                        {angle}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Info & Cart Systems Actions */}
          <div className="fm-details-info">
            <div className="fm-details-top-meta">
              <span className="fm-details-cat-tag">{product.category}</span>
              <span className="fm-details-cat-tag" style={{ marginLeft: '10px', background: '#f8fafc', color: '#475569' }}>{product.subcategory}</span>
              {product.brand && <span className="fm-details-cat-tag" style={{ marginLeft: '10px', background: '#f8fafc', color: '#475569' }}>{product.brand}</span>}
              <div className="fm-details-rating" style={{ marginLeft: 'auto' }}>
                <span>⭐</span>
                <strong>{ratingStats.count > 0 ? ratingStats.average : 'No Ratings'} {ratingStats.count > 0 && '/ 5.0'}</strong>
                  <span className="review-count">({ratingStats.count} reviews)</span>
              </div>
            </div>

            <h1 className="fm-details-title">{product.name}</h1>

            <div className="fm-details-pricing">
              <PriceTag currentPrice={product.price} originalPrice={product.originalPrice} size="large" />
              <span className="tax-inclusive">Inclusive of all taxes</span>
            </div>
            
            <div className="fm-details-stock-status" style={{ marginTop: '10px', fontSize: '0.95rem', fontWeight: 600 }}>
              {product.stock > 10 ? <span style={{color: '#16a34a'}}>In Stock</span> :
               product.stock > 0 ? <span style={{color: '#ea580c'}}>Only {product.stock} left</span> :
               <span style={{color: '#dc2626'}}>Out of Stock</span>}
            </div>

            <p className="fm-details-description" style={{ marginTop: '15px' }}>{product.description}</p>

            {/* Dynamic Colour Selector with live image preview */}
            {((product.colors && product.colors.length > 0 && product.colors[0] !== 'Standard') ||
              (product.colorImages && Object.keys(product.colorImages).length > 0) ||
              modelVariants.length > 1) && (
              <div className="fm-details-color-selector" style={{ margin: '20px 0' }}>
                <h4 style={{ marginBottom: '10px', color: '#334155', fontSize: '0.95rem' }}>
                  Colour: <strong style={{ color: '#0f172a' }}>{selectedColor || product.color?.name || 'Selected'}</strong>
                </h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {Array.from(new Set([
                    ...(product.colors && product.colors.filter(c => c !== 'Standard') || []),
                    ...(product.colorImages ? Object.keys(product.colorImages) : []),
                    ...(modelVariants.map(v => v.color?.name).filter(Boolean))
                  ])).map(col => {
                    const isSelected = selectedColor === col || (!selectedColor && product.color?.name === col);
                    const hex = colorHexMap[col] || '#475569';
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => handleColorSelect(col)}
                        title={col}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 14px 6px 6px',
                          borderRadius: '24px',
                          border: isSelected ? '2px solid var(--primary-color)' : '1.5px solid #cbd5e1',
                          background: isSelected ? 'var(--primary-light, #eff6ff)' : '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 2px 8px rgba(79, 70, 229, 0.15)' : 'none'
                        }}
                      >
                        <span style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: hex,
                          border: '1.5px solid rgba(0,0,0,0.15)',
                          display: 'inline-block'
                        }}></span>
                        <span style={{ fontSize: '0.88rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#1e293b' : '#475569' }}>
                          {col}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {hasSizes && (
              <div className="fm-details-size-selector" style={{ margin: '20px 0' }}>
                <h4 style={{ marginBottom: '10px', color: '#334155', fontSize: '0.95rem' }}>Select Size</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {product.sizes.map(sz => {
                    const stock = product.stockBySize?.[sz] || 0;
                    const isOutOfStock = stock === 0;
                    return (
                      <button
                        key={sz}
                        onClick={() => {
                          if (!isOutOfStock) {
                            setSelectedSize(sz);
                            setSizeError('');
                          }
                        }}
                        disabled={isOutOfStock}
                        title={isOutOfStock ? 'Out of Stock' : `${stock} left`}
                        style={{
                          padding: '8px 16px',
                          border: selectedSize === sz ? '2px solid var(--primary-color)' : '1px solid #cbd5e1',
                          borderRadius: '6px',
                          background: isOutOfStock ? '#f1f5f9' : (selectedSize === sz ? 'var(--primary-light)' : '#fff'),
                          color: isOutOfStock ? '#94a3b8' : (selectedSize === sz ? 'var(--primary-color)' : '#475569'),
                          fontWeight: selectedSize === sz ? '700' : '500',
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          textDecoration: isOutOfStock ? 'line-through' : 'none',
                          opacity: isOutOfStock ? 0.6 : 1
                        }}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
                {sizeError && <div style={{ color: '#ef4444', marginTop: '8px', fontSize: '0.9rem', fontWeight: 500 }}>{sizeError}</div>}
              </div>
            )}

            <div className="fm-details-full-description" style={{ marginTop: '25px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '10px' }}>About this product</h3>
              <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#475569', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Material:</strong> {product.material || 'Premium Quality Material'}</li>
                <li><strong>Fit/Style:</strong> {product.fit || 'Regular Comfortable Fit'}</li>
                <li><strong>Care Instructions:</strong> {product.care || 'Follow standard wash instructions'}</li>
                {product.features && product.features.map((feat, i) => (
                  <li key={i}>{feat}</li>
                ))}
              </ul>
            </div>

            <hr className="fm-details-divider" />

            {/* Cart System Interaction Hub */}
            <div className="fm-details-cart-hubs">
              <div className="cart-hub-block hub-normal">
                <div className="hub-header">
                  <span className="hub-icon">️</span>
                  <div>
                    <strong>Instant Checkout Cart</strong>
                    <p>Order now for immediate doorstep dispatch</p>
                  </div>
                </div>

                <div className="hub-actions-row">
                  <div className="details-qty-box">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))}>+</button>
                  </div>

                  <Button variant="primary" size="md" onClick={handleAddToCart} icon="️">
                    Add to Cart
                  </Button>

                  <button
                    className={`details-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                    onClick={handleWishlistToggle}
                    title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                    aria-label="Wishlist"
                  >
                    <Heart 
                      size={18} 
                      fill={isWishlisted ? "#ef4444" : "transparent"} 
                      color={isWishlisted ? "#ef4444" : "#475569"} 
                      strokeWidth={2.2} 
                    />
                    {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                  </button>
                </div>
              </div>

              {/* Hub 2: Memory Cart */}
              <div className="cart-hub-block hub-memory">
                <div className="hub-header">
                  <span className="hub-icon"></span>
                  <div>
                    <strong>Memory Cart (Auto-Refill Schedule)</strong>
                    <p>Set a recurring restock interval & get alerts</p>
                  </div>
                </div>

                <div className="hub-controls-row">
                  <div className="dropdown-inline">
                    <Dropdown
                      options={REMINDER_OPTIONS}
                      value={reminderMonths}
                      onChange={setReminderMonths}
                      placeholder=""
                    />
                  </div>
                  <Button
                    variant="memory"
                    size="md"
                    onClick={handleSaveToMemory}
                    icon=""
                  >
                    {isInMemoryCart(product.id) ? 'Update Refill Schedule' : 'Add to Memory Cart'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
            {/* Product Reviews Section – Fig 8.31 */}
        <div className="pdp-reviews-section">
          {/* Section Header */}
          <div className="pdp-reviews-header">
            <h2 className="pdp-reviews-title">
              <span className="pdp-reviews-title-icon">⭐</span>
              Customer Reviews &amp; Ratings
            </h2>
            {!hasUserReviewed(product.modelId) && canUserReview(product.modelId) && (
              <button className="pdp-write-review-btn" onClick={() => setReviewFormOpen(!reviewFormOpen)}>
                {reviewFormOpen ? '✕ Cancel' : '✏️ Write a Review'}
              </button>
            )}
          </div>

          {/* Rating Summary Row */}
          <div className="pdp-rating-summary-row">
            {/* Left: Big Score */}
            <div className="pdp-rating-hero">
              <div className="pdp-rating-hero-score">
                {ratingStats.count > 0 ? ratingStats.average : '—'}
              </div>
              <div className="pdp-rating-hero-stars">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={s <= Math.round(ratingStats.average) ? 'star filled' : 'star empty'}>★</span>
                ))}
              </div>
              <div className="pdp-rating-hero-count">
                {ratingStats.count > 0 ? `Based on ${ratingStats.count} review${ratingStats.count > 1 ? 's' : ''}` : 'No reviews yet'}
              </div>
              {ratingStats.count === 0 && (
                <p className="pdp-rating-hero-cta">Be the first to share your experience!</p>
              )}
            </div>

            {/* Middle: Distribution Bars */}
            <div className="pdp-rating-distribution">
              {[5,4,3,2,1].map(star => {
                const pct = ratingStats.count > 0 ? (ratingStats.distribution[star - 1] || 0) : 0;
                return (
                  <div key={star} className="pdp-dist-row">
                    <span className="pdp-dist-label">{star} ★</span>
                    <div className="pdp-dist-bar-track">
                      <div
                        className="pdp-dist-bar-fill"
                        style={{ width: `${pct}%`, background: star >= 4 ? '#22c55e' : star === 3 ? '#f59e0b' : '#ef4444' }}
                      />
                    </div>
                    <span className="pdp-dist-pct">{pct}%</span>
                  </div>
                );
              })}
            </div>

            {/* Right: Review CTA / Status */}
            <div className="pdp-rating-cta-block">
              {hasUserReviewed(product.modelId) ? (
                <div className="pdp-reviewed-badge">
                  <span className="pdp-reviewed-check">✓</span>
                  <div>
                    <strong>Review Submitted</strong>
                    <p>Thank you for your feedback!</p>
                  </div>
                </div>
              ) : canUserReview(product.modelId) ? (
                <div className="pdp-can-review-block">
                  <div className="pdp-can-review-icon">📝</div>
                  <p>You purchased this product. Share your experience!</p>
                  <button className="pdp-write-review-btn-alt" onClick={() => setReviewFormOpen(!reviewFormOpen)}>
                    {reviewFormOpen ? 'Close Form' : 'Write a Review'}
                  </button>
                </div>
              ) : (
                <div className="pdp-no-review-block">
                  <div className="pdp-no-review-icon">🛒</div>
                  <p>Purchase this product to leave a verified review.</p>
                </div>
              )}
            </div>
          </div>

          {/* Write Review Form */}
          {reviewFormOpen && (
            <div className="pdp-review-form-wrap">
              <h3 className="pdp-review-form-title">Your Review</h3>
              <form onSubmit={handleReviewSubmit} className="pdp-review-form">
                {/* Star Picker */}
                <div className="pdp-form-field">
                  <label>Your Rating *</label>
                  <div className="pdp-star-picker">
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`pdp-star-btn ${reviewForm.rating >= star ? 'active' : ''}`}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      >★</button>
                    ))}
                    <span className="pdp-star-label">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewForm.rating]}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div className="pdp-form-field">
                  <label>Review Title *</label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                    required
                    className="pdp-form-input"
                    placeholder="Summarise your experience in a few words"
                  />
                </div>

                {/* Body */}
                <div className="pdp-form-field">
                  <label>Detailed Review *</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    required
                    rows="5"
                    className="pdp-form-textarea"
                    placeholder="What did you love or dislike? How was the quality, fit, or delivery?"
                  />
                </div>

                {/* Meta */}
                <div className="pdp-form-meta">
                  {product.color?.name && <span className="pdp-form-tag">🎨 {product.color.name}</span>}
                  {selectedSize && <span className="pdp-form-tag">📐 Size: {selectedSize}</span>}
                </div>

                <div className="pdp-form-actions">
                  <Button type="submit" variant="primary" size="md">Submit Review</Button>
                  <button type="button" className="pdp-cancel-btn" onClick={() => setReviewFormOpen(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews List */}
          {ratingStats.count > 0 && (
            <div className="pdp-reviews-list-wrap">
              <div className="pdp-reviews-list-header">
                <h3 className="pdp-reviews-list-count">{ratingStats.count} Review{ratingStats.count > 1 ? 's' : ''}</h3>
                <select
                  value={reviewSort}
                  onChange={e => setReviewSort(e.target.value)}
                  className="pdp-reviews-sort"
                >
                  <option value="newest">Most Recent</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>

              <div className="pdp-reviews-list">
                {sortedReviews.map(rev => (
                  <div key={rev.reviewId} className="pdp-review-card">
                    <div className="pdp-review-card-top">
                      <div className="pdp-review-card-left">
                        <div className="pdp-review-avatar">
                          {(rev.userName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="pdp-review-username">{rev.userName}</div>
                          <div className="pdp-review-date">{new Date(rev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </div>
                      </div>
                      <div className="pdp-review-card-right">
                        <div className="pdp-review-stars-inline">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={s <= rev.rating ? 'rs filled' : 'rs empty'}>★</span>
                          ))}
                          <span className="pdp-review-rating-num">{rev.rating}.0</span>
                        </div>
                        {rev.verifiedPurchase && (
                          <span className="pdp-verified-badge">✓ Verified Purchase</span>
                        )}
                      </div>
                    </div>

                    <h4 className="pdp-review-title-text">{rev.title}</h4>
                    <p className="pdp-review-comment">{rev.comment}</p>

                    {(rev.colour || rev.size) && (
                      <div className="pdp-review-variant-tags">
                        {rev.colour && <span className="pdp-variant-chip">🎨 {rev.colour}</span>}
                        {rev.size && <span className="pdp-variant-chip">📐 {rev.size}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Matching Products / Complete the Look */}
        {product.matchingSuggestions && product.matchingSuggestions.length > 0 && (
          <div className="fm-details-related-section" style={{ marginTop: '40px' }}>
            <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.8rem' }}>✨</span> Complete the Look (Matching Items)
            </h2>
            <ProductGrid 
              products={product.matchingSuggestions.map(id => allProductsCatalog.find(p => p.id === id)).filter(Boolean)} 
              columns={4} 
            />
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="fm-details-related-section" style={{ marginTop: '40px' }}>
            <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
              Similar Products
            </h2>
            <ProductGrid products={relatedProducts} columns={4} />
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default ProductDetailsPage;
