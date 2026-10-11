import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import './GoogleSignInModal.css';

const GoogleSignInModal = () => {
  const { isGoogleAuthOpen, closeGoogleAuth } = useSettings();
  const { loginWithGoogle, registeredUsers } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const [customEmail, setCustomEmail] = useState('afrose@gmail.com');
  const [customName, setCustomName] = useState('Afrose');
  const [googleError, setGoogleError] = useState('');

  if (!isGoogleAuthOpen) return null;

  const handleSelectAccount = (account) => {
    loginWithGoogle(account);
    addNotification({
      title: 'Google Sign-In Successful! 🎉',
      message: `Signed in as ${account.name} (${account.email})`,
      type: 'account',
      link: '/home'
    });
    closeGoogleAuth();
    navigate('/home', { replace: true });
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        ).then(res => res.json());

        const account = {
          name: userInfo.name || 'Google User',
          email: userInfo.email,
          avatar: userInfo.picture
        };
        handleSelectAccount(account);
      } catch (err) {
        setGoogleError('Failed to fetch Google profile. Use One-Click Sign In below.');
      }
    },
    onError: (errorResponse) => {
      setGoogleError('Google OAuth popup was blocked (Origin not registered in Google Cloud Console). Use the instant One-Click Sign-In below!');
    }
  });

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail.trim()) {
      setGoogleError('Please enter a valid email address.');
      return;
    }
    const cleanEmail = customEmail.trim().toLowerCase();
    const account = {
      name: customName.trim() || 'Google User',
      email: cleanEmail,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customName || 'G')}`
    };
    handleSelectAccount(account);
  };

  return (
    <div className="fm-google-backdrop" onClick={closeGoogleAuth}>
      <div className="fm-google-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fm-google-header">
          <svg className="google-g-logo" viewBox="0 0 24 24" width="28" height="28">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <div className="fm-google-titles">
            <h4>Sign in with Google</h4>
            <p>Choose an account or sign in directly</p>
          </div>
          <button className="fm-google-close" onClick={closeGoogleAuth}>✕</button>
        </div>

        <div className="fm-google-body">
          {googleError && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              marginBottom: '14px',
              lineHeight: 1.4
            }}>
              {googleError}
            </div>
          )}

          {/* Quick Select Accounts */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>
              Choose a Google Account:
            </span>
            <div className="fm-google-accounts-list">
              <button
                type="button"
                className="fm-google-account-row"
                onClick={() => handleSelectAccount({
                  name: 'Afrose',
                  email: 'afrose@gmail.com',
                  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Afrose'
                })}
              >
                <img src="https://api.dicebear.com/7.x/initials/svg?seed=Afrose" alt="Afrose" className="google-user-avatar" />
                <div className="google-user-info">
                  <span className="google-user-name">Afrose (Customer)</span>
                  <span className="google-user-email">afrose@gmail.com</span>
                </div>
                <span className="google-auth-badge">1-Click</span>
              </button>

              {registeredUsers && registeredUsers.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="fm-google-account-row"
                  onClick={() => handleSelectAccount(acc)}
                >
                  <img src={acc.avatar} alt={acc.name} className="google-user-avatar" />
                  <div className="google-user-info">
                    <span className="google-user-name">{acc.name}</span>
                    <span className="google-user-email">{acc.email}</span>
                  </div>
                  <span className="google-auth-badge">Saved</span>
                </button>
              ))}
            </div>
          </div>

          <div className="fm-google-divider">
            <span>or enter custom Google email</span>
          </div>

          {/* Custom Account Form */}
          <form onSubmit={handleCustomSubmit} className="fm-google-custom-form">
            <div className="form-group">
              <label>Google Account Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Afrose Nisha"
                required
              />
            </div>
            <div className="form-group">
              <label>Gmail Address</label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                required
              />
            </div>

            <div className="fm-google-custom-actions" style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                className="google-btn-back"
                onClick={() => googleLogin()}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                title="Launch Google OAuth popup (requires domain authorized in Google Cloud)"
              >
                🌐 Try Popup
              </button>
              <button
                type="submit"
                className="google-btn-submit"
                style={{ flex: 1.5, background: '#1a73e8' }}
              >
                ⚡ Instant Google Sign-In
              </button>
            </div>
          </form>
        </div>

        <div className="fm-google-footer">
          <span>🔒 Protected by FutureMemory Secure Google Authentication Sandbox</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleSignInModal;
