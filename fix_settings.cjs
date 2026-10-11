const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');

c = c.replace(/<h2 style=\{\{ margin: 0, fontSize: '1\.25rem', fontWeight: 850 \}\}>\? FutureMemory Cart Store Configuration<\/h2>/g, `<h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850 }}>⚙️ FutureMemory Cart Store Configuration</h2>`);

c = c.replace(/<input\s*type="text"\s*value=\{storeSettings\.storeName\}/g, `<input
                      className="zestro-modal-input"
                      type="text"
                      value={storeSettings.storeName}`);
                      
c = c.replace(/<input\s*type="email"\s*value=\{storeSettings\.supportEmail\}/g, `<input
                      className="zestro-modal-input"
                      type="email"
                      value={storeSettings.supportEmail}`);
                      
c = c.replace(/<input\s*type="number"\s*value=\{storeSettings\.freeShippingThreshold\}/g, `<input
                        className="zestro-modal-input"
                        type="number"
                        value={storeSettings.freeShippingThreshold}`);
                        
c = c.replace(/<input\s*type="number"\s*value=\{storeSettings\.returnWindowDays\}/g, `<input
                        className="zestro-modal-input"
                        type="number"
                        value={storeSettings.returnWindowDays}`);
                        
c = c.replace(/gridTemplateColumns: '1fr 1fr'/g, `gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'`);
c = c.replace(/<input type="password" placeholder="sk_test_" className="zestro-modal-input" \/>/g, `<input type="password" placeholder="sk_test_..." className="zestro-modal-input" />`);

fs.writeFileSync('src/pages/AdminDashboardPage.jsx', c);
console.log('Fixed Settings UI');
