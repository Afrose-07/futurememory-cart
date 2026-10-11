import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useFutureCart } from '../context/FutureCartContext';
import PriceTag from './PriceTag';
import Button from './Button';
import './FutureCartCard.css';

const FutureCartCard = ({ product }) => {
  const { addToCart } = useCart();
  const { removePlannedProduct } = useFutureCart();

  const handleBuyNow = () => {
    addToCart(product, 1);
    removePlannedProduct(product.id);
  };

  return (
    <div className="fm-future-card">
      <div className="fm-future-card-header">
        <span className={`fm-future-priority priority-${(product.priority || 'medium').toLowerCase()}`}>
          Priority: {product.priority || 'Medium'}
        </span>
        <button
          className="fm-future-card-remove"
          onClick={() => removePlannedProduct(product.id)}
          title="Remove from future plan"
        >
          
        </button>
      </div>

      <div className="fm-future-card-body">
        <Link to={`/product/${product.id}`} className="fm-future-img-wrap">
          <img src={product.images.front} alt={product.name} />
        </Link>

        <div className="fm-future-info">
          <span className="fm-future-cat">{product.category}</span>
          <Link to={`/product/${product.id}`} className="fm-future-title">
            {product.name}
          </Link>
          <div className="fm-future-pricing">
            <PriceTag currentPrice={product.price} originalPrice={product.originalPrice} size="small" />
          </div>
        </div>
      </div>

      <div className="fm-future-card-footer">
        <Button
          variant="future"
          size="sm"
          fullWidth
          onClick={handleBuyNow}
          icon=""
        >
          Buy Now (Move to Cart)
        </Button>
      </div>
    </div>
  );
};

export default FutureCartCard;
