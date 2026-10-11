import React from 'react';

const DiscountBadge = ({ discount, label = null }) => {
  if (!discount || discount <= 0) return null;

  const cleanDiscount = String(discount).replace(/%?\s*OFF/gi, '').trim();

  return (
    <span 
      style={{
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: '#ffffff',
        padding: '3px 8px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '700',
        display: 'inline-flex',
        alignItems: 'center',
        boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)',
        letterSpacing: '0.02em',
        textTransform: 'uppercase'
      }}
    >
      {label || `${cleanDiscount}% OFF`}
    </span>
  );
};

export default DiscountBadge;
