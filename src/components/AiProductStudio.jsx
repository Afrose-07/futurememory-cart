import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, CheckCircle, AlertTriangle, Image as ImageIcon, Eye, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { allProductsCatalog } from '../data/allOccasionsCatalog';

const API_BASE = 'http://localhost:5000/api/products';

const AiProductStudio = () => {
  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(allProductsCatalog[0] || null);
  const [selectedAngle, setSelectedAngle] = useState('front');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [batchTesting, setBatchTesting] = useState(false);
  const [batchResults, setBatchResults] = useState(null);

  // Check backend HF & Storage status
  useEffect(() => {
    fetch(`${API_BASE}/ai-status`)
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLoadingStatus(false);
      })
      .catch(err => {
        console.warn('Backend status check failed:', err.message);
        setStatus({
          huggingFace: { configured: false, defaultModel: 'black-forest-labs/FLUX.1-schnell' },
          storage: { supabaseConfigured: false, localPersistentConfigured: true }
        });
        setLoadingStatus(false);
      });
  }, []);

  const categories = ['All', ...new Set(allProductsCatalog.map(p => p.category))];

  const filteredProducts = selectedCategory === 'All' 
    ? allProductsCatalog 
    : allProductsCatalog.filter(p => p.category === selectedCategory);

  // Generate single image
  const handleGenerate = async () => {
    if (!selectedProduct) return;
    setGenerating(true);
    setErrorMsg('');
    setGenerationResult(null);

    try {
      const res = await fetch(`${API_BASE}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: selectedProduct,
          angle: selectedAngle,
          customPrompt: customPrompt || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setGenerationResult(data);
      } else {
        setErrorMsg(data.error || 'Failed to generate image. Fallback image preserved.');
        setGenerationResult(data);
      }
    } catch (err) {
      setErrorMsg(`Server connection error: ${err.message}. Please ensure the server is running on port 5000.`);
    } finally {
      setGenerating(false);
    }
  };

  // Run 5-Product Test Batch
  const handleRun5ProductTest = async () => {
    setBatchTesting(true);
    setBatchResults(null);
    setErrorMsg('');

    // Pick 5 representative products across Men, Women, Gifts, Watches, Electronics
    const testIds = ['MF-01', 'WF-05', 'GC-01', 'WT-01', 'EG-05'];
    const testItems = allProductsCatalog.filter(p => testIds.includes(p.id));

    try {
      const res = await fetch(`${API_BASE}/batch-generate-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: testItems,
          angle: 'front'
        })
      });

      const data = await res.json();
      setBatchResults(data);
    } catch (err) {
      setErrorMsg(`Batch test failed: ${err.message}`);
    } finally {
      setBatchTesting(false);
    }
  };

  // Apply verified image for a specific product
  const handleApplySpecificImage = async (productId, imageUrl, angle = 'front') => {
    if (!productId || !imageUrl) return;
    try {
      const res = await fetch(`${API_BASE}/apply-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, imageUrl, angle })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Success! Updated image for [${productId}] in live store catalog.`);
        const prod = allProductsCatalog.find(p => p.id === productId);
        if (prod) {
          prod.image = imageUrl;
          if (!prod.images) prod.images = {};
          prod.images[angle] = imageUrl;
        }
      } else {
        alert(`Failed to apply: ${data.message || data.error}`);
      }
    } catch (err) {
      alert(`Error applying image: ${err.message}`);
    }
  };

  // Apply all successful batch results
  const handleApplyAllBatch = async () => {
    if (!batchResults || !batchResults.results) return;
    const successful = batchResults.results.filter(r => r.success && r.imageUrl);
    if (successful.length === 0) {
      alert('No successful generated images to apply.');
      return;
    }

    let appliedCount = 0;
    for (const item of successful) {
      try {
        await fetch(`${API_BASE}/apply-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: item.productId, imageUrl: item.imageUrl, angle: item.angle || 'front' })
        });
        const prod = allProductsCatalog.find(p => p.id === item.productId);
        if (prod) {
          prod.image = item.imageUrl;
          if (!prod.images) prod.images = {};
          prod.images[item.angle || 'front'] = item.imageUrl;
        }
        appliedCount++;
      } catch (e) {
        console.error('Error applying batch item:', item.productId, e);
      }
    }
    alert(`Successfully applied ${appliedCount} AI-generated images to live store catalog!`);
  };

  return (
    <div className="fm-ai-studio-container" style={{ padding: '24px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Sparkles color="#7c3aed" size={26} /> Hugging Face AI Product Studio
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '4px', marginBottom: 0 }}>
            Generate realistic Amazon-style commercial product photography for Men, Women, Gifts, and Occasion collections.
          </p>
        </div>

        {/* Integration Status Badges */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: status?.huggingFace?.configured ? '#f0fdf4' : '#fffbeb', border: `1px solid ${status?.huggingFace?.configured ? '#bbf7d0' : '#fef08a'}`, padding: '6px 14px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: status?.huggingFace?.configured ? '#16a34a' : '#ca8a04' }} />
            <strong style={{ color: status?.huggingFace?.configured ? '#166534' : '#854d0e' }}>
              HF Token: {status?.huggingFace?.configured ? 'Active' : 'Add to server/.env'}
            </strong>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '999px', fontSize: '0.85rem', color: '#475569' }}>
            Model: <strong>FLUX.1-schnell</strong>
          </div>

          <div style={{ background: status?.storage?.supabaseConfigured ? '#f0fdf4' : '#f8fafc', border: `1px solid ${status?.storage?.supabaseConfigured ? '#bbf7d0' : '#e2e8f0'}`, padding: '6px 14px', borderRadius: '999px', fontSize: '0.85rem', color: status?.storage?.supabaseConfigured ? '#166534' : '#475569' }}>
            Storage: <strong>{status?.storage?.supabaseConfigured ? 'Supabase Storage' : 'Persistent Local Storage'}</strong>
          </div>
        </div>
      </div>

      {/* Action Banner: 5-Product Test */}
      <div style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0, color: '#5b21b6', fontSize: '1.05rem', fontWeight: 600 }}>Controlled 5-Product Diagnostic Test</h4>
          <p style={{ margin: '4px 0 0 0', color: '#6d28d9', fontSize: '0.88rem' }}>
            Tests prompt formatting, serverless API availability, and persistent storage across Men, Women, Gifts, Watches, and Audio before processing full batches.
          </p>
        </div>
        <button 
          onClick={handleRun5ProductTest}
          disabled={batchTesting}
          style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: batchTesting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)' }}
        >
          {batchTesting ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
          {batchTesting ? 'Testing 5 Products...' : 'Run 5-Product Test'}
        </button>
      </div>

      {/* Batch Results Drawer */}
      {batchResults && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>
              Batch Test Results: <span style={{ color: '#16a34a' }}>{batchResults.successfulCount} Successful</span>, <span style={{ color: '#d97706' }}>{batchResults.failedCount} Fallbacks</span>
            </h4>
            {batchResults.successfulCount > 0 && (
              <button
                onClick={handleApplyAllBatch}
                style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle size={16} /> Apply All Verified Images to Live Catalog
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {batchResults.results?.map((r, i) => (
              <div key={i} style={{ background: '#fff', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{r.productId}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: r.success ? '#dcfce7' : '#fef3c7', color: r.success ? '#15803d' : '#b45309' }}>
                    {r.success ? (r.storageType === 'supabase' ? 'Supabase Saved' : 'Local Saved') : 'Fallback Safe'}
                  </span>
                </div>

                {r.imageUrl && (
                  <div style={{ width: '100%', height: '140px', borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9' }}>
                    <img src={r.imageUrl} alt={r.productId} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <div style={{ fontSize: '0.75rem', color: '#64748b', wordBreak: 'break-all' }}>
                  {r.imageUrl || r.fallbackUrl}
                </div>

                {r.imageUrl && (
                  <button
                    onClick={() => handleApplySpecificImage(r.productId, r.imageUrl, r.angle || 'front')}
                    style={{ marginTop: 'auto', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#1e293b', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <CheckCircle size={14} color="#16a34a" /> Apply to Catalog
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Studio Grid: Left Controls, Right Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Left Column: Product Selection & Configuration */}
        <div>
          {/* Category Filter */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Filter by Department:</label>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    border: '1px solid',
                    borderColor: selectedCategory === c ? '#7c3aed' : '#cbd5e1',
                    background: selectedCategory === c ? '#7c3aed' : '#fff',
                    color: selectedCategory === c ? '#fff' : '#475569',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Product Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Select Product to Generate / Enhance:</label>
            <select
              value={selectedProduct?.id || ''}
              onChange={(e) => {
                const found = allProductsCatalog.find(p => p.id === e.target.value);
                setSelectedProduct(found);
                setGenerationResult(null);
                setErrorMsg('');
              }}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.92rem', background: '#fff' }}
            >
              {filteredProducts.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.id}] {p.name} - {p.category} ({p.subcategory})
                </option>
              ))}
            </select>
          </div>

          {/* Angle Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Camera Angle & Presentation:</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['front', 'back', 'side', 'detail'].map(angle => (
                <label key={angle} style={{ flex: 1, padding: '10px', border: `1px solid ${selectedAngle === angle ? '#7c3aed' : '#cbd5e1'}`, borderRadius: '8px', background: selectedAngle === angle ? '#f5f3ff' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500, textTransform: 'capitalize' }}>
                  <input
                    type="radio"
                    name="angle"
                    value={angle}
                    checked={selectedAngle === angle}
                    onChange={() => setSelectedAngle(angle)}
                  />
                  {angle} View
                </label>
              ))}
            </div>
          </div>

          {/* Prompt Preview */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Amazon Commercial Studio Prompt (Auto-Configured):
            </label>
            <textarea
              rows={3}
              placeholder={`Leave blank to use automatic category-tailored prompt for ${selectedProduct?.name}...`}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'monospace', resize: 'vertical' }}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: '#0f172a',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: generating ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {generating ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {generating ? 'Calling Hugging Face Inference API...' : `Generate Commercial Photo for [${selectedProduct?.id}]`}
          </button>

          {errorMsg && (
            <div style={{ marginTop: '14px', padding: '12px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right Column: Live Before/After & Preview */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#1e293b' }}>Product Preview & Comparison</h4>

          {selectedProduct && (
            <div>
              {/* Product Info Card */}
              <div style={{ marginBottom: '16px', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>{selectedProduct.name}</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                  Category: {selectedProduct.category} • SKU: {selectedProduct.id} • Price: ₹{selectedProduct.price}
                </div>
              </div>

              {/* Images Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {/* Current Working Image */}
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>Current Store Photo:</span>
                  <div style={{ width: '100%', height: '220px', borderRadius: '8px', overflow: 'hidden', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', display: 'block', marginTop: '4px' }}>
                    <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Protected & Verified
                  </span>
                </div>

                {/* AI Generated / Proposed Image */}
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>AI Generated Photo:</span>
                  <div style={{ width: '100%', height: '220px', borderRadius: '8px', overflow: 'hidden', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {generationResult?.imageUrl ? (
                      <img 
                        src={generationResult.imageUrl} 
                        alt="AI Generated" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>
                        <ImageIcon size={36} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                        <span style={{ fontSize: '0.82rem' }}>No AI image generated yet. Click Generate to preview.</span>
                      </div>
                    )}
                  </div>

                  {generationResult?.imageUrl && (
                    <button
                      onClick={() => handleApplySpecificImage(selectedProduct.id, generationResult.imageUrl, selectedAngle)}
                      style={{
                        marginTop: '10px',
                        width: '100%',
                        padding: '8px 12px',
                        background: '#16a34a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle size={16} /> Apply to Live Product
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiProductStudio;
