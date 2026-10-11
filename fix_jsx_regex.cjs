const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');

c = c.replace(/\{o\.status !== 'Delivered' && \([\s\S]*?\{o\.status !== 'Cancelled' && \(/, `{o.status !== 'Delivered' && (
                                <button
                                  className="btn-z-edit"
                                  onClick={() => markAsDelivered(o.orderId)}
                                  style={{ background: '#dcfce7', color: '#15803d', borderColor: '#86efac' }}
                                >
                                   Deliver
                                </button>
                              )}
                              {o.status !== 'Cancelled' && (`);

// Let's also check if there are other syntax errors in AdminDashboardPage
// Search for <a href={`mailto:${c.email}`} inside the file
c = c.replace(/\{fpo\.status !== 'Cancelled' && \([\s\S]*?<\/div>\s*<\/td>/, `{fpo.status !== 'Cancelled' && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="btn-z-edit"
                                onClick={() => alert(\`Reminder notification sent to \${fpo.customerName} for \${fpo.occasion}!\`)}
                              >
                                 Send Reminder
                              </button>
                              <button
                                className="btn-qa qa-primary-orange"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                onClick={() => alert(\`Pre-order #\${fpo.id} transitioned to active packing queue.\`)}
                              >
                                 Stage Now
                              </button>
                            </div>
                          )}
                        </td>`);

fs.writeFileSync('src/pages/AdminDashboardPage.jsx', c);
console.log('Fixed JSX syntax error regex via file');
