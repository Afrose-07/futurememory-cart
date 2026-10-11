import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useNotifications } from '../context/NotificationContext';
import './GoogleSignInModal.css';

const GoogleSignInModal = () => {
  const { isGoogleAuthOpen, closeGoogleAuth } = useSettings();
  const { loginWithGoogle, registeredUsers } = useAuth();
  const { addNotification } = useNotifications();

  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  if (!isGoogleAuthOpen) return null;

  const handleSelectAccount = (account) => {
    loginWithGoogle(account);
    addNotification({
      title: 'Google Sign-In Successful! 🎉',
      message: `Signed in as ${account.name} (${account.email})`,
      type: 'account',
      link: '/profile'
    });
    closeGoogleAuth();
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
        handleSelectAccount(account);
      } catch (err) {
        console.error('Failed to fetch user info', err);
      }
    },
    onError: errorResponse => console.error('Google Sign In failed', errorResponse),
  });

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    googleLogin(); // Trigger actual Google OAuth instead of mock!
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
            <p>Enter your Google account credentials to continue</p>
          </div>
          <button className="fm-google-close" onClick={closeGoogleAuth}></button>
        </div>

        <div className="fm-google-body">
          {registeredUsers && registeredUsers.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>
                Continue with registered account:
              </span>
              <div className="fm-google-accounts-list">
                {registeredUsers.map((acc, idx) => (
                  <button
                    key={idx}
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
              <div className="fm-google-divider">
                <span>or use a new Google account</span>
              </div>
            </div>
          )}

          <div className="fm-google-custom-actions">
            <button
              type="button"
              className="google-btn-back"
              onClick={closeGoogleAuth}
            >
              Cancel
            </button>
            <button type="button" className="google-btn-submit" onClick={handleCustomSubmit}>
              Continue to Google
            </button>
          </div>
        </div>

        <div className="fm-google-footer">
          <span> Protected by Google OAuth 2.0 Security Sandbox</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleSignInModal;
