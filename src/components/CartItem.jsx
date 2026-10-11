import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useMemoryCart } from '../context/MemoryCartContext';
import { useLanguage } from '../context/LanguageContext';
import PriceTag from './PriceTag';
import { formatPrice, formatColorName, formatSizeName } from '../utils/helpers';
import './CartItem.css';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToMemoryCart } = useMemoryCart();
  const { t } = useLanguage();

  if (!item) return null;

  const itemPrice = typeof item.price === 'number' ? item.price : 0;
  const itemOriginalPrice = typeof item.originalPrice === 'number' ? item.originalPrice : itemPrice;
  const itemQty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
  const itemKey = item.cartKey || `${item.id || 'item'}-${item.color || ''}-${item.size || ''}`;
  const itemImage = item.images?.front || item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';

  const handleMoveToMemoryCart = () => {
    addToMemoryCart(item, 2);
    removeFromCart(itemKey);
  };

  const handleMoveToWishlist = () => {
    if (!isInWishlist(item.id)) {
      toggleWishlist(item);
    }
    removeFromCart(itemKey);
  };

  return (
    <div className="fm-cart-item">
      <Link to={`/product/${item.productId || item.id}`} className="fm-cart-item-img-link">
        <img src={itemImage} alt={item.name || 'Product'} className="fm-cart-item-img" />
      </Link>

      <div className="fm-cart-item-info">
        <div className="fm-cart-item-header">
          <Link to={`/product/${item.productId || item.id}`} className="fm-cart-item-title">
            {item.name || 'Product'}
          </Link>
          <button
            className="fm-cart-item-delete"
            onClick={() => removeFromCart(itemKey)}
            title={t('removeFromCart') || 'Remove from cart'}
          >
            🗑️
          </button>
        </div>

        <div className="fm-cart-item-category">{item.category || 'General'}</div>
        
        {(item.color || item.size) && (
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            {item.color && <span>Colour: {formatColorName(item.color)}</span>}
            {item.color && item.size && <span style={{ margin: '0 8px' }}>|</span>}
            {item.size && <span>Size: {formatSizeName(item.size)}</span>}
          </div>
        )}

        <div className="fm-cart-item-pricing" style={{ marginTop: '8px' }}>
          <PriceTag currentPrice={itemPrice} originalPrice={itemOriginalPrice} size="small" />
        </div>

        <div className="fm-cart-item-controls">
          <div className="fm-qty-control">
            <button
              className="fm-qty-btn"
              onClick={() => updateQuantity(itemKey, itemQty - 1)}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="fm-qty-display">{itemQty}</span>
            <button
              className="fm-qty-btn"
              onClick={() => updateQuantity(itemKey, Math.min(item.stock || 99, itemQty + 1))}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="fm-cart-item-subtotal">
            <span className="subtotal-label">{t('totalLabel') || 'Total:'}</span>
            <span className="subtotal-val">{formatPrice(itemPrice * itemQty)}</span>
          </div>
        </div>

        <div className="fm-cart-item-quick-moves">
          <button className="fm-move-btn" onClick={handleMoveToWishlist}>
            Move to Wishlist
          </button>
          <span className="dot-sep">•</span>
          <button className="fm-move-btn memory-color" onClick={handleMoveToMemoryCart}>
             Move to Memory Cart (Repurchase)
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
