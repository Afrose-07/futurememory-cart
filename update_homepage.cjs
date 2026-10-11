const fs = require('fs');

let homePageCode = fs.readFileSync('src/pages/HomePage.jsx', 'utf8');

const originalBrandsJSX = `
        {/* Original Brands Section (Meesho Style) */}
        <section className="fm-home-original-brands" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', background: '#fff', borderRadius: '8px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Original Brands <span style={{ color: '#8b5cf6' }}>✓</span>
            </h2>
            <Link to="/shop" style={{ color: '#d946ef', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>VIEW ALL &gt;</Link>
          </div>
          <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }} className="hide-scrollbar">
            {[
              { img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200", title: "Personal Care", color: "#6d28d9" },
              { img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200", title: "Electronics", color: "#6d28d9" },
              { img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200", title: "Makeup", color: "#6d28d9" },
              { img: "https://images.unsplash.com/photo-1598327105666-5b89351cb315?w=200", title: "Smart Phones", color: "#6d28d9" },
              { img: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=200", title: "Men Perfume", color: "#6d28d9" },
              { img: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=200", title: "Bags", color: "#6d28d9" },
              { img: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=200", title: "Footwear", color: "#6d28d9" }
            ].map((brand, idx) => (
              <div key={idx} style={{ minWidth: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '120px', padding: '10px', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src={brand.img} alt={brand.title} style={{ height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                </div>
                <div style={{ background: brand.color, color: '#fff', textAlign: 'center', padding: '8px 4px', fontSize: '0.8rem', fontWeight: 500 }}>
                  {brand.title}
                </div>
              </div>
            ))}
          </div>
        </section>
`;

// We will inject `originalBrandsJSX` right after `</section> {/* End Hero Banner */}`
homePageCode = homePageCode.replace(
    /<\/section>\s*\{\/\*.*?Hero.*?\*\/\}/i,
    `</section>\n\n${originalBrandsJSX}`
);

// We should also replace the multiple ProductGrid sections with a single "All Products" section for Meesho look
homePageCode = homePageCode.replace(
    /<section className="fm-home-section">[\s\S]*?(?=<\/div>\s*<\/div>\s*\)$)/i,
    `
        <section className="fm-home-section">
          <div className="container">
            <div className="section-header">
              <h2>Top Products For You</h2>
            </div>
            <ProductGrid products={allProductsCatalog} />
          </div>
        </section>
    `
);

fs.writeFileSync('src/pages/HomePage.jsx', homePageCode);

console.log('HomePage updated with Meesho Original Brands section and single product grid.');
