const fs = require('fs');

// 1. Create ReviewContext.jsx
const reviewContextCode = `import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useOrders } from './OrderContext';

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const { user } = useAuth();
  const { orders } = useOrders();

  const [reviews, setReviews] = useState(() => {
    try {
      const stored = localStorage.getItem('fm_reviews_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('fm_reviews_v1', JSON.stringify(reviews));
  }, [reviews]);

  const addReview = (reviewData) => {
    const newReview = {
      reviewId: \`REV-\${Math.random().toString(36).substring(2, 9).toUpperCase()}\`,
      date: new Date().toISOString(),
      userEmail: user?.email || 'guest',
      userName: user?.name || 'Guest',
      verifiedPurchase: true, // We only allow adding if canUserReview is true
      ...reviewData
    };
    setReviews(prev => [newReview, ...prev]);
    return newReview;
  };

  const getReviewsForModel = (modelId) => {
    return reviews.filter(r => r.modelId === modelId);
  };

  const hasUserReviewed = (modelId) => {
    const email = user?.email || 'guest';
    return reviews.some(r => r.modelId === modelId && r.userEmail === email);
  };

  const canUserReview = (modelId) => {
    if (hasUserReviewed(modelId)) return false;
    
    // Check if user bought it
    for (const order of orders) {
      if (order.items && order.items.some(item => item.modelId === modelId)) {
        return true;
      }
    }
    return false;
  };

  const getRatingStats = (modelId) => {
    const modelReviews = getReviewsForModel(modelId);
    if (modelReviews.length === 0) return { average: 0, count: 0, distribution: [0,0,0,0,0] };
    
    let total = 0;
    const dist = [0, 0, 0, 0, 0]; // 1-star to 5-star
    
    modelReviews.forEach(r => {
      total += r.rating;
      dist[r.rating - 1]++;
    });
    
    return {
      average: (total / modelReviews.length).toFixed(1),
      count: modelReviews.length,
      distribution: dist.map(d => Math.round((d / modelReviews.length) * 100))
    };
  };

  return (
    <ReviewContext.Provider value={{
      reviews,
      addReview,
      getReviewsForModel,
      hasUserReviewed,
      canUserReview,
      getRatingStats
    }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) throw new Error('useReviews must be used within ReviewProvider');
  return context;
};
`;
fs.writeFileSync('src/context/ReviewContext.jsx', reviewContextCode);

// 2. Add ReviewProvider to App.jsx
let appJsx = fs.readFileSync('src/App.jsx', 'utf8');
if (!appJsx.includes('ReviewProvider')) {
  appJsx = appJsx.replace("import { AdminAuthProvider } from './context/AdminAuthContext';", "import { AdminAuthProvider } from './context/AdminAuthContext';\nimport { ReviewProvider } from './context/ReviewContext';");
  appJsx = appJsx.replace("<AdminAuthProvider>", "<AdminAuthProvider>\n                          <ReviewProvider>");
  appJsx = appJsx.replace("</AdminAuthProvider>", "</ReviewProvider>\n                        </AdminAuthProvider>");
  fs.writeFileSync('src/App.jsx', appJsx);
}

// 3. Update ProductDetailsPage.jsx
let pdp = fs.readFileSync('src/pages/ProductDetailsPage.jsx', 'utf8');
if (!pdp.includes('useReviews')) {
  pdp = pdp.replace("import { useNotifications } from '../context/NotificationContext';", "import { useNotifications } from '../context/NotificationContext';\nimport { useReviews } from '../context/ReviewContext';");

  // Replace static reviews state and functions
  pdp = pdp.replace(/const \[reviews, setReviews\] = useState\([\s\S]*?showToast\('Review submitted successfully!'\);\r?\n  \};/m, 
  `const { getReviewsForModel, canUserReview, hasUserReviewed, addReview, getRatingStats } = useReviews();
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
    };`);

  // Update top meta rating to use dynamic stats
  pdp = pdp.replace(/<strong>\{product\.rating\} \/ 5\.0<\/strong>\r?\n\s*<span className="review-count">\(\{product\.reviewCount \|\| 0\} reviews\)<\/span>/, 
  `<strong>{ratingStats.count > 0 ? ratingStats.average : 'No Ratings'} {ratingStats.count > 0 && '/ 5.0'}</strong>
                  <span className="review-count">({ratingStats.count} reviews)</span>`);

  // Replace the entire Reviews Section in PDP
  const newReviewSection = `{/* Product Reviews Section */}
          <div className="fm-details-reviews-section" style={{ marginTop: '40px', padding: '30px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
              Customer Reviews & Ratings
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', marginBottom: '30px' }}>
              {/* Rating Summary & Distribution */}
              <div>
                {ratingStats.count > 0 ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '3rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{ratingStats.average}</div>
                      <div>
                        <div style={{ color: '#f59e0b', fontSize: '1.2rem', marginBottom: '4px' }}>
                          {'★'.repeat(Math.round(ratingStats.average))}{'☆'.repeat(5 - Math.round(ratingStats.average))}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Based on {ratingStats.count} reviews</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[5, 4, 3, 2, 1].map(star => {
                        const pct = ratingStats.distribution[star - 1];
                        return (
                          <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                            <span style={{ width: '40px', color: '#475569' }}>{star} Stars</span>
                            <div style={{ flex: 1, background: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: \`\${pct}%\`, background: '#f59e0b', height: '100%' }}></div>
                            </div>
                            <span style={{ width: '35px', textAlign: 'right', color: '#64748b' }}>{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '20px 0', color: '#64748b' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '8px' }}>No reviews yet</h3>
                    <p>Be the first to review this product.</p>
                  </div>
                )}

                <div style={{ marginTop: '24px' }}>
                  {hasUserReviewed(product.modelId) ? (
                    <div style={{ background: '#ecfdf5', color: '#065f46', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                      ✓ You have already reviewed this product.
                    </div>
                  ) : canUserReview(product.modelId) ? (
                    <Button variant="primary" onClick={() => setReviewFormOpen(!reviewFormOpen)}>
                      {reviewFormOpen ? 'Cancel Review' : 'Write a Review'}
                    </Button>
                  ) : (
                    <div style={{ background: '#f1f5f9', color: '#475569', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
                      Purchase this product to write a review.
                    </div>
                  )}
                </div>
              </div>

              {/* Write Review Form */}
              {reviewFormOpen && (
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Write a Review</h3>
                  <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Rating *</label>
                      <div style={{ display: 'flex', gap: '4px', fontSize: '1.5rem', cursor: 'pointer' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })} style={{ color: reviewForm.rating >= star ? '#f59e0b' : '#d1d5db' }}>★</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Review Title *</label>
                      <input type="text" value={reviewForm.title} onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="Sum up your experience" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Review Text *</label>
                      <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} required rows="4" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }} placeholder="What did you like or dislike?"></textarea>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: '#64748b' }}>
                      {product.color?.name && <span>Selected Colour: {product.color.name}</span>}
                      {selectedSize && <span> | Selected Size: {selectedSize}</span>}
                    </div>
                    <div>
                      <Button type="submit" variant="primary">Submit Review</Button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Reviews List */}
            {ratingStats.count > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>{ratingStats.count} Reviews</h3>
                  <select value={reviewSort} onChange={(e) => setReviewSort(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}>
                    <option value="newest">Most Recent</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {sortedReviews.map(rev => (
                    <div key={rev.reviewId} style={{ paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ color: '#f59e0b', fontSize: '1.1rem', marginBottom: '4px', letterSpacing: '2px' }}>
                            {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                          </div>
                          <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{rev.title}</strong>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{new Date(rev.date).toLocaleDateString()}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{rev.userName}</span>
                        {rev.verifiedPurchase && <span style={{ color: '#16a34a', background: '#dcfce3', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>✓ Verified Purchase</span>}
                      </div>

                      <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 12px 0' }}>{rev.comment}</p>
                      
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#64748b' }}>
                        {rev.colour && <span>Colour: {rev.colour}</span>}
                        {rev.size && <span>Size: {rev.size}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>`;

  pdp = pdp.replace(/\{\/\* Product Reviews Section \*\/\}([\s\S]*?)<div className="fm-details-related-section">/, newReviewSection + '\n\n        {/* Related Products */}\n        {relatedProducts.length > 0 && (\n          <div className="fm-details-related-section">');
  fs.writeFileSync('src/pages/ProductDetailsPage.jsx', pdp);
}

// 4. Update ProductCard.jsx to consume ReviewContext dynamically
let pCard = fs.readFileSync('src/components/ProductCard.jsx', 'utf8');
if (!pCard.includes('useReviews')) {
  pCard = pCard.replace("import { useNotifications } from '../context/NotificationContext';", "import { useNotifications } from '../context/NotificationContext';\nimport { useReviews } from '../context/ReviewContext';");
  pCard = pCard.replace("const { addNotification } = useNotifications();", "const { addNotification } = useNotifications();\n  const { getRatingStats } = useReviews();");
  pCard = pCard.replace("const navigate = useNavigate();", "const navigate = useNavigate();\n  const ratingStats = getRatingStats(product.modelId);");
  pCard = pCard.replace(/<strong>\{product\.rating\}<\/strong>/, "<strong>{ratingStats.count > 0 ? ratingStats.average : 'New'}</strong>");
  fs.writeFileSync('src/components/ProductCard.jsx', pCard);
}
