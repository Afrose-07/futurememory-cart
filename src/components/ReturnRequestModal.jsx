import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice } from '../utils/helpers';
import './ReturnRequestModal.css';

const ReturnRequestModal = () => {
  const { activeReturnOrder, setActiveReturnOrder, requestReturn } = useOrders();
  const { t } = useLanguage();

  const [reason, setReason] = useState('defective');
  const [comments, setComments] = useState('');
  const [refundMode, setRefundMode] = useState('wallet');
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [pickupSlot, setPickupSlot] = useState('10:00 AM - 01:00 PM');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!activeReturnOrder) return null;

  const returnReasons = [
    { id: 'defective', label: t('reasonDefective'), icon: '️' },
    { id: 'damaged', label: t('reasonDamaged'), icon: '' },
    { id: 'wrong_item', label: t('reasonWrongItem'), icon: '' },
    { id: 'quality', label: t('reasonQuality'), icon: '⭐' },
    { id: 'missing_parts', label: t('reasonMissingParts'), icon: '' },
    { id: 'not_needed', label: t('reasonNotNeeded'), icon: '' }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSamplePhoto = () => {
    setPhotoPreview("https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedReasonObj = returnReasons.find(r => r.id === reason);

    setTimeout(() => {
      requestReturn(activeReturnOrder.orderId, {
        reason: selectedReasonObj?.label || reason,
        comments: comments || 'Item return requested by customer under 7-days policy.',
        refundMode,
        pickupDate,
        pickupSlot,
        photoUrl: photoPreview
      });
      setIsSubmitting(false);
      setActiveReturnOrder(null);
    }, 400);
  };

  const baseRefund = activeReturnOrder.totalAmount || 0;
  const walletBonus = Math.round(baseRefund * 0.05);

  return (
    <div className="fm-return-backdrop" onClick={() => setActiveReturnOrder(null)}>
      <div className="fm-return-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="fm-return-header">
          <div className="fm-return-title-group">
            <span className="fm-return-badge-icon"></span>
            <div>
              <h3>{t('returnTitle')}</h3>
              <p className="fm-return-subtitle">
                Order #{activeReturnOrder.orderId} • <span className="guarantee-text">️ {t('daysReturnGuarantee')}</span>
              </p>
            </div>
          </div>
          <button className="fm-return-close" onClick={() => setActiveReturnOrder(null)}></button>
        </div>

        <form onSubmit={handleSubmit} className="fm-return-form">
          {/* Order Item Summary */}
          <div className="fm-return-item-summary">
            {activeReturnOrder.items?.map((item, idx) => (
              <div key={idx} className="return-item-preview">
                <img src={item.images.front} alt={item.name} />
                <div className="return-item-meta">
                  <span className="return-item-title">{item.name}</span>
                  <span className="return-item-price">
                    Qty: {item.quantity || 1} • {formatPrice(item.price)}
                  </span>
                  <span className="return-policy-chip"> 7 days Hassle-Free Replacement / Refund</span>
                </div>
              </div>
            ))}
          </div>

          <div className="fm-return-scroll-body">
            {/* Step 1: Select Return Reason */}
            <div className="fm-return-field-group">
              <label className="fm-field-title">
                1. {t('selectReturnReason')} <span className="req">*</span>
              </label>
              <div className="fm-reasons-list">
                {returnReasons.map((r) => (
                  <label
                    key={r.id}
                    className={`fm-reason-option ${reason === r.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="returnReason"
                      value={r.id}
                      checked={reason === r.id}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <span className="reason-icon">{r.icon}</span>
                    <span className="reason-label">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 2: Problem Description & Photo Upload */}
            <div className="fm-return-field-group">
              <label className="fm-field-title">
                2. {t('additionalComments')}
              </label>
              <textarea
                rows="3"
                placeholder="Please describe the defect, damage, or discrepancy in detail..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="fm-return-textarea"
              />

              {/* Photo Proof */}
              <div className="fm-photo-upload-container">
                <span className="photo-label"> Attach Photo Proof of Damaged / Defective Item:</span>
                <div className="photo-actions">
                  <label className="upload-btn">
                    <span>Upload from Device</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                  </label>
                  <button type="button" className="sample-photo-btn" onClick={handleSamplePhoto}>
                    Use Sample Photo Proof
                  </button>
                </div>
                {photoPreview && (
                  <div className="photo-preview-wrap">
                    <img src={photoPreview} alt="Defect proof" className="defect-thumbnail" />
                    <button type="button" className="remove-photo" onClick={() => setPhotoPreview(null)}> Remove</button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Refund Method Selection */}
            <div className="fm-return-field-group">
              <label className="fm-field-title">
                3. {t('refundPreference')} <span className="req">*</span>
              </label>
              <div className="fm-refund-options">
                <label className={`refund-card ${refundMode === 'wallet' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="refundMethod"
                    value="wallet"
                    checked={refundMode === 'wallet'}
                    onChange={(e) => setRefundMode(e.target.value)}
                  />
                  <div className="refund-card-body">
                    <div className="refund-card-title">
                      <span> FutureMemory Instant Wallet</span>
                      <span className="bonus-tag">+5% EXTRA BONUS</span>
                    </div>
                    <p className="refund-card-desc">
                      Credited instantly upon pickup verification. Total: <strong>{formatPrice(baseRefund + walletBonus)}</strong> (Includes {formatPrice(walletBonus)} free bonus cash!)
                    </p>
                  </div>
                </label>

                <label className={`refund-card ${refundMode === 'original' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="refundMethod"
                    value="original"
                    checked={refundMode === 'original'}
                    onChange={(e) => setRefundMode(e.target.value)}
                  />
                  <div className="refund-card-body">
                    <div className="refund-card-title">
                      <span> Original Payment Method (Bank / UPI)</span>
                    </div>
                    <p className="refund-card-desc">
                      Credited back to your source account within 2-3 business days. Total: <strong>{formatPrice(baseRefund)}</strong>
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 4: Reverse Pickup Schedule */}
            <div className="fm-return-field-group">
              <label className="fm-field-title">
                4. {t('pickupDateLabel')} & Time Slot
              </label>
              <div className="fm-pickup-grid">
                <div>
                  <label className="sub-label">Reverse Pickup Date:</label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="fm-date-input"
                    required
                  />
                </div>
                <div>
                  <label className="sub-label">Preferred Time Slot:</label>
                  <select
                    value={pickupSlot}
                    onChange={(e) => setPickupSlot(e.target.value)}
                    className="fm-slot-select"
                  >
                    <option value="09:00 AM - 12:00 PM">Morning (09:00 AM - 12:00 PM)</option>
                    <option value="12:00 PM - 03:00 PM">Afternoon (12:00 PM - 03:00 PM)</option>
                    <option value="03:00 PM - 07:00 PM">Evening (03:00 PM - 07:00 PM)</option>
                  </select>
                </div>
              </div>

              <div className="pickup-address-box">
                <span className="pickup-icon"></span>
                <div className="address-text">
                  <strong>Pickup from:</strong> {activeReturnOrder.shippingAddress?.fullName}, {activeReturnOrder.shippingAddress?.addressLine}, {activeReturnOrder.shippingAddress?.city} - {activeReturnOrder.shippingAddress?.pincode}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="fm-return-footer">
            <button
              type="button"
              className="btn-cancel-return"
              onClick={() => setActiveReturnOrder(null)}
            >
              {t('cancelReturn')}
            </button>
            <button
              type="submit"
              className="btn-submit-return"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Scheduling Pickup...' : ` ${t('submitReturnRequest')}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnRequestModal;
