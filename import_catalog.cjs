const fs = require('fs');
const p = 'src/pages/OrderHistoryPage.jsx';
let c = fs.readFileSync(p, 'utf8');

if (!c.includes('allProductsCatalog')) {
  c = c.replace(
    /import \{ formatPrice, formatDate \} from '\.\.\/utils\/helpers';/,
    "import { formatPrice, formatDate } from '../utils/helpers';\nimport { allProductsCatalog } from '../data/allOccasionsCatalog';"
  );
  fs.writeFileSync(p, c);
}
