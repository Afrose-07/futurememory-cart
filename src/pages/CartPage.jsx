import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import CartItem from '../components/CartItem';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { formatPrice } from '../utils/helpers';
import './CartPage.css';

const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const {
    cartItems,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    getSubtotal,
    getOriginalTotal,
    getDiscountAmount,
    getCartTotal,
    getCartCount,
    clearCart
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);

  const subtotal = getSubtotal();
  const originalTotal = getOriginalTotal();
  const itemDiscount = originalTotal - subtotal;
  const promoDiscount = getDiscountAmount();
  const deliveryFee = subtotal > 999 || subtotal === 0 ? 0 : 99;
  const finalTotal = getCartTotal() + deliveryFee;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const result = applyPromoCode(couponInput);
    setCouponFeedback(result);
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: { pathname: '/checkout' },
          message: ' தயவுசெய்து உங்கள் ஆர்டரை பதிவு செய்ய Sign In அல்லது Register செய்யவும் (Please sign in to place your order).'
        }
      });
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="fm-cart-page">
      <PageHeader
        title={`️ ${t('cartTitle') || 'Instant Shopping Cart'}`}
        subtitle={t('cartSubtitle') || 'Review your immediate order items, apply promo vouchers, and proceed to lightning checkout.'}
        breadcrumbs={[{ label: 'Cart' }]}
        badge={`${getCartCount()} Total Items`}
        action={
          cartItems.length > 0 && (
            <Button variant="danger" size="sm" onClick={clearCart}>
              Clear Cart
            </Button>
          )
        }
      />

      <div className="container">
        {cartItems.length === 0 ? (
          <EmptyState
            icon="️"
            title={t('emptyCartTitle') || 'Your Normal Cart is Empty'}
            description={t('emptyCartDesc') || "Looks like you haven't added any products for immediate checkout yet."}
            actionText={t('startShopping') || 'Start Shopping'}
            actionLink="/shop"
          />
        ) : (
          <div className="fm-cart-layout">
            {/* Left Items Column */}
            <div className="fm-cart-items-col">
              <div className="fm-cart-items-list">
                {cartItems.map((item) => (
                  <CartItem key={item.cartKey} item={item} />
                ))}
              </div>

              {/* Memory Cart Cross-Promotion */}
              <div className="fm-cart-memory-callout">
                <div className="callout-icon"></div>
                <div className="callout-text">
                  <h4>{t('memoryCartPromoTitle') || 'Want regular auto-refill reminders?'}</h4>
                  <p>
                    {t('memoryCartPromoDesc') || 'Items like shampoo, skincare, and stationery can be moved to your Memory Cart to receive price drop alerts and restock reminders.'}
                  </p>
                </div>
                <Link to="/memory-cart">
                  <Button variant="memory" size="sm">{t('exploreMemoryCart') || 'Explore Memory Cart'}</Button>
                </Link>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="fm-cart-summary-col">
              <div className="fm-summary-card">
                <h3 className="fm-summary-title">{t('orderSummary') || 'Order Summary'}</h3>

                <div className="fm-summary-breakdown">
                  <div className="fm-summary-row">
                    <span>{t('originalMrp') || 'Original MRP:'}</span>
                    <span>{formatPrice(originalTotal)}</span>
                  </div>

                  {itemDiscount > 0 && (
                    <div className="fm-summary-row discount-row">
                      <span>{t('productDiscount') || 'Product Discount:'}</span>
                      <span>- {formatPrice(itemDiscount)}</span>
                    </div>
                  )}

                  <div className="fm-summary-row">
                    <span>
                      {typeof t('subtotalItems') === 'string' && t('subtotalItems').includes('{count}')
                        ? t('subtotalItems').replace('{count}', getCartCount())
                        : `Subtotal (${getCartCount()} items):`}
                    </span>
                    <span className="bold-val">{formatPrice(subtotal)}</span>
                  </div>

                  {appliedPromo && (
                    <div className="fm-summary-row promo-row">
                      <span>Promo ({appliedPromo.code} - {appliedPromo.discountPercent}%):</span>
                      <span className="green-val">- {formatPrice(promoDiscount)}</span>
                    </div>
                  )}

                  <div className="fm-summary-row">
                    <span>{t('standardShipping') || 'Standard Shipping:'}</span>
                    <span>{deliveryFee === 0 ? <strong className="green-val">{t('free') || 'FREE'}</strong> : formatPrice(deliveryFee)}</span>
                  </div>

                  {subtotal > 0 && subtotal < 999 && (
                    <div className="fm-free-shipping-hint">
                      Add {formatPrice(999 - subtotal)} more for <strong>FREE Delivery</strong>!
                    </div>
                  )}

                  <hr className="fm-summary-divider" />

                  <div className="fm-summary-total-row">
                    <span>{t('totalAmount') || 'Total Amount:'}</span>
                    <span className="final-price">{formatPrice(finalTotal)}</span>
                  </div>
                </div>



                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleProceedToCheckout}
                  icon=""
                >
                  {t('proceedToCheckout') || 'Proceed to Checkout'} ({formatPrice(finalTotal)})
                </Button>

                <div className="fm-summary-trust">
                  <span>️ {t('secureCheckout') || '100% Safe & Secure Checkout'}</span>
                  <span> {t('quickDispatch') || 'Quick Dispatch in 24 Hours'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
