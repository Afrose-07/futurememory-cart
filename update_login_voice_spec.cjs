const fs = require('fs');

const loginPath = 'src/pages/AdminLoginPage.jsx';
let content = fs.readFileSync(loginPath, 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Update PIN check from 0707 to 260107
content = content.replace(
  `if (pin !== '0707') {`,
  `if (pin !== '260107') {`
);

// 2. Replace Step 2 biometric section with the user's exact specification
const oldStep2Container = `<div className="admin-2fa-container" style={{ padding: '16px 0', textAlign: 'center' }}>
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

const newStep2Container = `<div className="admin-2fa-container" style={{ padding: '16px 0', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '6px', color: 'var(--primary-color)', fontSize: '1.25rem' }}>Biometric & PIN Verification</h3>
            <p style={{ marginBottom: '18px', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              Scan your enrolled admin fingerprint or use 6-digit Security PIN to access the dashboard.
            </p>

            {/* Error / Status Alert */}
            {formError && (
              <div className="admin-login-alert" style={{ marginBottom: '18px', background: formError.includes('Enrolled') ? '#f0fdf4' : '#fef2f2', border: \`1px solid \${formError.includes('Enrolled') ? '#bbf7d0' : '#fecaca'}\`, color: formError.includes('Enrolled') ? '#166534' : '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span>{formError.includes('Enrolled') ? '✅' : '⚠️'}</span>
                <strong>{formError}</strong>
              </div>
            )}

            {/* Fingerprints Enrollment & Scanning */}
            {(() => {
              const enrolled = JSON.parse(localStorage.getItem('adminFingerprints') || '["fp1", "fp2"]');
              const isFp1Enrolled = enrolled.includes('fp1') || enrolled.includes('owner1');
              const isFp2Enrolled = enrolled.includes('fp2') || enrolled.includes('owner2');

              const authenticateSuccess = () => {
                setFormError('');
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
              };

              const enrollFingerprint = (fpId, fpLabel) => {
                const current = JSON.parse(localStorage.getItem('adminFingerprints') || '[]');
                if (!current.includes(fpId)) current.push(fpId);
                localStorage.setItem('adminFingerprints', JSON.stringify(current));
                setFormError(\`\${fpLabel} successfully enrolled! Click to scan & verify.\`);
              };

              return (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '22px', flexWrap: 'wrap' }}>
                  {/* Fingerprint 1 */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (isFp1Enrolled) authenticateSuccess();
                        else enrollFingerprint('fp1', 'Fingerprint 1');
                      }}
                      style={{
                        background: isFp1Enrolled ? '#f0fdf4' : '#f8fafc',
                        border: isFp1Enrolled ? '2px solid #22c55e' : '2px dashed #94a3b8',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        minWidth: '130px',
                        boxShadow: isFp1Enrolled ? '0 2px 8px rgba(34,197,94,0.15)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: '2rem' }}>🔑</span>
                      <strong style={{ fontSize: '0.84rem', color: isFp1Enrolled ? '#15803d' : '#334155' }}>Fingerprint 1</strong>
                      <span style={{ fontSize: '0.72rem', color: isFp1Enrolled ? '#16a34a' : '#64748b' }}>
                        {isFp1Enrolled ? '✓ Scan to Enter' : '+ Set / Enroll'}
                      </span>
                    </button>
                  </div>

                  {/* Fingerprint 2 */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (isFp2Enrolled) authenticateSuccess();
                        else enrollFingerprint('fp2', 'Fingerprint 2');
                      }}
                      style={{
                        background: isFp2Enrolled ? '#f0fdf4' : '#f8fafc',
                        border: isFp2Enrolled ? '2px solid #22c55e' : '2px dashed #94a3b8',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        minWidth: '130px',
                        boxShadow: isFp2Enrolled ? '0 2px 8px rgba(34,197,94,0.15)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: '2rem' }}>🔑</span>
                      <strong style={{ fontSize: '0.84rem', color: isFp2Enrolled ? '#15803d' : '#334155' }}>Fingerprint 2</strong>
                      <span style={{ fontSize: '0.72rem', color: isFp2Enrolled ? '#16a34a' : '#64748b' }}>
                        {isFp2Enrolled ? '✓ Scan to Enter' : '+ Set / Enroll'}
                      </span>
                    </button>
                  </div>

                  {/* Stranger Fingerprint -> ACCESS DENIED */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
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
                        minWidth: '130px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: '2rem' }}>🖐️</span>
                      <strong style={{ fontSize: '0.84rem', color: '#b91c1c' }}>Stranger Finger</strong>
                      <span style={{ fontSize: '0.72rem', color: '#dc2626' }}>Access Denied Test</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* 6-digit PIN fallback */}
            <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                Or enter 6-Digit Master Security PIN (<strong>260107</strong>)
              </span>
              <form onSubmit={handlePinSubmit} style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\\D/g, '').slice(0, 6))}
                  placeholder="260107"
                  style={{ width: '120px', textAlign: 'center', letterSpacing: '4px', fontSize: '1.1rem', padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: '700' }}
                />
                <button
                  type="submit"
                  className="btn-admin-submit"
                  disabled={loading || pin.length !== 6}
                  style={{ padding: '7px 18px', fontSize: '0.85rem' }}
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

if (content.includes(oldStep2Container)) {
  content = content.replace(oldStep2Container, newStep2Container);
  console.log('Replaced Step 2 container with user voice specifications!');
} else {
  console.log('Could not match oldStep2Container exactly');
}

fs.writeFileSync(loginPath, content, 'utf8');
console.log('AdminLoginPage.jsx updated successfully!');
