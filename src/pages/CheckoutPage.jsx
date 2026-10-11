import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import Button from '../components/Button';
import { formatPrice } from '../utils/helpers';
import { detectTamilNaduPincode, lookupPincode } from '../utils/tnPincodes';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Check, 
  MapPin, 
  QrCode, 
  Lock, 
  AlertCircle,
  MessageSquare,
  Mail,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cartItems, getSubtotal, getDiscountAmount, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();

  // Multi-step checkout wizard state: Step 1 (Address) -> Step 2 (Shipping & Alerts) -> Step 3 (Payment)
  const [activeStep, setActiveStep] = useState(1);

  // Storage key strictly scoped to CURRENT logged-in user or clean guest
  const getAddressKey = () => (user?.email ? `fm_addresses_${user.email.toLowerCase()}` : 'fm_addresses_guest');

  const [addresses, setAddresses] = useState(() => {
    try {
      if (user?.email) {
        const stored = localStorage.getItem(`fm_addresses_${user.email.toLowerCase()}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // When user logs in or switches, refresh address list
  useEffect(() => {
    if (user?.email) {
      try {
        const stored = localStorage.getItem(`fm_addresses_${user.email.toLowerCase()}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setAddresses(parsed);
        }
      } catch {}
    } else {
      setAddresses([]);
    }
  }, [user]);

  // Sync addresses to localStorage
  useEffect(() => {
    if (user?.email && addresses.length > 0) {
      try {
        localStorage.setItem(`fm_addresses_${user.email.toLowerCase()}`, JSON.stringify(addresses));
      } catch {}
    }
  }, [addresses, user]);

  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    return addresses.length > 0 ? addresses[0].id : null;
  });

  const [isAddingAddress, setIsAddingAddress] = useState(() => addresses.length === 0);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const [addrForm, setAddrForm] = useState({
    fullName: user?.name || '',
    phone: user?.mobile || '',
    houseNo: '',
    street: '',
    city: '',
    district: '',
    state: 'Tamil Nadu',
    pincode: '',
    type: 'Home'
  });

  // Keep form in sync if user logs in
  useEffect(() => {
    if (user) {
      setAddrForm(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.mobile || ''
      }));
    }
  }, [user]);

  const [pincodeDetectionMsg, setPincodeDetectionMsg] = useState(null);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);

  const [deliveryOption, setDeliveryOption] = useState('Standard');
  const [notificationPreference, setNotificationPreference] = useState(() => {
    return localStorage.getItem('fm_notif_pref') || 'whatsapp';
  });

  const [customerWhatsAppMobile, setCustomerWhatsAppMobile] = useState(() => user?.mobile || localStorage.getItem('customer_whatsapp_number') || '7418186734');
  const [customerEmailInput, setCustomerEmailInput] = useState(() => user?.email || localStorage.getItem('customer_email') || 'valar01072007@gmail.com');

  useEffect(() => {
    if (user?.mobile) setCustomerWhatsAppMobile(user.mobile);
    if (user?.email) setCustomerEmailInput(user.email);
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState(() => (user?.mobile ? `${user.mobile}@ybl` : ''));
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiVerified, setUpiVerified] = useState(Boolean(user?.mobile));
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  // Card details
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    nameOnCard: user?.name || '',
    expiry: '',
    cvv: ''
  });

  // Net banking bank
  const [selectedBank, setSelectedBank] = useState('sbi');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMsg, setCouponMsg] = useState('');

  const [formError, setFormError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getSubtotal();
  const baseDiscount = getDiscountAmount();
  const extraDiscount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const discount = baseDiscount + extraDiscount;
  const deliveryCharge = deliveryOption === 'Express' ? 99 : 0;
  const totalAmount = Math.max(0, subtotal - discount + deliveryCharge);

  // Auto-detection for Pincodes across India with Tamil Nadu priority
  const handlePincodeChange = async (e) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 6);
    const updated = { ...addrForm, pincode: rawVal };

    if (rawVal.length === 6) {
      setIsPincodeLoading(true);
      const localDetected = detectTamilNaduPincode(rawVal);
      if (localDetected) {
        updated.state = localDetected.state || 'Tamil Nadu';
        if (localDetected.district) updated.district = localDetected.district;
        if (localDetected.city) updated.city = localDetected.city;
        setPincodeDetectionMsg({
          type: 'success',
          text: `Auto-Detected: ${localDetected.city}, ${localDetected.district} (${localDetected.state})`
        });
        setIsPincodeLoading(false);
      } else {
        try {
          const apiMatch = await lookupPincode(rawVal);
          if (apiMatch) {
            updated.state = apiMatch.state || 'Tamil Nadu';
            if (apiMatch.district) updated.district = apiMatch.district;
            if (apiMatch.city) updated.city = apiMatch.city;
            setPincodeDetectionMsg({
              type: 'success',
              text: `Auto-Detected: ${apiMatch.city}, ${apiMatch.district} (${apiMatch.state})`
            });
          } else {
            setPincodeDetectionMsg({
              type: 'info',
              text: 'Valid 6-digit Pincode. Please verify City and State below.'
            });
          }
        } catch {
          setPincodeDetectionMsg(null);
        } finally {
          setIsPincodeLoading(false);
        }
      }
    } else {
      setPincodeDetectionMsg(null);
      setIsPincodeLoading(false);
    }

    setAddrForm(updated);
    setFormError('');
  };

  const handleInputChange = (e) => {
    setAddrForm({ ...addrForm, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleVerifyUpi = () => {
    if (!upiId.trim() || !upiId.includes('@')) {
      setFormError('Please enter a valid UPI ID (e.g. username@ybl or mobile@oksbi)');
      return;
    }
    setIsVerifyingUpi(true);
    setFormError('');
    setTimeout(() => {
      setIsVerifyingUpi(false);
      setUpiVerified(true);
    }, 400);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const cleanCode = couponCode.trim().toUpperCase();
    if (['FUTURE10', 'MEMORABLE', 'SAVE10', 'DIWALI', 'GIFT', 'WELCOME10'].includes(cleanCode)) {
      setCouponApplied(true);
      setCouponMsg(`Coupon ${cleanCode} applied! 10% Extra Discount unlocked.`);
    } else {
      setCouponApplied(false);
      setCouponMsg(`Code "${cleanCode}" is invalid. Try "FUTURE10" for 10% off.`);
    }
  };

  const saveAddress = () => {
    if (!addrForm.fullName.trim() || !addrForm.phone.trim() || !addrForm.houseNo.trim() || 
        !addrForm.street.trim() || !addrForm.city.trim() || !addrForm.state.trim() || !addrForm.pincode.trim()) {
      setFormError('Please fill in all required address fields.');
      return;
    }
    
    if (addrForm.phone.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (editingAddressId) {
      setAddresses(prev => prev.map(a => a.id === editingAddressId ? { ...addrForm, id: editingAddressId } : a));
      setSelectedAddressId(editingAddressId);
    } else {
      const newAddr = { ...addrForm, id: `addr-${Date.now()}` };
      setAddresses(prev => [...prev, newAddr]);
      setSelectedAddressId(newAddr.id);
    }
    
    setIsAddingAddress(false);
    setEditingAddressId(null);
    setPincodeDetectionMsg(null);
    setAddrForm({
      fullName: user?.name || '',
      phone: user?.mobile || '',
      houseNo: '',
      street: '',
      city: '',
      district: '',
      state: 'Tamil Nadu',
      pincode: '',
      type: 'Home'
    });
  };

  const editAddress = (addr) => {
    setAddrForm(addr);
    setEditingAddressId(addr.id);
    setIsAddingAddress(true);
    setPincodeDetectionMsg(null);
  };

  const deleteAddress = (id) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    if (selectedAddressId === id) {
      const remaining = addresses.filter(a => a.id !== id);
      setSelectedAddressId(remaining.length > 0 ? remaining[0].id : null);
      if (remaining.length === 0) setIsAddingAddress(true);
    }
  };

  const selectedAddr = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  const handleProceedToStep2 = () => {
    if (isAddingAddress) {
      saveAddress();
      return;
    }
    if (!selectedAddressId && addresses.length === 0) {
      setFormError('Please add a delivery address to proceed.');
      return;
    }
    setFormError('');
    setActiveStep(2);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleProceedToStep3 = () => {
    if (notificationPreference === 'whatsapp' && customerWhatsAppMobile.replace(/\D/g, '').length < 10) {
      setFormError('Please provide a valid 10-digit WhatsApp phone number.');
      return;
    }
    if (notificationPreference === 'email' && (!customerEmailInput.trim() || !customerEmailInput.includes('@'))) {
      setFormError('Please provide a valid recipient email address.');
      return;
    }
    setFormError('');
    setActiveStep(3);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId && addresses.length === 0) {
      setFormError('Please provide a delivery address to proceed.');
      setActiveStep(1);
      return;
    }

    if (paymentMethod === 'UPI' && !upiId.trim()) {
      setFormError('Please enter a valid UPI ID (e.g. username@upi) or select Google Pay/PhonePe.');
      setActiveStep(3);
      return;
    }

    setIsProcessing(true);
    setFormError('');

    try {
      const activeAddr = selectedAddr || addresses[0];
      const customerEmail = (customerEmailInput || '').trim() || user?.email || activeAddr?.email || localStorage.getItem('customer_email') || 'valar01072007@gmail.com';
      const customerMobile = (customerWhatsAppMobile || activeAddr?.phone || activeAddr?.mobile || user?.mobile || localStorage.getItem('customer_whatsapp_number') || '7418186734').replace(/\D/g, '');

      try {
        if (customerEmail) localStorage.setItem('customer_email', customerEmail);
        if (customerMobile) localStorage.setItem('customer_whatsapp_number', customerMobile);
      } catch {}

      const orderData = {
        items: [...cartItems],
        subtotal,
        discount,
        deliveryCharge,
        totalAmount,
        deliveryOption,
        deliveryAddress: activeAddr,
        shippingAddress: {
          fullName: activeAddr.fullName || user?.name || 'Customer',
          mobile: customerMobile,
          phone: customerMobile,
          email: customerEmail,
          addressLine: `${activeAddr.houseNo || ''}, ${activeAddr.street || ''}`,
          city: activeAddr.city || '',
          state: activeAddr.state || 'Tamil Nadu',
          pincode: activeAddr.pincode || '',
          district: activeAddr.district || ''
        },
        email: customerEmail,
        mobile: customerMobile,
        customerName: activeAddr.fullName || user?.name || 'Customer',
        paymentMethod: paymentMethod === 'COD' 
          ? 'Cash on Delivery' 
          : (paymentMethod === 'UPI' ? `UPI (${upiId || 'Instant'})` : paymentMethod),
        upiId: paymentMethod === 'UPI' ? upiId : null,
        notificationPreference,
        orderStatus: 'Confirmed'
      };

      const createdOrder = placeOrder(orderData);
      clearCart();

      // Always trigger real email dispatch to customer if email exists
      if (customerEmail) {
        fetch('http://localhost:5000/api/orders/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...orderData,
            orderId: createdOrder.orderId,
            email: customerEmail
          })
        }).catch(() => {});
      }

      navigate('/order-confirmation', { 
        state: { 
          order: createdOrder,
          justPlaced: true 
        } 
      });
    } catch (err) {
      console.error('Order placement failed:', err);
      setFormError('Unable to place order right now. Please try again.');
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="fm-checkout-page">
        <div className="fm-checkout-empty-state">
          <div className="empty-cart-icon">
            <Lock size={48} color="#6366f1" />
          </div>
          <h2>Your Cart is Empty</h2>
          <p>Add products to your cart before proceeding to checkout.</p>
          <Link to="/shop">
            <Button variant="primary">Explore Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fm-checkout-page">
      
      {/* Sleek Horizontal Stepper Header */}
      <div className="fm-checkout-top-banner">
        <div className="fm-checkout-top-inner">
          <div className="fm-checkout-brand-box">
            <span className="fm-checkout-brand-tag">FUTUREMEMORY</span>
            <h1 className="fm-checkout-headline">Secure Checkout</h1>
            <span className="fm-checkout-ssl-pill">
              <ShieldCheck size={14} style={{ marginRight: '4px', verticalAlign: '-2px' }} />
              256-Bit SSL Encrypted
            </span>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="fm-checkout-stepper-wrap">
            <div 
              className={`fm-checkout-stepper-step ${activeStep === 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`}
              onClick={() => setActiveStep(1)}
            >
              <div className="step-badge">{activeStep > 1 ? <Check size={15} /> : '1'}</div>
              <div className="step-text">
                <span className="step-title">Address</span>
                <span className="step-sub">Delivery Location</span>
              </div>
            </div>

            <div className={`fm-checkout-stepper-line ${activeStep > 1 ? 'filled' : ''}`} />

            <div 
              className={`fm-checkout-stepper-step ${activeStep === 2 ? 'active' : ''} ${activeStep > 2 ? 'completed' : ''}`}
              onClick={() => setActiveStep(2)}
            >
              <div className="step-badge">{activeStep > 2 ? <Check size={15} /> : '2'}</div>
              <div className="step-text">
                <span className="step-title">Delivery & Alerts</span>
                <span className="step-sub">Speed & Channels</span>
              </div>
            </div>

            <div className={`fm-checkout-stepper-line ${activeStep > 2 ? 'filled' : ''}`} />

            <div 
              className={`fm-checkout-stepper-step ${activeStep === 3 ? 'active' : ''}`}
              onClick={() => setActiveStep(3)}
            >
              <div className="step-badge">3</div>
              <div className="step-text">
                <span className="step-title">Payment</span>
                <span className="step-sub">UPI, COD, Cards</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Full-Screen Horizontal 2-Column Layout */}
      <div className="fm-checkout-container">
        <div className="fm-checkout-layout">
          
          {/* Left Column: Interactive Stepped Accordion */}
          <div className="fm-checkout-main-col">

            {formError && (
              <div className="fm-checkout-error-banner">
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            {/* STEP 1: DELIVERY ADDRESS */}
            <div className={`fm-checkout-step-card ${activeStep === 1 ? 'step-expanded' : 'step-collapsed'}`}>
              <div 
                className="step-card-header clickable-header"
                onClick={() => setActiveStep(1)}
              >
                <div className="step-title-group">
                  <div className={`step-card-num ${activeStep > 1 ? 'step-num-done' : ''}`}>
                    {activeStep > 1 ? <Check size={16} /> : '1'}
                  </div>
                  <div>
                    <h3 className="step-heading">Delivery Address</h3>
                    <p className="step-desc">Where should we deliver your order?</p>
                  </div>
                </div>

                {activeStep !== 1 && selectedAddr && (
                  <button 
                    type="button" 
                    className="fm-step-edit-btn"
                    onClick={(e) => { e.stopPropagation(); setActiveStep(1); }}
                  >
                    Change Address
                  </button>
                )}

                {activeStep === 1 && !isAddingAddress && (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddingAddress(true);
                      setEditingAddressId(null);
                      setPincodeDetectionMsg(null);
                      setAddrForm({
                        fullName: user?.name || '',
                        phone: user?.mobile || '',
                        houseNo: '',
                        street: '',
                        city: '',
                        district: '',
                        state: 'Tamil Nadu',
                        pincode: '',
                        type: 'Home'
                      });
                    }}
                  >
                    + Add New Address
                  </Button>
                )}
              </div>

              {/* Collapsed Step 1 Summary */}
              {activeStep !== 1 && selectedAddr && (
                <div className="fm-step-summary-view" onClick={() => setActiveStep(1)}>
                  <div className="summary-pin-icon">
                    <MapPin size={20} color="#4338ca" />
                  </div>
                  <div className="summary-text-block">
                    <div className="summary-name-row">
                      <strong>{selectedAddr.fullName}</strong>
                      <span className="summary-type-chip">{selectedAddr.type || 'Home'}</span>
                      <span className="summary-phone">+91 {selectedAddr.phone}</span>
                    </div>
                    <p className="summary-address-line">
                      {selectedAddr.houseNo}, {selectedAddr.street}, {selectedAddr.city}{selectedAddr.district && selectedAddr.district !== selectedAddr.city ? `, ${selectedAddr.district}` : ''}, {selectedAddr.state} - <strong>{selectedAddr.pincode}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Expanded Step 1 Content */}
              {activeStep === 1 && (
                <div className="step-body-content">
                  {isAddingAddress ? (
                    <div className="fm-address-form-box">
                      <div className="fm-form-header-row">
                        <h4>{editingAddressId ? 'Edit Delivery Address' : 'Enter Delivery Address'}</h4>
                        {addresses.length > 0 && (
                          <button 
                            type="button" 
                            className="fm-form-cancel-link"
                            onClick={() => { setIsAddingAddress(false); setEditingAddressId(null); }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      <div className="fm-checkout-form-grid">
                        <div className="fm-form-group">
                          <label className="fm-form-label">Full Name *</label>
                          <input 
                            type="text" 
                            name="fullName" 
                            placeholder="Enter full name"
                            value={addrForm.fullName} 
                            onChange={handleInputChange} 
                            className="fm-checkout-premium-input" 
                          />
                        </div>

                        <div className="fm-form-group">
                          <label className="fm-form-label">10-Digit Mobile Number *</label>
                          <input 
                            type="tel" 
                            name="phone" 
                            placeholder="Enter 10-digit mobile number"
                            maxLength="10"
                            value={addrForm.phone} 
                            onChange={handleInputChange} 
                            className="fm-checkout-premium-input" 
                          />
                        </div>

                        <div className="fm-form-group">
                          <label className="fm-form-label">Address Type</label>
                          <select 
                            name="type" 
                            value={addrForm.type} 
                            onChange={handleInputChange} 
                            className="fm-checkout-premium-input fm-select-input"
                          >
                            <option value="Home">Home (All-day delivery)</option>
                            <option value="Office">Office / Workplace</option>
                            <option value="College">College / Campus</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div className="fm-form-group">
                          <label className="fm-form-label">Flat / House / Door No. *</label>
                          <input 
                            type="text" 
                            name="houseNo" 
                            placeholder="e.g. 151/C"
                            value={addrForm.houseNo} 
                            onChange={handleInputChange} 
                            className="fm-checkout-premium-input" 
                          />
                        </div>

                        <div className="fm-form-group full-span">
                          <label className="fm-form-label">Street / Area / Colony *</label>
                          <input 
                            type="text" 
                            name="street" 
                            placeholder="e.g. Mount Road, Gandhi Nagar"
                            value={addrForm.street} 
                            onChange={handleInputChange} 
                            className="fm-checkout-premium-input" 
                          />
                        </div>

                        {/* PINCODE AUTO-DETECTION ENGINE */}
                        <div className="fm-form-group">
                          <div className="fm-label-row">
                            <label className="fm-form-label">Pincode (Auto-Detect) *</label>
                            <span className="fm-auto-pill">Auto City / State</span>
                          </div>
                          <input 
                            type="text" 
                            name="pincode" 
                            placeholder="6-digit pincode"
                            maxLength="6"
                            value={addrForm.pincode} 
                            onChange={handlePincodeChange} 
                            className="fm-checkout-premium-input" 
                          />
                          {isPincodeLoading && (
                            <div className="pincode-detect-banner loading">
                              <span>Detecting City & State...</span>
                            </div>
                          )}
                          {pincodeDetectionMsg && !isPincodeLoading && (
                            <div className="pincode-detect-banner success">
                              <MapPin size={14} />
                              <strong>{pincodeDetectionMsg.text}</strong>
                            </div>
                          )}
                        </div>

                        <div className="fm-form-group">
                          <label className="fm-form-label">City / Town *</label>
                          <input 
                            type="text" 
                            name="city" 
                            placeholder="City"
                            value={addrForm.city} 
                            onChange={handleInputChange} 
                            className="fm-checkout-premium-input" 
                          />
                        </div>

                        <div className="fm-form-group">
                          <label className="fm-form-label">District *</label>
                          <input 
                            type="text" 
                            name="district" 
                            placeholder="District"
                            value={addrForm.district} 
                            onChange={handleInputChange} 
                            className="fm-checkout-premium-input" 
                          />
                        </div>

                        <div className="fm-form-group">
                          <label className="fm-form-label">State *</label>
                          <input 
                            type="text" 
                            name="state" 
                            placeholder="State"
                            value={addrForm.state} 
                            onChange={handleInputChange} 
                            className="fm-checkout-premium-input" 
                          />
                        </div>
                      </div>

                      <div className="fm-form-btn-row">
                        <Button variant="primary" onClick={saveAddress}>
                          {editingAddressId ? 'Update Address' : 'Save Address'}
                        </Button>
                        {addresses.length > 0 && (
                          <Button variant="secondary" onClick={() => { setIsAddingAddress(false); setEditingAddressId(null); }}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Saved Addresses List */
                    <div className="fm-saved-address-list">
                      {addresses.map(addr => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div 
                            key={addr.id} 
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`fm-address-card ${isSelected ? 'selected' : ''}`}
                          >
                            <div className="address-card-left">
                              <input 
                                type="radio" 
                                name="addressSelection" 
                                checked={isSelected} 
                                onChange={() => setSelectedAddressId(addr.id)}
                                className="address-radio"
                              />
                              <div className="address-card-details">
                                <div className="address-name-line">
                                  <span className="address-type-badge">{addr.type || 'Home'}</span>
                                  <strong className="address-fullname">{addr.fullName}</strong>
                                  <span className="address-mobile">• +91 {addr.phone}</span>
                                </div>
                                <p className="address-street-line">
                                  {addr.houseNo}, {addr.street}<br/>
                                  {addr.city}{addr.district && addr.district !== addr.city ? `, ${addr.district}` : ''}, {addr.state} - <strong>{addr.pincode}</strong>
                                </p>
                              </div>
                            </div>

                            <div className="address-card-actions" onClick={e => e.stopPropagation()}>
                              <button 
                                type="button" 
                                onClick={() => editAddress(addr)}
                                className="btn-edit-address"
                              >
                                Edit
                              </button>
                              {addresses.length > 1 && (
                                <button 
                                  type="button" 
                                  onClick={() => deleteAddress(addr.id)}
                                  className="btn-delete-address"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Step 1 Continue Button */}
                      <div className="step-continue-bar">
                        <Button 
                          variant="primary" 
                          size="lg"
                          onClick={handleProceedToStep2}
                          style={{ minWidth: '280px', height: '52px', fontSize: '1rem', fontWeight: 800 }}
                        >
                          Deliver to this Address & Continue
                          <ChevronRight size={18} style={{ marginLeft: '6px', verticalAlign: '-3px' }} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP 2: SHIPPING SPEED & LIVE NOTIFICATIONS */}
            <div className={`fm-checkout-step-card ${activeStep === 2 ? 'step-expanded' : 'step-collapsed'}`}>
              <div 
                className="step-card-header clickable-header"
                onClick={() => setActiveStep(2)}
              >
                <div className="step-title-group">
                  <div className={`step-card-num ${activeStep > 2 ? 'step-num-done' : ''}`}>
                    {activeStep > 2 ? <Check size={16} /> : '2'}
                  </div>
                  <div>
                    <h3 className="step-heading">Shipping Speed & Notification Channel</h3>
                    <p className="step-desc">Choose delivery timeframe and live order tracking channel</p>
                  </div>
                </div>

                {activeStep !== 2 && (
                  <button 
                    type="button" 
                    className="fm-step-edit-btn"
                    onClick={(e) => { e.stopPropagation(); setActiveStep(2); }}
                  >
                    Change Shipping
                  </button>
                )}
              </div>

              {/* Collapsed Step 2 Summary */}
              {activeStep !== 2 && (
                <div className="fm-step-summary-view" onClick={() => setActiveStep(2)}>
                  <div className="summary-pin-icon">
                    <Truck size={20} color="#4338ca" />
                  </div>
                  <div className="summary-text-block">
                    <div className="summary-name-row">
                      <strong>{deliveryOption} Delivery ({deliveryOption === 'Express' ? '₹99' : 'FREE'})</strong>
                      <span className="summary-type-chip">
                        {notificationPreference === 'whatsapp' ? 'WhatsApp Tracking' : 'Email Tracking'}
                      </span>
                    </div>
                    <p className="summary-address-line">
                      {notificationPreference === 'whatsapp' 
                        ? `Official order invoice and transit milestones dispatched to WhatsApp (+91 ${customerWhatsAppMobile || 'Mobile'}).`
                        : `Official tax invoice and tracking details dispatched to ${customerEmailInput || 'Email'}.`}
                    </p>
                  </div>
                </div>
              )}

              {/* Expanded Step 2 Content */}
              {activeStep === 2 && (
                <div className="step-body-content">
                  
                  {/* Delivery Options */}
                  <div className="shipping-option-block">
                    <label className="section-sub-label">Choose Delivery Speed</label>
                    <div className="shipping-speed-grid">
                      <div 
                        onClick={() => setDeliveryOption('Standard')}
                        className={`shipping-speed-card ${deliveryOption === 'Standard' ? 'selected' : ''}`}
                      >
                        <div className="speed-card-top">
                          <div className="speed-card-title">
                            <input 
                              type="radio" 
                              checked={deliveryOption === 'Standard'} 
                              onChange={() => setDeliveryOption('Standard')} 
                              style={{ accentColor: '#4338ca' }}
                            />
                            <strong>Standard Delivery</strong>
                          </div>
                          <span className="speed-price-free">FREE</span>
                        </div>
                        <p className="speed-subtext">Estimated delivery: 4-6 business days</p>
                      </div>
                      
                      <div 
                        onClick={() => setDeliveryOption('Express')}
                        className={`shipping-speed-card ${deliveryOption === 'Express' ? 'selected' : ''}`}
                      >
                        <div className="speed-card-top">
                          <div className="speed-card-title">
                            <input 
                              type="radio" 
                              checked={deliveryOption === 'Express'} 
                              onChange={() => setDeliveryOption('Express')} 
                              style={{ accentColor: '#4338ca' }}
                            />
                            <strong>Express Delivery</strong>
                          </div>
                          <span className="speed-price-paid">₹99</span>
                        </div>
                        <p className="speed-subtext">Estimated delivery: 2-3 business days (Priority Cargo)</p>
                      </div>
                    </div>
                  </div>

                  {/* Notification Channels */}
                  <div className="notification-channel-block">
                    <label className="section-sub-label">Order Notifications Channel</label>
                    <div className="notif-channels-grid">
                      
                      <div 
                        onClick={() => {
                          setNotificationPreference('whatsapp');
                          try { localStorage.setItem('fm_notif_pref', 'whatsapp'); } catch {}
                        }}
                        className={`notif-choice-card whatsapp ${notificationPreference === 'whatsapp' ? 'selected' : ''}`}
                      >
                        <div className="notif-card-header">
                          <div className="notif-card-badge">
                            <MessageSquare size={22} color="#15803d" />
                          </div>
                          <div>
                            <strong className="notif-card-title">WhatsApp Alerts</strong>
                            <span className="notif-instant-pill">Instant & Real-Time</span>
                          </div>
                        </div>
                        <p className="notif-card-desc">
                          Instant tax invoice, PDF receipt, and live courier tracking link sent directly to your phone.
                        </p>
                      </div>

                      <div 
                        onClick={() => {
                          setNotificationPreference('email');
                          try { localStorage.setItem('fm_notif_pref', 'email'); } catch {}
                        }}
                        className={`notif-choice-card email ${notificationPreference === 'email' ? 'selected' : ''}`}
                      >
                        <div className="notif-card-header">
                          <div className="notif-card-badge">
                            <Mail size={22} color="#1d4ed8" />
                          </div>
                          <div>
                            <strong className="notif-card-title">Email Notifications</strong>
                            <span className="notif-instant-pill email">Official PDF</span>
                          </div>
                        </div>
                        <p className="notif-card-desc">
                          Detailed GST order invoice, warranty info, and tracking coordinates delivered to your inbox.
                        </p>
                      </div>
                    </div>

                    {notificationPreference === 'whatsapp' && (
                      <div className="notif-live-input-box whatsapp">
                        <div className="notif-input-header">
                          <label>WhatsApp Mobile Number for Live Tracking *:</label>
                          <span className="notif-live-badge">Verified Gateway</span>
                        </div>
                        <div className="notif-input-row">
                          <span className="country-prefix">+91</span>
                          <input 
                            type="tel"
                            maxLength="10"
                            value={customerWhatsAppMobile}
                            onChange={(e) => setCustomerWhatsAppMobile(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 10-digit mobile number"
                            className="fm-checkout-premium-input"
                            style={{ flex: 1 }}
                          />
                        </div>

                        <div className="notif-input-header" style={{ marginTop: '16px' }}>
                          <label>Recipient Email Address (For Official Tax Invoice):</label>
                          <span className="notif-live-badge email">Instant PDF</span>
                        </div>
                        <div className="notif-input-row">
                          <input 
                            type="email"
                            value={customerEmailInput}
                            onChange={(e) => setCustomerEmailInput(e.target.value)}
                            placeholder="Enter your email address"
                            className="fm-checkout-premium-input"
                            style={{ flex: 1 }}
                          />
                        </div>

                        <p className="notif-hint-text">
                          Official order receipt & transit milestones will be sent to WhatsApp (+91 {customerWhatsAppMobile || '...'}), and your tax invoice PDF will be delivered to {customerEmailInput || 'your inbox'}.
                        </p>
                      </div>
                    )}

                    {notificationPreference === 'email' && (
                      <div className="notif-live-input-box email">
                        <div className="notif-input-header">
                          <label>Recipient Email Address *:</label>
                          <span className="notif-live-badge email">Direct Invoice</span>
                        </div>
                        <div className="notif-input-row">
                          <input 
                            type="email"
                            value={customerEmailInput}
                            onChange={(e) => setCustomerEmailInput(e.target.value)}
                            placeholder="Enter your email address"
                            className="fm-checkout-premium-input"
                            style={{ flex: 1 }}
                          />
                        </div>

                        <div className="notif-input-header" style={{ marginTop: '16px' }}>
                          <label>WhatsApp Mobile Number for Delivery SMS & Milestones:</label>
                          <span className="notif-live-badge">Live Updates</span>
                        </div>
                        <div className="notif-input-row">
                          <span className="country-prefix">+91</span>
                          <input 
                            type="tel"
                            maxLength="10"
                            value={customerWhatsAppMobile}
                            onChange={(e) => setCustomerWhatsAppMobile(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 10-digit mobile number"
                            className="fm-checkout-premium-input"
                            style={{ flex: 1 }}
                          />
                        </div>

                        <p className="notif-hint-text">
                          Real-time GST tax invoice, warranty card, and 7-days doorstep return authorization will be delivered to {customerEmailInput || 'your email'}.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Step 2 Buttons */}
                  <div className="step-continue-bar dual-buttons">
                    <Button 
                      variant="secondary"
                      onClick={() => setActiveStep(1)}
                      style={{ height: '52px' }}
                    >
                      <ArrowLeft size={16} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
                      Back to Address
                    </Button>
                    <Button 
                      variant="primary" 
                      size="lg"
                      onClick={handleProceedToStep3}
                      style={{ minWidth: '260px', height: '52px', fontSize: '1rem', fontWeight: 800 }}
                    >
                      Continue to Payment Method
                      <ChevronRight size={18} style={{ marginLeft: '6px', verticalAlign: '-3px' }} />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3: PAYMENT METHOD */}
            <div className={`fm-checkout-step-card ${activeStep === 3 ? 'step-expanded' : 'step-collapsed'}`}>
              <div 
                className="step-card-header clickable-header"
                onClick={() => setActiveStep(3)}
              >
                <div className="step-title-group">
                  <div className="step-card-num">3</div>
                  <div>
                    <h3 className="step-heading">Payment Method</h3>
                    <p className="step-desc">Select UPI, Cash on Delivery, or Cards</p>
                  </div>
                </div>
              </div>

              {/* Expanded Step 3 Content */}
              {activeStep === 3 && (
                <div className="step-body-content">
                  <div className="payment-options-stack">
                    
                    {/* Option 1: UPI */}
                    <div 
                      className={`payment-option-card ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('UPI')}
                    >
                      <div className="payment-option-header">
                        <div className="payment-title-row">
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={paymentMethod === 'UPI'} 
                            onChange={() => setPaymentMethod('UPI')}
                            style={{ accentColor: '#4338ca' }}
                          />
                          <div>
                            <strong className="payment-method-name">
                              UPI / Google Pay / PhonePe / Paytm
                              <span className="payment-fast-tag">Instant Checkout</span>
                            </strong>
                            <p className="payment-method-desc">
                              Pay directly with any UPI application or verified Virtual Payment Address
                            </p>
                          </div>
                        </div>
                        <div className="payment-icons-group">
                          <Smartphone size={20} color="#4338ca" />
                        </div>
                      </div>

                      {paymentMethod === 'UPI' && (
                        <div className="upi-details-container" onClick={e => e.stopPropagation()}>
                          <label className="fm-form-label">Enter UPI ID / VPA</label>
                          <div className="upi-input-group">
                            <input 
                              type="text" 
                              placeholder="Enter your UPI ID (e.g. name@okhdfcbank)"
                              value={upiId} 
                              onChange={(e) => {
                                setUpiId(e.target.value);
                                setUpiVerified(false);
                              }}
                              className="fm-checkout-premium-input"
                              style={{ flex: 1 }}
                            />
                            <button 
                              type="button"
                              onClick={handleVerifyUpi}
                              disabled={isVerifyingUpi}
                              className="btn-verify-upi"
                            >
                              {isVerifyingUpi ? 'Verifying...' : (upiVerified ? 'Verified' : 'Verify')}
                            </button>
                          </div>

                          {upiVerified && (
                            <div className="upi-verified-badge">
                              <Check size={14} />
                              <span>Verified UPI ID • Ready for Instant Checkout</span>
                            </div>
                          )}

                          {/* Quick Handle Pills */}
                          <div className="upi-handle-pills">
                            {['@ybl', '@okhdfcbank', '@okaxis', '@paytm', '@oksbi'].map(handle => (
                              <button
                                key={handle}
                                type="button"
                                onClick={() => {
                                  const prefix = upiId.includes('@') ? upiId.split('@')[0] : (upiId || (user?.mobile || ''));
                                  setUpiId(`${prefix}${handle}`);
                                  setUpiVerified(true);
                                }}
                                className="upi-handle-pill"
                              >
                                {handle}
                              </button>
                            ))}
                          </div>

                          {/* 1-Click Apps */}
                          <div className="upi-apps-row">
                            {[
                              { id: 'gpay', label: 'Google Pay' },
                              { id: 'phonepe', label: 'PhonePe' },
                              { id: 'paytm', label: 'Paytm UPI' }
                            ].map(app => (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() => {
                                  setSelectedUpiApp(app.id);
                                  setUpiVerified(true);
                                }}
                                className={`upi-app-btn ${selectedUpiApp === app.id ? 'active' : ''}`}
                              >
                                <span>{app.label}</span>
                              </button>
                            ))}
                          </div>

                          {/* QR Code Toggle */}
                          <div className="qr-toggle-row">
                            <button
                              type="button"
                              onClick={() => setShowQrCode(!showQrCode)}
                              className="qr-toggle-btn"
                            >
                              <QrCode size={16} style={{ marginRight: '6px', verticalAlign: '-3px' }} />
                              {showQrCode ? 'Hide QR Code' : 'Show Dynamic QR Code to Scan & Pay'}
                            </button>
                            {showQrCode && (
                              <div className="qr-box-container">
                                <div className="qr-code-placeholder">
                                  <div className="qr-matrix-sim">
                                    <div className="qr-corner top-left" />
                                    <div className="qr-corner top-right" />
                                    <div className="qr-corner bottom-left" />
                                    <div className="qr-center-text">₹{totalAmount}</div>
                                  </div>
                                </div>
                                <span className="qr-instruction">
                                  Scan using Google Pay, PhonePe, Paytm, or CRED to pay <strong>{formatPrice(totalAmount)}</strong>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Option 2: Cash on Delivery (COD) */}
                    <div 
                      className={`payment-option-card ${paymentMethod === 'COD' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('COD')}
                    >
                      <div className="payment-option-header">
                        <div className="payment-title-row">
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={paymentMethod === 'COD'} 
                            onChange={() => setPaymentMethod('COD')}
                            style={{ accentColor: '#4338ca' }}
                          />
                          <div>
                            <strong className="payment-method-name">
                              Cash on Delivery (COD)
                              <span className="payment-cod-tag">Pay on Delivery</span>
                            </strong>
                            <p className="payment-method-desc">
                              Pay in cash or courier UPI QR code when your parcel arrives at your doorstep.
                            </p>
                          </div>
                        </div>
                        <div className="payment-icons-group">
                          <Truck size={20} color="#0369a1" />
                        </div>
                      </div>

                      {paymentMethod === 'COD' && (
                        <div className="cod-details-container" onClick={e => e.stopPropagation()}>
                          <div className="cod-info-alert">
                            <ShieldCheck size={22} color="#0369a1" style={{ flexShrink: 0 }} />
                            <div>
                              <strong>No Advance Payment Required:</strong>
                              <p>
                                You only pay <strong>{formatPrice(totalAmount)}</strong> to the delivery agent upon receiving your order.
                                A formal order confirmation with live tracking will be immediately generated.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Option 3: Credit / Debit Cards */}
                    <div 
                      className={`payment-option-card ${paymentMethod === 'Card' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('Card')}
                    >
                      <div className="payment-option-header">
                        <div className="payment-title-row">
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={paymentMethod === 'Card'} 
                            onChange={() => setPaymentMethod('Card')}
                            style={{ accentColor: '#4338ca' }}
                          />
                          <div>
                            <strong className="payment-method-name">
                              Credit / Debit Card
                            </strong>
                            <p className="payment-method-desc">
                              Visa, MasterCard, RuPay, Maestro & American Express
                            </p>
                          </div>
                        </div>
                        <div className="payment-icons-group">
                          <CreditCard size={20} color="#475569" />
                        </div>
                      </div>

                      {paymentMethod === 'Card' && (
                        <div className="card-details-container" onClick={e => e.stopPropagation()}>
                          <div className="fm-checkout-form-grid">
                            <div className="fm-form-group full-span">
                              <label className="fm-form-label">Card Number</label>
                              <input 
                                type="text" 
                                placeholder="16-digit card number"
                                value={cardDetails.cardNumber}
                                onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                                className="fm-checkout-premium-input"
                              />
                            </div>
                            <div className="fm-form-group full-span">
                              <label className="fm-form-label">Name on Card</label>
                              <input 
                                type="text" 
                                placeholder="Cardholder name"
                                value={cardDetails.nameOnCard}
                                onChange={(e) => setCardDetails({ ...cardDetails, nameOnCard: e.target.value })}
                                className="fm-checkout-premium-input"
                              />
                            </div>
                            <div className="fm-form-group">
                              <label className="fm-form-label">Expiry (MM/YY)</label>
                              <input 
                                type="text" 
                                placeholder="MM/YY"
                                value={cardDetails.expiry}
                                onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                className="fm-checkout-premium-input"
                              />
                            </div>
                            <div className="fm-form-group">
                              <label className="fm-form-label">CVV</label>
                              <input 
                                type="password" 
                                maxLength="4"
                                placeholder="CVV"
                                value={cardDetails.cvv}
                                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                className="fm-checkout-premium-input"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Option 4: Net Banking */}
                    <div 
                      className={`payment-option-card ${paymentMethod === 'NetBanking' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('NetBanking')}
                    >
                      <div className="payment-option-header">
                        <div className="payment-title-row">
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={paymentMethod === 'NetBanking'} 
                            onChange={() => setPaymentMethod('NetBanking')}
                            style={{ accentColor: '#4338ca' }}
                          />
                          <div>
                            <strong className="payment-method-name">
                              Net Banking
                            </strong>
                            <p className="payment-method-desc">
                              All Major Indian Banks (SBI, HDFC, ICICI, Axis, Kotak, PNB)
                            </p>
                          </div>
                        </div>
                        <div className="payment-icons-group">
                          <Building2 size={20} color="#475569" />
                        </div>
                      </div>

                      {paymentMethod === 'NetBanking' && (
                        <div className="netbanking-container" onClick={e => e.stopPropagation()}>
                          <div className="bank-selection-grid">
                            {[
                              { id: 'sbi', name: 'State Bank of India' },
                              { id: 'hdfc', name: 'HDFC Bank' },
                              { id: 'icici', name: 'ICICI Bank' },
                              { id: 'axis', name: 'Axis Bank' },
                              { id: 'kotak', name: 'Kotak Mahindra' },
                              { id: 'pnb', name: 'Punjab National' }
                            ].map(bank => (
                              <button
                                key={bank.id}
                                type="button"
                                onClick={() => setSelectedBank(bank.id)}
                                className={`bank-pill ${selectedBank === bank.id ? 'active' : ''}`}
                              >
                                {bank.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Step 3 Action Bar */}
                  <div className="step-continue-bar dual-buttons">
                    <Button 
                      variant="secondary"
                      onClick={() => setActiveStep(2)}
                      style={{ height: '54px' }}
                    >
                      <ArrowLeft size={16} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
                      Back to Shipping
                    </Button>
                    <Button 
                      variant="primary" 
                      size="lg"
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      style={{ 
                        flex: 1, 
                        height: '54px', 
                        fontSize: '1.1rem', 
                        fontWeight: 800,
                        background: paymentMethod === 'COD' ? '#0284c7' : '#4338ca'
                      }}
                    >
                      {isProcessing 
                        ? 'Placing Order...' 
                        : (paymentMethod === 'COD' 
                            ? `Confirm Cash on Delivery Order (${formatPrice(totalAmount)})` 
                            : `Pay & Place Order (${formatPrice(totalAmount)})`)}
                    </Button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Sticky Order Summary */}
          <div className="fm-checkout-summary-col">
            <div className="fm-checkout-summary-card">
              <div className="summary-card-title-row">
                <h3 className="summary-title">Order Summary</h3>
                <span className="summary-item-count">{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</span>
              </div>
              
              <div className="fm-checkout-items-preview">
                {cartItems.map(item => (
                  <div key={item.cartKey} className="fm-checkout-item-row">
                    <img src={item.images?.front || item.image} alt={item.name} />
                    <div className="preview-item-info">
                      <span className="name" title={item.name}>{item.name}</span>
                      <span className="qty-price">
                        {item.color && typeof item.color === 'object' ? item.color.name : item.color}
                        {item.size ? ` • ${typeof item.size === 'object' ? item.size.name : item.size}` : ''}
                        {` • Qty: ${item.quantity}`}
                      </span>
                    </div>
                    <div className="row-total">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Input */}
              <form onSubmit={handleApplyCoupon} className="coupon-apply-form">
                <div className="coupon-input-group">
                  <input 
                    type="text" 
                    placeholder="Coupon code (e.g. FUTURE10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="coupon-input"
                  />
                  <button type="submit" className="coupon-btn">Apply</button>
                </div>
                {couponMsg && (
                  <span className={`coupon-msg ${couponApplied ? 'success' : 'error'}`}>
                    {couponMsg}
                  </span>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="fm-checkout-breakdown">
                <div className="breakdown-row">
                  <span>Items Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>

                {discount > 0 && (
                  <div className="breakdown-row green">
                    <span>Discount Savings</span>
                    <strong>- {formatPrice(discount)}</strong>
                  </div>
                )}

                <div className="breakdown-row">
                  <span>Delivery Charge</span>
                  <strong>
                    {deliveryCharge === 0 ? <span className="free-tag">FREE</span> : formatPrice(deliveryCharge)}
                  </strong>
                </div>

                <hr className="divider" />

                <div className="breakdown-total">
                  <span>Total Amount</span>
                  <span className="total-val">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <Button 
                variant="primary" 
                size="lg" 
                fullWidth 
                onClick={handlePlaceOrder} 
                disabled={isProcessing}
                style={{ 
                  height: '54px', 
                  fontSize: '1.05rem', 
                  fontWeight: 800, 
                  background: paymentMethod === 'COD' ? '#0284c7' : '#4338ca' 
                }}
              >
                {isProcessing 
                  ? 'Processing Order...' 
                  : (paymentMethod === 'COD' 
                      ? `Place COD Order (${formatPrice(totalAmount)})` 
                      : `Pay & Place Order (${formatPrice(totalAmount)})`)}
              </Button>

              {/* Trust Badges */}
              <div className="fm-checkout-trust-box">
                <div className="trust-item">
                  <ShieldCheck size={16} color="#15803d" />
                  <span>256-bit Bank Grade SSL Checkout</span>
                </div>
                <div className="trust-item">
                  <Truck size={16} color="#4338ca" />
                  <span>7-Days Free Doorstep Returns</span>
                </div>
                <div className="trust-item">
                  <Check size={16} color="#0284c7" />
                  <span>Instant Notifications & Live Tracking</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
