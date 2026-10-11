import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import confetti from 'canvas-confetti';
import './AdminLogin.css';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('afromalik07@gmail.com');
  const [password, setPassword] = useState('afromalik07');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState('');
  
  // 2-Step Verification Sequence:
  // Step 1: Sign in with Google (afromalik07@gmail.com) or Credentials
  // Step 2: Google Security Code Challenge (PIN: 260107)
  const [step, setStep] = useState(1);
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '', '']);
  const pinRefs = useRef([]);
  const [dontAskAgain, setDontAskAgain] = useState(true);

  const { loginAdminWithPin, loading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  // STEP 1: CREDENTIALS SUBMIT
  const handleStep1Submit = (e) => {
    e.preventDefault();
    setFormError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setFormError('Please enter both admin email and password.');
      return;
    }

    if (cleanEmail !== 'afromalik07@gmail.com' || cleanPassword !== 'afromalik07') {
      setFormError('⛔ Access Denied! Only authorized Master Admin (afromalik07@gmail.com) can access.');
      return;
    }

    setStep(2); // Advance directly to Google Security Challenge PIN
    setFormError('');
  };

  const handleGoogleClick = () => {
    // Jump directly to Security Code verification for afromalik07@gmail.com
    setStep(2);
    setFormError('');
  };

  // STEP 2: DIGIT BOX HANDLERS
  const handleDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...pinDigits];
      next[index] = '';
      setPinDigits(next);
      return;
    }
    const char = cleaned.slice(-1);
    const next = [...pinDigits];
    next[index] = char;
    setPinDigits(next);
    setFormError('');
    if (index < 5) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!pinDigits[index] && index > 0) {
        pinRefs.current[index - 1]?.focus();
        const next = [...pinDigits];
        next[index - 1] = '';
        setPinDigits(next);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      pinRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...pinDigits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || '';
    }
    setPinDigits(next);
    setFormError('');
    const nextIndex = Math.min(pasted.length, 5);
    pinRefs.current[nextIndex]?.focus();
  };

  // STEP 2: SECURITY CODE / PIN SUBMIT (PIN: 260107)
  const handlePinSubmit = async (e) => {
    if (e) e.preventDefault();
    const cleanPin = pinDigits.join('');

    if (cleanPin.length < 6) {
      setFormError('Please enter all 6 digits of your security PIN.');
      return;
    }

    if (cleanPin !== '260107') {
      setFormError('This code is invalid. Get a new code and try again.');
      return;
    }

    setFormError('');

    try {
      const res = await loginAdminWithPin(cleanPin, 'afromalik07@gmail.com');
      if (res.success) {
        try {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.6 }
          });
        } catch {}

        setTimeout(() => {
          navigate(from, { replace: true });
        }, 300);
      } else {
        setFormError(res.message || 'This code is invalid. Get a new code and try again.');
      }
    } catch (err) {
      setFormError('Authentication error. Please try again.');
    }
  };

  return (
    <div className="admin-login-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
      <div className="admin-login-bg-overlay" />
      
      <div className="admin-login-card" style={{
        maxWidth: '460px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '28px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
        border: '1px solid #dadce0',
        padding: '36px',
        boxSizing: 'border-box'
      }}>
        
        {/* ======================================================== */}
        {/* STEP 1: CREDENTIALS (GOOGLE SSO OR EMAIL/PASSWORD)      */}
        {/* ======================================================== */}
        {step === 1 && (
          <>
            {/* Header Branding */}
            <div className="admin-login-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eff6ff', padding: '6px 14px', borderRadius: '20px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.1rem' }}>👑</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4338ca', letterSpacing: '0.5px' }}>MASTER ADMIN PORTAL</span>
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                Executive Access
              </h1>
              <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
                Sign in with authorized Master Google Account (afromalik07@gmail.com)
              </p>
            </div>

            {/* Error Message */}
            {formError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <span>⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            {/* Google Sign in Button */}
            <button
              type="button"
              onClick={handleGoogleClick}
              style={{
                width: '100%',
                height: '50px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.94rem',
                color: '#1e293b',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google (afromalik07@gmail.com)</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 16px 0', color: '#94a3b8', fontSize: '0.82rem' }}>
              <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
              <span style={{ padding: '0 12px' }}>or sign in with credentials</span>
              <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
            </div>

            <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Admin Email ID
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0 14px', background: '#fff', height: '48px' }}>
                  <span style={{ marginRight: '10px' }}>✉️</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="afromalik07@gmail.com"
                    required
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Secure Password
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0 14px', background: '#fff', height: '48px' }}>
                  <span style={{ marginRight: '10px' }}>🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#64748b' }}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  height: '48px',
                  background: 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.96rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '6px',
                  boxShadow: '0 4px 12px rgba(67, 56, 202, 0.25)'
                }}
              >
                Next: Security Code →
              </button>
            </form>
          </>
        )}

        {/* ======================================================== */}
        {/* STEP 2: GOOGLE SECURITY CODE CHALLENGE (PIN: 260107)    */}
        {/* ======================================================== */}
        {step === 2 && (
          <div>
            {/* Google Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span style={{ fontSize: '1rem', color: '#3c4043', fontWeight: 500 }}>
                Sign in with Google
              </span>
            </div>

            {/* Challenge Title */}
            <h1 style={{ fontSize: '1.65rem', fontWeight: 400, color: '#202124', margin: '0 0 10px 0', lineHeight: 1.25 }}>
              Get a code to sign in
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#5f6368', margin: '0 0 20px 0', lineHeight: 1.4 }}>
              This extra step helps make sure it's really you signing in
            </p>

            {/* Account Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px 4px 6px',
              borderRadius: '16px',
              border: '1px solid #dadce0',
              background: '#fff',
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
              <span style={{ fontSize: '0.88rem', color: '#3c4043', fontWeight: 500 }}>
                afromalik07@gmail.com
              </span>
            </div>

            {/* Instruction */}
            <p style={{ fontSize: '0.9rem', color: '#3c4043', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              To get your security code, enter your 6-digit Master Security PIN:
            </p>

            <form onSubmit={handlePinSubmit}>
              {/* 6 Individual PIN Input Boxes */}
              <div
                onPaste={handleDigitPaste}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '8px',
                  marginBottom: formError ? '10px' : '20px'
                }}
              >
                {pinDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (pinRefs.current[idx] = el)}
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    style={{
                      width: '52px',
                      height: '56px',
                      borderRadius: '12px',
                      border: formError
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
                      if (!formError) {
                        e.target.style.borderColor = digit ? '#1a73e8' : '#dadce0';
                        e.target.style.boxShadow = digit ? '0 2px 8px rgba(26, 115, 232, 0.12)' : 'none';
                      }
                    }}
                  />
                ))}
              </div>

              {/* Error Alert */}
              {formError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#d93025',
                  fontSize: '0.82rem',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '0.95rem' }}>🚫</span>
                  <span>{formError}</span>
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
                marginBottom: '32px',
                userSelect: 'none'
              }}>
                <input
                  type="checkbox"
                  checked={dontAskAgain}
                  onChange={(e) => setDontAskAgain(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#1a73e8', cursor: 'pointer' }}
                />
                <span>Don't ask again on this device</span>
              </label>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setPinDigits(['', '', '', '', '', '']);
                    setFormError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1a73e8',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    padding: '8px 4px'
                  }}
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  disabled={loading || pinDigits.some(d => d === '')}
                  style={{
                    background: loading ? '#93c5fd' : pinDigits.every(d => d !== '') ? '#1a73e8' : '#cbd5e1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '24px',
                    padding: '10px 26px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    cursor: loading || pinDigits.some(d => d === '') ? 'not-allowed' : 'pointer',
                    minWidth: '96px',
                    boxShadow: pinDigits.every(d => d !== '') ? '0 2px 6px rgba(26, 115, 232, 0.3)' : 'none'
                  }}
                >
                  {loading ? 'Verifying...' : 'Next'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer info & Customer Store link */}
        <div style={{ textAlign: 'center', marginTop: '28px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <Link to="/home" style={{ color: '#64748b', fontSize: '0.84rem', textDecoration: 'none', fontWeight: 600 }}>
            ← Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
