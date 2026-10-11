const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');

const target = `                              {o.status !== 'Delivered' && (
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
                                  onClick={() => markAsDelivered(o.orderId)}
                                  style={{ background: '#dcfce7', color: '#15803d', borderColor: '#86efac' }}
                                >
                                   Deliver
                                </button>
                              )}`;

const replace = `                              {o.status !== 'Delivered' && (
                                <button
                                  className="btn-z-edit"
                                  onClick={() => markAsDelivered(o.orderId)}
                                  style={{ background: '#dcfce7', color: '#15803d', borderColor: '#86efac' }}
                                >
                                   Deliver
                                </button>
                              )}`;

c = c.replace(target, replace);

// Also need to revert any other accidental replacements!
// Let's check if the Cancel button was replaced too!
const target2 = `                              {o.status !== 'Cancelled' && (
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
                                className="btn-z-delete"`;

const replace2 = `                              {o.status !== 'Cancelled' && (
                                <button
                                  className="btn-z-delete"`;

c = c.replace(target2, replace2);

// Check if Future Pre Orders Cancel button was replaced too!
const target3 = `                              {fpo.status !== 'Cancelled' && (
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
                                className="btn-z-delete"`;

const replace3 = `                              {fpo.status !== 'Cancelled' && (
                                <button
                                  className="btn-z-delete"`;

c = c.replace(target3, replace3);

fs.writeFileSync('src/pages/AdminDashboardPage.jsx', c);
console.log('Fixed JSX syntax error');
