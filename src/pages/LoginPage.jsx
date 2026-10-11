import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useSettings } from '../context/SettingsContext';
import { useGoogleLogin } from '@react-oauth/google';
import GoogleSecurityCodeModal from '../components/GoogleSecurityCodeModal';
import './AuthPages.css';

const LoginPage = () => {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const { openGoogleAuth } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: true });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(location.state?.message || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Admin Google Security Modal State
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // If already authenticated, directly navigate to /home (Home Page)
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
    setError('');
    setSuccessMsg('');
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPassword = formData.password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both your email and password.');
      return;
    }

    // Master Admin: Check password first, then prompt for 6-PIN verification!
    if (cleanEmail === 'afromalik07@gmail.com') {
      if (cleanPassword !== 'afromalik07') {
        setError('Incorrect password for Master Admin account.');
        return;
      }
      setShowSecurityModal(true);
      return;
    }

    setIsLoading(true);
    const result = login(cleanEmail, cleanPassword);
    setIsLoading(false);

    if (result.success) {
      localStorage.setItem('customer_email', cleanEmail);

      addNotification({
        title: 'Welcome Back! 🎉',
        message: 'Successfully signed in to FutureMemory Cart.',
        type: 'account'
      });

      navigate('/home', { replace: true });
    } else {
      setError(result.error || 'Invalid email or password. Please try again.');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        ).then(res => res.json());

        if (userInfo.email?.toLowerCase() === 'afromalik07@gmail.com') {
          setShowSecurityModal(true);
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
          message: `Signed in as ${account.name}`,
          type: 'account',
          link: '/home'
        });

        navigate('/home', { replace: true });
      } catch (err) {
        setError('Failed to fetch Google profile. Please try regular login.');
      }
    },
    onError: () => setError('Google Sign In was cancelled or failed.')
  });

  return (
    <div className="fm-auth-page-wrapper" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div
        className="fm-auth-clean-card"
        style={{
          maxWidth: '480px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '44px 40px',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08), 0 4px 16px rgba(15, 23, 42, 0.03)',
          border: '1px solid #e2e8f0',
          position: 'relative'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eff6ff', padding: '6px 14px', borderRadius: '20px', marginBottom: '14px' }}>
            <span style={{ fontSize: '1rem' }}>🛍️</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4338ca', letterSpacing: '0.5px' }}>FUTUREMEMORY CART</span>
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 850, color: '#0f172a', margin: '0 0 6px 0' }}>Welcome Back</h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
            Sign in to access your orders, wishlist, and smart carts
          </p>
        </div>

        {/* Continue with Google button */}
        <button
          type="button"
          onClick={() => openGoogleAuth()}
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
        <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0 18px 0', color: '#94a3b8', fontSize: '0.84rem' }}>
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

        {/* Standard Clean Sign In Form */}
        <form onSubmit={handleCustomerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 650, color: '#1e293b', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0 14px', background: '#fff', height: '48px', transition: 'border-color 0.2s' }}>
              <span style={{ marginRight: '10px', fontSize: '1rem', color: '#64748b' }}>✉️</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
                autoComplete="email"
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem', color: '#0f172a', background: 'transparent' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 650, color: '#1e293b' }}>
                Password
              </label>
              <Link to="/reset-password" style={{ fontSize: '0.82rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0 14px', background: '#fff', height: '48px', transition: 'border-color 0.2s' }}>
              <span style={{ marginRight: '10px', fontSize: '1rem', color: '#64748b' }}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem', color: '#0f172a', background: 'transparent' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: 0, color: '#64748b' }}
                tabIndex="-1"
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.86rem', color: '#475569' }}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                style={{ width: '16px', height: '16px', borderRadius: '4px', accentColor: '#4338ca', cursor: 'pointer' }}
              />
              <span>Remember me</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              height: '48px',
              background: 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              transition: 'opacity 0.2s',
              boxShadow: '0 4px 14px rgba(67, 56, 202, 0.3)'
            }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '26px', fontSize: '0.88rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#4338ca', fontWeight: 700, textDecoration: 'none' }}>
            Sign up now
          </Link>
        </div>
      </div>

      {/* Google Security Code Challenge Modal for Master Admin afromalik07@gmail.com */}
      <GoogleSecurityCodeModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        email="afromalik07@gmail.com"
      />
    </div>
  );
};

export default LoginPage;
