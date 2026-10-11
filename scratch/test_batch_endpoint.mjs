async function testBatch() {
  const payload = {
    products: [
      { id: 'MF-01', name: 'Formal Shirt', category: "Men's Fashion", subcategory: 'Shirts' },
      { id: 'WF-05', name: 'Lehenga', category: "Women's Fashion", subcategory: 'Ethnic' },
      { id: 'GC-01', name: 'Personalized Mug', category: 'Gifts & Greeting Cards', subcategory: 'Personalized' },
      { id: 'WT-01', name: "Men's Watch", category: 'Watches', subcategory: 'Analog' },
      { id: 'EG-05', name: 'Earbuds', category: 'Electronics & Gadgets', subcategory: 'Audio' }
    ],
    angle: 'front'
  };

  console.log('Sending batch request for 5 products...');
  const res = await fetch('http://localhost:5000/api/products/batch-generate-images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log('Batch Response status:', res.status);
  console.log('Summary:', {
    success: data.success,
    total: data.total,
    successfulCount: data.successfulCount,
    failedCount: data.failedCount
  });

  data.results.forEach(r => {
    console.log(`- [${r.productId}] Success: ${r.success} | Image/Fallback: ${r.imageUrl || r.fallbackUrl} | Error: ${r.error || 'None'}`);
  });
}
testBatch();
