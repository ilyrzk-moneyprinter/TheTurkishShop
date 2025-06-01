import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../data/products';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const [selectedTier, setSelectedTier] = useState(product.tiers[0]);
  const [addedToCart, setAddedToCart] = useState(false);

  // Handle add to cart
  const handleAddToCart = () => {
    console.log("Adding to cart:", product.name, selectedTier.amount);
    
    // Create a unique ID for the cart item
    const itemId = `${product.name}-${selectedTier.amount}`;
    
    // Determine product type (category)
    let productType = 'Game Currency';
    if (product.name.includes('Spotify') || product.name.includes('Discord Nitro')) {
      productType = 'Subscription';
    }
    if (product.category) {
      productType = product.category;
    }
    
    // Add to cart
    addToCart({
      id: itemId,
      name: product.name,
      type: productType,
      amount: selectedTier.amount,
      price: parseFloat(selectedTier.price),
      image: getProductEmoji(product.name)
    });
    
    // Show added to cart feedback
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  // Get emoji based on product name
  const getProductEmoji = (name: string): string => {
    if (name.includes('Discord')) return '💬';
    if (name.includes('Spotify')) return '🎵';
    if (name.includes('Fortnite')) return '🎮';
    if (name.includes('FIFA')) return '⚽';
    if (name.includes('Robux')) return '🟥';
    if (name.includes('Apex')) return '🎯';
    if (name.includes('Valorant')) return '🔫';
    if (name.includes('Steam')) return '🎲';
    return '🎮';
  };
  
  // Generate a URL-friendly slug if not provided
  const getProductSlug = (): string => {
    if (product.slug) return product.slug;
    return product.name.toLowerCase().replace(/ /g, '-');
  };

  return (
    <div className="bg-glass backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 transition-all hover:shadow-xl hover:scale-[1.02] group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-textDark">{product.name}</h3>
            <p className="text-sm text-textDark/70">{product.region}</p>
          </div>
          <div className="text-3xl">
            {getProductEmoji(product.name)}
          </div>
        </div>

        <div className="space-y-3 mt-4">
          {product.tiers.slice(0, 3).map((tier) => (
            <div 
              key={tier.amount} 
              className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-colors ${
                selectedTier.amount === tier.amount 
                  ? 'bg-accent/20 border border-accent/30' 
                  : 'bg-surface/30 hover:bg-white/5'
              }`}
              onClick={() => setSelectedTier(tier)}
            >
              <span className="text-sm font-medium text-textDark">{tier.amount}</span>
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-price">{formatPrice(tier.price)}</span>
                {currency !== 'GBP' && (
                  <span className="text-xs text-textDark/50">£{tier.price}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {product.tiers.length > 3 && (
          <div className="mt-3 text-center">
            <span className="text-xs text-textDark/70">+{product.tiers.length - 3} more options</span>
          </div>
        )}

        {product.notes && (
          <div className="mt-4 text-xs text-textDark/70 italic">
            {product.notes}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-2">
          <Link 
            to={`/products/${getProductSlug()}`}
            className="py-2 px-4 bg-white/5 hover:bg-white/10 text-textDark font-medium rounded-lg transition-colors text-center"
          >
            View Details
          </Link>
          
          <button 
            onClick={handleAddToCart}
            className={`py-2 px-4 font-medium rounded-lg transition-colors flex items-center justify-center ${
              addedToCart 
                ? 'bg-green-500 text-white' 
                : 'bg-accent text-white hover:bg-accent/90'
            }`}
          >
            {addedToCart ? (
              'Added ✓'
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 