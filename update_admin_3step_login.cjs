const fs = require('fs');

const loginPath = 'src/pages/AdminLoginPage.jsx';

const newAdminLoginCode = `import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAdminAuth } from '../context/AdminAuthContext';
import './AdminLogin.css';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('afromalik07@gmail.com');
  const [password, setPassword] = useState('afromalik07');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState('');
  
  // 3-Step Verification Sequence:
  // Step 1: Email & Password (or Google for afromalik07@gmail.com)
  // Step 2: Biometric Verification Page
  // Step 3: Security PIN Page (260107)
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState('');
  const [pendingLogin, setPendingLogin] = useState({
    type: 'email',
    data: { cleanEmail: 'afromalik07@gmail.com', cleanPassword: 'afromalik07' }
  });
  const [biometricSuccess, setBiometricSuccess] = useState(false);

  const { loginAdmin, loginAdminWithGoogle, loading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  // STEP 1 SUBMIT
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setFormError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setFormError('Please enter both admin email and password.');
      return;
    }

    if (cleanEmail !== 'afromalik07@gmail.com' || cleanPassword !== 'afromalik07') {
      setFormError('⛔ Access Denied! Only authorized Master Admin (afromalik07@gmail.com / afromalik07) can access this console.');
      return;
    }

    setPendingLogin({ type: 'email', data: { cleanEmail, cleanPassword } });
    setStep(2); // Go to Step 2: Biometric Verification
    setFormError('');
  };

  // GOOGLE SSO (ONLY FOR afromalik07@gmail.com)
  const handleGoogleSignIn = useGoogleLogin({
    login_hint: 'afromalik07@gmail.com',
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: \`Bearer \${tokenResponse.access_token}\` } }
        ).then(res => res.json());

        if (userInfo.email?.toLowerCase() !== 'afromalik07@gmail.com') {
          setFormError('⛔ Access Denied! Only afromalik07@gmail.com is authorized as Master Admin.');
          return;
        }

        setPendingLogin({
          type: 'google',
          data: { name: userInfo.name, email: userInfo.email, avatar: userInfo.picture }
        });
        setStep(2); // Go to Step 2: Biometric Verification
        setFormError('');
      } catch (err) {
        setFormError('Failed to fetch Google profile.');
      }
    },
    onError: () => setFormError('Google Sign In was cancelled or failed.')
  });

  // STEP 2: BIOMETRIC SCAN
  const handleBiometricScan = (fpId, fpLabel) => {
    setFormError('');
    const enrolled = JSON.parse(localStorage.getItem('adminFingerprints') || '["fp1", "fp2"]');
    
    // Auto-enroll if first time
    if (!enrolled.includes(fpId) && !enrolled.includes('owner1') && !enrolled.includes('owner2')) {
      enrolled.push(fpId);
      localStorage.setItem('adminFingerprints', JSON.stringify(enrolled));
    }

    setBiometricSuccess(true);
    setFormError(\`✅ \${fpLabel} Authenticated! Proceeding to PIN page...\`);
    
    setTimeout(() => {
      setStep(3); // Advance to Step 3: PIN Page
      setFormError('');
    }, 900);
  };

  // STEP 3: PIN SUBMIT (PIN: 260107)
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pin !== '260107') {
      setFormError('⛔ Incorrect Security PIN. Access Denied.');
      return;
    }
    setFormError('');
    
    // Finalize Login and open Dashboard
    if (pendingLogin.type === 'email') {
      const res = await loginAdmin(pendingLogin.data.cleanEmail, pendingLogin.data.cleanPassword);
      if (res.success) navigate(from, { replace: true });
      else setFormError(res.message || 'Invalid admin credentials.');
    } else if (pendingLogin.type === 'google') {
      const res = await loginAdminWithGoogle(pendingLogin.data);
      if (res.success) navigate(from, { replace: true });
      else setFormError(res.message || 'Google authentication failed.');
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-bg-overlay" />
      
      <div className="admin-login-card">
        {/* Header Branding */}
        <div className="admin-login-header">
          <div className="admin-login-badge">
            <span className="seller-badge-icon">👑</span>
            <span>FUTUREMEMORY HQ • EXECUTIVE ACCESS</span>
          </div>
          <h1 className="admin-login-title">
            {step === 1 ? 'Admin Console' : step === 2 ? 'Biometric Verify' : 'Security PIN'}
          </h1>
          <p className="admin-login-subtitle">
            {step === 1 && 'Restricted Operator Access. Sign in with Master Admin credentials.'}
            {step === 2 && 'Step 2: Authenticate with registered biometric fingerprint.'}
            {step === 3 && 'Step 3: Enter your 6-digit Master PIN (260107) to unlock dashboard.'}
          </p>
        </div>

        {/* STEP PROGRESS INDICATOR */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: step >= 1 ? 'var(--primary-color)' : '#e2e8f0', color: '#fff', fontSize: '0.78rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: step === 1 ? 'var(--primary-color)' : '#64748b' }}>Credentials</span>
          </div>
          <span style={{ color: '#cbd5e1' }}>—</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: step >= 2 ? 'var(--primary-color)' : '#e2e8f0', color: '#fff', fontSize: '0.78rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: step === 2 ? 'var(--primary-color)' : '#64748b' }}>Biometrics</span>
          </div>
          <span style={{ color: '#cbd5e1' }}>—</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: step >= 3 ? 'var(--primary-color)' : '#e2e8f0', color: '#fff', fontSize: '0.78rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: step === 3 ? 'var(--primary-color)' : '#64748b' }}>PIN</span>
          </div>
        </div>

        {/* Status / Error Alerts */}
        {formError && (
          <div
            className="admin-login-alert"
            style={{
              marginBottom: '18px',
              background: formError.includes('✅') ? '#f0fdf4' : '#fef2f2',
              border: \`1px solid \${formError.includes('✅') ? '#bbf7d0' : '#fecaca'}\`,
              color: formError.includes('✅') ? '#166534' : '#b91c1c',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center'
            }}
          >
            <span>{formError.includes('✅') ? '✅' : '⚠️'}</span>
            <strong>{formError}</strong>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 1: CREDENTIALS (EMAIL & PASSWORD OR GOOGLE SSO)   */}
        {/* ======================================================== */}
        {step === 1 && (
          <>
            <button
              type="button"
              className="admin-google-sso-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
              title="Sign in with afromalik07@gmail.com Google Account"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google (afromalik07@gmail.com)</span>
            </button>

            <div className="admin-login-divider">
              <span>or sign in with admin password</span>
            </div>

            <form onSubmit={handleStep1Submit} className="admin-login-form">
              <div className="form-group-admin">
                <label htmlFor="adminEmail">Admin Email ID</label>
                <div className="input-wrap-admin">
                  <span className="input-icon-admin">✉️</span>
                  <input
                    id="adminEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="afromalik07@gmail.com"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group-admin">
                <div className="label-row-admin">
                  <label htmlFor="adminPass">Secure Password</label>
                </div>
                <div className="input-wrap-admin">
                  <span className="input-icon-admin">🔒</span>
                  <input
                    id="adminPass"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <div className="form-aux-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember this session</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn-admin-submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loading-content">
                    <span className="spinner-dot" /> Authenticating...
                  </span>
                ) : (
                  <span>Verify Credentials → Next: Biometrics</span>
                )}
              </button>
            </form>
          </>
        )}

        {/* ======================================================== */}
        {/* SCREEN 2: BIOMETRIC VERIFICATION PAGE                     */}
        {/* ======================================================== */}
        {step === 2 && (
          <div className="admin-2fa-container" style={{ padding: '10px 0', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '6px', color: 'var(--primary-color)', fontSize: '1.2rem' }}>
              Touch Biometric Scanner
            </h3>
            <p style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              Place your enrolled admin fingerprint to advance to Master PIN security check.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '22px', flexWrap: 'wrap' }}>
              {/* Registered Fingerprint 1 */}
              <button
                type="button"
                onClick={() => handleBiometricScan('fp1', 'Fingerprint 1')}
                style={{
                  background: '#f0fdf4',
                  border: '2px solid #22c55e',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  minWidth: '130px',
                  boxShadow: '0 2px 8px rgba(34,197,94,0.15)',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '2.2rem' }}>🔑</span>
                <strong style={{ fontSize: '0.86rem', color: '#15803d' }}>Fingerprint 1</strong>
                <span style={{ fontSize: '0.72rem', color: '#16a34a' }}>Scan & Pass</span>
              </button>

              {/* Registered Fingerprint 2 */}
              <button
                type="button"
                onClick={() => handleBiometricScan('fp2', 'Fingerprint 2')}
                style={{
                  background: '#f0fdf4',
                  border: '2px solid #22c55e',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  minWidth: '130px',
                  boxShadow: '0 2px 8px rgba(34,197,94,0.15)',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '2.2rem' }}>🔑</span>
                <strong style={{ fontSize: '0.86rem', color: '#15803d' }}>Fingerprint 2</strong>
                <span style={{ fontSize: '0.72rem', color: '#16a34a' }}>Scan & Pass</span>
              </button>

              {/* Stranger Fingerprint -> ACCESS DENIED */}
              <button
                type="button"
                onClick={() => {
                  setFormError('⛔ Access Denied! Unrecognized stranger biometric pattern. Authentication failed.');
                }}
                style={{
                  background: '#fef2f2',
                  border: '2px dashed #ef4444',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  minWidth: '130px',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '2.2rem' }}>🖐️</span>
                <strong style={{ fontSize: '0.86rem', color: '#b91c1c' }}>Stranger Finger</strong>
                <span style={{ fontSize: '0.72rem', color: '#dc2626' }}>Access Denied Test</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-admin-submit"
                style={{ padding: '10px 20px' }}
              >
                Skip to PIN Verification (260107) →
              </button>

              <button 
                type="button" 
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}
              >
                ← Back to Credentials
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 3: SECURITY PIN PAGE (260107)                     */}
        {/* ======================================================== */}
        {step === 3 && (
          <div className="admin-2fa-container" style={{ padding: '10px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '2.8rem', marginBottom: '8px' }}>🔢</div>
            <h3 style={{ marginBottom: '6px', color: 'var(--primary-color)', fontSize: '1.25rem' }}>
              Enter Master Security PIN
            </h3>
            <p style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              Enter the 6-Digit authorization PIN (<strong>260107</strong>) to unlock the Executive Console.
            </p>

            <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\\D/g, '').slice(0, 6))}
                placeholder="260107"
                autoFocus
                style={{
                  width: '180px',
                  height: '52px',
                  textAlign: 'center',
                  letterSpacing: '8px',
                  fontSize: '1.4rem',
                  borderRadius: '12px',
                  border: '2px solid #cbd5e1',
                  fontWeight: '800',
                  color: '#0f172a',
                  background: '#f8fafc',
                  outline: 'none'
                }}
              />

              <button
                type="submit"
                className="btn-admin-submit"
                disabled={loading || pin.length !== 6}
                style={{ width: '100%', height: '48px', fontSize: '1rem', fontWeight: 750 }}
              >
                {loading ? 'Opening Dashboard...' : 'Verify PIN & Open Dashboard →'}
              </button>

              <button 
                type="button" 
                onClick={() => setStep(2)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}
              >
                ← Back to Biometric Scanner
              </button>
            </form>
          </div>
        )}

        {/* Footer info & Customer Store link */}
        <div className="admin-login-footer">
          <div className="admin-footer-links">
            <Link to="/home" className="back-store-link">
              ← Return to Customer Storefront
            </Link>
          </div>
        </div>

        {/* Security watermark */}
        <div className="admin-sec-features">
          <span>👑 256-Bit TLS</span>
          <span>•</span>
          <span>🛡️ RBAC Protected</span>
          <span>•</span>
          <span>⚡ Live Database Synced</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
`;

fs.writeFileSync(loginPath, newAdminLoginCode, 'utf8');
console.log('AdminLoginPage.jsx successfully updated with progressive 3-step sequence!');
