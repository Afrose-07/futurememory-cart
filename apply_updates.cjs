const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');

// 1. Inject State and Effect for Theme
const stateInjection = `  const [adminTheme, setAdminTheme] = useState(() => localStorage.getItem('adminTheme') || 'light');
  const [adminAccent, setAdminAccent] = useState(() => localStorage.getItem('adminAccent') || '#a855f7');

  useEffect(() => {
    localStorage.setItem('adminTheme', adminTheme);
    localStorage.setItem('adminAccent', adminAccent);
    if(adminTheme === 'dark') {
       document.documentElement.setAttribute('data-theme', 'dark');
       document.body.style.backgroundColor = '#0f172a';
       document.body.style.color = '#f8fafc';
    } else {
       document.documentElement.removeAttribute('data-theme');
       document.body.style.backgroundColor = '#f8fafc';
       document.body.style.color = '#0f172a';
    }
    document.documentElement.style.setProperty('--primary-color', adminAccent);
  }, [adminTheme, adminAccent]);`;

c = c.replace(/const \[scanStatus, setScanStatus\] = useState\('idle'\);/, 'const [scanStatus, setScanStatus] = useState(\'idle\');\n' + stateInjection);

// 2. Fix the Settings UI for Theme & Color
c = c.replace(/<select className=\"zestro-modal-input\" defaultValue=\"light\">/, '<select className=\"zestro-modal-input\" value={adminTheme} onChange={(e) => setAdminTheme(e.target.value)}>');
c = c.replace(/\{\['var\(--primary-color\)', '#ea4335', '#25d366', '#f59e0b', '#ec4899', '#0ea5e9'\]\.map\(color => \(/, "{['#a855f7', '#ea4335', '#25d366', '#f59e0b', '#ec4899', '#0ea5e9'].map(color => (");
c = c.replace(/<div key=\{color\} style=\{\{ width: '30px', height: '30px', borderRadius: '50%', background: color, cursor: 'pointer', border: color === 'var\(--primary-color\)' \? '3px solid #cbd5e1' : 'none' \}\}><\/div>/, "<div key={color} onClick={() => setAdminAccent(color)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: color, cursor: 'pointer', border: color === adminAccent ? '3px solid #64748b' : 'none' }}></div>");

// 3. Remove SMS Field
c = c.replace(/<div className=\"z-form-group\">\s*<label>TextBelt SMS Webhook URL<\/label>\s*<input type=\"url\" placeholder=\"https:\/\/textbelt\.com\/text\" className=\"zestro-modal-input\" \/>\s*<\/div>/, "");
c = c.replace(/browser notifications will be used for SMS & WhatsApp/, "browser notifications will be used for WhatsApp");

// 4. Add WhatsApp & Email buttons to Customers Table
const actionReplacement = `
                              <a href={\`mailto:\${c.email}\`} style={{ textDecoration: 'none' }}>
                                <button className="btn-z-edit" style={{ background: '#dbeafe', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                                  ✉️ Email
                                </button>
                              </a>
                              <a href={\`https://wa.me/\${c.mobile?.replace(/\\D/g,'') || ''}\`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                <button className="btn-z-edit" style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                                  💬 WA
                                </button>
                              </a>
                              <button
                                className="btn-z-edit"
`;
c = c.replace(/<button\s*className=\"btn-z-edit\"/, actionReplacement.trim());

fs.writeFileSync('src/pages/AdminDashboardPage.jsx', c);
console.log('Fixed themes, removed SMS, added WhatsApp/Email');
