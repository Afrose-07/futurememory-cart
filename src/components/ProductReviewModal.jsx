import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import Button from './Button';

const RATING_DESCRIPTIONS = {
  1: '😞 Poor - Did not meet expectations',
  2: '😐 Fair - Below average experience',
  3: '🙂 Good - Met expectations',
  4: '😊 Very Good - High quality & satisfied',
  5: '🤩 Outstanding! - Exceptional quality & loved it!'
};

const SAMPLE_PHOTOS = [
  { label: 'Unboxing', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80' },
  { label: 'Product Look', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80' },
  { label: 'Packaging Box', url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80' }
];

const ProductReviewModal = ({ isOpen, onClose, order, product, onSubmitReview }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Fast Delivery', 'Superb Quality']);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentProduct = product || order?.items?.[0] || { name: 'Purchased Item' };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size should be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMsg('Please select a star rating from 1 to 5.');
      return;
    }
    if (!comment.trim()) {
      setErrorMsg('Please write a short review or feedback about the item.');
      return;
    }

    setIsSubmitting(true);
    
    // Confetti celebration
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    const reviewPayload = {
      orderId: order?.orderId,
      productId: currentProduct.id || currentProduct.productId,
      productName: currentProduct.name,
      rating,
      title: title.trim() || `${rating}-Star Rating`,
      comment: comment.trim(),
      tags: selectedTags,
      image: imagePreview,
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      onSubmitReview(reviewPayload);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  const activeRating = hoverRating || rating;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        border: '1px solid #e2e8f0',
        animation: 'fadeInUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
              Rate & Review Order
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Order #{order?.orderId} • Verified Purchase
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
              fontWeight: 800,
              fontSize: '1.1rem'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          
          {/* Product Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#f8fafc',
            padding: '10px 14px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <img 
              src={currentProduct.images?.front || currentProduct.image || 'https://via.placeholder.com/50'} 
              alt={currentProduct.name}
              style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{currentProduct.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>✅ Delivered & Received</div>
            </div>
          </div>

          {/* 5-Star Interactive Rating */}
          <div style={{ textAlign: 'center', marginBottom: '22px', background: '#f8fafc', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Select Your Rating *
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '8px 0' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= activeRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '2.6rem',
                      lineHeight: 1,
                      cursor: 'pointer',
                      color: isFilled ? '#f59e0b' : '#cbd5e1',
                      transform: isFilled ? 'scale(1.18)' : 'scale(1)',
                      filter: isFilled ? 'drop-shadow(0 2px 6px rgba(245, 158, 11, 0.45))' : 'none',
                      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                      padding: '2px 4px'
                    }}
                    title={`${star} Star${star > 1 ? 's' : ''}`}
                  >
                    {isFilled ? '★' : '☆'}
                  </button>
                );
              })}
            </div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: activeRating === 0 ? '#64748b' : (activeRating >= 4 ? '#15803d' : activeRating === 3 ? '#d97706' : '#dc2626'),
              minHeight: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {activeRating === 0 ? '👉 Click on a star above to rate this item' : RATING_DESCRIPTIONS[activeRating]}
            </div>
          </div>

          {/* Quick Tags */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
              Quick Highlights
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Fast Delivery', 'Superb Quality', 'True to Size', 'Value for Money', 'Loved Packaging', 'Exact as Pictured'].map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      border: isSelected ? '1.5px solid var(--primary-color)' : '1px solid #cbd5e1',
                      background: isSelected ? 'var(--primary-light, #eef2ff)' : '#fff',
                      color: isSelected ? 'var(--primary-color, #4338ca)' : '#475569',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Review Headline (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Stunning watch, packaging was fantastic!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Detailed Comment */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Detailed Experience & Feedback *
            </label>
            <textarea
              rows="3"
              placeholder="Tell others what you liked about this product, quality, delivery speed to your city..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Upload Product Photo */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Upload Product Photo / Unboxing Picture
            </label>

            {imagePreview ? (
              <div style={{ position: 'relative', display: 'inline-block', marginTop: '6px' }}>
                <img 
                  src={imagePreview} 
                  alt="Review Preview" 
                  style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #10b981' }} 
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '0.8rem'
                  }}
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px dashed #cbd5e1',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <span style={{ fontSize: '1.8rem', marginBottom: '4px' }}>📷</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
                    Click to Upload Photo from Device
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PNG, JPG up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{ display: 'none' }}
                  />
                </label>

                {/* Or sample photos */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Or quick sample:</span>
                  {SAMPLE_PHOTOS.map(s => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setImagePreview(s.url)}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        color: '#334155',
                        fontWeight: 600
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing Review...' : '⭐ Submit Verified Review'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProductReviewModal;
