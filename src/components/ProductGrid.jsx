import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';
import './ProductGrid.css';

const ProductGrid = ({ products = [], columns = 4, emptyMessage = "No products found matching your criteria." }) => {
  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon=""
        title="No Products Found"
        description={emptyMessage}
        actionText="Browse All Products"
        actionLink="/shop"
      />
    );
  }

  return (
    <div className={`fm-product-grid fm-grid-cols-${columns}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
