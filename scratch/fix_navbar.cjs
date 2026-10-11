const fs = require('fs');
let f = fs.readFileSync('src/components/Navbar.jsx', 'utf8');
f = f.replace(/ta: \{ flag: '', label: '.*?' \}/, "ta: { flag: '', label: 'தமிழ்' }");
f = f.replace(/kn: \{ flag: '', label: '.*?' \}/, "kn: { flag: '', label: 'ಕನ್ನಡ' }");
f = f.replace(/te: \{ flag: '', label: '.*?' \}/, "te: { flag: '', label: 'తెలుగు' }");
fs.writeFileSync('src/components/Navbar.jsx', f);
console.log('Fixed Navbar.jsx');
