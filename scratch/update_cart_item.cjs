const fs = require('fs');
let code = fs.readFileSync('src/components/CartItem.jsx', 'utf8');

if (!code.includes('item.color?.name')) {
  code = code.replace(/<span className="cart-item-category">.*?<\/span>/, `$&
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
          {item.color && <span style={{ marginRight: '10px' }}>Colour: {item.color.name}</span>}
          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
        </div>`);
  fs.writeFileSync('src/components/CartItem.jsx', code);
  console.log('Fixed CartItem.jsx');
}
