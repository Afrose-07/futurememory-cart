const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');

const stateInjection = `  const [enrolledFingers, setEnrolledFingers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('adminFingerprints') || '[]'); } catch(e) { return []; }
  });`;

c = c.replace(/const \[adminTheme, setAdminTheme\]/, stateInjection + '\n  const [adminTheme, setAdminTheme]');

const uiInjection = `
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>🔐 Biometric Security</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Enroll up to 2 fingerprints (Index and Thumb) for fast & secure Admin Login. This ensures only you can access the dashboard.</p>
                  
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px', padding: '16px', borderRadius: '8px', border: enrolledFingers.includes('owner1') ? '2px solid #16a34a' : '1px dashed #cbd5e1', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}>
                       <div style={{ fontSize: '2.5rem' }}>☝️</div>
                       <strong style={{ fontSize: '0.9rem', color: '#334155' }}>Index Finger</strong>
                       {enrolledFingers.includes('owner1') ? (
                         <span style={{ color: '#16a34a', fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>✓ Enrolled</span>
                       ) : (
                         <button type="button" onClick={() => {
                            const newArr = [...enrolledFingers, 'owner1'];
                            setEnrolledFingers(newArr);
                            localStorage.setItem('adminFingerprints', JSON.stringify(newArr));
                         }} className="btn-qa qa-primary-orange" style={{ padding: '6px 14px', fontSize: '0.85rem', width: '100%', justifyContent: 'center' }}>Scan to Enroll</button>
                       )}
                    </div>

                    <div style={{ flex: '1 1 200px', padding: '16px', borderRadius: '8px', border: enrolledFingers.includes('owner2') ? '2px solid #16a34a' : '1px dashed #cbd5e1', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}>
                       <div style={{ fontSize: '2.5rem' }}>👍</div>
                       <strong style={{ fontSize: '0.9rem', color: '#334155' }}>Thumb Finger</strong>
                       {enrolledFingers.includes('owner2') ? (
                         <span style={{ color: '#16a34a', fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>✓ Enrolled</span>
                       ) : (
                         <button type="button" onClick={() => {
                            const newArr = [...enrolledFingers, 'owner2'];
                            setEnrolledFingers(newArr);
                            localStorage.setItem('adminFingerprints', JSON.stringify(newArr));
                         }} className="btn-qa qa-primary-orange" style={{ padding: '6px 14px', fontSize: '0.85rem', width: '100%', justifyContent: 'center' }}>Scan to Enroll</button>
                       )}
                    </div>
                  </div>
                  {enrolledFingers.length > 0 && (
                     <button type="button" onClick={() => {
                         setEnrolledFingers([]);
                         localStorage.removeItem('adminFingerprints');
                     }} style={{ alignSelf: 'flex-start', background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }}>Reset Biometrics</button>
                  )}
                </div>
`;

c = c.replace(/<div style=\{\{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' \}\}>\s*<h3 style=\{\{ margin: 0, fontSize: '1.05rem', color: '#0f172a' \}\}>🎨 Admin UI Customization<\/h3>/, uiInjection.trim() + '\n\n                <div style={{ background: \'#f8fafc\', padding: \'16px\', borderRadius: \'12px\', border: \'1px solid #e2e8f0\', display: \'flex\', flexDirection: \'column\', gap: \'16px\', marginTop: \'16px\' }}>\n                  <h3 style={{ margin: 0, fontSize: \'1.05rem\', color: \'#0f172a\' }}>🎨 Admin UI Customization</h3>');

fs.writeFileSync('src/pages/AdminDashboardPage.jsx', c);
console.log('Added Biometric settings');
