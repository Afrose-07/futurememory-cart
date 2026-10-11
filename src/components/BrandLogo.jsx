import React from 'react';

const BrandLogo = ({ size = 'md', showTagline = true, dark = false }) => {
  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 42
  };

  const currentSize = iconSizes[size] || 32;

  return (
    <div className={`fm-brand-identity size-${size}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Sleek Modern Gradient Monogram SVG */}
      <svg
        width={currentSize}
        height={currentSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 3px 8px rgba(99, 102, 241, 0.25))' }}
      >
        <defs>
          <linearGradient id="fmGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary-color)" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="fmGradAccent" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>

        {/* Outer Rounded Diamond Badge */}
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="12"
          fill="url(#fmGradPrimary)"
        />



        {/* Dynamic Stylized FM Monogram Letters */}
        <path
          d="M17 17H31V21H22V24H29V28H22V32H17V17Z"
          fill="#ffffff"
        />
        <circle cx="32" cy="18" r="3" fill="url(#fmGradAccent)" />
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 'max-content' }}>
        <span
          style={{
            fontSize: size === 'lg' ? '1.35rem' : size === 'sm' ? '0.95rem' : '1.12rem',
            fontWeight: 800,
            letterSpacing: '-0.3px',
            lineHeight: 1.15
          }}
        >
          <span style={{
            background: 'linear-gradient(135deg, var(--primary-color) 0%, #7c3aed 50%, #2563eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            FutureMemory
          </span>
          <span style={{
            marginLeft: '4px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Cart
          </span>
        </span>
        {showTagline && (
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: dark ? '#94a3b8' : '#64748b'
            }}
          >
            Curated Gifts • 7-days Return
          </span>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
