import React from 'react';
import { Link } from 'react-router-dom';
import { useFutureCart } from '../context/FutureCartContext';
import PriceTag from './PriceTag';
import DiscountBadge from './DiscountBadge';
import Button from './Button';
import './RecommendationCard.css';

const RecommendationCard = ({ product, occasionName = 'Milestone' }) => {
  const { addPlannedProduct, isInFuturePlan } = useFutureCart();
  const isPlanned = isInFuturePlan(product.id);

  return (
    <div className="fm-rec-card">
      <div className="fm-rec-img-wrap">
        <Link to={`/product/${product.id}`}>
          <img src={product.images.front} alt={product.name} />
        </Link>
        <div className="fm-rec-badge-overlay">
          <DiscountBadge discount={`${product.discount}% OFF`} />
        </div>
      </div>

      <div className="fm-rec-info">
        <span className="fm-rec-tag">Recommended for {occasionName}</span>
        <Link to={`/product/${product.id}`} className="fm-rec-title">
          {product.name}
        </Link>
        <div className="fm-rec-price">
          <PriceTag currentPrice={product.price} originalPrice={product.originalPrice} size="small" />
        </div>

        <Button
          variant={isPlanned ? 'secondary' : 'future'}
          size="sm"
          fullWidth
          onClick={() => addPlannedProduct(product)}
          disabled={isPlanned}
          icon={isPlanned ? '' : ''}
        >
          {isPlanned ? 'In Your Plan' : 'Add to Future Plan'}
        </Button>
      </div>
    </div>
  );
};

export default RecommendationCard;
