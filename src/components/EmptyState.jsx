import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import './EmptyState.css';

const EmptyState = ({
  icon = '',
  title = 'Nothing here yet',
  description = 'Explore our catalog and start adding items.',
  actionText = 'Start Shopping',
  actionLink = '/shop',
  onActionClick = null,
  variant = 'default'
}) => {
  return (
    <div className={`fm-empty-state fm-empty-${variant}`}>
      <div className="fm-empty-icon-box">
        <span className="fm-empty-icon">{icon}</span>
      </div>
      <h3 className="fm-empty-title">{title}</h3>
      <p className="fm-empty-desc">{description}</p>
      {actionText && (
        <div className="fm-empty-action">
          {onActionClick ? (
            <Button onClick={onActionClick} variant="primary">
              {actionText}
            </Button>
          ) : (
            <Link to={actionLink}>
              <Button variant="primary">{actionText}</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
