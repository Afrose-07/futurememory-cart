const fs = require('fs');

const newContent = `import React, { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { allProductsCatalog } from '../data/allOccasionsCatalog';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useMemoryCart } from '../context/MemoryCartContext';
import { useNotifications } from '../context/NotificationContext';
import PriceTag from '../components/PriceTag';
import DiscountBadge from '../components/DiscountBadge';
import Button from '../components/Button';
import Dropdown from '../components/Dropdown';
import ProductGrid from '../components/ProductGrid';
import { REMINDER_OPTIONS } from '../utils/constants';
import './ProductDetailsPage.css';

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

  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/600x800/f8fafc/94a3b8?text=Image+Unavailable';
  };
  
  // Reviews State
  const [reviews, setReviews] = useState([
    { id: 1, user: 'Arun K.', rating: 5, date: 'Oct 12, 2026', text: 'Excellent quality! Highly recommended.', photo: '' },
    { id: 2, user: 'Sneha R.', rating: 4, date: 'Oct 05, 2026', text: 'Good product, fast delivery.', photo: '' }
  ]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  const showToast = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 3000);
  };

  const submitReview = (e) => {
    e.preventDefault();
    if (!checkAuth('submit a review')) return;
    if (!newReviewText.trim()) return;
    const newRev = {
      id: Date.now(),
      user: 'You',
      rating: newReviewRating,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      text: newReviewText,
      photo: ''
    };
    setReviews([newRev, ...reviews]);
    setNewReviewText('');
    showToast('Review submitted successfully!');
  };

  const checkAuth = (actionName) => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: location,
          message: \` Please sign in to \${actionName}.\`
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
    
    showToast(\`Added \${quantity} item(s) to Cart! ️\`);
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
      message: \`\${product.name} will trigger repurchase reminder every \${reminderMonths} month(s).\`,
      type: 'reminder',
      link: '/memory-cart'
    });
    showToast(\`Scheduled in Memory Cart (\${reminderMonths}m)!\`);
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
          <Link to="/" style={{ color: '#4f46e5', textDecoration: 'none' }}>Home</Link>
          <span>&gt;</span>
          {product.gender && (
            <>
              <Link to={\`/shop?gender=\${encodeURIComponent(product.gender)}\`} style={{ color: '#4f46e5', textDecoration: 'none' }}>{product.gender}</Link>
              <span>&gt;</span>
            </>
          )}
          {product.subcategory ? (
            <>
              <Link to={\`/shop?subcategory=\${encodeURIComponent(product.subcategory)}\`} style={{ color: '#4f46e5', textDecoration: 'none' }}>{product.subcategory}</Link>
              <span>&gt;</span>
            </>
          ) : (
            <>
              <Link to={\`/shop?category=\${encodeURIComponent(product.category)}\`} style={{ color: '#4f46e5', textDecoration: 'none' }}>{product.category}</Link>
              <span>&gt;</span>
            </>
          )}
          <span className="current" style={{ color: '#334155', fontWeight: 500 }}>{product.name}</span>
        </div>

        {/* Main Grid */}
        <div className="fm-details-layout">
          {/* Image & Badges */}
          <div className="fm-details-gallery">
            <div className="fm-details-main-img-wrap">
              <img 
                src={product.images[activeImage] || product.images.front} 
                alt={product.name} 
                className="fm-details-main-img" 
                onError={handleImageError}
              />
              <div className="fm-details-badge-float">
                <DiscountBadge discount={\`\${product.discount}% OFF\`} />
              </div>
            </div>
            
            {/* Thumbnails Gallery */}
            <div className="fm-gallery-thumbnails">
              {['front', 'back', 'side', 'design'].map(view => (
                product.images[view] && (
                  <button 
                    key={view}
                    className={\`fm-thumbnail-btn \${activeImage === view ? 'active' : ''}\`}
                    onClick={() => setActiveImage(view)}
                    title={\`View \${view}\`}
                  >
                    <img 
                      src={product.images[view]} 
                      alt={\`\${product.name} - \${view}\`} 
                      onError={handleImageError}
                    />
                    <div className="fm-thumbnail-label">{view.charAt(0).toUpperCase() + view.slice(1)}</div>
                  </button>
                )
              ))}
            </div>
          </div>

          {/* Product Info & Cart Systems Actions */}
          <div className="fm-details-info">
            <div className="fm-details-top-meta">
              <span className="fm-details-cat-tag">{product.category}</span>
              <span className="fm-details-cat-tag" style={{ marginLeft: '10px', background: '#f8fafc', color: '#475569' }}>{product.subcategory}</span>
              {product.brand && <span className="fm-details-cat-tag" style={{ marginLeft: '10px', background: '#f8fafc', color: '#475569' }}>{product.brand}</span>}
              <div className="fm-details-rating" style={{ marginLeft: 'auto' }}>
                <span>⭐</span>
                <strong>{product.rating} / 5.0</strong>
                <span className="review-count">({product.reviewCount || 0} reviews)</span>
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

            {modelVariants.length > 1 && (
              <div className="fm-details-color-selector" style={{ margin: '20px 0' }}>
                <h4 style={{ marginBottom: '10px', color: '#334155', fontSize: '0.95rem' }}>Colour: {product.color?.name}</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {modelVariants.map(variant => (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setProduct(variant);
                        setActiveImage('front');
                        setSelectedSize(null);
                        setSizeError('');
                      }}
                      title={variant.color?.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px 4px 4px',
                        borderRadius: '20px',
                        border: product.id === variant.id ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                        background: product.id === variant.id ? '#eff6ff' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        opacity: variant.stock === 0 ? 0.5 : 1
                      }}
                    >
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: variant.color?.value || '#ccc',
                        display: 'inline-block',
                        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
                      }}></span>
                      <span style={{ fontSize: '0.85rem', fontWeight: product.id === variant.id ? 600 : 400, color: '#334155' }}>
                        {variant.color?.name}
                        {variant.stock === 0 && ' (Out)'}
                      </span>
                    </button>
                  ))}
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
                        title={isOutOfStock ? 'Out of Stock' : \`\${stock} left\`}
                        style={{
                          padding: '8px 16px',
                          border: selectedSize === sz ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                          borderRadius: '6px',
                          background: isOutOfStock ? '#f1f5f9' : (selectedSize === sz ? '#eff6ff' : '#fff'),
                          color: isOutOfStock ? '#94a3b8' : (selectedSize === sz ? '#4f46e5' : '#475569'),
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
                    className={\`details-wishlist-btn \${isInWishlist(product.id) ? 'active' : ''}\`}
                    onClick={() => {
                      if (!checkAuth('save items to Wishlist')) return;
                      toggleWishlist(product);
                    }}
                    title="Wishlist"
                  >
                    {isInWishlist(product.id) ? '️ Saved' : ' Wishlist'}
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
        </div>

        {/* Product Reviews Section */}
        <div className="fm-details-reviews-section" style={{ marginTop: '40px', padding: '30px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
            {lang === 'ta' ? 'விமர்சனங்கள் மற்றும் மதிப்பீடுகள் (Reviews)' : 'Customer Reviews & Ratings'}
          </h2>

          <div className="fm-reviews-grid" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="fm-reviews-list">
              {reviews.map(rev => (
                <div key={rev.id} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ color: '#334155' }}>{rev.user}</strong>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{rev.date}</span>
                  </div>
                  <div style={{ color: '#f59e0b', marginBottom: '6px', fontSize: '1.1rem' }}>
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.95rem', margin: 0 }}>{rev.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="fm-details-related-section">
            <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
              Similar Products
            </h2>
            <ProductGrid products={relatedProducts} columns={4} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage;
`

fs.writeFileSync('src/pages/ProductDetailsPage.jsx', newContent);
