const fs = require('fs');

// --- Modifying LoginPage.jsx ---
let lp = fs.readFileSync('src/pages/LoginPage.jsx', 'utf8');

const fpLogicReplacement = `
  const handleFingerprintScan = (type) => {
    setScanStatus('scanning');
    setError('');
    
    // Check enrolled fingerprints
    const enrolledStr = localStorage.getItem('adminFingerprints');
    const enrolled = enrolledStr ? JSON.parse(enrolledStr) : [];
    
    setTimeout(() => {
      if (type === 'stranger') {
         setScanStatus('error');
         setError('Biometric mismatch. Unrecognized fingerprint.');
         setTimeout(() => setScanStatus('idle'), 2000);
      } else if (type === 'owner1' || type === 'owner2') {
         if (enrolled.includes(type)) {
             setScanStatus('success');
             setTimeout(() => finalizeAdminLogin(), 800);
         } else {
             setScanStatus('error');
             setError('This finger has not been enrolled in Admin Settings.');
             setTimeout(() => setScanStatus('idle'), 2000);
         }
      } else {
         // Default fallback if no type passed
         if (enrolled.length > 0) {
            setScanStatus('error');
            setError('Please select which finger you are scanning.');
            setTimeout(() => setScanStatus('idle'), 2000);
         } else {
            setScanStatus('error');
            setError('No fingerprints enrolled. Please use PIN to login and enroll in settings.');
            setTimeout(() => setScanStatus('idle'), 3000);
         }
      }
    }, 1500);
  };
`;

lp = lp.replace(/const handleFingerprintScan = \(\) => \{[\s\S]*?\}, 2000\);\n  \};/, fpLogicReplacement.trim());

const fpUIReplacement = `
          {/* Fingerprint Section */}
          <div style={{ padding: '20px', background: '#0f172a', borderRadius: '16px', marginBottom: '24px' }}>
            <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '0.85rem' }}>Biometric Sensor Simulation</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
               <button onClick={() => handleFingerprintScan('owner1')} style={{ padding: '6px 12px', background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>Scan Index Finger</button>
               <button onClick={() => handleFingerprintScan('owner2')} style={{ padding: '6px 12px', background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>Scan Thumb</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
               <button onClick={() => handleFingerprintScan('stranger')} style={{ padding: '6px 12px', background: '#450a0a', border: '1px solid #7f1d1d', color: '#fca5a5', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>Scan Stranger's Finger</button>
            </div>

            <div 
              style={{
                width: '80px', height: '80px', borderRadius: '50%', border: 'none',
                background: scanStatus === 'success' ? '#16a34a' : scanStatus === 'error' ? '#dc2626' : scanStatus === 'scanning' ? '#2563eb' : '#334155',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto', transition: 'all 0.3s',
                boxShadow: scanStatus === 'scanning' ? '0 0 20px rgba(37, 99, 235, 0.5)' : scanStatus === 'error' ? '0 0 20px rgba(220, 38, 38, 0.5)' : 'none'
              }}
            >
              <Fingerprint size={40} />
            </div>
            <p style={{ color: scanStatus === 'success' ? '#4ade80' : scanStatus === 'error' ? '#f87171' : scanStatus === 'scanning' ? '#60a5fa' : '#475569', marginTop: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
              {scanStatus === 'success' ? 'Verified!' : scanStatus === 'error' ? 'Access Denied' : scanStatus === 'scanning' ? 'Scanning...' : 'Awaiting Biometrics'}
            </p>
          </div>
`;

lp = lp.replace(/\{\/\* Fingerprint Section \*\/\}\n\s*<div[\s\S]*?Awaiting Biometrics'\}\n\s*<\/p>\n\s*<\/div>/, fpUIReplacement.trim());

fs.writeFileSync('src/pages/LoginPage.jsx', lp);

// --- Modifying AdminDashboardPage.jsx ---
let adp = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');

const fingerprintSettingsUI = `
            {/* Biometric Settings */}
            <div className="z-settings-group" style={{ marginTop: '30px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🧬</span> Biometric Authentication
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>Enroll up to 2 fingerprints to securely access the master console.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                 <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>☝️</div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem' }}>Index Finger</h4>
                    {(() => {
                       const enrolled = JSON.parse(localStorage.getItem('adminFingerprints') || '[]');
                       const isEnrolled = enrolled.includes('owner1');
                       return (
                          <button 
                             onClick={() => {
                                 let arr = [...enrolled];
                                 if (isEnrolled) arr = arr.filter(x => x !== 'owner1');
                                 else arr.push('owner1');
                                 localStorage.setItem('adminFingerprints', JSON.stringify(arr));
                                 alert(isEnrolled ? 'Index Finger removed.' : 'Index Finger successfully enrolled!');
                                 window.location.reload();
                             }}
                             style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: isEnrolled ? '#fee2e2' : '#dbeafe', color: isEnrolled ? '#dc2626' : '#2563eb', fontWeight: 600, cursor: 'pointer', width: '100%' }}
                          >
                             {isEnrolled ? 'Remove Fingerprint' : 'Enroll Index Finger'}
                          </button>
                       )
                    })()}
                 </div>

                 <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👍</div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem' }}>Thumb</h4>
                    {(() => {
                       const enrolled = JSON.parse(localStorage.getItem('adminFingerprints') || '[]');
                       const isEnrolled = enrolled.includes('owner2');
                       return (
                          <button 
                             onClick={() => {
                                 let arr = [...enrolled];
                                 if (isEnrolled) arr = arr.filter(x => x !== 'owner2');
                                 else arr.push('owner2');
                                 localStorage.setItem('adminFingerprints', JSON.stringify(arr));
                                 alert(isEnrolled ? 'Thumb removed.' : 'Thumb successfully enrolled!');
                                 window.location.reload();
                             }}
                             style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: isEnrolled ? '#fee2e2' : '#dbeafe', color: isEnrolled ? '#dc2626' : '#2563eb', fontWeight: 600, cursor: 'pointer', width: '100%' }}
                          >
                             {isEnrolled ? 'Remove Fingerprint' : 'Enroll Thumb'}
                          </button>
                       )
                    })()}
                 </div>
              </div>
            </div>
`;

adp = adp.replace(/(<div className="z-settings-group">\s*<h3 style=\{\{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#0f172a' \}\}>🎨 Admin UI Customization<\/h3>[\s\S]*?<\/div>\s*)(<\/div>\s*<\/div>\s*\}\s*<\/div>\s*<\/div>\s*<\/div>)/, '$1\n' + fingerprintSettingsUI + '\n$2');

fs.writeFileSync('src/pages/AdminDashboardPage.jsx', adp);
console.log('Successfully updated fingerprint logic');
