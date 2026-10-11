import React from 'react';
import { formatPrice } from '../utils/helpers';

const PriceTag = ({ currentPrice, originalPrice, size = 'medium' }) => {
  const hasDiscount = originalPrice && originalPrice > currentPrice;

  return (
    <div className={`price-tag-container price-tag-${size}`} style={{ display: 'inline-flex', alignItems: 'baseline', gap: '8px' }}>
      <span style={{ 
        fontWeight: '700', 
        color: 'var(--primary-color, #1e293b)',
        fontSize: size === 'large' ? '1.5rem' : size === 'small' ? '0.95rem' : '1.15rem'
      }}>
        {formatPrice(currentPrice)}
      </span>
      {hasDiscount && (
        <span style={{ 
          textDecoration: 'line-through', 
          color: '#94a3b8',
          fontSize: size === 'large' ? '1.05rem' : size === 'small' ? '0.8rem' : '0.9rem'
        }}>
          {formatPrice(originalPrice)}
        </span>
      )}
    </div>
  );
};

export default PriceTag;
