const fs = require('fs');

const files = ['src/data/allOccasionsCatalog.js', 'src/data/realProducts.js'];

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        if (!content.includes('export const realProducts =')) {
            content += '\nexport const realProducts = allProductsCatalog;\n';
            fs.writeFileSync(file, content);
        }
    }
}
console.log('Added realProducts export.');
