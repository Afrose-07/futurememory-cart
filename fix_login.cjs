const fs = require('fs');
let c = fs.readFileSync('src/pages/LoginPage.jsx', 'utf8');

const newVerifyUI = `
  const [enrollmentStep, setEnrollmentStep] = useState(() => {
    const enrolledStr = localStorage.getItem('adminFingerprints');
    const enrolled = enrolledStr ? JSON.parse(enrolledStr) : [];
    return enrolled.length >= 2 ? 'done' : 'setup-index';
  });

  // Admin Verification Logic
  const handleFingerprintScan = () => {
    if (scanStatus === 'scanning') return;
    setScanStatus('scanning');
    setError('');
    
    setTimeout(() => {
      if (enrollmentStep === 'setup-index') {
          const current = JSON.parse(localStorage.getItem('adminFingerprints') || '[]');
          if (!current.includes('owner1')) current.push('owner1');
          localStorage.setItem('adminFingerprints', JSON.stringify(current));
          setScanStatus('success');
          setTimeout(() => {
              setEnrollmentStep('setup-thumb');
              setScanStatus('idle');
          }, 1000);
      } else if (enrollmentStep === 'setup-thumb') {
          const current = JSON.parse(localStorage.getItem('adminFingerprints') || '[]');
          if (!current.includes('owner2')) current.push('owner2');
          localStorage.setItem('adminFingerprints', JSON.stringify(current));
          setScanStatus('success');
          setTimeout(() => {
              setEnrollmentStep('done');
              setScanStatus('idle');
              // Automatically login after setup
              finalizeAdminLogin();
          }, 1000);
      } else {
          // Login Mode
          const enrolled = JSON.parse(localStorage.getItem('adminFingerprints') || '[]');
          if (enrolled.length >= 2) {
              setScanStatus('success');
              setTimeout(() => finalizeAdminLogin(), 800);
          } else {
              setScanStatus('error');
              setError('Biometric data corrupted. Please use PIN.');
              setTimeout(() => setScanStatus('idle'), 2000);
          }
      }
    }, 1500);
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinCode !== '260107') {
      setError('Incorrect Security PIN. Access Denied.');
      return;
    }
    finalizeAdminLogin();
  };

  const finalizeAdminLogin = async () => {
    if (pendingAdminData.type === 'email') {
      const res = await loginAdmin(pendingAdminData.data.email, pendingAdminData.data.password);
      if (res.success) navigate('/admin', { replace: true });
      else setError('Admin authentication failed.');
    } else {
      const res = await loginAdminWithGoogle(pendingAdminData.data);
      if (res.success) navigate('/admin', { replace: true });
      else setError('Admin Google authentication failed.');
    }
  };

  if (adminVerification) {
    return (
      <div className="fm-auth-page-wrapper" style={{ background: '#0f172a' }}>
        <div className="fm-auth-clean-card" style={{ maxWidth: 'clamp(400px, 25vw, 600px)', textAlign: 'center', background: '#1e293b', border: '1px solid #334155' }}>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#f8fafc', marginBottom: '8px' }}>Security Verification</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Authenticate to access Master Console</p>
          </div>
          
          {error && <div className="fm-auth-alert-box" style={{ background: '#7f1d1d', color: '#fecaca', border: 'none' }}>{error}</div>}

          {/* Sleek Fingerprint Section */}
          <div style={{ padding: '30px 20px', background: '#0f172a', borderRadius: '16px', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', marginBottom: '8px' }}>
              {enrollmentStep === 'setup-index' ? 'Biometric Setup: Index Finger' : 
               enrollmentStep === 'setup-thumb' ? 'Biometric Setup: Thumb' : 
               'Fingerprint Login'}
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '0.85rem' }}>
              {enrollmentStep === 'setup-index' ? 'Tap the scanner to register your index finger.' : 
               enrollmentStep === 'setup-thumb' ? 'Tap the scanner to register your thumb.' : 
               'Place your registered finger to authenticate.'}
            </p>

            <button 
              onClick={handleFingerprintScan}
              style={{
                width: '90px', height: '90px', borderRadius: '50%', border: 'none',
                background: scanStatus === 'success' ? '#16a34a' : scanStatus === 'error' ? '#dc2626' : scanStatus === 'scanning' ? '#2563eb' : '#1e293b',
                color: scanStatus === 'idle' ? '#3b82f6' : '#fff', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto', transition: 'all 0.3s', cursor: 'pointer',
                boxShadow: scanStatus === 'scanning' ? '0 0 25px rgba(37, 99, 235, 0.6)' : scanStatus === 'error' ? '0 0 25px rgba(220, 38, 38, 0.6)' : scanStatus === 'success' ? '0 0 25px rgba(22, 163, 74, 0.6)' : '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              <Fingerprint size={48} />
            </button>
            <p style={{ color: scanStatus === 'success' ? '#4ade80' : scanStatus === 'error' ? '#f87171' : scanStatus === 'scanning' ? '#60a5fa' : '#64748b', marginTop: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
              {scanStatus === 'success' ? (enrollmentStep === 'done' ? 'Access Granted!' : 'Finger Registered!') : 
               scanStatus === 'error' ? 'Access Denied' : 
               scanStatus === 'scanning' ? 'Scanning...' : 
               'Waiting for scanner...'}
            </p>
          </div>

          <div className="fm-clean-divider" style={{ borderColor: '#334155' }}>
            <span style={{ background: '#1e293b', color: '#64748b' }}>OR USE PIN</span>
          </div>

          {/* PIN Section */}
          <form onSubmit={handlePinSubmit} style={{ marginTop: '24px' }}>
            <div className="fm-clean-input-wrap" style={{ background: '#0f172a', border: '1px solid #334155' }}>
              <span className="fm-field-icon" style={{ color: '#64748b' }}><Lock size={18} /></span>
              <input
                type="password"
                className="fm-clean-input"
                style={{ color: '#f8fafc', letterSpacing: '8px', textAlign: 'center', fontSize: '1.2rem' }}
                value={pinCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\\D/g, '').slice(0, 6);
                  setPinCode(val);
                  setError('');
                }}
                placeholder="6-DIGIT PIN"
                maxLength={6}
              />
            </div>
            <button type="submit" className="fm-btn-clean-primary" style={{ marginTop: '16px', width: '100%', background: '#3b82f6', color: '#fff' }}>
              Verify PIN
            </button>
          </form>

          <button onClick={() => setAdminVerification(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', marginTop: '24px', cursor: 'pointer' }}>
            Cancel Verification
          </button>
        </div>
      </div>
    );
  }
`;

const regex = /\/\/ Admin Verification Logic[\s\S]*Cancel Verification\s*<\/button>\s*<\/div>\s*<\/div>\s*\);\s*\}/;

if (!regex.test(c)) {
  console.log('Regex did not match!');
} else {
  c = c.replace(regex, newVerifyUI);
  c = c.replace(/const \[scanStatus, setScanStatus\] = useState\('idle'\);/, "const [scanStatus, setScanStatus] = useState('idle');\n" + 
                "  const [enrollmentStep, setEnrollmentStep] = useState(() => {\n" +
                "    const enrolledStr = localStorage.getItem('adminFingerprints');\n" +
                "    const enrolled = enrolledStr ? JSON.parse(enrolledStr) : [];\n" +
                "    return enrolled.length >= 2 ? 'done' : 'setup-index';\n" +
                "  });");
  
  // Clean up duplicate state declaration
  c = c.replace(/const \[enrollmentStep, setEnrollmentStep\] = useState\([\s\S]*?\}\);\s*\/\/ Admin Verification Logic/, "// Admin Verification Logic");
  fs.writeFileSync('src/pages/LoginPage.jsx', c);
  console.log('Successfully updated Login Page');
}
