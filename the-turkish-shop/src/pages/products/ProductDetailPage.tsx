import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, ChevronDown, ChevronUp, Info, ShoppingCart } from 'lucide-react';
import { products } from '../../data/products';
import { useCart } from '../../contexts/CartContext';
import { useCurrency } from '../../contexts/CurrencyContext';

// Convert product name to URL slug
const getProductSlug = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, '-');
};

// Convert URL slug to product name
const getProductNameFromSlug = (slug: string) => {
  return products.find(p => getProductSlug(p.name) === slug);
};

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Find the product based on the slug
  const product = getProductNameFromSlug(slug || '');
  
  // If product not found, redirect to products page
  useEffect(() => {
    if (!product && slug) {
      navigate('/products');
    }
    // Redirect to dedicated Robux page if trying to access via generic route
    if (product && product.name === 'Roblox Robux') {
      navigate('/products/roblox-robux');
    }
  }, [product, slug, navigate]);

  if (!product) {
    return null; // Will redirect in useEffect
  }

  // Helper function to get the game-specific icon
  const getGameIcon = () => {
    if (product.name.includes('Fortnite')) return '🎮';
    if (product.name.includes('FIFA')) return '⚽';
    if (product.name.includes('Rainbow')) return '🔫';
    if (product.name.includes('Apex')) return '🎯';
    if (product.name.includes('Brawl')) return '⚔️';
    if (product.name.includes('Valorant')) return '🎯';
    if (product.name.includes('Discord')) return '💬';
    if (product.name.includes('Spotify')) return '🎵';
    if (product.name.includes('Roblox')) return '🎲';
    if (product.name.includes('Call of Duty')) return '🔫';
    return '🎮';
  };

  // Calculate total price
  const calculateTotal = () => {
    if (selectedTier === null) return "0.00";
    const tierPrice = parseFloat(product.tiers[selectedTier].price);
    return (tierPrice * quantity).toFixed(2);
  };

  // Calculate original international price (2.5x Turkish price)
  const calculateOriginalPrice = () => {
    if (selectedTier === null) return "0.00";
    const total = parseFloat(calculateTotal());
    return (total * 2.5).toFixed(2);
  };

  // Handle quantity change
  const handleQuantityChange = (value: number) => {
    setQuantity(Math.max(1, value));
  };
  
  // Special case for Roblox Robux
  const isRobux = product.name === 'Roblox Robux';
  
  // Special case for subscription products
  const isSubscription = ['Spotify Premium', 'Discord Nitro'].includes(product.name);

  // Handle add to cart
  const handleAddToCart = () => {
    if (selectedTier === null) return;
    
    console.log("Adding to cart from detail page:", product.name, product.tiers[selectedTier].amount);
    
    // Determine product type
    let productType = 'Game Currency';
    if (product.name.includes('Spotify') || product.name.includes('Discord Nitro')) {
      productType = 'Subscription';
    }
    if (product.category) {
      productType = product.category;
    }
    
    // Add items to cart based on quantity
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: `${product.name}-${product.tiers[selectedTier].amount}-${Date.now()}-${i}`,
        name: product.name,
        type: productType,
        amount: product.tiers[selectedTier].amount,
        price: parseFloat(product.tiers[selectedTier].price),
        image: getGameIcon()
      });
    }
    
    // Show feedback
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  // Handle buy now - add to cart and redirect to cart
  const handleBuyNow = () => {
    if (selectedTier === null) return;
    
    // Add to cart
    handleAddToCart();
    
    // Navigate to cart
    navigate('/cart');
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <button 
          onClick={() => navigate('/products')} 
          className="flex items-center text-textDark hover:text-accent mb-6 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Back to Products</span>
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Image/Icon Section */}
          <div className="lg:col-span-1">
            <div className="bg-glass backdrop-blur-lg rounded-2xl p-8 border border-white/10 flex items-center justify-center aspect-square">
              <div className="w-40 h-40 bg-accent/10 rounded-full flex items-center justify-center">
                <span className="text-7xl">{getGameIcon()}</span>
              </div>
            </div>
            
            {/* Reviews/Rating (Placeholder) */}
            <div className="mt-6 bg-glass backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      className="h-5 w-5 text-price" 
                      fill={star <= 5 ? "currentColor" : "none"} 
                    />
                  ))}
                </div>
                <span className="ml-2 text-textDark">5.0 (48 reviews)</span>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-start mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className="h-4 w-4 text-price" 
                          fill="currentColor" 
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium text-textDark">James R.</span>
                  </div>
                  <p className="text-sm text-textDark/80">
                    Super fast delivery! Got my {product.name} within minutes after payment. Will buy again.
                  </p>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-start mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className="h-4 w-4 text-price" 
                          fill="currentColor" 
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium text-textDark">Sarah K.</span>
                  </div>
                  <p className="text-sm text-textDark/80">
                    Amazing prices compared to official store. The process was smooth and support was helpful.
                  </p>
                </div>
              </div>
              
              <button className="w-full mt-4 py-2 text-sm text-accent bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors">
                See all 48 reviews
              </button>
            </div>
          </div>
          
          {/* Product Details Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-glass backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <h1 className="text-3xl font-bold text-textDark">{product.name}</h1>
                  <span className="ml-3 px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                    Turkish Region
                  </span>
                </div>
                <p className="text-textDark/70">
                  Discounted {product.name} at Turkish regional prices. Safe and instant delivery.
                </p>
              </div>
              
              {/* Product tiers selection */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-textDark mb-3">Select Amount</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {product.tiers.map((tier, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTier(index)}
                      className={`p-4 rounded-lg border transition-colors ${
                        selectedTier === index 
                          ? 'border-accent bg-accent/10 text-accent' 
                          : 'border-white/10 bg-white/5 text-textDark hover:bg-white/10'
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex justify-between items-center">
                          <span>{tier.amount}</span>
                          <span className={selectedTier === index ? 'font-bold' : ''}>
                            {formatPrice(tier.price)}
                          </span>
                        </div>
                        <div className="flex flex-col items-end mt-1">
                          <span className="text-xs text-textDark/50 line-through">
                            {formatPrice((parseFloat(tier.price) * 2.5).toString())}
                          </span>
                          {currency !== 'GBP' && (
                            <span className="text-xs text-textDark/70 mt-0.5">
                              (£{tier.price})
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Quantity selection - not shown for subscriptions */}
              {!isSubscription && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-textDark mb-3">Quantity</h3>
                  <div className="flex items-center">
                    <button 
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="p-2 rounded-l-lg bg-white/5 border border-white/10 text-textDark hover:bg-white/10"
                      disabled={quantity <= 1}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-16 p-2 text-center bg-white/5 border-y border-white/10 text-textDark focus:outline-none"
                    />
                    <button 
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="p-2 rounded-r-lg bg-white/5 border border-white/10 text-textDark hover:bg-white/10"
                    >
                      <ChevronUp className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Total Price */}
              <div className="mb-6 p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-textDark/70">Price:</span>
                  <div className="flex flex-col items-end">
                    <span className="font-medium text-textDark">
                      {selectedTier !== null ? formatPrice(product.tiers[selectedTier].price) : '-'}
                    </span>
                    {selectedTier !== null && currency !== 'GBP' && (
                      <span className="text-xs text-textDark/70">
                        (£{product.tiers[selectedTier].price})
                      </span>
                    )}
                  </div>
                </div>
                
                {!isSubscription && (
                  <div className="flex justify-between mb-2">
                    <span className="text-textDark/70">Quantity:</span>
                    <span className="font-medium text-textDark">x{quantity}</span>
                  </div>
                )}
                
                <div className="h-px bg-white/10 my-3"></div>
                
                <div className="flex justify-between items-center">
                  <span className="text-textDark font-medium">Total:</span>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-price font-bold text-2xl">
                        {formatPrice(calculateTotal())}
                      </span>
                      <span className="text-sm text-textDark/50 line-through">
                        {formatPrice(calculateOriginalPrice())}
                      </span>
                    </div>
                    {currency !== 'GBP' && (
                      <span className="text-xs text-textDark/70">
                        (£{calculateTotal()})
                      </span>
                    )}
                    <span className="text-xs text-accent">Save 60% off international price</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleBuyNow}
                  className={`flex-1 py-3 rounded-lg transition-colors font-medium ${
                    selectedTier === null 
                      ? 'bg-accent/50 text-textLight/50 cursor-not-allowed' 
                      : 'bg-accent text-textLight hover:bg-accent/90'
                  }`}
                  disabled={selectedTier === null}
                >
                  Buy Now
                </button>
                
                <button 
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 rounded-lg transition-colors ${
                    addedToCart 
                      ? 'bg-green-500 text-white' 
                      : selectedTier === null 
                        ? 'bg-white/5 border border-white/10 text-textDark/50 cursor-not-allowed' 
                        : 'bg-white/5 border border-white/10 text-textDark hover:bg-white/10'
                  }`}
                  disabled={selectedTier === null}
                >
                  {addedToCart ? (
                    'Added to Cart ✓'
                  ) : (
                    <span className="flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </span>
                  )}
                </button>
              </div>
            </div>
            
            {/* Product Description */}
            <div className="bg-glass backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl font-bold text-textDark mb-4">Description</h2>
              <div className="space-y-4 text-textDark/80">
                <p>
                  {product.name} is a virtual currency used in {product.name.split(' ')[0]} to purchase in-game items, cosmetics, battle passes, and more.
                  Our service provides you with legitimate {product.name} at Turkish regional prices, which are significantly lower than global prices.
                </p>
                
                <div className="flex items-center gap-2 text-sm text-accent bg-accent/5 p-3 rounded-lg">
                  <Info className="h-5 w-5" />
                  <p>All purchases are delivered instantly to your account after payment.</p>
                </div>
                
                <h3 className="text-lg font-medium text-textDark pt-2">How it works:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Select your desired amount of {product.name}</li>
                  <li>Complete the payment process</li>
                  <li>Receive your code or account credentials via email or Discord</li>
                  <li>Redeem your {product.name} in-game</li>
                </ol>
                
                {product.notes && (
                  <div className="p-4 bg-white/5 rounded-lg mt-4">
                    <p className="text-sm">
                      <span className="font-medium">Note:</span> {product.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* FAQ Section */}
            <div className="bg-glass backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl font-bold text-textDark mb-4">Frequently Asked Questions</h2>
              
              <div className="space-y-3">
                <div className="p-4 bg-white/5 rounded-lg">
                  <h3 className="font-medium text-textDark">Is this safe and legal?</h3>
                  <p className="text-sm text-textDark/80 mt-2">
                    Yes, our service is completely legitimate. We utilize regional price differences which is allowed by most platforms.
                  </p>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg">
                  <h3 className="font-medium text-textDark">How long does delivery take?</h3>
                  <p className="text-sm text-textDark/80 mt-2">
                    Delivery is instant for most products. Once payment is confirmed, you'll receive your purchase immediately.
                  </p>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg">
                  <h3 className="font-medium text-textDark">Do I need a VPN?</h3>
                  <p className="text-sm text-textDark/80 mt-2">
                    No, you don't need a VPN. We handle everything on our end, and you'll receive either a code or account details to redeem your purchase.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 