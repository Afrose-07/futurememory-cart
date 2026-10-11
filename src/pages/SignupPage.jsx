import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { useGoogleLogin } from '@react-oauth/google';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import './AuthPages.css';

const SignupPage = () => {
  const { signup, loginWithGoogle, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // If already logged in, enter store directly!
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    const result = signup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      mobile: formData.mobile || ''
    });

    if (result.success) {
      // Navigate to login page so they can login with newly created credentials
      navigate('/login', { replace: true, state: { message: 'Account created successfully! Please login with your new credentials.' } });
    } else {
      setError(result.error);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        ).then(res => res.json());

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
          link: '/profile'
        });
        
        navigate('/home', { replace: true });
      } catch (err) {
        setError('Failed to fetch Google profile.');
      }
    },
    onError: () => setError('Google Sign In was cancelled or failed.')
  });

  return (
    <div className="fm-auth-container">
      <div className="fm-auth-card">
        <div className="fm-auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <BrandLogo size="lg" showTagline={false} />
          </div>
          <h1 className="fm-auth-title">{t('signup')}</h1>
          <p className="fm-auth-subtitle">Create your personal shopping account with 7-days Returns & Smart Carts</p>
        </div>

        {/* Google Signup Button */}
        <button
          type="button"
          className="fm-btn-google-auth"
          onClick={() => googleLogin()}
        >
          <svg className="google-svg-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>{t('signUpGoogle')}</span>
        </button>

        <div className="fm-auth-divider">
          <span>{t('orContinueWith')}</span>
        </div>

        {error && <div className="fm-auth-alert">{error}</div>}

        <form className="fm-auth-form" onSubmit={handleSubmit}>
          <div className="fm-form-group">
            <label className="fm-form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="fm-form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Anandha Krishnan"
              required
            />
          </div>

          <div className="fm-form-group">
            <label className="fm-form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="fm-form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="anand@example.com"
              required
            />
          </div>

          <div className="fm-form-group">
            <label className="fm-form-label">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              className="fm-form-input"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="+91 98401 23456"
              required
            />
          </div>

          <div className="fm-form-group">
            <label className="fm-form-label">Password</label>
            <input
              type="password"
              name="password"
              className="fm-form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              required
            />
          </div>

          <div className="fm-form-group">
            <label className="fm-form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="fm-form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              required
            />
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth>
            Create Free Account
          </Button>
        </form>

        <div className="fm-auth-footer">
          Already have an account? <Link to="/login" style={{ fontWeight: 800, color: 'var(--primary-color)' }}>{t('login')}</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
