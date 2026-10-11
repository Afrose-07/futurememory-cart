const fs = require('fs');

const cssContent = `
.fm-orders-page {
  background: #f8fafc;
  min-height: 100vh;
  padding-bottom: 40px;
}

.fm-orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.fm-order-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.fm-order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.order-status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}
.status-order-placed, .status-confirmed { background: #dbeafe; color: #1e40af; }
.status-shipped { background: #fef3c7; color: #92400e; }
.status-out-for-delivery { background: #ffedd5; color: #c2410c; }
.status-delivered { background: #dcfce3; color: #166534; }
.status-cancelled { background: #fee2e2; color: #b91c1c; }

.fm-timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin: 40px 0;
}
.fm-timeline::before {
  content: '';
  position: absolute;
  top: 15px;
  left: 0;
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  z-index: 1;
}
.fm-timeline-step {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}
.fm-timeline-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #fff;
  border: 4px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: bold;
}
.fm-timeline-step.completed .fm-timeline-circle {
  background: #10b981;
  border-color: #10b981;
  color: #fff;
}
.fm-timeline-step.active .fm-timeline-circle {
  border-color: #4f46e5;
  background: #fff;
  color: #4f46e5;
}
.fm-timeline-step.completed ~ .fm-timeline-step .fm-timeline-circle {
  border-color: #e2e8f0;
  color: #94a3b8;
}

.fm-timeline-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  text-align: center;
}
.fm-timeline-step.completed .fm-timeline-label,
.fm-timeline-step.active .fm-timeline-label {
  color: #0f172a;
}
`;

fs.writeFileSync('src/pages/OrderHistoryPage.css', cssContent);

const jsxContent = `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { formatPrice, formatDate } from '../utils/helpers';
import './OrderHistoryPage.css';

const TIMELINE_STEPS = [
  'Order Placed',
  'Confirmed',
  'Shipped',
  'Out for Delivery',
  'Delivered'
];

const OrderHistoryPage = () => {
  const { orders, cancelOrder } = useOrders();
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();

  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleBuyAgain = (item) => {
    // Check stock if available, else just allow adding as much as stock says
    if (item.stock === 0) {
      alert(\`Sorry, \${item.name} is currently out of stock.\`);
      return;
    }
    
    addToCart(item, 1);
    alert(\`Added \${item.name} to Cart!\`);
  };

  if (selectedOrder) {
    const o = selectedOrder;
    const currentStepIndex = TIMELINE_STEPS.indexOf(o.orderStatus === 'Placed' ? 'Order Placed' : o.orderStatus);
    const isCancelled = o.orderStatus === 'Cancelled';
    const canCancel = o.orderStatus === 'Order Placed' || o.orderStatus === 'Confirmed' || o.orderStatus === 'Placed' || o.orderStatus === 'Received';

    return (
      <div className="fm-orders-page">
        <PageHeader title="Order Details" subtitle={\`Order ID: \${o.orderId}\`} />
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '30px' }}>
          
          <Button variant="secondary" onClick={() => setSelectedOrder(null)} style={{ marginBottom: '20px' }}>
            ← Back to Order History
          </Button>

          {/* Tracking UI */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>A. Order Information</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '0.95rem' }}>
              <div><strong>Order ID:</strong> {o.orderId}</div>
              <div><strong>Order Date:</strong> {formatDate(o.orderDate || o.createdAt)}</div>
              <div><strong>Status:</strong> <span className={\`order-status-badge status-\${o.orderStatus.toLowerCase().replace(/\\s+/g, '-')}\`}>{o.orderStatus}</span></div>
            </div>

            {isCancelled ? (
              <div style={{ marginTop: '30px', padding: '16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                This order was cancelled.
              </div>
            ) : (
              <div className="fm-timeline">
                {TIMELINE_STEPS.map((step, idx) => {
                  let statusClass = '';
                  if (currentStepIndex > idx) statusClass = 'completed';
                  else if (currentStepIndex === idx) statusClass = 'active';
                  
                  return (
                    <div key={step} className={\`fm-timeline-step \${statusClass}\`}>
                      <div className="fm-timeline-circle">{currentStepIndex > idx ? '✓' : idx + 1}</div>
                      <div className="fm-timeline-label">{step}</div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {canCancel && !isCancelled && (
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Button variant="danger" onClick={() => {
                  cancelOrder(o.orderId);
                  setSelectedOrder({ ...o, orderStatus: 'Cancelled' });
                }}>
                  Cancel Order
                </Button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>B. Delivery Information</h3>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>{o.deliveryAddress?.fullName}</strong>
                  <span style={{ fontSize: '0.8rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{o.deliveryAddress?.type || 'Home'}</span>
                </div>
                <div style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {o.deliveryAddress?.houseNo}, {o.deliveryAddress?.street}<br/>
                  {o.deliveryAddress?.city}, {o.deliveryAddress?.state} - {o.deliveryAddress?.pincode}<br/>
                  Phone: {o.deliveryAddress?.phone || o.deliveryAddress?.mobile}
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>C. Delivery Method</h3>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <strong style={{ fontSize: '1.05rem', display: 'block', marginBottom: '4px' }}>{o.deliveryOption || 'Standard'} Delivery</strong>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '0.95rem', marginTop: '8px' }}>
                  <span>Delivery Charge:</span>
                  <span style={{ fontWeight: 600 }}>{o.deliveryCharge === 0 ? 'FREE' : formatPrice(o.deliveryCharge)}</span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                  Estimated delivery: {formatDate(o.deliveryDate || Date.now() + 4 * 24 * 60 * 60 * 1000)}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>D. Ordered Products</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {o.items?.map(item => (
                <div key={item.cartKey || item.id} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', alignItems: 'center' }}>
                  <img src={item.images?.front || item.image} alt={item.name} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#0f172a' }}>{item.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                      {item.color && <span>Colour: {item.color}</span>}
                      {item.color && item.size && <span> | </span>}
                      {item.size && <span>Size: {item.size}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#0f172a' }}>{formatPrice(item.price)}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Qty: {item.quantity}</div>
                    <div style={{ marginTop: '8px' }}>
                      <Button size="sm" variant="secondary" onClick={() => handleBuyAgain(item)}>Buy Again</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>4. Price Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Subtotal</span>
                <span>{formatPrice(o.subtotal)}</span>
              </div>
              {(o.discount || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                  <span>Discount</span>
                  <span>- {formatPrice(o.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Delivery Charge</span>
                <span>{o.deliveryCharge === 0 ? 'FREE' : formatPrice(o.deliveryCharge)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '4px', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                <span>Final Total</span>
                <span>{formatPrice(o.totalAmount)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="fm-orders-page">
      <PageHeader title="My Orders" subtitle="View and track your previous orders" />

      <div className="container" style={{ paddingTop: '40px' }}>
        {(!orders || orders.length === 0) ? (
          <div style={{ textAlign: 'center', background: '#fff', padding: '60px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h2 style={{ marginBottom: '16px' }}>No Orders Yet</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>You haven't placed any orders yet.</p>
            <Link to="/shop">
              <Button variant="primary">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="fm-orders-list">
            {orders.map(order => (
              <div key={order.orderId} className="fm-order-card">
                <div className="fm-order-card-header">
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a', marginBottom: '4px' }}>Order {order.orderId}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Placed on {formatDate(order.orderDate || order.createdAt)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a', marginBottom: '4px' }}>{formatPrice(order.totalAmount)}</div>
                    <div className={\`order-status-badge status-\${(order.orderStatus || 'Received').toLowerCase().replace(/\\s+/g, '-')}\`}>
                      {order.orderStatus || 'Order Placed'}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#475569', fontSize: '0.9rem' }}>
                    {order.items?.length || 0} items • {order.deliveryOption || 'Standard'} Delivery
                  </div>
                  <Button variant="primary" onClick={() => setSelectedOrder({ ...order, orderStatus: order.orderStatus || 'Order Placed' })}>
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
`;

fs.writeFileSync('src/pages/OrderHistoryPage.jsx', jsxContent);
