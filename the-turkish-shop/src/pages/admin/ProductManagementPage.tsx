import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { isAdmin } from '../../firebase/authService';
import { 
  getAllProducts, 
  updateProduct, 
  createProduct, 
  deleteProduct, 
  uploadProductImage,
  Product,
  ProductTier,
  ProductType,
  ProductCategory,
  DeliveryMethod
} from '../../firebase/productService';
import MotionWrapper from '../../components/animations/MotionWrapper';
import { Search, ShoppingBag, Plus, Edit, Trash2, X, Check, ImagePlus, Save } from 'lucide-react';

const ProductManagementPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});

  // Check admin status on mount
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminStatus = await isAdmin();
        if (!adminStatus) {
          navigate('/signin'); // Redirect non-admins
          return;
        }

        // Load products
        await loadProducts();
      } catch (err: any) {
        setError(err.message || 'Error loading product data');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  // Load all products
  const loadProducts = async () => {
    try {
      const productData = await getAllProducts();
      setProducts(productData);
      setFilteredProducts(productData);
      
      // If no products exist, show a helpful message
      if (productData.length === 0) {
        setError('No products found. You may need to initialize the database first.');
      }
    } catch (err: any) {
      console.error('Error loading products:', err);
      
      // Check if it's a permissions error or empty database
      if (err.message && err.message.includes('permission')) {
        setError('Permission denied. Please ensure you are logged in as an admin.');
      } else {
        setError(`Failed to load products: ${err.message || 'Unknown error'}. You may need to initialize the database.`);
      }
    }
  };

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(lowerSearchTerm) || 
      product.description.toLowerCase().includes(lowerSearchTerm) || 
      product.tiers.some((tier: ProductTier) => tier.name.toLowerCase().includes(lowerSearchTerm))
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Add new tier to product
  const addTier = () => {
    if (!editedProduct.tiers) return;
    
    const newTier: ProductTier = {
      id: `tier_${Date.now()}`,
      name: '',
      price: 0,
      description: '',
      inStock: true
    };
    
    setEditedProduct({
      ...editedProduct,
      tiers: [...editedProduct.tiers, newTier]
    });
  };

  // Remove tier from product
  const removeTier = (tierId: string) => {
    if (!editedProduct.tiers) return;
    
    setEditedProduct({
      ...editedProduct,
      tiers: editedProduct.tiers.filter((tier: ProductTier) => tier.id !== tierId)
    });
  };

  // Update tier details
  const updateTier = (tierId: string, field: keyof ProductTier, value: any) => {
    if (!editedProduct.tiers) return;
    
    setEditedProduct({
      ...editedProduct,
      tiers: editedProduct.tiers.map((tier: ProductTier) => {
        if (tier.id === tierId) {
          return { ...tier, [field]: value };
        }
        return tier;
      })
    });
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Reset form and states
  const resetForm = () => {
    setIsEditing(false);
    setIsCreating(false);
    setImageFile(null);
    setEditedProduct({});
  };

  // Start editing product
  const startEditing = (product: Product) => {
    setEditedProduct({...product});
    setIsEditing(true);
    setIsCreating(false);
  };

  // Start creating new product
  const startCreating = () => {
    setEditedProduct({
      name: '',
      description: '',
      imageURL: '',
      type: 'other' as ProductType,
      category: 'other' as ProductCategory,
      deliveryMethod: 'code' as DeliveryMethod,
      inStock: true,
      featured: false,
      tiers: [{
        id: `tier_${Date.now()}`,
        name: 'Basic',
        price: 0,
        description: '',
        inStock: true
      }]
    });
    setIsCreating(true);
    setIsEditing(false);
    setSelectedProduct(null);
  };

  // Save product (create or update)
  const saveProduct = async () => {
    try {
      setLoading(true);
      
      // Validate
      if (!editedProduct.name || !editedProduct.description) {
        setError('Please fill out all required fields.');
        setLoading(false);
        return;
      }
      
      if (!editedProduct.tiers || editedProduct.tiers.length === 0) {
        setError('Product must have at least one tier.');
        setLoading(false);
        return;
      }
      
      for (const tier of editedProduct.tiers) {
        if (!tier.name || tier.price <= 0) {
          setError('All tiers must have a name and a valid price.');
          setLoading(false);
          return;
        }
      }
      
      let imageURL = editedProduct.imageURL;
      
      // Upload image if provided
      if (imageFile) {
        imageURL = await uploadProductImage(imageFile, editedProduct.name || 'product');
      }
      
      const productData = {
        ...editedProduct,
        imageURL
      };
      
      // Create or update
      if (isCreating) {
        await createProduct(productData as Product);
        setSuccess('Product created successfully!');
      } else {
        await updateProduct(productData as Product);
        setSuccess('Product updated successfully!');
      }
      
      // Reload products
      await loadProducts();
      resetForm();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteProduct(productId);
      await loadProducts();
      setSelectedProduct(null);
      setSuccess('Product deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete product.');
    } finally {
      setLoading(false);
    }
  };

  // Product type field - ensure we're checking for a string before using it
  const productType = editedProduct.type || 'other';
  
  // Category field - ensure we're checking for a string before using it  
  const productCategory = editedProduct.category || 'other';
  
  // Delivery method field - ensure we're checking for a string before using it
  const deliveryMethod = editedProduct.deliveryMethod || 'code';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MotionWrapper variant="bouncyFadeIn">
        <div className="max-w-7xl mx-auto">
          <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
            Product Management
          </h1>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
              {error}
              {error.includes('initialize') && (
                <Link 
                  to="/admin/database-init" 
                  className="ml-4 underline hover:text-red-400"
                >
                  Go to Database Setup
                </Link>
              )}
              <button 
                className="ml-4 underline"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500">
              {success}
              <button 
                className="ml-4 underline"
                onClick={() => setSuccess(null)}
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Search and Add New Product */}
          <div className={`p-4 mb-6 rounded-lg ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'} flex items-center justify-between`}>
            <div className="relative flex-1 mr-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-black/20 text-textLight placeholder:text-gray-500' 
                    : 'bg-white text-textDark placeholder:text-gray-400'
                } border border-transparent focus:border-accent focus:outline-none`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={startCreating}
              className="flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </button>
          </div>
          
          {/* Product Form (Create/Edit) */}
          {(isCreating || isEditing) && (
            <div className={`p-6 rounded-xl mb-6 ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  {isCreating ? 'Create New Product' : 'Edit Product'}
                </h2>
                <button 
                  onClick={resetForm}
                  className="p-2 rounded-full hover:bg-black/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  {/* Basic Product Info */}
                  <div className="mb-4">
                    <label className="block text-sm opacity-70 mb-1">Product Name*</label>
                    <input
                      type="text"
                      value={editedProduct.name || ''}
                      onChange={(e) => setEditedProduct({...editedProduct, name: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg ${
                        isDarkMode 
                          ? 'bg-black/20 text-textLight' 
                          : 'bg-white text-textDark'
                      } border border-transparent focus:border-accent focus:outline-none`}
                      placeholder="Enter product name"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm opacity-70 mb-1">Description*</label>
                    <textarea
                      value={editedProduct.description || ''}
                      onChange={(e) => setEditedProduct({...editedProduct, description: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg ${
                        isDarkMode 
                          ? 'bg-black/20 text-textLight' 
                          : 'bg-white text-textDark'
                      } border border-transparent focus:border-accent focus:outline-none`}
                      placeholder="Enter product description"
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm opacity-70 mb-1">Product Type</label>
                      <select
                        value={productType}
                        onChange={(e) => setEditedProduct({...editedProduct, type: e.target.value as ProductType})}
                        className={`w-full px-4 py-2 rounded-lg ${
                          isDarkMode 
                            ? 'bg-black/20 text-textLight' 
                            : 'bg-white text-textDark'
                        } border border-transparent focus:border-accent focus:outline-none`}
                      >
                        <option value="subscription">Subscription</option>
                        <option value="game">Game</option>
                        <option value="currency">Currency</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm opacity-70 mb-1">Category</label>
                      <select
                        value={productCategory}
                        onChange={(e) => setEditedProduct({...editedProduct, category: e.target.value as ProductCategory})}
                        className={`w-full px-4 py-2 rounded-lg ${
                          isDarkMode 
                            ? 'bg-black/20 text-textLight' 
                            : 'bg-white text-textDark'
                        } border border-transparent focus:border-accent focus:outline-none`}
                      >
                        <option value="streaming">Streaming</option>
                        <option value="gaming">Gaming</option>
                        <option value="software">Software</option>
                        <option value="steam">Steam</option>
                        <option value="playstation">PlayStation</option>
                        <option value="xbox">Xbox</option>
                        <option value="nintendo">Nintendo</option>
                        <option value="mobile">Mobile</option>
                        <option value="gift-card">Gift Card</option>
                        <option value="in-game-currency">In-Game Currency</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm opacity-70 mb-1">Delivery Method</label>
                    <select
                      value={deliveryMethod}
                      onChange={(e) => setEditedProduct({...editedProduct, deliveryMethod: e.target.value as DeliveryMethod})}
                      className={`w-full px-4 py-2 rounded-lg ${
                        isDarkMode 
                          ? 'bg-black/20 text-textLight' 
                          : 'bg-white text-textDark'
                      } border border-transparent focus:border-accent focus:outline-none`}
                    >
                      <option value="code">Code/Key</option>
                      <option value="account">Account</option>
                      <option value="giftcard">Gift Card</option>
                      <option value="service">Service</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm opacity-70 mb-1">Status</label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editedProduct.inStock ?? true}
                            onChange={(e) => setEditedProduct({...editedProduct, inStock: e.target.checked})}
                            className="sr-only"
                          />
                          <div className={`w-10 h-6 rounded-full ${
                            editedProduct.inStock ? 'bg-green-500' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                          } flex items-center transition-colors p-1`}>
                            <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                              editedProduct.inStock ? 'translate-x-4' : ''
                            }`} />
                          </div>
                          <span className="ml-2">In Stock</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm opacity-70 mb-1">Featured</label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editedProduct.featured ?? false}
                            onChange={(e) => setEditedProduct({...editedProduct, featured: e.target.checked})}
                            className="sr-only"
                          />
                          <div className={`w-10 h-6 rounded-full ${
                            editedProduct.featured ? 'bg-accent' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                          } flex items-center transition-colors p-1`}>
                            <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                              editedProduct.featured ? 'translate-x-4' : ''
                            }`} />
                          </div>
                          <span className="ml-2">Featured</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Product Image Upload */}
                <div>
                  <label className="block text-sm opacity-70 mb-1">Product Image</label>
                  <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center">
                    {(editedProduct.imageURL || imageFile) ? (
                      <div className="relative w-full">
                        <img
                          src={imageFile ? URL.createObjectURL(imageFile) : editedProduct.imageURL}
                          alt="Product preview"
                          className="h-40 mx-auto object-contain rounded-lg"
                        />
                        <div className="mt-2 flex justify-center">
                          <label className="cursor-pointer text-accent hover:underline">
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleImageChange} 
                            />
                            Change Image
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center">
                        <div className="w-full h-40 flex flex-col justify-center items-center">
                          <ImagePlus className="h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-center text-sm opacity-70">
                            Click to upload image<br />
                            <span className="text-xs">JPG, PNG or GIF</span>
                          </p>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageChange} 
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Tiers */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-semibold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    Product Tiers
                  </h3>
                  <button 
                    onClick={addTier}
                    className="text-sm text-accent hover:underline flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Tier
                  </button>
                </div>
                
                {editedProduct.tiers && editedProduct.tiers.map((tier: ProductTier, index: number) => (
                  <div 
                    key={tier.id} 
                    className={`p-4 rounded-lg mb-3 ${
                      isDarkMode ? 'bg-black/10' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between mb-3">
                      <h4 className="font-medium">Tier {index + 1}</h4>
                      <button 
                        onClick={() => removeTier(tier.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-xs opacity-70 mb-1">Tier Name*</label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => updateTier(tier.id, 'name', e.target.value)}
                          className={`w-full px-3 py-2 text-sm rounded ${
                            isDarkMode 
                              ? 'bg-black/20 text-textLight' 
                              : 'bg-white text-textDark'
                          } border border-transparent focus:border-accent focus:outline-none`}
                          placeholder="Basic, Premium, etc."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs opacity-70 mb-1">Price*</label>
                        <input
                          type="number"
                          value={tier.price}
                          onChange={(e) => updateTier(tier.id, 'price', parseFloat(e.target.value) || 0)}
                          className={`w-full px-3 py-2 text-sm rounded ${
                            isDarkMode 
                              ? 'bg-black/20 text-textLight' 
                              : 'bg-white text-textDark'
                          } border border-transparent focus:border-accent focus:outline-none`}
                          placeholder="19.99"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tier.inStock}
                            onChange={(e) => updateTier(tier.id, 'inStock', e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-8 h-5 rounded-full ${
                            tier.inStock ? 'bg-green-500' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                          } flex items-center transition-colors p-1`}>
                            <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                              tier.inStock ? 'translate-x-3' : ''
                            }`} />
                          </div>
                          <span className="ml-2 text-sm">In Stock</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs opacity-70 mb-1">Description</label>
                      <input
                        type="text"
                        value={tier.description}
                        onChange={(e) => updateTier(tier.id, 'description', e.target.value)}
                        className={`w-full px-3 py-2 text-sm rounded ${
                          isDarkMode 
                            ? 'bg-black/20 text-textLight' 
                            : 'bg-white text-textDark'
                        } border border-transparent focus:border-accent focus:outline-none`}
                        placeholder="Description of what this tier includes"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={saveProduct}
                  className="flex items-center px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {isCreating ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products List */}
            {!isCreating && !isEditing && (
              <div className={`lg:col-span-1 rounded-lg ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'} h-[calc(100vh-240px)] overflow-y-auto`}>
                <div className="p-4">
                  <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    Products ({filteredProducts.length})
                  </h2>
                  
                  {filteredProducts.length === 0 ? (
                    <p className="text-center py-8 opacity-70">No products found</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredProducts.map((product) => (
                        <div 
                          key={product.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedProduct?.id === product.id
                              ? isDarkMode ? 'bg-accent/20 border-l-4 border-accent' : 'bg-accent/10 border-l-4 border-accent'
                              : isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedProduct(product)}
                        >
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded bg-gray-200 overflow-hidden mr-3">
                              {product.imageURL ? (
                                <img 
                                  src={product.imageURL} 
                                  alt={product.name} 
                                  className="h-full w-full object-cover" 
                                />
                              ) : (
                                <ShoppingBag className="h-6 w-6 m-3 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                                {product.name}
                              </p>
                              <p className="text-sm opacity-70">
                                {product.tiers?.length || 0} tiers
                              </p>
                            </div>
                            <div className="ml-auto">
                              {product.inStock ? (
                                <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">In Stock</span>
                              ) : (
                                <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">Out of Stock</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Product Details */}
            {!isCreating && !isEditing && (
              <div className={`lg:col-span-2 rounded-lg ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'} h-[calc(100vh-240px)] overflow-y-auto`}>
                {!selectedProduct ? (
                  <div className="flex flex-col items-center justify-center h-full p-6">
                    <ShoppingBag className={`h-16 w-16 ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`} />
                    <p className="mt-4 text-lg opacity-70">Select a product to view details</p>
                    <button 
                      onClick={startCreating}
                      className="mt-4 flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add New Product
                    </button>
                  </div>
                ) : (
                  <div className="p-6">
                    {/* Product Header */}
                    <div className="flex justify-between mb-6">
                      <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                        {selectedProduct.name}
                      </h2>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(selectedProduct)}
                          className="flex items-center px-3 py-1 rounded bg-accent text-white hover:bg-accent/80"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(selectedProduct.id)}
                          className="flex items-center px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="grid grid-cols-3 gap-6 mb-6">
                      <div className="col-span-1">
                        <div className="h-48 w-full rounded-lg bg-gray-200 overflow-hidden">
                          {selectedProduct.imageURL ? (
                            <img 
                              src={selectedProduct.imageURL} 
                              alt={selectedProduct.name} 
                              className="h-full w-full object-contain" 
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <ShoppingBag className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="mb-4">
                          <h3 className="text-sm opacity-70">Description</h3>
                          <p className={`mt-1 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                            {selectedProduct.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${selectedProduct.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <p className="text-sm">{selectedProduct.inStock ? 'In Stock' : 'Out of Stock'}</p>
                          </div>
                          
                          {selectedProduct.featured && (
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full mr-2 bg-accent"></div>
                              <p className="text-sm">Featured</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Tiers */}
                    <div>
                      <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                        Product Tiers
                      </h3>
                      
                      {selectedProduct.tiers && selectedProduct.tiers.map((tier: ProductTier) => (
                        <div 
                          key={tier.id} 
                          className={`p-4 mb-3 rounded-lg ${
                            isDarkMode ? 'bg-black/10' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                                {tier.name}
                              </h4>
                              <p className="text-sm opacity-70">{tier.description}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-semibold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                                £{tier.price}
                              </p>
                              <div className="flex items-center justify-end mt-1">
                                {tier.inStock ? (
                                  <span className="text-xs flex items-center text-green-500">
                                    <Check className="h-3 w-3 mr-1" /> In Stock
                                  </span>
                                ) : (
                                  <span className="text-xs flex items-center text-red-500">
                                    <X className="h-3 w-3 mr-1" /> Out of Stock
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </MotionWrapper>
    </div>
  );
};

export default ProductManagementPage; 