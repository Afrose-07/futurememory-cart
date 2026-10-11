const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');

const stateInjection = `  const [storeOps, setStoreOps] = useState('normal');
  const [dispatchMode, setDispatchMode] = useState('lightning');
  const [warehouseStatus, setWarehouseStatus] = useState('active');

  // Toggle handlers
  const toggleStoreOps = () => {
    if (storeOps === 'normal') setStoreOps('high');
    else if (storeOps === 'high') setStoreOps('maintenance');
    else setStoreOps('normal');
  };
  const toggleDispatchMode = () => {
    if (dispatchMode === 'lightning') setDispatchMode('standard');
    else if (dispatchMode === 'standard') setDispatchMode('paused');
    else setDispatchMode('lightning');
  };
  const toggleWarehouseStatus = () => {
    if (warehouseStatus === 'active') setWarehouseStatus('audit');
    else if (warehouseStatus === 'audit') setWarehouseStatus('offline');
    else setWarehouseStatus('active');
  };
`;

// Inject state near activeTab
c = c.replace(/const \[activeTab, setActiveTab\] = useState\('overview'\);/, `const [activeTab, setActiveTab] = useState('overview');\n${stateInjection}`);

const newPills = `                <div className="zestro-hero-status-pills" style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={toggleStoreOps}
                    className={\`hero-pill \${storeOps === 'normal' ? 'normal' : storeOps === 'high' ? 'peak' : 'danger'}\`}
                    style={{ cursor: 'pointer', border: 'none', transition: 'all 0.2s', fontWeight: 600, padding: '6px 12px', borderRadius: '20px' }}
                  >
                    {storeOps === 'normal' ? '🟢 Normal Ops' : storeOps === 'high' ? '🔥 Peak Ops' : '🔴 Maintenance'}
                  </button>
                  <button 
                    onClick={toggleDispatchMode}
                    className={\`hero-pill \${dispatchMode === 'lightning' ? 'peak' : dispatchMode === 'standard' ? 'normal' : 'neutral'}\`}
                    style={{ cursor: 'pointer', border: 'none', transition: 'all 0.2s', fontWeight: 600, padding: '6px 12px', borderRadius: '20px' }}
                  >
                    {dispatchMode === 'lightning' ? '⚡ Lightning Dispatch' : dispatchMode === 'standard' ? '🚚 Standard Dispatch' : '⏸️ Dispatch Paused'}
                  </button>
                  <button 
                    onClick={toggleWarehouseStatus}
                    className={\`hero-pill \${warehouseStatus === 'active' ? 'busy' : warehouseStatus === 'audit' ? 'neutral' : 'danger'}\`}
                    style={{ cursor: 'pointer', border: 'none', transition: 'all 0.2s', fontWeight: 600, padding: '6px 12px', borderRadius: '20px' }}
                  >
                    {warehouseStatus === 'active' ? '🏭 Warehouses Active' : warehouseStatus === 'audit' ? '📋 Inventory Audit' : '🛑 Warehouses Offline'}
                  </button>
                </div>`;

c = c.replace(/<div className="zestro-hero-status-pills">[\s\S]*?<\/div>/, newPills);

fs.writeFileSync('src/pages/AdminDashboardPage.jsx', c);
console.log('Fixed dummy option pills in AdminDashboard');
