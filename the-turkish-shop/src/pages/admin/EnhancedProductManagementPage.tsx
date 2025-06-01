import React, { useState, useEffect } from 'react';
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
  PlatformType,
  DeliveryMethod
} from '../../firebase/productService';
import MotionWrapper from '../../components/animations/MotionWrapper';
import { 
  Search, Plus, Edit, Trash2, X, Save, Upload, Image,
  ShoppingBag, Gamepad2, DollarSign, Package,
  Star, Zap, Clock, Globe, AlertCircle, ChevronDown,
  Copy, Eye, EyeOff, Tag, TrendingUp, Sparkles
} from 'lucide-react';
import { auth } from '../../firebase/config';

const EnhancedProductManagementPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ProductType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFiles, setImageFiles] = useState<{ main?: File; gallery: File[] }>({ gallery: [] });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic', 'pricing', 'delivery']));

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    shortDescription: '',
    imageURL: '',
    gallery: [],
    type: 'other',
    category: 'other',
    platform: undefined,
    tags: [],
    tiers: [{
      id: `tier_${Date.now()}`,
      name: 'Standard',
      price: 0,
      description: '',
      inStock: true
    }],
    inStock: true,
    featured: false,
    isNew: false,
    isBestseller: false,
    deliveryMethod: 'instant',
    deliveryTime: 'Instant',
    deliveryInstructions: '',
    region: '',
    systemRequirements: {
      minimum: '',
      recommended: ''
    },
    ageRating: '',
    releaseDate: '',
    developer: '',
    publisher: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    displayOrder: 0,
    notes: ''
  });

  // Product type configurations
  const productTypeConfig = {
    subscription: {
      icon: <Package className="h-5 w-5" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      categories: ['streaming', 'gaming', 'software', 'other'] as ProductCategory[]
    },
    game: {
      icon: <Gamepad2 className="h-5 w-5" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      categories: ['steam', 'playstation', 'xbox', 'nintendo', 'mobile', 'other'] as ProductCategory[]
    },
    currency: {
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      categories: ['in-game-currency', 'gift-card', 'other'] as ProductCategory[]
    },
    other: {
      icon: <ShoppingBag className="h-5 w-5" />,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-900/20',
      categories: ['other'] as ProductCategory[]
    }
  };

  useEffect(() => {
    checkAdminAndLoadProducts();
  }, []);

  const checkAdminAndLoadProducts = async () => {
    try {
      const adminStatus = await isAdmin();
      if (!adminStatus) {
        navigate('/admin');
        return;
      }
      await loadProducts();
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
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

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug from name
      if (field === 'name' && !editingProduct) {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  };

  const handleTierChange = (tierId: string, field: keyof ProductTier, value: any) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers?.map(tier => 
        tier.id === tierId ? { ...tier, [field]: value } : tier
      ) || []
    }));
  };

  const addTier = () => {
    setFormData(prev => ({
      ...prev,
      tiers: [...(prev.tiers || []), {
        id: `tier_${Date.now()}`,
        name: '',
        price: 0,
        description: '',
        inStock: true
      }]
    }));
  };

  const removeTier = (tierId: string) => {
    if ((formData.tiers?.length || 0) <= 1) {
      setError('Product must have at least one tier');
      return;
    }
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers?.filter(tier => tier.id !== tierId) || []
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'gallery') => {
    const files = e.target.files;
    if (!files) return;

    if (type === 'main' && files[0]) {
      setImageFiles(prev => ({ ...prev, main: files[0] }));
    } else if (type === 'gallery') {
      setImageFiles(prev => ({ 
        ...prev, 
        gallery: [...prev.gallery, ...Array.from(files)] 
      }));
    }
  };

  const removeGalleryImage = (index: number) => {
    setImageFiles(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
    
    if (formData.gallery) {
      setFormData(prev => ({
        ...prev,
        gallery: prev.gallery?.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      setError('Product name is required');
      return false;
    }
    
    if (!formData.description?.trim()) {
      setError('Product description is required');
      return false;
    }
    
    if (!formData.tiers || formData.tiers.length === 0) {
      setError('At least one tier is required');
      return false;
    }
    
    for (const tier of formData.tiers) {
      if (!tier.name || tier.price < 0) {
        setError('All tiers must have a name and valid price');
        return false;
      }
    }
    
    if (!imageFiles.main && !formData.imageURL) {
      setError('Product image is required');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Upload images
      let imageURL = formData.imageURL || '';
      let gallery = formData.gallery || [];
      
      if (imageFiles.main) {
        imageURL = await uploadProductImage(imageFiles.main, formData.name || 'product');
      }
      
      if (imageFiles.gallery.length > 0) {
        const uploadedGallery = await Promise.all(
          imageFiles.gallery.map((file, index) => 
            uploadProductImage(file, `${formData.name || 'product'}_gallery_${index}`)
          )
        );
        gallery = [...gallery, ...uploadedGallery];
      }
      
      const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
        imageURL,
        gallery,
        [editingProduct ? 'updatedBy' : 'createdBy']: auth.currentUser?.uid
      };
      
      if (editingProduct) {
        await updateProduct({ ...productData, id: editingProduct.id } as Product);
        setSuccess('Product updated successfully!');
      } else {
        await createProduct(productData);
        setSuccess('Product created successfully!');
      }
      
      await loadProducts();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    
    setLoading(true);
    try {
      await deleteProduct(product.id);
      await loadProducts();
      setSuccess('Product deleted successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      shortDescription: '',
      imageURL: '',
      gallery: [],
      type: 'other',
      category: 'other',
      tiers: [{
        id: `tier_${Date.now()}`,
        name: 'Standard',
        price: 0,
        description: '',
        inStock: true
      }],
      inStock: true,
      featured: false,
      deliveryMethod: 'instant',
      deliveryTime: 'Instant'
    });
    setImageFiles({ gallery: [] });
    setExpandedSections(new Set(['basic', 'pricing', 'delivery']));
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || product.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <MotionWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Product Management
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your products, pricing, and inventory
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Product
            </button>
            <Link
              to="/admin"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
            <button onClick={() => setError(null)}>
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {success}
            </div>
            <button onClick={() => setSuccess(null)}>
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white placeholder-gray-400' 
                    : 'bg-gray-50 text-gray-800 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ProductType | 'all')}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-gray-50 text-gray-800'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value="all">All Types</option>
              <option value="subscription">Subscriptions</option>
              <option value="game">Games</option>
              <option value="currency">Currency</option>
              <option value="other">Other</option>
            </select>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ProductCategory | 'all')}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-gray-50 text-gray-800'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value="all">All Categories</option>
              <option value="streaming">Streaming</option>
              <option value="gaming">Gaming</option>
              <option value="software">Software</option>
              <option value="steam">Steam</option>
              <option value="playstation">PlayStation</option>
              <option value="xbox">Xbox</option>
              <option value="nintendo">Nintendo</option>
              <option value="mobile">Mobile</option>
              <option value="gift-card">Gift Cards</option>
              <option value="in-game-currency">In-Game Currency</option>
              <option value="other">Other</option>
            </select>
            
            <div className="flex items-center gap-4 text-sm">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {filteredProducts.length} products
              </span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`rounded-lg p-4 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg hover:shadow-xl transition-all`}
              >
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {product.imageURL ? (
                    <img
                      src={product.imageURL}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${productTypeConfig[product.type].bgColor} ${productTypeConfig[product.type].color}`}>
                      {product.type}
                    </span>
                    {product.featured && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600">
                        <Star className="h-3 w-3 inline mr-1" />
                        Featured
                      </span>
                    )}
                    {product.isNew && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-600">
                        <Sparkles className="h-3 w-3 inline mr-1" />
                        New
                      </span>
                    )}
                    {product.isBestseller && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-600">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        Bestseller
                      </span>
                    )}
                  </div>
                  
                  {/* Stock Status */}
                  <div className="absolute top-2 right-2">
                    {product.inStock ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-600">
                        In Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-600">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
                
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {product.name}
                </h3>
                
                <p className={`text-sm mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {product.shortDescription || product.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {product.deliveryMethod === 'instant' && (
                      <Zap className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {product.deliveryTime || 'Instant Delivery'}
                    </span>
                  </div>
                  {product.platform && (
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {product.platform}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      From
                    </span>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      ${product.tiers[0]?.price || 0}
                    </p>
                  </div>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {product.tiers.length} {product.tiers.length === 1 ? 'tier' : 'tiers'}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/products/${product.slug || product.id}`)}
                    className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Expandable Sections */}
              <div className="space-y-4">
                {/* Basic Information */}
                <div className={`border rounded-lg ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => toggleSection('basic')}
                    className={`w-full px-4 py-3 flex items-center justify-between ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Basic Information
                    </h3>
                    <ChevronDown className={`h-5 w-5 transition-transform ${
                      expandedSections.has('basic') ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {expandedSections.has('basic') && (
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Product Name *
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleFormChange('name', e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            URL Slug
                          </label>
                          <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => handleFormChange('slug', e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                            placeholder="auto-generated-from-name"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Short Description
                        </label>
                        <input
                          type="text"
                          value={formData.shortDescription}
                          onChange={(e) => handleFormChange('shortDescription', e.target.value)}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          placeholder="Brief description for product cards"
                        />
                      </div>
                      
                      <div>
                        <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Full Description *
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => handleFormChange('description', e.target.value)}
                          rows={4}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Product Type *
                          </label>
                          <select
                            value={formData.type}
                            onChange={(e) => handleFormChange('type', e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          >
                            <option value="subscription">Subscription</option>
                            <option value="game">Game</option>
                            <option value="currency">Currency</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Category *
                          </label>
                          <select
                            value={formData.category}
                            onChange={(e) => handleFormChange('category', e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          >
                            {productTypeConfig[formData.type as ProductType]?.categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Platform
                          </label>
                          <select
                            value={formData.platform || ''}
                            onChange={(e) => handleFormChange('platform', e.target.value || undefined)}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          >
                            <option value="">None</option>
                            <option value="steam">Steam</option>
                            <option value="playstation">PlayStation</option>
                            <option value="xbox">Xbox</option>
                            <option value="nintendo">Nintendo</option>
                            <option value="epic">Epic Games</option>
                            <option value="discord">Discord</option>
                            <option value="spotify">Spotify</option>
                            <option value="netflix">Netflix</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={formData.tags?.join(', ')}
                          onChange={(e) => handleFormChange('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          placeholder="action, multiplayer, fps"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.inStock}
                            onChange={(e) => handleFormChange('inStock', e.target.checked)}
                            className="rounded text-purple-500 focus:ring-purple-500"
                          />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>In Stock</span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => handleFormChange('featured', e.target.checked)}
                            className="rounded text-purple-500 focus:ring-purple-500"
                          />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Featured</span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.isNew}
                            onChange={(e) => handleFormChange('isNew', e.target.checked)}
                            className="rounded text-purple-500 focus:ring-purple-500"
                          />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>New</span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.isBestseller}
                            onChange={(e) => handleFormChange('isBestseller', e.target.checked)}
                            className="rounded text-purple-500 focus:ring-purple-500"
                          />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Bestseller</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Images */}
                <div className={`border rounded-lg ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => toggleSection('images')}
                    className={`w-full px-4 py-3 flex items-center justify-between ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Images
                    </h3>
                    <ChevronDown className={`h-5 w-5 transition-transform ${
                      expandedSections.has('images') ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {expandedSections.has('images') && (
                    <div className="p-4 space-y-4">
                      <div>
                        <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Main Image *
                        </label>
                        <div className="flex items-center gap-4">
                          {(formData.imageURL || imageFiles.main) && (
                            <img
                              src={imageFiles.main ? URL.createObjectURL(imageFiles.main) : formData.imageURL}
                              alt="Main product"
                              className="h-24 w-24 object-cover rounded-lg"
                            />
                          )}
                          <label className="cursor-pointer px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'main')}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Gallery Images
                        </label>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {[...(formData.gallery || []), ...imageFiles.gallery.map(f => URL.createObjectURL(f))].map((img, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={img}
                                  alt={`Gallery ${index + 1}`}
                                  className="h-20 w-20 object-cover rounded-lg"
                                />
                                <button
                                  onClick={() => removeGalleryImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <label className="cursor-pointer px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors inline-flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Add Gallery Images
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleImageUpload(e, 'gallery')}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing & Tiers */}
                <div className={`border rounded-lg ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => toggleSection('pricing')}
                    className={`w-full px-4 py-3 flex items-center justify-between ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Pricing & Tiers
                    </h3>
                    <ChevronDown className={`h-5 w-5 transition-transform ${
                      expandedSections.has('pricing') ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {expandedSections.has('pricing') && (
                    <div className="p-4 space-y-4">
                      {formData.tiers?.map((tier, index) => (
                        <div key={tier.id} className={`p-4 rounded-lg border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium">Tier {index + 1}</h4>
                            {(formData.tiers?.length || 0) > 1 && (
                              <button
                                onClick={() => removeTier(tier.id)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm mb-1">Tier Name *</label>
                              <input
                                type="text"
                                value={tier.name}
                                onChange={(e) => handleTierChange(tier.id, 'name', e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  isDarkMode 
                                    ? 'bg-gray-800 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                placeholder="e.g., Basic, Premium"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm mb-1">Price *</label>
                                <input
                                  type="number"
                                  value={tier.price}
                                  onChange={(e) => handleTierChange(tier.id, 'price', parseFloat(e.target.value) || 0)}
                                  step="0.01"
                                  min="0"
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    isDarkMode 
                                      ? 'bg-gray-800 border-gray-600 text-white' 
                                      : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm mb-1">Original Price</label>
                                <input
                                  type="number"
                                  value={tier.originalPrice || ''}
                                  onChange={(e) => handleTierChange(tier.id, 'originalPrice', parseFloat(e.target.value) || undefined)}
                                  step="0.01"
                                  min="0"
                                  className={`w-full px-3 py-2 rounded-lg border ${
                                    isDarkMode 
                                      ? 'bg-gray-800 border-gray-600 text-white' 
                                      : 'bg-white border-gray-300 text-gray-900'
                                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <label className="block text-sm mb-1">Description</label>
                            <input
                              type="text"
                              value={tier.description}
                              onChange={(e) => handleTierChange(tier.id, 'description', e.target.value)}
                              className={`w-full px-3 py-2 rounded-lg border ${
                                isDarkMode 
                                  ? 'bg-gray-800 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                              placeholder="What's included in this tier"
                            />
                          </div>
                          
                          {formData.type === 'subscription' && (
                            <div className="mt-3">
                              <label className="block text-sm mb-1">Duration</label>
                              <input
                                type="text"
                                value={tier.duration || ''}
                                onChange={(e) => handleTierChange(tier.id, 'duration', e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  isDarkMode 
                                    ? 'bg-gray-800 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                placeholder="e.g., 1 month, 3 months"
                              />
                            </div>
                          )}
                          
                          {formData.type === 'currency' && (
                            <div className="mt-3">
                              <label className="block text-sm mb-1">Amount</label>
                              <input
                                type="text"
                                value={tier.amount || ''}
                                onChange={(e) => handleTierChange(tier.id, 'amount', e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  isDarkMode 
                                    ? 'bg-gray-800 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                placeholder="e.g., 1000 Robux, $10"
                              />
                            </div>
                          )}
                          
                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm mb-1">Stock Count</label>
                              <input
                                type="number"
                                value={tier.stockCount || ''}
                                onChange={(e) => handleTierChange(tier.id, 'stockCount', parseInt(e.target.value) || undefined)}
                                min="0"
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  isDarkMode 
                                    ? 'bg-gray-800 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                placeholder="Leave empty for unlimited"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm mb-1">Max Quantity/Order</label>
                              <input
                                type="number"
                                value={tier.maxQuantity || ''}
                                onChange={(e) => handleTierChange(tier.id, 'maxQuantity', parseInt(e.target.value) || undefined)}
                                min="1"
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  isDarkMode 
                                    ? 'bg-gray-800 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                placeholder="Leave empty for unlimited"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-3 flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={tier.inStock}
                              onChange={(e) => handleTierChange(tier.id, 'inStock', e.target.checked)}
                              className="rounded text-purple-500 focus:ring-purple-500"
                            />
                            <label className="text-sm">In Stock</label>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        onClick={addTier}
                        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Tier
                      </button>
                    </div>
                  )}
                </div>

                {/* Delivery */}
                <div className={`border rounded-lg ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => toggleSection('delivery')}
                    className={`w-full px-4 py-3 flex items-center justify-between ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Delivery Settings
                    </h3>
                    <ChevronDown className={`h-5 w-5 transition-transform ${
                      expandedSections.has('delivery') ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {expandedSections.has('delivery') && (
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Delivery Method *
                          </label>
                          <select
                            value={formData.deliveryMethod}
                            onChange={(e) => handleFormChange('deliveryMethod', e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          >
                            <option value="instant">Instant Delivery</option>
                            <option value="manual">Manual Delivery</option>
                            <option value="email">Email Delivery</option>
                            <option value="account">Account Delivery</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Delivery Time
                          </label>
                          <input
                            type="text"
                            value={formData.deliveryTime}
                            onChange={(e) => handleFormChange('deliveryTime', e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                            placeholder="e.g., Instant, Within 24 hours"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Delivery Instructions
                        </label>
                        <textarea
                          value={formData.deliveryInstructions}
                          onChange={(e) => handleFormChange('deliveryInstructions', e.target.value)}
                          rows={3}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          placeholder="Instructions shown to customers after purchase"
                        />
                      </div>
                      
                      {formData.type === 'game' && (
                        <div>
                          <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Region
                          </label>
                          <input
                            type="text"
                            value={formData.region}
                            onChange={(e) => handleFormChange('region', e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                            placeholder="e.g., Global, EU, US"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Additional Details */}
                <div className={`border rounded-lg ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => toggleSection('additional')}
                    className={`w-full px-4 py-3 flex items-center justify-between ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Additional Details
                    </h3>
                    <ChevronDown className={`h-5 w-5 transition-transform ${
                      expandedSections.has('additional') ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {expandedSections.has('additional') && (
                    <div className="p-4 space-y-4">
                      {formData.type === 'game' && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Developer
                              </label>
                              <input
                                type="text"
                                value={formData.developer}
                                onChange={(e) => handleFormChange('developer', e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                  isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                              />
                            </div>
                            
                            <div>
                              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Publisher
                              </label>
                              <input
                                type="text"
                                value={formData.publisher}
                                onChange={(e) => handleFormChange('publisher', e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                  isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                              />
                            </div>
                            
                            <div>
                              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Release Date
                              </label>
                              <input
                                type="date"
                                value={formData.releaseDate}
                                onChange={(e) => handleFormChange('releaseDate', e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                  isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Age Rating
                            </label>
                            <input
                              type="text"
                              value={formData.ageRating}
                              onChange={(e) => handleFormChange('ageRating', e.target.value)}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                isDarkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                              placeholder="e.g., PEGI 18, ESRB M"
                            />
                          </div>
                          
                          <div>
                            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              System Requirements (Minimum)
                            </label>
                            <textarea
                              value={formData.systemRequirements?.minimum}
                              onChange={(e) => handleFormChange('systemRequirements', { 
                                ...formData.systemRequirements, 
                                minimum: e.target.value 
                              })}
                              rows={3}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                isDarkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                            />
                          </div>
                          
                          <div>
                            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              System Requirements (Recommended)
                            </label>
                            <textarea
                              value={formData.systemRequirements?.recommended}
                              onChange={(e) => handleFormChange('systemRequirements', { 
                                ...formData.systemRequirements, 
                                recommended: e.target.value 
                              })}
                              rows={3}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                isDarkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                            />
                          </div>
                        </>
                      )}
                      
                      <div>
                        <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Internal Notes
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => handleFormChange('notes', e.target.value)}
                          rows={3}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          placeholder="Internal notes (not visible to customers)"
                        />
                      </div>
                      
                      <div>
                        <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={formData.displayOrder}
                          onChange={(e) => handleFormChange('displayOrder', parseInt(e.target.value) || 0)}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          placeholder="Lower numbers appear first"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* SEO */}
                <div className={`border rounded-lg ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => toggleSection('seo')}
                    className={`w-full px-4 py-3 flex items-center justify-between ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      SEO Settings
                    </h3>
                    <ChevronDown className={`h-5 w-5 transition-transform ${
                      expandedSections.has('seo') ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {expandedSections.has('seo') && (
                    <div className="p-4 space-y-4">
                      <div>
                        <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Meta Title
                        </label>
                        <input
                          type="text"
                          value={formData.metaTitle}
                          onChange={(e) => handleFormChange('metaTitle', e.target.value)}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          placeholder={formData.name || 'Product meta title'}
                        />
                      </div>
                      
                      <div>
                        <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Meta Description
                        </label>
                        <textarea
                          value={formData.metaDescription}
                          onChange={(e) => handleFormChange('metaDescription', e.target.value)}
                          rows={3}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          placeholder={formData.shortDescription || formData.description || 'Product meta description'}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 mt-6 pt-6 border-t dark:border-gray-700">
                <button
                  onClick={handleCloseModal}
                  className={`px-6 py-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MotionWrapper>
  );
};

export default EnhancedProductManagementPage; 