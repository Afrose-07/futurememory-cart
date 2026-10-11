const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');

// 1. Replace broken currency symbol in settings
c = c.replace(/currency:\s*'\?\s*INR'/g, "currency: '₹ INR'");

// 2. Fix all '?' marks in headings
c = c.replace(/<h2>\?\s*Products Catalog/g, '<h2>📦 Products Catalog');
c = c.replace(/<h2>\?\s*Verified Sellers/g, '<h2>🏢 Verified Sellers');
c = c.replace(/<h2>\?\s*Offers, Promo Codes/g, '<h2>🎟️ Offers, Promo Codes');

// 3. Fix Sidebar Navigation Icons
c = c.replace(
  `<span className="nav-icon"></span>\n                <span>Executive Overview</span>`,
  `<span className="nav-icon">📊</span>\n                <span>Executive Overview</span>`
);
c = c.replace(
  `<span className="nav-icon"></span>\n                <span>Orders Master</span>`,
  `<span className="nav-icon">🛒</span>\n                <span>Orders Master</span>`
);
c = c.replace(
  `<span className="nav-icon"></span>\n                <span>7-days Returns</span>`,
  `<span className="nav-icon">🔄</span>\n                <span>7-days Returns</span>`
);
c = c.replace(
  `<span className="nav-icon"></span>\n                <span>Occasion Collections</span>`,
  `<span className="nav-icon">🎉</span>\n                <span>Occasion Collections</span>`
);
c = c.replace(
  `<span className="nav-icon">📦</span>\n                <span>Brands & Sellers</span>`,
  `<span className="nav-icon">🏢</span>\n                <span>Brands & Sellers</span>`
);
c = c.replace(
  `<span className="nav-icon"></span>\n                <span>Customers CRM</span>`,
  `<span className="nav-icon">👥</span>\n                <span>Customers CRM</span>`
);
c = c.replace(
  `<span className="nav-icon">📦</span>\n                <span>Offers & Coupons</span>`,
  `<span className="nav-icon">🎟️</span>\n                <span>Offers & Coupons</span>`
);
c = c.replace(
  `<span className="nav-icon"></span>\n                <span>Analytics & Graphs</span>`,
  `<span className="nav-icon">📈</span>\n                <span>Analytics & Graphs</span>`
);
c = c.replace(
  `<span className="nav-icon">📦</span>\n                <span>Store Settings</span>`,
  `<span className="nav-icon">⚙️</span>\n                <span>Store Settings</span>`
);

// 4. Fix Stat Card Icons
c = c.replace(
  `<div className="stat-icon-wrap orange"></div>\n                    <span className="stat-trend-tag positive">+14% vs wk</span>`,
  `<div className="stat-icon-wrap orange">🛍️</div>\n                    <span className="stat-trend-tag positive">+14% vs wk</span>`
);
c = c.replace(
  `<div className="stat-icon-wrap purple"></div>\n                    <span className="stat-trend-tag">Registered</span>`,
  `<div className="stat-icon-wrap purple">👥</div>\n                    <span className="stat-trend-tag">Registered</span>`
);
c = c.replace(
  `<div className="stat-icon-wrap pink"></div>\n                    <span className="stat-trend-tag">Active Hubs</span>`,
  `<div className="stat-icon-wrap pink">🏭</div>\n                    <span className="stat-trend-tag">Active Hubs</span>`
);
c = c.replace(
  `<div className="stat-icon-wrap orange"></div>\n                    <span className="stat-trend-tag action">Action Req.</span>`,
  `<div className="stat-icon-wrap orange">⏳</div>\n                    <span className="stat-trend-tag action">Action Req.</span>`
);

// 5. Fix Quick Actions & Date Icons
c = c.replace('<span></span>\n                    <span>Friday, September 25, 2026', '<span>📅</span>\n                    <span>Today • Live Connected');
c = c.replace('<span className="quick-actions-label"> QUICK ACTIONS</span>', '<span className="quick-actions-label">⚡ QUICK ACTIONS</span>');
c = c.replace('+ Add Product', '➕ Add Product');
c = c.replace('+ Add Customer', '➕ Add Customer');
c = c.replace('View Orders', '📋 View Orders');
c = c.replace('Pre-Orders Pipeline', '🕒 Pre-Orders Pipeline');
c = c.replace('7-days Returns (', '🔄 7-days Returns (');

// 6. Fix inventory filtering logic so it works with allProductsCatalog
const oldFilteredCatalog = `  // Filtered inventory
  const filteredCatalog = catalogItems.filter(p => {
    const matchesOccasion = selectedOccasionFilter === 'all' || p.occasionId === selectedOccasionFilter;
    const matchesSearch = p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                          p.sku.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                          p.occasionName.toLowerCase().includes(inventorySearch.toLowerCase());
    return matchesOccasion && matchesSearch;
  });`;

const newFilteredCatalog = `  // Filtered inventory
  const filteredCatalog = catalogItems.filter(p => {
    const pCategory = (p.category || '').toLowerCase();
    const pOccasions = Array.isArray(p.occasion) ? p.occasion : [p.occasionId || ''];
    const matchesOccasion = selectedOccasionFilter === 'all' || 
                            pOccasions.some(occ => occ && occ.toLowerCase().includes(selectedOccasionFilter.toLowerCase())) ||
                            pCategory.includes(selectedOccasionFilter.toLowerCase());
    const searchQ = inventorySearch.toLowerCase();
    const pName = (p.name || '').toLowerCase();
    const pSku = (p.sku || p.id || '').toLowerCase();
    const pBrand = (p.brand || '').toLowerCase();
    const matchesSearch = !searchQ || pName.includes(searchQ) || pSku.includes(searchQ) || pCategory.includes(searchQ) || pBrand.includes(searchQ);
    return matchesOccasion && matchesSearch;
  });`;

c = c.replace(/\r\n/g, '\n');
const cleanOldFil = oldFilteredCatalog.replace(/\r\n/g, '\n');
if (c.includes(cleanOldFil)) {
  c = c.replace(cleanOldFil, newFilteredCatalog);
} else {
  console.log('oldFilteredCatalog not matched directly, checking looser replace');
}

// 7. Fix Inventory Table Rows
const oldInvRow = `{filteredCatalog.slice(0, 50).map((prod) => (
                      <tr key={prod.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={prod.image}
                              alt={prod.name}
                              style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                            />
                            <div>
                              <strong style={{ display: 'block', color: '#0f172a' }}>{prod.name}</strong>
                              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>SKU: {prod.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600' }}>
                            {prod.occasionName}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => toggleStock(prod.id)}
                            style={{
                              background: prod.inStock ? '#dcfce7' : '#fee2e2',
                              color: prod.inStock ? '#15803d' : '#b91c1c',
                              border: 'none',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            {prod.inStock ? ' Available' : ' Out of Stock'}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>?</span>
                            <input
                              type="number"
                              defaultValue={prod.currentPrice}
                              onBlur={(e) => updatePrice(prod.id, e.target.value)}
                              style={{ width: '70px', padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: '700' }}
                            />
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <Link to={\`/product/\${prod.id}\`} className="btn-z-edit" style={{ textDecoration: 'none' }}>
                              Preview ?
                            </Link>
                            <button
                              className="btn-z-delete"
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              title="Delete from Catalog"
                            >
                              ? Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}`;

const newInvRow = `{filteredCatalog.slice(0, 50).map((prod) => {
                      const prodImg = prod.images?.front || prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
                      const prodPrice = prod.price || prod.currentPrice || 999;
                      const prodSku = prod.sku || prod.id;
                      const prodCat = prod.category || prod.occasionName || 'Curated';
                      const isAvail = prod.stock > 0 || prod.inStock !== false;
                      return (
                        <tr key={prod.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img
                                src={prodImg}
                                alt={prod.name}
                                style={{ width: '46px', height: '46px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                              />
                              <div>
                                <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.9rem' }}>{prod.name}</strong>
                                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>SKU: {prodSku} | {prod.brand || 'FutureMemory'}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', color: '#334155' }}>
                              {prodCat}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => toggleStock(prod.id)}
                              style={{
                                background: isAvail ? '#dcfce7' : '#fee2e2',
                                color: isAvail ? '#15803d' : '#b91c1c',
                                border: 'none',
                                padding: '5px 12px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              {isAvail ? '● Available' : '○ Out of Stock'}
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontWeight: 700, color: '#475569' }}>₹</span>
                              <input
                                type="number"
                                defaultValue={prodPrice}
                                onBlur={(e) => updatePrice(prod.id, e.target.value)}
                                style={{ width: '85px', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem' }}
                              />
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <Link to={\`/product/\${prod.id}\`} className="btn-z-edit" style={{ textDecoration: 'none', padding: '5px 10px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                Preview 👁️
                              </Link>
                              <button
                                className="btn-z-delete"
                                onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                title="Delete from Catalog"
                                style={{ padding: '5px 10px', fontSize: '0.76rem' }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}`;

const cleanOldInv = oldInvRow.replace(/\r\n/g, '\n');
if (c.includes(cleanOldInv)) {
  c = c.replace(cleanOldInv, newInvRow);
} else {
  console.log('oldInvRow not matched directly, checking replace');
}

// 8. Fix Vouchers delete button
c = c.replace('? Delete\n                            </button>', '🗑️ Delete\n                            </button>');

fs.writeFileSync('src/pages/AdminDashboardPage.jsx', c, 'utf8');
console.log('Successfully polished AdminDashboardPage.jsx!');
