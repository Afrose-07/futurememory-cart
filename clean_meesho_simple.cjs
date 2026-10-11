const fs = require('fs');

// 1. Remove Meesho references and update images in products data
const dataFiles = ['src/data/allOccasionsCatalog.js', 'src/data/realProducts.js'];

for (const file of dataFiles) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Remove 'Meesho' text
        content = content.replace(/Real Meesho feel\./gi, 'Premium quality guaranteed.');
        content = content.replace(/Meesho/gi, 'FutureMemory');
        
        // Update images to aesthetic ones using string replace
        const replacements = {
            "https://images.unsplash.com/photo-1610189013233-1c390559eb44?w=600&q=80": "https://images.unsplash.com/photo-1583391733958-650fac69e6b1?w=600&q=80",
            "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80": "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80",
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80",
            "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"
        };
        
        for (const [oldImg, newImg] of Object.entries(replacements)) {
            content = content.split(oldImg).join(newImg);
        }
        
        fs.writeFileSync(file, content);
    }
}

// 2. Remove Meesho references from HomePage.jsx
if (fs.existsSync('src/pages/HomePage.jsx')) {
    let hpContent = fs.readFileSync('src/pages/HomePage.jsx', 'utf8');
    hpContent = hpContent.replace(/\(Meesho Style\)/gi, '(Premium Style)');
    hpContent = hpContent.replace(/Meesho look/gi, 'Premium look');
    hpContent = hpContent.replace(/Meesho/gi, 'FutureMemory');
    fs.writeFileSync('src/pages/HomePage.jsx', hpContent);
}

console.log('Removed all references to Meesho and updated images to Pinterest aesthetic.');
