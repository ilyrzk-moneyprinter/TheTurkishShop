import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  ShoppingCart, 
  Zap, 
  Shield, 
  Check, 
  Star,
  Clock,
  Globe,
  Tag,
  Info,
  ChevronDown,
  ChevronUp,
  Package,
  Users,
  Award,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCart } from '../../contexts/CartContext';
import { getProductById, Product, ProductTier } from '../../firebase/productService';
import PlatformIcon from '../../components/PlatformIcon';
import { auth } from '../../firebase/config';
import { createOrder } from '../../firebase/orderService';
import { PaymentMethod, DeliveryType, GamePlatform } from '../../firebase/types';

const GenericProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isDarkMode } = useTheme();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<ProductTier | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['description']));
  const [addedToCart, setAddedToCart] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      // For now, fetch all products and find by slug
      // In production, you'd want a dedicated query by slug
      const products = await getProductById(slug || '');
      
      if (products) {
        setProduct(products);
        setSelectedTier(products.tiers[0]);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleAddToCart = () => {
    if (!product || !selectedTier) return;

    const cartItem = {
      id: `${product.id}_${selectedTier.id}`,
      productId: product.id,
      name: product.name,
      tierName: selectedTier.name,
      price: selectedTier.price,
      quantity,
      image: product.imageURL,
      type: product.type,
      category: product.category,
      platform: product.platform,
      deliveryTime: product.deliveryTime,
      tier: selectedTier,
      amount: selectedTier.amount || ''
    };

    addToCart(cartItem);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = async () => {
    if (!product || !selectedTier || !auth.currentUser) return;

    setPurchaseLoading(true);
    try {
      const orderData = {
        buyerEmail: auth.currentUser.email || '',
        product: product.name,
        tier: selectedTier.name,
        price: (selectedTier.price * quantity).toString(),
        currency: 'USD',
        paymentMethod: 'PayPal' as PaymentMethod,
        deliveryType: 'Standard' as DeliveryType,
        gameUsername: '',
        platform: product.platform as GamePlatform || 'PC' as GamePlatform
      };

      await createOrder(orderData);
      // Redirect to orders or show success
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedTier) return 0;
    return selectedTier.price * quantity;
  };

  const calculateDiscount = () => {
    if (!selectedTier || !selectedTier.originalPrice) return 0;
    return Math.round(((selectedTier.originalPrice - selectedTier.price) / selectedTier.originalPrice) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.metaTitle || product.name} - The Turkish Shop</title>
        <meta name="description" content={product.metaDescription || product.description} />
      </Helmet>

      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800"
              >
                <img
                  src={product.imageURL}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {calculateDiscount() > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    -{calculateDiscount()}%
                  </div>
                )}
              </motion.div>
              
              {product.gallery && product.gallery.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.gallery.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.platform && <PlatformIcon platform={product.platform} size={20} />}
                  <span className="text-sm text-gray-600 dark:text-gray-400">{product.category}</span>
                  {product.isNew && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 text-xs font-medium rounded">
                      NEW
                    </span>
                  )}
                  {product.isBestseller && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 text-xs font-medium rounded">
                      BESTSELLER
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {product.shortDescription || product.description}
                </p>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 py-4 border-y border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm">{product.deliveryTime || 'Instant Delivery'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">24/7 Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  <span className="text-sm">100% Genuine</span>
                </div>
              </div>

              {/* Tier Selection */}
              {product.tiers.length > 1 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Select Option</h3>
                  <div className="space-y-2">
                    {product.tiers.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedTier(tier)}
                        disabled={!tier.inStock}
                        className={`w-full p-4 rounded-lg border-2 transition-all ${
                          selectedTier?.id === tier.id
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        } ${!tier.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {tier.name}
                            </h4>
                            {tier.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {tier.description}
                              </p>
                            )}
                            {tier.duration && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Duration: {tier.duration}
                              </p>
                            )}
                            {tier.amount && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Amount: {tier.amount}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                              {formatPrice(tier.price)}
                            </p>
                            {tier.originalPrice && tier.originalPrice > tier.price && (
                              <p className="text-sm text-gray-500 line-through">
                                {formatPrice(tier.originalPrice)}
                              </p>
                            )}
                            {!tier.inStock && (
                              <p className="text-sm text-red-500 mt-1">Out of Stock</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              {selectedTier && selectedTier.inStock && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Quantity</h3>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedTier.maxQuantity || 10, quantity + 1))}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium">{formatPrice(calculateTotal())}</span>
                </div>
                {calculateDiscount() > 0 && (
                  <div className="flex items-center justify-between mb-2 text-green-600">
                    <span>Discount</span>
                    <span>-{calculateDiscount()}%</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {formatPrice(calculateTotal())}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedTier || !selectedTier.inStock || addedToCart}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addedToCart ? (
                    <>
                      <Check className="h-5 w-5" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!selectedTier || !selectedTier.inStock || purchaseLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchaseLoading ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-12 space-y-6">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={() => toggleSection('description')}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="text-xl font-semibold">Description</h3>
                {expandedSections.has('description') ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedSections.has('description') && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Delivery Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={() => toggleSection('delivery')}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="text-xl font-semibold">Delivery Information</h3>
                {expandedSections.has('delivery') ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedSections.has('delivery') && (
                <div className="px-6 pb-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Delivery Time</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {product.deliveryTime || 'Instant delivery after payment confirmation'}
                      </p>
                    </div>
                  </div>
                  {product.deliveryInstructions && (
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Delivery Instructions</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {product.deliveryInstructions}
                        </p>
                      </div>
                    </div>
                  )}
                  {product.region && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Region</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {product.region}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Additional Details */}
            {(product.developer || product.publisher || product.releaseDate || product.ageRating) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('details')}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <h3 className="text-xl font-semibold">Product Details</h3>
                  {expandedSections.has('details') ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                {expandedSections.has('details') && (
                  <div className="px-6 pb-6 grid grid-cols-2 gap-4">
                    {product.developer && (
                      <div>
                        <h4 className="text-sm text-gray-600 dark:text-gray-400">Developer</h4>
                        <p className="font-medium">{product.developer}</p>
                      </div>
                    )}
                    {product.publisher && (
                      <div>
                        <h4 className="text-sm text-gray-600 dark:text-gray-400">Publisher</h4>
                        <p className="font-medium">{product.publisher}</p>
                      </div>
                    )}
                    {product.releaseDate && (
                      <div>
                        <h4 className="text-sm text-gray-600 dark:text-gray-400">Release Date</h4>
                        <p className="font-medium">{product.releaseDate}</p>
                      </div>
                    )}
                    {product.ageRating && (
                      <div>
                        <h4 className="text-sm text-gray-600 dark:text-gray-400">Age Rating</h4>
                        <p className="font-medium">{product.ageRating}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* System Requirements */}
            {product.systemRequirements && (product.systemRequirements.minimum || product.systemRequirements.recommended) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('requirements')}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <h3 className="text-xl font-semibold">System Requirements</h3>
                  {expandedSections.has('requirements') ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                {expandedSections.has('requirements') && (
                  <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {product.systemRequirements.minimum && (
                      <div>
                        <h4 className="font-medium mb-2">Minimum Requirements</h4>
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {product.systemRequirements.minimum}
                        </p>
                      </div>
                    )}
                    {product.systemRequirements.recommended && (
                      <div>
                        <h4 className="font-medium mb-2">Recommended Requirements</h4>
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {product.systemRequirements.recommended}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GenericProductPage; 