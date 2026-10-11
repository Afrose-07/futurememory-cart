const fs = require('fs');

const loginPageCode = `import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useGoogleLogin } from '@react-oauth/google';
import './AuthPages.css';

const LoginPage = () => {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const fromCustomer = location.state?.from?.pathname || '/home';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [notificationPreference, setNotificationPreference] = useState(() => {
    return localStorage.getItem('customer_notification_pref') || 'whatsapp';
  });
  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    return localStorage.getItem('customer_whatsapp_number') || '';
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(location.state?.message || '');
  const [showPassword, setShowPassword] = useState(false);
  const [dispatchedNotif, setDispatchedNotif] = useState(null);

  // If already authenticated, redirect to /home
  useEffect(() => {
    if (isAuthenticated) {
      navigate(fromCustomer, { replace: true });
    }
  }, [isAuthenticated, navigate, fromCustomer]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
    setSuccessMsg('');
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPassword = formData.password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both email and password.');
      return;
    }

    // STRICT ADMIN REDIRECT: If Master Admin email is entered on Customer Login
    if (cleanEmail === 'afromalik07@gmail.com') {
      setError('⚠️ afromalik07@gmail.com is designated Master Admin. Redirecting to Executive Admin Login...');
      setTimeout(() => {
        navigate('/admin/login', { replace: true });
      }, 1200);
      return;
    }

    if (notificationPreference === 'whatsapp' && !whatsappNumber.trim()) {
      setError('Please enter your WhatsApp mobile number to receive order updates.');
      return;
    }

    const result = login(cleanEmail, cleanPassword);
    if (result.success) {
      // Save customer notification preferences
      localStorage.setItem('customer_notification_pref', notificationPreference);
      if (whatsappNumber) {
        localStorage.setItem('customer_whatsapp_number', whatsappNumber.trim());
      }

      const cleanPhone = whatsappNumber.replace(/\\D/g, '');
      const fullPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;

      // Welcome Notification Payload
      const notifData = {
        channel: notificationPreference,
        target: notificationPreference === 'whatsapp' ? \`+\${fullPhone}\` : cleanEmail,
        message: \`Welcome to FutureMemory Cart! 🎉 You have successfully logged in. Price alerts and order updates will be sent to your \${notificationPreference.toUpperCase()}.\`,
        waLink: notificationPreference === 'whatsapp'
          ? \`https://wa.me/\${fullPhone}?text=\${encodeURIComponent(\`Hello! Welcome to FutureMemory Cart 🎉\\nYour login was successful!\\nAccount: \${cleanEmail}\\nAll your order updates & flash deals will arrive here.\`)}\`
          : null
      };

      setDispatchedNotif(notifData);

      addNotification({
        title: 'Login Successful! 🎉',
        message: \`Welcome back! Updates configured for \${notificationPreference.toUpperCase()} (\${notifData.target})\`,
        type: 'account'
      });

      // Navigate after a brief friendly confirmation
      setTimeout(() => {
        navigate(fromCustomer, { replace: true });
      }, 1600);
    } else {
      setError(result.error || 'Invalid customer email or password.');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: \`Bearer \${tokenResponse.access_token}\` } }
        ).then(res => res.json());

        if (userInfo.email?.toLowerCase() === 'afromalik07@gmail.com') {
          setError('afromalik07@gmail.com is Master Admin. Redirecting to Admin Console...');
          setTimeout(() => navigate('/admin/login', { replace: true }), 1200);
          return;
        }

        const account = {
          name: userInfo.name,
          email: userInfo.email,
          avatar: userInfo.picture
        };

        loginWithGoogle(account);
        addNotification({
          title: 'Google Sign-In Successful! 🎉',
          message: \`Signed in as \${account.name}\`,
          type: 'account',
          link: '/profile'
        });

        navigate(fromCustomer, { replace: true });
      } catch (err) {
        setError('Failed to fetch Google profile.');
      }
    },
    onError: () => setError('Google Sign In was cancelled or failed.')
  });

  return (
    <div className="fm-auth-page-wrapper">
      <div className="fm-auth-clean-card">
        {/* Brand Header */}
        <div className="fm-auth-brand-section">
          <div className="fm-brand-badge-pill">
            <svg className="fm-badge-svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z"/>
            </svg>
            <span className="fm-badge-name">FUTUREMEMORY CART</span>
          </div>

          <h1 className="fm-auth-main-title">Customer Sign In</h1>
          <p className="fm-auth-main-subtitle">
            Sign in to access your curated shopping bag, memory cart, and deals
          </p>
        </div>

        {/* Live Notification Dispatched Banner */}
        {dispatchedNotif && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '14px', marginBottom: '18px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: '700', fontSize: '0.9rem' }}>
              <span>{dispatchedNotif.channel === 'whatsapp' ? '💬' : '✉️'}</span>
              <span>Notification Dispatched to {dispatchedNotif.target}!</span>
            </div>
            <p style={{ margin: '4px 0 8px 0', fontSize: '0.82rem', color: '#334155' }}>
              {dispatchedNotif.message}
            </p>
            {dispatchedNotif.waLink && (
              <a
                href={dispatchedNotif.waLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: '#22c55e', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                Open in WhatsApp ↗
              </a>
            )}
          </div>
        )}

        {/* Continue with Google button */}
        <button
          type="button"
          className="fm-btn-google-pill"
          onClick={() => googleLogin()}
        >
          <svg className="google-svg-g" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="fm-clean-divider">
          <span>or sign in with email</span>
        </div>

        {error && <div className="fm-auth-alert-box">{error}</div>}
        {successMsg && <div className="fm-auth-alert-box fm-success-box">{successMsg}</div>}

        <form onSubmit={handleCustomerSubmit} className="fm-auth-clean-form">
          <div className="fm-clean-group">
            <label className="fm-clean-label">Customer Email</label>
            <div className="fm-clean-input-wrap">
              <span className="fm-field-icon">✉️</span>
              <input
                type="email"
                name="email"
                className="fm-clean-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="customer@example.com"
                required
              />
            </div>
          </div>

          <div className="fm-clean-group">
            <div className="fm-clean-label-row">
              <label className="fm-clean-label">Password</label>
              <a href="#forgot" className="fm-forgot-link">Forgot Password?</a>
            </div>
            <div className="fm-clean-input-wrap">
              <span className="fm-field-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="fm-clean-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter customer password"
                required
              />
              <button
                type="button"
                className="fm-toggle-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          {/* NOTIFICATION PREFERENCE SELECTION (DIRECTLY ON LOGIN) */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', margin: '14px 0', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
              🔔 Receive Order & Price Drop Updates via:
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: notificationPreference === 'whatsapp' ? '2px solid #22c55e' : '1px solid #cbd5e1',
                  background: notificationPreference === 'whatsapp' ? '#f0fdf4' : '#fff',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: '600'
                }}
              >
                <input
                  type="radio"
                  name="notifPref"
                  value="whatsapp"
                  checked={notificationPreference === 'whatsapp'}
                  onChange={() => setNotificationPreference('whatsapp')}
                />
                <span>💬 WhatsApp</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: notificationPreference === 'email' ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                  background: notificationPreference === 'email' ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: '600'
                }}
              >
                <input
                  type="radio"
                  name="notifPref"
                  value="email"
                  checked={notificationPreference === 'email'}
                  onChange={() => setNotificationPreference('email')}
                />
                <span>✉️ Email</span>
              </label>
            </div>

            {notificationPreference === 'whatsapp' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '4px' }}>
                  WhatsApp Phone Number (with Country Code) *
                </label>
                <div className="fm-clean-input-wrap">
                  <span className="fm-field-icon">📱</span>
                  <input
                    type="tel"
                    className="fm-clean-input"
                    placeholder="9876543210"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="fm-btn-clean-primary" style={{ marginTop: '10px' }}>
            Sign In to Customer Account →
          </button>
        </form>

        <div className="fm-auth-footer-nav" style={{ marginTop: '20px' }}>
          <p className="fm-switch-auth-text">
            Don't have an account? <Link to="/signup" className="fm-text-link">Sign Up Free</Link>
          </p>

          <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            <Link
              to="/admin/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#6366f1',
                fontSize: '0.84rem',
                fontWeight: '700',
                textDecoration: 'none'
              }}
            >
              🔐 Admin Console (afromalik07@gmail.com) →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
`;

fs.writeFileSync('src/pages/LoginPage.jsx', loginPageCode, 'utf8');
console.log('LoginPage.jsx successfully updated with customer notification preferences!');
