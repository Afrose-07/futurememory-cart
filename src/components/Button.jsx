import React from 'react';
import './Button.css';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  icon = null,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`fm-btn fm-btn-${variant} fm-btn-${size} ${fullWidth ? 'fm-btn-full' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="fm-btn-icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;
