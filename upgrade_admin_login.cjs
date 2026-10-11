const fs = require('fs');

// ==========================================
// 1. UPDATE AdminLoginPage.jsx
// ==========================================
let loginCode = fs.readFileSync('src/pages/AdminLoginPage.jsx', 'utf8');

// Replace the step 2 container in AdminLoginPage.jsx
const oldStep2Target = `<div className="admin-2fa-container" style={{ padding: '20px 0', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Fingerprint Verification</h3>
            <p style={{ marginBottom: '25px', color: 'var(--text-muted)' }}>Scan your registered fingerprint to authenticate as Master Admin.</p>
            
            {/* Error Alert */}
            {formError && (
              <div className="admin-login-alert" style={{ marginBottom: '20px' }}>
                <span className="alert-icon">️</span>
                <span>{formError}</span>
              </div>
            )}

            <div 
              style={{
                width: '100px',
                height: '100px',
                margin: '0 auto 20px',
                borderRadius: '50%',
                border: '3px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: '#f8fafc',
                boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                // Mocking the fingerprint scan success
                setFormError('');
                if (pendingLogin.type === 'email') {
                  loginAdmin(pendingLogin.data.cleanEmail, pendingLogin.data.cleanPassword)
                    .then(res => {
                      if (res.success) navigate(from, { replace: true });
                      else setFormError(res.message || 'Invalid admin credentials.');
                    });
                } else if (pendingLogin.type === 'google') {
                  loginAdminWithGoogle(pendingLogin.data)
                    .then(res => {
                      if (res.success) navigate(from, { replace: true });
                      else setFormError(res.message || 'Google authentication failed.');
                    });
                }
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
            >
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 12v.01" />
                <path d="M17.5 12c0 2.5-2 4.5-4.5 4.5h-1a1.5 1.5 0 0 1-1.5-1.5V10a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v2" />
                <path d="M22 12a10 10 0 0 0-20 0" />
                <path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12" />
                <path d="M22 12v3" />
                <path d="M2 12v3" />
                <path d="M12 22a10 10 0 0 0 10-10" />
                <path d="M12 22c-5.5 0-10-4.5-10-10" />
              </svg>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Click the scanner icon to simulate fingerprint scan</p>
              <button
                type="submit"
                className="btn-admin-submit"
                disabled={loading || pin.length !== 4}
              >
                {loading ? (
                  <span className="btn-loading-content">
                    <span className="spinner-dot" /> Authorizing...
                  </span>
                ) : (
                  <span>Authorize & Enter Admin Panel →</span>
                )}
              </button>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', marginTop: '20px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                ← Go back
              </button>
          </div>`;

const newStep2Replacement = `<div className="admin-2fa-container" style={{ padding: '16px 0', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '8px', color: 'var(--primary-color)', fontSize: '1.25rem' }}>Biometric Verification</h3>
            <p style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Authenticate with your registered biometric fingerprint to unlock Master Console.
            </p>

            {/* Error Alert */}
            {formError && (
              <div className="admin-login-alert" style={{ marginBottom: '20px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span>⚠️</span>
                <strong>{formError}</strong>
              </div>
            )}

            {/* Biometric Scanner Visual */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {/* Registered Index Finger */}
              <button
                type="button"
                onClick={() => {
                  setFormError('');
                  const enrolled = JSON.parse(localStorage.getItem('adminFingerprints') || '["owner1", "owner2"]');
                  if (enrolled.includes('owner1')) {
                    if (pendingLogin.type === 'email') {
                      loginAdmin(pendingLogin.data.cleanEmail, pendingLogin.data.cleanPassword)
                        .then(res => {
                          if (res.success) navigate(from, { replace: true });
                          else setFormError(res.message || 'Authentication error.');
                        });
                    } else {
                      loginAdminWithGoogle(pendingLogin.data)
                        .then(res => {
                          if (res.success) navigate(from, { replace: true });
                          else setFormError(res.message || 'Google Auth error.');
                        });
                    }
                  } else {
                    setFormError('Index finger not enrolled yet. Please enroll in Store Settings.');
                  }
                }}
                style={{
                  background: '#f8fafc',
                  border: '2px solid #22c55e',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(34,197,94,0.12)',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '2rem' }}>☝️</span>
                <strong style={{ fontSize: '0.85rem', color: '#15803d' }}>Index Finger</strong>
                <span style={{ fontSize: '0.72rem', color: '#16a34a' }}>Registered Access</span>
              </button>

              {/* Registered Thumb */}
              <button
                type="button"
                onClick={() => {
                  setFormError('');
                  const enrolled = JSON.parse(localStorage.getItem('adminFingerprints') || '["owner1", "owner2"]');
                  if (enrolled.includes('owner2')) {
                    if (pendingLogin.type === 'email') {
                      loginAdmin(pendingLogin.data.cleanEmail, pendingLogin.data.cleanPassword)
                        .then(res => {
                          if (res.success) navigate(from, { replace: true });
                          else setFormError(res.message || 'Authentication error.');
                        });
                    } else {
                      loginAdminWithGoogle(pendingLogin.data)
                        .then(res => {
                          if (res.success) navigate(from, { replace: true });
                          else setFormError(res.message || 'Google Auth error.');
                        });
                    }
                  } else {
                    setFormError('Thumb not enrolled yet. Please enroll in Store Settings.');
                  }
                }}
                style={{
                  background: '#f8fafc',
                  border: '2px solid #22c55e',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(34,197,94,0.12)',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '2rem' }}>👍</span>
                <strong style={{ fontSize: '0.85rem', color: '#15803d' }}>Thumb</strong>
                <span style={{ fontSize: '0.72rem', color: '#16a34a' }}>Registered Access</span>
              </button>

              {/* Stranger Fingerprint -> ACCESS DENIED */}
              <button
                type="button"
                onClick={() => {
                  setFormError('Access Denied! Unrecognized stranger biometric pattern. Authentication failed.');
                }}
                style={{
                  background: '#fef2f2',
                  border: '2px dashed #ef4444',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '2rem' }}>🖐️</span>
                <strong style={{ fontSize: '0.85rem', color: '#b91c1c' }}>Stranger Finger</strong>
                <span style={{ fontSize: '0.72rem', color: '#dc2626' }}>Simulate Unauthorized</span>
              </button>
            </div>

            {/* Optional 4-digit PIN fallback */}
            <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '8px' }}>Or enter 4-Digit Security PIN (0707)</span>
              <form onSubmit={handlePinSubmit} style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\\D/g, '').slice(0, 4))}
                  placeholder="PIN"
                  style={{ width: '80px', textAlign: 'center', letterSpacing: '4px', fontSize: '1.1rem', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                <button
                  type="submit"
                  className="btn-admin-submit"
                  disabled={loading || pin.length !== 4}
                  style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                >
                  Verify PIN →
                </button>
              </form>
            </div>

            <button 
              type="button" 
              onClick={() => setStep(1)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', marginTop: '20px', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}
            >
              ← Back to Login Credentials
            </button>
          </div>`;

loginCode = loginCode.replace(/\r\n/g, '\n');
const cleanOldStep2 = oldStep2Target.replace(/\r\n/g, '\n');
if (loginCode.includes(cleanOldStep2)) {
  loginCode = loginCode.replace(cleanOldStep2, newStep2Replacement);
  fs.writeFileSync('src/pages/AdminLoginPage.jsx', loginCode, 'utf8');
  console.log('Successfully updated AdminLoginPage.jsx with Biometric & Stranger access controls!');
} else {
  console.log('cleanOldStep2 not matched exactly in AdminLoginPage.jsx');
}
