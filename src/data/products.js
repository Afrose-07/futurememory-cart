import { realProducts } from './realProducts';
import { occasionsMetadata } from './allOccasionsCatalog';

export const products = realProducts;
export { occasionsMetadata };

export const categories = ["All", ...new Set(products.map(p => p.category))];

export const occasions = occasionsMetadata.map(o => o.name);

export const getProductById = (id) => {
  const numId = parseInt(id, 10);
  return products.find(p => p.id === numId) || products[0];
};

export const getProductsByOccasion = (occasionIdOrName) => {
  return products.filter(p => 
    p.occasionId === occasionIdOrName || 
    p.occasionName.toLowerCase().includes(occasionIdOrName.toLowerCase())
  );
};
