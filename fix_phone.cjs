const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');
c = c.replace(/<td>\{c\.mobile[^}]*\}<\/td>/g, '<td>{c.mobile || "Not Provided"}</td>');
fs.writeFileSync('src/pages/AdminDashboardPage.jsx', c);
console.log('Fixed phone format');
