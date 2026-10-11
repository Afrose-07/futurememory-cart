const fs = require('fs');

// 1. Update OrderContext.jsx
let orderContext = fs.readFileSync('src/context/OrderContext.jsx', 'utf8');
orderContext = orderContext.replace(
  /orderId: \`FM-\$\{Math\.random.*?9000\)\}\`/,
  "orderId: `FMC-2026-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`"
);
orderContext = orderContext.replace(/createdAt: /g, 'orderDate: ');
fs.writeFileSync('src/context/OrderContext.jsx', orderContext);

// 2. Rewrite CheckoutPage.jsx
const checkoutPageCode = `import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { formatPrice } from '../utils/helpers';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cartItems, getSubtotal, getDiscountAmount, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();

  // Load addresses
  const getAddressKey = () => \`fm_addresses_\${user?.email || 'guest'}\`;
  const [addresses, setAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem(getAddressKey());
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(getAddressKey(), JSON.stringify(addresses));
  }, [addresses, user]);

  const [selectedAddressId, setSelectedAddressId] = useState(addresses.length > 0 ? addresses[0].id : null);
  const [isAddingAddress, setIsAddingAddress] = useState(addresses.length === 0);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const [addrForm, setAddrForm] = useState({
    fullName: '',
    phone: '',
    houseNo: '',
    street: '',
    city: '',
    district: '',
    state: 'Tamil Nadu',
    pincode: '',
    type: 'Home'
  });

  const [deliveryOption, setDeliveryOption] = useState('Standard');
  const [formError, setFormError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const deliveryCharge = deliveryOption === 'Express' ? 99 : 0;
  const totalAmount = subtotal - discount + deliveryCharge;

  if (cartItems.length === 0) {
    return (
      <div className="fm-checkout-page">
        <PageHeader title="Secure Checkout" subtitle="Complete your purchase" />
        <div className="container text-center" style={{ padding: '60px 0' }}>
          <h2>Your cart is empty!</h2>
          <p style={{ margin: '16px 0 24px 0', color: '#64748b' }}>Please add products before checking out.</p>
          <Link to="/shop">
            <Button variant="primary">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setAddrForm({ ...addrForm, [e.target.name]: e.target.value });
    setFormError('');
  };

  const saveAddress = () => {
    if (!addrForm.fullName.trim() || !addrForm.phone.trim() || !addrForm.houseNo.trim() || 
        !addrForm.street.trim() || !addrForm.city.trim() || !addrForm.state.trim() || !addrForm.pincode.trim()) {
      setFormError('Please fill in all required address fields.');
      return;
    }
    
    if (addrForm.phone.replace(/\\D/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (editingAddressId) {
      setAddresses(prev => prev.map(a => a.id === editingAddressId ? { ...addrForm, id: editingAddressId } : a));
      setSelectedAddressId(editingAddressId);
    } else {
      const newAddr = { ...addrForm, id: Date.now().toString() };
      setAddresses(prev => [...prev, newAddr]);
      setSelectedAddressId(newAddr.id);
    }
    
    setIsAddingAddress(false);
    setEditingAddressId(null);
    setAddrForm({
      fullName: '', phone: '', houseNo: '', street: '', city: '', district: '', state: 'Tamil Nadu', pincode: '', type: 'Home'
    });
  };

  const editAddress = (addr) => {
    setAddrForm(addr);
    setEditingAddressId(addr.id);
    setIsAddingAddress(true);
    window.scrollTo(0, 0);
  };

  const deleteAddress = (id) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    if (selectedAddressId === id) setSelectedAddressId(null);
  };

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      setFormError('Please select a delivery address.');
      return;
    }

    // Stock validation
    for (const item of cartItems) {
      if (item.stock === 0 || item.stock < item.quantity) {
        setFormError(\`Sorry, \${item.name} is out of stock or insufficient quantity.\`);
        return;
      }
    }

    setIsProcessing(true);
    const selectedAddr = addresses.find(a => a.id === selectedAddressId);

    setTimeout(() => {
      const orderData = {
        items: [...cartItems],
        subtotal,
        discount,
        deliveryCharge,
        totalAmount,
        deliveryOption,
        deliveryAddress: selectedAddr,
        orderStatus: 'Confirmed'
      };

      const createdOrder = placeOrder(orderData);
      clearCart();
      setIsProcessing(false);

      navigate('/order-confirmation', { state: { order: createdOrder } });
    }, 1000);
  };

  return (
    <div className="fm-checkout-page">
      <PageHeader title="Secure Checkout" subtitle="Finalize delivery and place your order." />

      <div className="container fm-checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px', padding: '30px 0' }}>
        <div className="fm-checkout-main">
          
          {/* ADDRESS SECTION */}
          <div className="checkout-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem' }}>A. Delivery Address</h2>
              {!isAddingAddress && (
                <Button size="sm" variant="secondary" onClick={() => { setIsAddingAddress(true); setEditingAddressId(null); setAddrForm({ fullName: '', phone: '', houseNo: '', street: '', city: '', district: '', state: 'Tamil Nadu', pincode: '', type: 'Home' }); }}>
                  + Add New Address
                </Button>
              )}
            </div>

            {isAddingAddress ? (
              <div className="address-form" style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Address Type *</label>
                    <select name="type" value={addrForm.type} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <option value="Home">Home</option>
                      <option value="College">College</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Full Name *</label>
                    <input type="text" name="fullName" value={addrForm.fullName} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Mobile Number *</label>
                    <input type="tel" name="phone" value={addrForm.phone} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>House / Flat / Door No. *</label>
                    <input type="text" name="houseNo" value={addrForm.houseNo} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Street / Area *</label>
                    <input type="text" name="street" value={addrForm.street} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Village / City *</label>
                    <input type="text" name="city" value={addrForm.city} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>District</label>
                    <input type="text" name="district" value={addrForm.district} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>State *</label>
                    <input type="text" name="state" value={addrForm.state} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Pincode *</label>
                    <input type="text" name="pincode" value={addrForm.pincode} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button variant="primary" onClick={saveAddress}>Save Address</Button>
                  {addresses.length > 0 && <Button variant="secondary" onClick={() => { setIsAddingAddress(false); setEditingAddressId(null); }}>Cancel</Button>}
                </div>
              </div>
            ) : (
              <div className="saved-addresses" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {addresses.map(addr => (
                  <div key={addr.id} style={{ 
                    border: selectedAddressId === addr.id ? '2px solid #4f46e5' : '1px solid #cbd5e1', 
                    borderRadius: '12px', padding: '16px', background: selectedAddressId === addr.id ? '#eff6ff' : '#fff',
                    display: 'flex', justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>{addr.type}</span>
                        <strong style={{ fontSize: '1.05rem' }}>{addr.fullName}</strong>
                        <span style={{ color: '#64748b' }}>- {addr.phone}</span>
                      </div>
                      <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        {addr.houseNo}, {addr.street}<br/>
                        {addr.city}{addr.district ? \`, \${addr.district}\` : ''}, {addr.state} - {addr.pincode}
                      </p>
                      
                      <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                        {selectedAddressId !== addr.id && (
                          <Button size="sm" variant="primary" onClick={() => setSelectedAddressId(addr.id)}>Deliver Here</Button>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => editAddress(addr)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => deleteAddress(addr.id)}>Delete</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <hr style={{ margin: '32px 0', border: 0, borderTop: '1px solid #e2e8f0' }} />

          {/* DELIVERY OPTION */}
          <div className="checkout-section">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>D. Delivery Option</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label style={{ border: deliveryOption === 'Standard' ? '2px solid #4f46e5' : '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', cursor: 'pointer', background: deliveryOption === 'Standard' ? '#eff6ff' : '#fff' }}>
                <input type="radio" name="delivery" checked={deliveryOption === 'Standard'} onChange={() => setDeliveryOption('Standard')} style={{ display: 'none' }} />
                <strong style={{ display: 'block', fontSize: '1.05rem' }}>Standard Delivery</strong>
                <span style={{ display: 'block', color: '#16a34a', fontWeight: 700, margin: '8px 0' }}>₹0</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Estimated delivery: 5-7 days</p>
              </label>
              
              <label style={{ border: deliveryOption === 'Express' ? '2px solid #4f46e5' : '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', cursor: 'pointer', background: deliveryOption === 'Express' ? '#eff6ff' : '#fff' }}>
                <input type="radio" name="delivery" checked={deliveryOption === 'Express'} onChange={() => setDeliveryOption('Express')} style={{ display: 'none' }} />
                <strong style={{ display: 'block', fontSize: '1.05rem' }}>Express Delivery</strong>
                <span style={{ display: 'block', color: '#334155', fontWeight: 700, margin: '8px 0' }}>₹99</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Estimated delivery: 2-3 days</p>
              </label>
            </div>
          </div>

        </div>

        {/* SUMMARY & PRICES */}
        <div className="fm-checkout-sidebar">
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', position: 'sticky', top: '24px' }}>
            
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>B. Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '40vh', overflowY: 'auto', paddingRight: '8px', marginBottom: '24px' }}>
              {cartItems.map(item => (
                <div key={item.cartKey} style={{ display: 'flex', gap: '12px' }}>
                  <img src={item.images?.front || item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.2, marginBottom: '4px' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                      {item.color && <span>Color: {item.color} </span>}
                      {item.size && <span> | Size: {item.size}</span>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#475569' }}>Qty: {item.quantity}</span>
                      <strong style={{ color: '#0f172a' }}>{formatPrice(item.price * item.quantity)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>C. Price Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                  <span>Discount</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Delivery Charge</span>
                <span>{deliveryCharge === 0 ? <span style={{ color: '#16a34a' }}>FREE</span> : formatPrice(deliveryCharge)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, paddingTop: '16px', borderTop: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <span>E. Final Total</span>
              <span style={{ color: '#4f46e5' }}>{formatPrice(totalAmount)}</span>
            </div>

            {formError && (
              <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600, marginBottom: '16px' }}>
                ️ {formError}
              </div>
            )}

            <Button variant="primary" size="lg" fullWidth onClick={handlePlaceOrder} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'F. Place Order'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
`;

fs.writeFileSync('src/pages/CheckoutPage.jsx', checkoutPageCode);

// 3. Rewrite OrderConfirmationPage.jsx
const orderConfirmationPageCode = `import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { formatPrice, formatDate } from '../utils/helpers';
import './OrderConfirmationPage.css';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/shop" replace />;
  }

  // Calculate estimated delivery if not provided
  let estDelivery = order.deliveryDate;
  if (!estDelivery) {
    const d = new Date(order.orderDate || Date.now());
    d.setDate(d.getDate() + (order.deliveryOption === 'Express' ? 2 : 5));
    estDelivery = d.toISOString();
  }

  return (
    <div className="fm-order-success-page">
      <PageHeader title="Order Placed Successfully" subtitle="Thank you for shopping with FutureMemory Cart!" />
      
      <div className="container" style={{ padding: '40px 0', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          
          <div style={{ background: '#10b981', color: '#fff', padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Order Confirmed!</h2>
            <p style={{ opacity: 0.9 }}>Your order <strong>{order.orderId}</strong> has been placed and is being processed.</p>
          </div>

          <div style={{ padding: '32px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total Amount</h4>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{formatPrice(order.totalAmount)}</div>
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Estimated Delivery</h4>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>{formatDate(estDelivery)}</div>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>{order.deliveryOption} Delivery</div>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Delivery Address</h4>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>{order.deliveryAddress.fullName}</strong>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {order.deliveryAddress.houseNo}, {order.deliveryAddress.street}<br/>
                  {order.deliveryAddress.city}{order.deliveryAddress.district ? \`, \${order.deliveryAddress.district}\` : ''}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}<br/>
                  Phone: {order.deliveryAddress.phone}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Ordered Products</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {order.items.map(item => (
                  <div key={item.cartKey} style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                    <img src={item.images?.front || item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                        {item.color && <span>Color: {item.color}</span>}
                        {item.color && item.size && <span> | </span>}
                        {item.size && <span>Size: {item.size}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600 }}>{formatPrice(item.price)}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '40px' }}>
              <Link to="/shop">
                <Button variant="secondary">Continue Shopping</Button>
              </Link>
              <Link to="/order-history">
                <Button variant="primary">View Order</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
`;

fs.writeFileSync('src/pages/OrderConfirmationPage.jsx', orderConfirmationPageCode);
