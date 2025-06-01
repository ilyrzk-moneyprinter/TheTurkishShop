import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { isAdmin, ensureAdminRole } from '../../firebase/authService';
import { getAllVouches, updateVouchStatus, deleteVouch, addManualVouch, Vouch, VouchStatus, VerificationType } from '../../firebase/vouchService';
import { uploadFile } from '../../firebase/storageService';
import { auth, db } from '../../firebase/config';
import { getDoc, doc } from 'firebase/firestore';
import MotionWrapper from '../../components/animations/MotionWrapper';
import { 
  Search, Star, CheckCircle, XCircle, Plus, Trash2, Edit, User, 
  Camera, MapPin, ShoppingBag, Calendar, DollarSign, Image, 
  Instagram, Twitter, Shield, Globe, Upload, X, Mail,
  AlertCircle, MessageSquare, Clock, Hash, Flag, Store, ShieldCheck
} from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';

const VouchManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [vouches, setVouches] = useState<Vouch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | VouchStatus>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVouch, setEditingVouch] = useState<Vouch | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showAdminIssue, setShowAdminIssue] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    profilePicture: '',
    
    // Location
    country: '',
    city: '',
    countryCode: '',
    
    // Purchase Details
    productPurchased: '',
    orderNumber: '',
    purchaseDate: '',
    purchaseAmount: '',
    currency: 'USD',
    
    // Review Details
    platform: 'Website',
    rating: 5,
    message: '',
    
    // Images
    purchaseScreenshot: '',
    additionalImages: [] as string[],
    
    // Social Media
    discordUsername: '',
    instagramHandle: '',
    twitterHandle: '',
    
    // Verification
    verificationMethod: 'none' as VerificationType,
    isVerifiedPurchase: false,
    verificationDate: '',
    
    // Status
    status: 'approved' as VouchStatus
  });

  useEffect(() => {
    loadVouches();
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const adminCheck = await isAdmin();
      console.log('Admin check result:', adminCheck);
      
      // Also check the current user details
      const user = await auth.currentUser;
      if (user) {
        console.log('Current user:', {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        });
        
        // Check user document in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          console.log('User document data:', userDoc.data());
          if (userDoc.data()?.role !== 'admin') {
            setShowAdminIssue(true);
          }
        } else {
          console.log('No user document found in Firestore');
          setShowAdminIssue(true);
        }
      } else {
        console.log('No user is currently signed in');
      }
      
      if (!adminCheck) {
        // Don't navigate away immediately if we can fix the issue
        if (user?.email === 'senpaimc04@gmail.com') {
          setShowAdminIssue(true);
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    }
  };

  const handleFixAdminRole = async () => {
    try {
      const success = await ensureAdminRole();
      if (success) {
        alert('Admin role has been set successfully! Please refresh the page.');
        window.location.reload();
      } else {
        alert('Failed to set admin role. Please make sure you are logged in with the correct admin email.');
      }
    } catch (error) {
      console.error('Error fixing admin role:', error);
      alert('Error setting admin role. Please check the console for details.');
    }
  };

  const loadVouches = async () => {
    try {
      setIsLoading(true);
      console.log('Loading vouches...');
      const data = await getAllVouches();
      console.log('Vouches loaded:', data);
      setVouches(data);
    } catch (error) {
      console.error('Error loading vouches:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        alert('You do not have permission to view vouches. Please sign in as an admin.');
      } else {
        alert('Failed to load vouches. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: VouchStatus) => {
    try {
      await updateVouchStatus(id, status);
      await loadVouches();
    } catch (error) {
      console.error('Error updating vouch status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vouch?')) {
      try {
        await deleteVouch(id);
        await loadVouches();
      } catch (error) {
        console.error('Error deleting vouch:', error);
      }
    }
  };

  const handleImageUpload = async (file: File, field: 'profilePicture' | 'purchaseScreenshot' | 'additional') => {
    setUploadingImages(true);
    try {
      const url = await uploadFile(file, 'vouches');
      
      if (field === 'additional') {
        setFormData(prev => ({
          ...prev,
          additionalImages: [...prev.additionalImages, url]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: url
        }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create a copy of formData with proper date handling
      const formDataWithFixedDates = {
        ...formData,
        // Convert empty string dates to null instead of undefined
        purchaseDate: formData.purchaseDate && formData.purchaseDate.trim() !== '' ? formData.purchaseDate : null,
        verificationDate: formData.verificationDate && formData.verificationDate.trim() !== '' ? formData.verificationDate : null
      };

      const vouchData: Omit<Vouch, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formDataWithFixedDates,
        rating: Number(formData.rating),
        purchaseAmount: formData.purchaseAmount ? Number(formData.purchaseAmount) : undefined,
        isManual: true
      };
      
      // Remove undefined fields to prevent Firestore errors
      const cleanedData = Object.entries(vouchData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key as keyof typeof vouchData] = value;
        }
        return acc;
      }, {} as any);
      
      if (editingVouch) {
        // Update existing vouch (would need to implement updateVouch function)
        console.log('Update not implemented yet');
      } else {
        // Add new vouch
        await addManualVouch(cleanedData);
      }
      
      setShowAddModal(false);
      resetForm();
      await loadVouches();
    } catch (error: any) {
      console.error('Error saving vouch:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // More specific error messages
      if (error.message?.includes('Unauthorized')) {
        alert('Unauthorized: You need admin privileges to add vouches. Please ensure you are logged in as an admin.');
      } else if (error.message?.includes('permission-denied')) {
        alert('Permission denied: Your account does not have permission to add vouches. Please contact support.');
      } else if (error.message?.includes('Name and message are required')) {
        alert('Please fill in all required fields: Name and Message are required.');
      } else {
        alert(`Failed to save vouch: ${error.message || 'Unknown error occurred'}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
        name: '',
      email: '',
      profilePicture: '',
      country: '',
      city: '',
      countryCode: '',
      productPurchased: '',
      orderNumber: '',
      purchaseDate: '',
      purchaseAmount: '',
      currency: 'USD',
        platform: 'Website',
        rating: 5,
        message: '',
      purchaseScreenshot: '',
      additionalImages: [],
      discordUsername: '',
      instagramHandle: '',
      twitterHandle: '',
      verificationMethod: 'none',
      isVerifiedPurchase: false,
      verificationDate: '',
      status: 'approved'
    });
    setEditingVouch(null);
  };

  const filteredVouches = vouches.filter(vouch => {
    const matchesSearch = 
      vouch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vouch.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vouch.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vouch.productPurchased?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || vouch.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getVerificationBadge = (method: VerificationType | undefined) => {
    switch (method) {
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'purchase':
        return <ShoppingBag className="h-4 w-4 text-green-500" />;
      case 'social':
        return <Instagram className="h-4 w-4 text-purple-500" />;
      case 'phone':
        return <Shield className="h-4 w-4 text-indigo-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: VouchStatus) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</span>;
  }
  };

  return (
    <MotionWrapper>
    <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Vouch Management
          </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage customer testimonials and reviews
            </p>
            </div>
          <div className="flex space-x-4">
              <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2"
              >
              <Plus className="h-5 w-5" />
              <span>Add Vouch</span>
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

        {/* Admin Permission Issue Alert */}
        {showAdminIssue && (
          <div className={`mb-6 p-4 rounded-lg border ${
            isDarkMode 
              ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300' 
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Admin Permissions Issue</h3>
                <p className="text-sm mb-3">
                  Your account does not have the admin role set properly in the database. 
                  This is preventing you from adding or managing vouches.
                </p>
                <button
                  onClick={handleFixAdminRole}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm font-medium"
                >
                  Fix Admin Permissions
                </button>
              </div>
            </div>
          </div>
        )}
          
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
              <input
                type="text"
              placeholder="Search vouches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
              <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as 'all' | VouchStatus)}
            className={`px-4 py-2 rounded-lg border ${
                  isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
            <option value="all">All Status</option>
                <option value="approved">Approved</option>
            <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
          </div>
          
            {/* Vouches List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : filteredVouches.length === 0 ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No vouches found</p>
          </div>
              ) : (
          <div className="grid gap-6">
                  {filteredVouches.map((vouch) => (
                    <div 
                      key={vouch.id}
                className={`rounded-lg border p-6 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Profile Picture */}
                    {vouch.profilePicture ? (
                      <img
                        src={vouch.profilePicture}
                        alt={vouch.name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                        <User className="h-8 w-8 text-gray-500" />
                        </div>
                    )}
                    
                    <div className="flex-1">
                      {/* Header Info */}
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {vouch.name}
                        </h3>
                        {getStatusBadge(vouch.status)}
                        {vouch.verificationMethod && vouch.verificationMethod !== 'none' && (
                          <div className="flex items-center space-x-1">
                            {getVerificationBadge(vouch.verificationMethod)}
                            <span className="text-xs text-gray-500">Verified</span>
                          </div>
                        )}
                        {vouch.isManual && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                            Manual
                          </span>
                        )}
                      </div>
                      
                      {/* Contact & Location */}
                      <div className="flex flex-wrap gap-4 text-sm mb-3">
                        {vouch.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{vouch.email}</span>
                          </div>
                        )}
                        {(vouch.city || vouch.country) && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                              {[vouch.city, vouch.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                        {vouch.platform && (
                          <div className="flex items-center space-x-1">
                            <Store className="h-4 w-4 text-gray-500" />
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{vouch.platform}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Purchase Details - Enhanced */}
                      {(vouch.productPurchased || vouch.orderNumber) && (
                        <div className={`rounded-lg p-3 mb-3 ${
                          vouch.isVerifiedPurchase 
                            ? isDarkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
                            : isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className={`h-4 w-4 ${vouch.isVerifiedPurchase ? 'text-green-500' : 'text-gray-500'}`} />
                            <span className={`text-sm font-medium ${
                              vouch.isVerifiedPurchase 
                                ? isDarkMode ? 'text-green-400' : 'text-green-700'
                                : isDarkMode ? 'text-gray-400' : 'text-gray-700'
                            }`}>
                              {vouch.isVerifiedPurchase ? 'Verified Purchase' : 'Purchase Details'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {vouch.productPurchased && (
                              <div className="flex items-center space-x-1">
                                <ShoppingBag className="h-4 w-4 text-purple-500" />
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                  {vouch.productPurchased}
                                </span>
                              </div>
                            )}
                            {vouch.orderNumber && (
                              <div className="flex items-center space-x-1">
                                <Hash className="h-4 w-4 text-blue-500" />
                                <span className={`font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Order: {vouch.orderNumber}
                                </span>
                              </div>
                            )}
                            {vouch.purchaseAmount && (
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4 text-yellow-500" />
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                  {vouch.currency || 'USD'} {vouch.purchaseAmount}
                                </span>
                              </div>
                            )}
                            {vouch.purchaseDate && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                  {vouch.purchaseDate.toDate ? 
                                    new Date(vouch.purchaseDate.toDate()).toLocaleDateString() : 
                                    new Date(vouch.purchaseDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Rating */}
                      <div className="flex items-center space-x-2 mb-3">
                            <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < vouch.rating
                                  ? 'text-yellow-400 fill-current'
                                  : isDarkMode ? 'text-gray-600' : 'text-gray-300'
                              }`}
                            />
                              ))}
                            </div>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {vouch.rating}/5
                            </span>
                          </div>
                      
                      {/* Message */}
                      <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {vouch.message}
                      </p>
                      
                      {/* Social Media */}
                      {(vouch.discordUsername || vouch.instagramHandle || vouch.twitterHandle) && (
                        <div className="flex flex-wrap gap-3 mb-3">
                          {vouch.discordUsername && (
                            <div className="flex items-center space-x-1 text-sm">
                              <FaDiscord className="h-4 w-4 text-indigo-500" />
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                {vouch.discordUsername}
                              </span>
                        </div>
                          )}
                          {vouch.instagramHandle && (
                            <div className="flex items-center space-x-1 text-sm">
                              <Instagram className="h-4 w-4 text-pink-500" />
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                @{vouch.instagramHandle}
                              </span>
                            </div>
                          )}
                          {vouch.twitterHandle && (
                            <div className="flex items-center space-x-1 text-sm">
                              <Twitter className="h-4 w-4 text-blue-400" />
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                @{vouch.twitterHandle}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Images */}
                      {(vouch.purchaseScreenshot || vouch.additionalImages?.length) && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {vouch.purchaseScreenshot && (
                            <a
                              href={vouch.purchaseScreenshot}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                                isDarkMode
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <Image className="h-3 w-3" />
                              <span>Purchase Proof</span>
                            </a>
                          )}
                          {vouch.additionalImages?.map((img, idx) => (
                            <a
                              key={idx}
                              href={img}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                                isDarkMode
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <Image className="h-3 w-3" />
                              <span>Image {idx + 1}</span>
                            </a>
                          ))}
                      </div>
                      )}
                      
                      {/* Timestamp */}
                      <div className="flex items-center space-x-1 text-xs">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                          {vouch.createdAt?.toDate ? 
                            new Date(vouch.createdAt.toDate()).toLocaleDateString() : 
                            'Unknown date'}
                        </span>
                    </div>
                </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    {vouch.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(vouch.id, 'approved')}
                          className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(vouch.id, 'rejected')}
                          className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(vouch.id)}
                      className={`p-2 rounded transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
            </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } p-6`}>
                  <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {editingVouch ? 'Edit Vouch' : 'Add New Vouch'}
                    </h2>
                    <button 
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700`}
                    >
                  <X className="h-5 w-5" />
                    </button>
                  </div>
                  
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                    <div>
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    </div>
                    
                  {/* Profile Picture */}
                  <div className="mt-4">
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Profile Picture
                    </label>
                    <div className="flex items-center space-x-4">
                      {formData.profilePicture ? (
                        <img
                          src={formData.profilePicture}
                          alt="Profile"
                          className="h-20 w-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`h-20 w-20 rounded-full flex items-center justify-center ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          <Camera className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'profilePicture');
                        }}
                        className="hidden"
                        id="profile-upload"
                      />
                      <label
                        htmlFor="profile-upload"
                        className={`px-4 py-2 rounded-lg cursor-pointer ${
                          isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {uploadingImages ? 'Uploading...' : 'Upload Photo'}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Location */}
                      <div>
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Country Code
                      </label>
                      <input
                        type="text"
                        value={formData.countryCode}
                        onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                        placeholder="e.g., US, GB"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                </div>

                {/* Purchase Details */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Purchase Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Product Purchased
                      </label>
                      <input
                        type="text"
                        value={formData.productPurchased}
                        onChange={(e) => setFormData({...formData, productPurchased: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Order Number
                      </label>
                      <input
                        type="text"
                        value={formData.orderNumber}
                        onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Purchase Date
                      </label>
                      <input
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Amount
                      </label>
                      <div className="flex space-x-2">
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData({...formData, currency: e.target.value})}
                          className={`px-4 py-2 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="TRY">TRY</option>
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.purchaseAmount}
                          onChange={(e) => setFormData({...formData, purchaseAmount: e.target.value})}
                          className={`flex-1 px-4 py-2 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Details */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Review Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Platform
                      </label>
                      <select
                        value={formData.platform}
                        onChange={(e) => setFormData({...formData, platform: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="Website">Website</option>
                          <option value="Discord">Discord</option>
                        <option value="Trustpilot">Trustpilot</option>
                        <option value="Google">Google</option>
                        <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                      <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Rating *
                      </label>
                        <select
                        value={formData.rating}
                        onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        required
                        >
                          <option value="5">5 Stars</option>
                          <option value="4">4 Stars</option>
                          <option value="3">3 Stars</option>
                          <option value="2">2 Stars</option>
                          <option value="1">1 Star</option>
                        </select>
                      </div>
                    </div>
                  <div className="mt-4">
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Review Message *
                    </label>
                      <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={4}
                      className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                    </div>
                    
                {/* Social Media */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Social Media
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Discord Username
                      </label>
                      <input
                        type="text"
                        value={formData.discordUsername}
                        onChange={(e) => setFormData({...formData, discordUsername: e.target.value})}
                        placeholder="user#1234"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Instagram Handle
                      </label>
                      <input
                        type="text"
                        value={formData.instagramHandle}
                        onChange={(e) => setFormData({...formData, instagramHandle: e.target.value})}
                        placeholder="username"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                  </div>
                    <div>
                      <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Twitter Handle
                      </label>
                      <input
                        type="text"
                        value={formData.twitterHandle}
                        onChange={(e) => setFormData({...formData, twitterHandle: e.target.value})}
                        placeholder="username"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                </div>
                  </div>
                </div>

                {/* Verification */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Verification
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Verification Method
                      </label>
                      <select
                        value={formData.verificationMethod}
                        onChange={(e) => setFormData({...formData, verificationMethod: e.target.value as VerificationType})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="none">None</option>
                        <option value="email">Email Verified</option>
                        <option value="purchase">Purchase Verified</option>
                        <option value="social">Social Media Verified</option>
                        <option value="phone">Phone Verified</option>
                      </select>
                </div>
                <div>
                      <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as VouchStatus})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isVerifiedPurchase}
                        onChange={(e) => setFormData({...formData, isVerifiedPurchase: e.target.checked})}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Verified Purchase
                      </span>
                    </label>
                        </div>
                      </div>
                      
                {/* Images */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Images & Screenshots
                  </h3>
                  
                  {/* Purchase Screenshot */}
                  <div className="mb-4">
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Purchase Screenshot
                    </label>
                    {formData.purchaseScreenshot && (
                      <img
                        src={formData.purchaseScreenshot}
                        alt="Purchase proof"
                        className="mb-2 max-w-xs rounded-lg"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'purchaseScreenshot');
                      }}
                      className="hidden"
                      id="purchase-upload"
                    />
                    <label
                      htmlFor="purchase-upload"
                      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer ${
                        isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      <span>{uploadingImages ? 'Uploading...' : 'Upload Screenshot'}</span>
                    </label>
                    </div>
                    
                  {/* Additional Images */}
                    <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Additional Images
                    </label>
                    {formData.additionalImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.additionalImages.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={img}
                              alt={`Additional ${idx + 1}`}
                              className="h-20 w-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  additionalImages: prev.additionalImages.filter((_, i) => i !== idx)
                                }));
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                    </div>
                        ))}
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'additional');
                      }}
                      className="hidden"
                      id="additional-upload"
                    />
                    <label
                      htmlFor="additional-upload"
                      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer ${
                        isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      <span>{uploadingImages ? 'Uploading...' : 'Add Image'}</span>
                    </label>
                  </div>
                    </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className={`px-6 py-2 rounded-lg ${
                      isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingImages}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImages ? 'Uploading...' : editingVouch ? 'Update' : 'Add'} Vouch
                  </button>
                    </div>
              </form>
            </div>
                </div>
              )}
        </div>
      </MotionWrapper>
  );
};

export default VouchManagementPage; 