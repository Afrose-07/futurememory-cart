import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { useReviews } from '../context/ReviewContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import ProductReviewModal from '../components/ProductReviewModal';
import { formatPrice, formatDate } from '../utils/helpers';
import { allProductsCatalog } from '../data/allOccasionsCatalog';
import './OrderHistoryPage.css';

const TIMELINE_STEPS = [
  'Order Placed',
  'Confirmed',
  'Shipped',
  'Out for Delivery',
  'Delivered'
];

const OrderHistoryPage = () => {
  const { orders, cancelOrder, markAsDelivered, setActiveReturnOrder } = useOrders();
  const { addToCart } = useCart();
  const { addReview } = useReviews();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlOrderId = queryParams.get('orderId');

  const [selectedOrder, setSelectedOrder] = useState(null);

  // Review Modal State
  const [reviewModalOrder, setReviewModalOrder] = useState(null);
  const [reviewModalProduct, setReviewModalProduct] = useState(null);
  const [orderReviews, setOrderReviews] = useState(() => {
    try {
      const stored = localStorage.getItem('fm_order_user_reviews');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [successToast, setSuccessToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('fm_order_user_reviews', JSON.stringify(orderReviews));
    } catch {}
  }, [orderReviews]);

  useEffect(() => {
    if (urlOrderId && orders.length > 0) {
      const o = orders.find(ord => ord.orderId === urlOrderId);
      if (o) {
        setSelectedOrder({ ...o, orderStatus: o.orderStatus || o.status || 'Order Placed' });
      }
    }
  }, [urlOrderId, orders]);

  const handleBuyAgain = (item) => {
    let liveProduct = allProductsCatalog.find(p => String(p.id) === String(item.productId || item.id));
    let currentStock = liveProduct ? liveProduct.stock : item.stock;
    
    if (liveProduct && item.size && liveProduct.stockBySize) {
      currentStock = liveProduct.stockBySize[item.size] !== undefined ? liveProduct.stockBySize[item.size] : currentStock;
    }

    if (currentStock === 0) {
      alert(`Sorry, ${item.name} is currently out of stock.`);
      return;
    }
    
    addToCart(item, 1);
    setSuccessToast(`Added ${item.name} to Cart!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleMarkReceived = (order) => {
    if (markAsDelivered) {
      markAsDelivered(order.orderId);
    }
    setSuccessToast(`Order #${order.orderId} marked as Received & Delivered! 🎉`);
    setTimeout(() => setSuccessToast(null), 3000);

    // Open review modal immediately for the first item
    setReviewModalOrder(order);
    setReviewModalProduct(order.items?.[0] || null);
  };

  const handleOpenReview = (order, item = null) => {
    setReviewModalOrder(order);
    setReviewModalProduct(item || order.items?.[0] || null);
  };

  const handleReviewSubmit = (reviewData) => {
    // Add to global ReviewContext
    if (addReview) {
      addReview({
        modelId: reviewData.productId,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        image: reviewData.image,
        tags: reviewData.tags
      });
    }

    // Save locally to display on order card
    const key = `${reviewData.orderId}_${reviewData.productId || 'item'}`;
    setOrderReviews(prev => ({
      ...prev,
      [key]: reviewData
    }));

    setSuccessToast(`Thank you! Your verified ${reviewData.rating}★ photo review is published!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // If viewing single order detail view
  if (selectedOrder) {
    const o = selectedOrder;
    const currentStepIndex = TIMELINE_STEPS.indexOf(o.orderStatus === 'Placed' ? 'Order Placed' : o.orderStatus);
    const isCancelled = o.orderStatus === 'Cancelled';
    const isDelivered = o.status === 'Delivered' || o.orderStatus === 'Delivered';
    const canCancel = !isCancelled && !isDelivered && (o.orderStatus === 'Order Placed' || o.orderStatus === 'Confirmed' || o.orderStatus === 'Placed' || o.orderStatus === 'Received');

    return (
      <div className="fm-orders-page">
        <PageHeader title="Order Details" subtitle={`Order ID: ${o.orderId}`} />
        <div className="container" style={{ maxWidth: '840px', margin: '0 auto', paddingTop: '30px' }}>
          
          <Button variant="secondary" onClick={() => setSelectedOrder(null)} style={{ marginBottom: '20px' }}>
            ← Back to Order History
          </Button>

          {/* Toast */}
          {successToast && (
            <div style={{
              background: '#10b981',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: '10px',
              fontWeight: 700,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <span>{successToast}</span>
              <button onClick={() => setSuccessToast(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>
          )}

          {/* Tracking UI */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '30px', border: '1px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#0f172a' }}>Order Status</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Placed on {formatDate(o.orderDate || o.createdAt)}</span>
              </div>
              <span className={`order-status-badge status-${(o.status || o.orderStatus || 'Delivered').toLowerCase().replace(/\s+/g, '-')}`}>
                {o.status || o.orderStatus || 'Order Placed'}
              </span>
            </div>

            {isCancelled ? (
              <div style={{ marginTop: '20px', padding: '16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                This order was cancelled.
              </div>
            ) : (
              <div className="fm-timeline">
                {TIMELINE_STEPS.map((step, idx) => {
                  let statusClass = '';
                  if (currentStepIndex > idx || isDelivered) statusClass = 'completed';
                  else if (currentStepIndex === idx) statusClass = 'active';
                  
                  return (
                    <div key={step} className={`fm-timeline-step ${statusClass}`}>
                      <div className="fm-timeline-circle">{(currentStepIndex > idx || isDelivered) ? '✓' : idx + 1}</div>
                      <div className="fm-timeline-label">{step}</div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
              {!isDelivered && !isCancelled && (
                <Button 
                  variant="primary" 
                  onClick={() => handleMarkReceived(o)}
                  style={{ background: '#10b981', borderColor: '#10b981' }}
                >
                  📦 Mark as Received / Delivered
                </Button>
              )}
              {isDelivered && (
                <>
                  <Button 
                    variant="primary" 
                    onClick={() => handleOpenReview(o)}
                    style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#fff' }}
                  >
                    ⭐ Rate & Write Review
                  </Button>
                  {!o.returnInfo ? (
                    <Button 
                      variant="secondary" 
                      onClick={() => setActiveReturnOrder(o)}
                      style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#166534', fontWeight: 800 }}
                    >
                      🛡️ 7-Days Return Wizard (Fig 8.76)
                    </Button>
                  ) : (
                    <span style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '0.86rem' }}>
                      🚚 Return: {o.returnInfo.status || 'Requested'}
                    </span>
                  )}
                </>
              )}
              {canCancel && (
                <Button variant="danger" onClick={() => {
                  cancelOrder(o.orderId);
                  setSelectedOrder({ ...o, orderStatus: 'Cancelled' });
                }}>
                  Cancel Order
                </Button>
              )}
            </div>
          </div>

          {/* Delivery & Shipping Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#0f172a' }}>Delivery Address</h4>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px' }}>
                <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                  {o.deliveryAddress?.fullName || o.shippingAddress?.fullName || 'Customer'}
                </strong>
                <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
                  {o.deliveryAddress?.houseNo || o.shippingAddress?.addressLine}, {o.deliveryAddress?.street}<br/>
                  {o.deliveryAddress?.city || o.shippingAddress?.city}, {o.deliveryAddress?.state || o.shippingAddress?.state} - <strong>{o.deliveryAddress?.pincode || o.shippingAddress?.pincode}</strong><br/>
                  Phone: {o.deliveryAddress?.phone || o.deliveryAddress?.mobile || o.mobile}
                </p>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#0f172a' }}>Payment & Updates</h4>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Payment Mode:</span>
                  <strong style={{ color: '#0f172a' }}>{o.paymentMethod || 'UPI'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Notification Channel:</span>
                  <strong style={{ color: '#16a34a' }}>
                    {(o.notificationPreference || 'whatsapp') === 'whatsapp' ? '💬 WhatsApp' : '✉️ Email'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Shipping Speed:</span>
                  <strong style={{ color: '#0f172a' }}>{o.deliveryOption || 'Standard'} Delivery</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Ordered Products with Reviews */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#0f172a' }}>Ordered Products</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {o.items?.map(item => {
                const reviewKey = `${o.orderId}_${item.id || item.productId || 'item'}`;
                const itemReview = orderReviews[reviewKey];

                return (
                  <div key={item.cartKey || item.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <img 
                        src={item.images?.front || item.image} 
                        alt={item.name} 
                        style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover' }} 
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{item.name}</div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                          {item.color && <span>Colour: {typeof item.color === 'object' ? item.color.name : item.color}</span>}
                          {item.size && <span> | Size: {typeof item.size === 'object' ? item.size.name : item.size}</span>}
                          <span> | Qty: {item.quantity}</span>
                        </div>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                          {formatPrice(item.price)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        <Button size="sm" variant="secondary" onClick={() => handleBuyAgain(item)}>Buy Again</Button>
                        <Button 
                          size="sm" 
                          variant="primary"
                          onClick={() => handleOpenReview(o, item)}
                          style={{ background: itemReview ? '#10b981' : '#f59e0b', border: 'none' }}
                        >
                          {itemReview ? '★ Edit Review' : '⭐ Rate Product'}
                        </Button>
                      </div>
                    </div>

                    {/* Show Verified Review if Submitted */}
                    {itemReview && (
                      <div style={{
                        marginTop: '12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        display: 'flex',
                        gap: '14px',
                        alignItems: 'flex-start'
                      }}>
                        {itemReview.image && (
                          <img 
                            src={itemReview.image} 
                            alt="Customer upload" 
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ color: '#f59e0b', fontSize: '1rem' }}>{'★'.repeat(itemReview.rating)}</span>
                            <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{itemReview.title}</strong>
                            <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              Verified Review
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.4 }}>
                            "{itemReview.comment}"
                          </p>
                          {itemReview.tags?.length > 0 && (
                            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                              {itemReview.tags.map(t => (
                                <span key={t} style={{ fontSize: '0.7rem', background: '#e2e8f0', color: '#334155', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                  ✓ {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Details */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#0f172a' }}>Payment Summary</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Subtotal</span>
                <span>{formatPrice(o.subtotal || o.totalAmount)}</span>
              </div>
              {(o.discount || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                  <span>Discount</span>
                  <span>- {formatPrice(o.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Delivery Charge</span>
                <span>{o.deliveryCharge === 0 ? 'FREE' : formatPrice(o.deliveryCharge || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginTop: '4px', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                <span>Total Paid</span>
                <span style={{ color: 'var(--primary-color)' }}>{formatPrice(o.totalAmount)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Review Modal */}
        <ProductReviewModal
          isOpen={!!reviewModalOrder}
          onClose={() => setReviewModalOrder(null)}
          order={reviewModalOrder}
          product={reviewModalProduct}
          onSubmitReview={handleReviewSubmit}
        />
      </div>
    );
  }

  // Orders List View
  return (
    <div className="fm-orders-page">
      <PageHeader title="My Orders" subtitle="Track orders, manage delivery, and rate purchased gifts" />

      <div className="container" style={{ paddingTop: '36px', maxWidth: '860px', margin: '0 auto', paddingBottom: '60px' }}>
        
        {/* Toast */}
        {successToast && (
          <div style={{
            background: '#10b981',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '10px',
            fontWeight: 700,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <span>{successToast}</span>
            <button onClick={() => setSuccessToast(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 800 }}>✕</button>
          </div>
        )}

        {(!orders || orders.length === 0) ? (
          <div style={{ textAlign: 'center', background: '#fff', padding: '60px 20px', borderRadius: '20px', border: '1px solid #e2e8f0', maxWidth: '600px', margin: '0 auto', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h2 style={{ marginBottom: '8px', fontSize: '1.4rem', color: '#0f172a' }}>No Orders Found</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>You haven't placed any orders yet. Discover our curated catalog today!</p>
            <Link to="/shop">
              <Button variant="primary" size="lg">Start Shopping Now</Button>
            </Link>
          </div>
        ) : (
          <div className="fm-orders-list">
            {orders.map(order => {
              const isDelivered = order.status === 'Delivered' || order.orderStatus === 'Delivered';
              const firstItem = order.items?.[0];
              const reviewKey = `${order.orderId}_${firstItem?.id || firstItem?.productId || 'item'}`;
              const hasReview = orderReviews[reviewKey];

              return (
                <div key={order.orderId} className="fm-order-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                  <div className="fm-order-card-header">
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginBottom: '4px' }}>
                        Order #{order.orderId}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Placed on {formatDate(order.orderDate || order.createdAt)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', marginBottom: '4px' }}>
                        {formatPrice(order.totalAmount)}
                      </div>
                      <div className={`order-status-badge status-${(order.status || order.orderStatus || 'Received').toLowerCase().replace(/\s+/g, '-')}`}>
                        {order.status || order.orderStatus || 'Order Placed'}
                      </div>
                    </div>
                  </div>

                  {/* Items snapshot */}
                  <div style={{ display: 'flex', gap: '12px', margin: '14px 0', alignItems: 'center' }}>
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <img 
                        key={idx} 
                        src={item.images?.front || item.image} 
                        alt={item.name} 
                        style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #e2e8f0' }} 
                      />
                    ))}
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginLeft: '6px' }}>
                      {order.items?.length || 1} {order.items?.length === 1 ? 'item' : 'items'} • {order.deliveryOption || 'Standard'} Delivery
                      {order.deliveryAddress?.city && <span> • To {order.deliveryAddress.city}</span>}
                    </div>
                  </div>

                  {/* Customer Review Preview if exists */}
                  {hasReview && (
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      marginBottom: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      {hasReview.image && (
                        <img 
                          src={hasReview.image} 
                          alt="Review" 
                          style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }} 
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#f59e0b' }}>{'★'.repeat(hasReview.rating)}</span>
                          <strong style={{ fontSize: '0.82rem', color: '#15803d' }}>Your Verified Review:</strong>
                          <span style={{ fontSize: '0.82rem', color: '#334155' }}>"{hasReview.title}"</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {!isDelivered ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleMarkReceived(order)}
                            style={{
                              background: '#10b981',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.84rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                            }}
                          >
                            <span>📦</span> Mark Received / Delivered
                          </button>
                          {!order.returnInfo && (
                            <button
                              type="button"
                              onClick={() => {
                                if (markAsDelivered) markAsDelivered(order.orderId);
                                setActiveReturnOrder(order);
                              }}
                              style={{
                                background: '#f0fdf4',
                                color: '#166534',
                                border: '1.5px solid #86efac',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontWeight: 800,
                                fontSize: '0.84rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                              title="Deliver and open 7-Days Return Wizard (Fig 8.76)"
                            >
                              <span>🛡️</span> 7-Days Return (Fig 8.76)
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenReview(order)}
                            style={{
                              background: hasReview ? '#eef2ff' : '#f59e0b',
                              color: hasReview ? '#4338ca' : '#fff',
                              border: hasReview ? '1px solid #c7d2fe' : 'none',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.84rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span>⭐</span> {hasReview ? 'Edit Photo Review' : 'Rate & Review Order'}
                          </button>

                          {!order.returnInfo ? (
                            <button
                              type="button"
                              onClick={() => setActiveReturnOrder(order)}
                              style={{
                                background: '#f0fdf4',
                                color: '#166534',
                                border: '1.5px solid #86efac',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontWeight: 800,
                                fontSize: '0.84rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                              title="Open 7-Days Return Wizard (Fig 8.76)"
                            >
                              <span>🛡️</span> 7-Days Return (Fig 8.76)
                            </button>
                          ) : (
                            <span style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '6px 12px', borderRadius: '8px', fontWeight: 800, fontSize: '0.82rem' }}>
                              🚚 Return: {order.returnInfo.status || 'Requested'}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => setSelectedOrder({ ...order, orderStatus: order.orderStatus || order.status || 'Order Placed' })}
                    >
                      View Details →
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ProductReviewModal
        isOpen={!!reviewModalOrder}
        onClose={() => setReviewModalOrder(null)}
        order={reviewModalOrder}
        product={reviewModalProduct}
        onSubmitReview={handleReviewSubmit}
      />
    </div>
  );
};

export default OrderHistoryPage;
