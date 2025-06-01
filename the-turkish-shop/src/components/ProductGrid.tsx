import { useState } from 'react';
import ProductCard from './ProductCard';
import { products } from '../data/products';

interface ProductGridProps {
  featured?: boolean;
  maxItems?: number;
}

const ProductGrid = ({ featured = false, maxItems }: ProductGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Display all products or just the featured ones (first maxItems)
  const displayProducts = featured 
    ? filteredProducts.slice(0, maxItems || 5) 
    : filteredProducts;

  return (
    <div id="products" className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-textDark mb-6">
            {featured ? 'Featured Products' : 'All Products'}
          </h2>
          
          {!featured && (
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-4 pr-10 rounded-xl bg-surface border border-white/10 text-textDark placeholder:text-textDark/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
        </div>

        {featured && products.length > maxItems! && (
          <div className="mt-10 text-center">
            <a
              href="#all-products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg bg-surface text-textDark shadow-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/50 transition-colors"
            >
              View All Products
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid; 