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
      setError('⚠️ afromalik07@gmail.com is Master Admin. Redirecting to Admin Console...');
      setTimeout(() => {
        navigate('/admin/login', { replace: true });
      }, 1000);
      return;
    }

    if (notificationPreference === 'whatsapp' && !whatsappNumber.trim()) {
      setError('Please enter your WhatsApp mobile number.');
      return;
    }

    const result = login(cleanEmail, cleanPassword);
    if (result.success) {
      localStorage.setItem('customer_notification_pref', notificationPreference);
      if (whatsappNumber) {
        localStorage.setItem('customer_whatsapp_number', whatsappNumber.trim());
      }

      const cleanPhone = whatsappNumber.replace(/\\D/g, '');
      const fullPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;

      const notifData = {
        channel: notificationPreference,
        target: notificationPreference === 'whatsapp' ? \`+\${fullPhone}\` : cleanEmail,
        message: \`Welcome to FutureMemory Cart! 🎉 Login successful. Order and deal updates will be sent to your \${notificationPreference.toUpperCase()}.\`,
        waLink: notificationPreference === 'whatsapp'
          ? \`https://wa.me/\${fullPhone}?text=\${encodeURIComponent(\`Hello! Welcome to FutureMemory Cart 🎉\\nYour login was successful!\\nAccount: \${cleanEmail}\\nAll your order updates & flash deals will arrive here.\`)}\`
          : null
      };

      setDispatchedNotif(notifData);

      addNotification({
        title: 'Login Successful! 🎉',
        message: \`Welcome back! Notification preference set to \${notificationPreference.toUpperCase()}.\`,
        type: 'account'
      });

      setTimeout(() => {
        navigate(fromCustomer, { replace: true });
      }, 1400);
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
          setTimeout(() => navigate('/admin/login', { replace: true }), 1000);
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
    <div className="fm-auth-page-wrapper" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 16px' }}>
      <div
        className="fm-auth-clean-card"
        style={{
          maxWidth: '460px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: '0 12px 36px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '6px 14px', borderRadius: '20px', marginBottom: '14px' }}>
            <span style={{ fontSize: '1rem' }}>🛍️</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4338ca', letterSpacing: '0.5px' }}>FUTUREMEMORY CART</span>
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 850, color: '#0f172a', margin: '0 0 6px 0' }}>Customer Sign In</h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
            Sign in to access your shopping bag, memory cart, and live deals
          </p>
        </div>

        {/* Live Notification Dispatched Banner */}
        {dispatchedNotif && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '14px 16px', marginBottom: '18px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 700, fontSize: '0.9rem' }}>
              <span>{dispatchedNotif.channel === 'whatsapp' ? '💬' : '✉️'}</span>
              <span>Notification Sent to {dispatchedNotif.target}!</span>
            </div>
            <p style={{ margin: '4px 0 8px 0', fontSize: '0.82rem', color: '#334155' }}>
              {dispatchedNotif.message}
            </p>
            {dispatchedNotif.waLink && (
              <a
                href={dispatchedNotif.waLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: '#22c55e', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                Open in WhatsApp ↗
              </a>
            )}
          </div>
        )}

        {/* Continue with Google button */}
        <button
          type="button"
          onClick={() => googleLogin()}
          style={{
            width: '100%',
            height: '48px',
            background: '#ffffff',
            color: '#1e293b',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: 650,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 16px 0', color: '#94a3b8', fontSize: '0.84rem' }}>
          <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
          <span style={{ padding: '0 12px' }}>or sign in with email</span>
          <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span>ℹ️</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleCustomerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 650, color: '#1e293b', marginBottom: '6px' }}>Customer Email</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '11px', padding: '0 14px', background: '#fff', height: '46px' }}>
              <span style={{ marginRight: '10px', fontSize: '0.95rem' }}>✉️</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="customer@example.com"
                required
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.92rem', color: '#0f172a', background: 'transparent' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 650, color: '#1e293b' }}>Password</label>
              <a href="#forgot" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#4f46e5', textDecoration: 'none' }}>Forgot Password?</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '11px', padding: '0 14px', background: '#fff', height: '46px' }}>
              <span style={{ marginRight: '10px', fontSize: '0.95rem' }}>🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter customer password"
                required
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.92rem', color: '#0f172a', background: 'transparent' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '0.95rem' }}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          {/* Notification Preference Selection */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', margin: '6px 0', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              🔔 Receive Order & Price Drop Updates via:
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: notificationPreference === 'whatsapp' ? '10px' : '0' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: notificationPreference === 'whatsapp' ? '2px solid #22c55e' : '1.5px solid #cbd5e1',
                  background: notificationPreference === 'whatsapp' ? '#f0fdf4' : '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: 650,
                  color: notificationPreference === 'whatsapp' ? '#15803d' : '#334155'
                }}
              >
                <input
                  type="radio"
                  name="notifPref"
                  value="whatsapp"
                  checked={notificationPreference === 'whatsapp'}
                  onChange={() => setNotificationPreference('whatsapp')}
                  style={{ accentColor: '#22c55e' }}
                />
                <span>💬 WhatsApp</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: notificationPreference === 'email' ? '2px solid #3b82f6' : '1.5px solid #cbd5e1',
                  background: notificationPreference === 'email' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: 650,
                  color: notificationPreference === 'email' ? '#1d4ed8' : '#334155'
                }}
              >
                <input
                  type="radio"
                  name="notifPref"
                  value="email"
                  checked={notificationPreference === 'email'}
                  onChange={() => setNotificationPreference('email')}
                  style={{ accentColor: '#3b82f6' }}
                />
                <span>✉️ Email</span>
              </label>
            </div>

            {notificationPreference === 'whatsapp' && (
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                  WhatsApp Phone Number (with Country Code) *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '0 12px', background: '#fff', height: '42px' }}>
                  <span style={{ marginRight: '8px', fontSize: '0.9rem' }}>📱</span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    required
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', color: '#0f172a', background: 'transparent' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Full-Width Bold Submit Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              height: '48px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 750,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              transition: 'all 0.2s ease',
              marginTop: '4px'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(79, 70, 229, 0.45)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.35)'; }}
          >
            <span>Sign In to Customer Account</span>
            <span style={{ fontSize: '1.1rem' }}>→</span>
          </button>
        </form>

        {/* Footer: ONLY Sign Up Free (NO Admin link or email) */}
        <div style={{ marginTop: '22px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            Don't have an account? <Link to="/signup" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>Sign Up Free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
`;

fs.writeFileSync('src/pages/LoginPage.jsx', loginPageCode, 'utf8');
console.log('LoginPage.jsx successfully rebuilt with gorgeous styling and NO admin links!');
