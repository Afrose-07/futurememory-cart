import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import confetti from 'canvas-confetti';

const GoogleSecurityCodeModal = ({ isOpen, onClose, email = 'afromalik07@gmail.com' }) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [dontAskAgain, setDontAskAgain] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  const { loginAdminWithPin } = useAdminAuth();
  const navigate = useNavigate();

  // Reset and focus first box when modal opens
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setErrorMsg('');
      setIsVerifying(false);
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      setDigits(nextDigits);
      return;
    }

    const char = cleaned.slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);
    setErrorMsg('');

    // Advance to next box if available
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const nextDigits = [...digits];
        nextDigits[index - 1] = '';
        setDigits(nextDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pastedData[i] || '';
    }
    setDigits(nextDigits);
    setErrorMsg('');

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const fullPin = digits.join('');

    if (fullPin.length < 6) {
      setErrorMsg('Please enter all 6 digits of your security PIN.');
      return;
    }

    if (fullPin !== '260107') {
      setErrorMsg('Invalid Security PIN! Please check and try again.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const res = await loginAdminWithPin(fullPin, email);
      if (res.success) {
        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {}

        setTimeout(() => {
          setIsVerifying(false);
          if (onClose) onClose();
          navigate('/admin', { replace: true });
        }, 350);
      } else {
        setErrorMsg(res.message || 'Verification failed. Please try again.');
        setIsVerifying(false);
      }
    } catch (err) {
      setErrorMsg('Authentication error. Please try again.');
      setIsVerifying(false);
    }
  };

  const isComplete = digits.every(d => d !== '');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(32, 33, 36, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '16px',
      fontFamily: "'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '28px',
        width: '100%',
        maxWidth: '460px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
        border: '1px solid #dadce0',
        padding: '36px 36px 32px 36px',
        boxSizing: 'border-box',
        animation: 'fadeInModal 0.25s ease-out'
      }}>
        {/* Google Branding Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span style={{ fontSize: '1rem', color: '#3c4043', fontWeight: 500 }}>
            Admin 2-Step Verification
          </span>
        </div>

        {/* Challenge Title */}
        <h1 style={{ fontSize: '1.65rem', fontWeight: 500, color: '#202124', margin: '0 0 8px 0', lineHeight: 1.25 }}>
          Enter 6-Digit Master PIN
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#5f6368', margin: '0 0 18px 0', lineHeight: 1.4 }}>
          Enter the 6-digit administrator security code to access the Admin Dashboard.
        </p>

        {/* Account Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px 4px 6px',
          borderRadius: '16px',
          border: '1px solid #dadce0',
          background: '#f8fafc',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#1a73e8',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            A
          </div>
          <span style={{ fontSize: '0.86rem', color: '#3c4043', fontWeight: 500 }}>
            {email}
          </span>
          <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
            Master
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 6 Individual PIN Input Boxes */}
          <div
            onPaste={handlePaste}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '8px',
              marginBottom: errorMsg ? '10px' : '20px'
            }}
          >
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                style={{
                  width: '52px',
                  height: '56px',
                  borderRadius: '12px',
                  border: errorMsg
                    ? '2px solid #d93025'
                    : digit
                    ? '2px solid #1a73e8'
                    : '2px solid #dadce0',
                  background: digit ? '#f0f7ff' : '#ffffff',
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  boxShadow: digit ? '0 2px 8px rgba(26, 115, 232, 0.12)' : 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a73e8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(26, 115, 232, 0.2)';
                }}
                onBlur={(e) => {
                  if (!errorMsg) {
                    e.target.style.borderColor = digit ? '#1a73e8' : '#dadce0';
                    e.target.style.boxShadow = digit ? '0 2px 8px rgba(26, 115, 232, 0.12)' : 'none';
                  }
                }}
              />
            ))}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#d93025',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '0.95rem' }}>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Checkbox */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.88rem',
            color: '#3c4043',
            cursor: 'pointer',
            marginBottom: '28px',
            userSelect: 'none'
          }}>
            <input
              type="checkbox"
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
              style={{ width: '17px', height: '17px', accentColor: '#1a73e8', cursor: 'pointer' }}
            />
            <span>Remember verification on this device</span>
          </label>

          {/* Bottom Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#5f6368',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                padding: '8px 4px'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isVerifying || !isComplete}
              style={{
                background: isVerifying ? '#93c5fd' : isComplete ? '#1a73e8' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '24px',
                padding: '11px 26px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: isVerifying || !isComplete ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                minWidth: '110px',
                boxShadow: isComplete ? '0 2px 6px rgba(26, 115, 232, 0.3)' : 'none'
              }}
            >
              {isVerifying ? 'Verifying...' : 'Verify & Enter →'}
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '16px', borderTop: '1px solid #f1f3f4', fontSize: '0.75rem', color: '#5f6368' }}>
          <span>Security Pin: 260107</span>
          <div style={{ display: 'flex', gap: '14px' }}>
            <span>Help</span>
            <span>Privacy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleSecurityCodeModal;
