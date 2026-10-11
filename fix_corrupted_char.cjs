const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');
c = c.replace(/<td>\{c\.mobile \|\| ''\}<\/td>/g, '<td>{c.mobile || \'-\'}</td>');
c = c.replace(//g, '-');
fs.writeFileSync('src/pages/AdminDashboardPage.jsx', c);
console.log('Fixed replacement');
