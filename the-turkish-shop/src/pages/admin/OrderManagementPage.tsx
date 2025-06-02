import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { getAllOrders, processOrder, getOrderStats } from '../../firebase/adminService';
import { isAdmin } from '../../firebase/authService';
import { Order, OrderStatus } from '../../firebase/types';
import MotionWrapper from '../../components/animations/MotionWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Filter, Search, Clock, Check, X, ArrowUpRight, Truck, Package, AlertTriangle, RefreshCw, Upload, Monitor, Gamepad2 } from 'lucide-react';
import { getActiveOrders, updateOrderStatus, updateDeliveryType, updateQueuePosition, subscribeToActiveOrders, markOrderAsDeliveredWithProof } from '../../firebase/orderService';
import PaymentProofUpload from '../../components/PaymentProofUpload';

const OrderManagementPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Record<OrderStatus, number>>({
    pending: 0,
    'Payment Verification': 0,
    queued: 0,
    in_progress: 0,
    delivered: 0,
    delayed: 0,
    cancelled: 0
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedOrder, setDraggedOrder] = useState<Order | null>(null);
  const [deliveryProofFile, setDeliveryProofFile] = useState<File | null>(null);
  const [deliveryProofPreview, setDeliveryProofPreview] = useState<string | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check admin status on mount
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminStatus = await isAdmin();
        if (!adminStatus) {
          navigate('/signin'); // Redirect non-admins
          return;
        }

        // Load data
        await loadOrders();
        await loadStats();
      } catch (err: any) {
        setError(err.message || 'Error loading admin data');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  // Load orders with optional filter
  const loadOrders = async () => {
    try {
      const result = await getAllOrders(
        20, 
        undefined, 
        filterStatus !== 'all' ? filterStatus : undefined
      );
      setOrders(result.orders);
    } catch (err: any) {
      setError(err.message || 'Error loading orders');
    }
  };

  // Load order statistics
  const loadStats = async () => {
    try {
      const orderStats = await getOrderStats();
      setStats(orderStats);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  };

  // Filter change handler
  const handleFilterChange = async (status: OrderStatus | 'all') => {
    setFilterStatus(status);
    setLoading(true);
    setSelectedOrder(null);
    
    try {
      const result = await getAllOrders(
        20, 
        undefined, 
        status !== 'all' ? status : undefined
      );
      setOrders(result.orders);
    } catch (err: any) {
      setError(err.message || 'Error filtering orders');
    } finally {
      setLoading(false);
    }
  };

  // Handle order selection
  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setAdminNote('');
  };

  // Process order status change
  const handleStatusChange = async (status: OrderStatus) => {
    if (!selectedOrder) return;
    
    setActionLoading(true);
    try {
      const success = await processOrder(selectedOrder.orderID, status, adminNote || undefined);
      
      if (success) {
        // Update local state
        const updatedOrders = orders.map(order => 
          order.orderID === selectedOrder.orderID 
            ? { ...order, status, adminNotes: adminNote || order.adminNotes, updatedAt: new Date() } 
            : order
        );
        
        setOrders(updatedOrders);
        setSelectedOrder(prev => prev ? { ...prev, status, adminNotes: adminNote || prev.adminNotes, updatedAt: new Date() } : null);
        
        // Reload stats
        await loadStats();
      } else {
        setError('Failed to update order status');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating order');
    } finally {
      setActionLoading(false);
    }
  };

  // Format date for display
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore Timestamp objects
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return new Date(timestamp.toDate()).toLocaleString();
    }
    
    // Handle Date objects or ISO strings
    return new Date(timestamp).toLocaleString();
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'text-yellow-500';
      case 'in_progress':
        return 'text-blue-500';
      case 'delivered':
        return 'text-green-500';
      case 'delayed':
        return 'text-orange-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Subscribe to active orders for real-time updates
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    setLoading(true);
    
    // Prepare filter options
    const filterOptions: any = {};
    if (deliveryTypeFilter) {
      filterOptions.deliveryType = deliveryTypeFilter;
    }
    
    // Subscribe to order updates
    const unsubscribe = subscribeToActiveOrders((updatedOrders) => {
      setOrders(updatedOrders);
      setLoading(false);
    }, filterOptions);
    
    return () => {
      unsubscribe();
    };
  }, [currentUser, deliveryTypeFilter]);
  
  // Filter orders based on status and search term
  const filteredOrders = orders.filter(order => {
    // Apply status filter
    if (statusFilter !== 'all' && statusFilter !== 'games' && order.status !== statusFilter) {
      return false;
    }
    
    // Filter for game orders
    if (statusFilter === 'games' && !order.product.includes('Game') && !order.deliveryDetails?.gameUrl) {
      return false;
    }
    
    // Apply delivery type filter
    if (deliveryTypeFilter !== 'all' && order.deliveryType !== deliveryTypeFilter) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.orderID.toLowerCase().includes(searchLower) ||
        order.buyerEmail.toLowerCase().includes(searchLower) ||
        order.product.toLowerCase().includes(searchLower) ||
        (order.notes && order.notes.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });
  
  // Sort orders by delivery type (Express first), then by queue position
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    // Sort by delivery type first (Express before Standard)
    if (a.deliveryType !== b.deliveryType) {
      return a.deliveryType === 'Express' ? -1 : 1;
    }
    
    // Then sort by queue position
    return (a.queuePosition || 9999) - (b.queuePosition || 9999);
  });
  
  // Handle status update
  const handleStatusUpdate = async (orderID: string, status: 'queued' | 'in_progress' | 'delivered' | 'delayed' | 'cancelled') => {
    try {
      await updateOrderStatus(orderID, status);
      // Don't need to update state as the subscription will handle it
    } catch (error: any) {
      setError(`Error updating order status: ${error.message}`);
    }
  };
  
  // Handle delivery type update
  const handleDeliveryTypeUpdate = async (orderID: string, type: 'Standard' | 'Express') => {
    try {
      await updateDeliveryType(orderID, type);
      // Don't need to update state as the subscription will handle it
    } catch (error: any) {
      setError(`Error updating delivery type: ${error.message}`);
    }
  };
  
  // Drag and drop handlers for queue management
  const handleDragStart = (order: Order) => {
    setIsDragging(true);
    setDraggedOrder(order);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedOrder(null);
  };
  
  const handleDrop = async (targetOrder: Order) => {
    if (!draggedOrder || draggedOrder.orderID === targetOrder.orderID) {
      return;
    }
    
    try {
      // Update queue position
      await updateQueuePosition(draggedOrder.orderID, targetOrder.queuePosition || 0);
    } catch (error: any) {
      setError(`Error updating queue position: ${error.message}`);
    }
    
    setIsDragging(false);
    setDraggedOrder(null);
  };
  
  // Get status badge classes
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'queued':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'delivered':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'delayed':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };
  
  // Get delivery type badge classes
  const getDeliveryTypeBadge = (type?: string) => {
    if (type === 'Express') {
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    }
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <Package className="h-4 w-4" />;
      case 'delivered':
        return <Check className="h-4 w-4" />;
      case 'delayed':
        return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Handle delivery proof file change
  const handleDeliveryProofChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setDeliveryProofFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setDeliveryProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Mark order as delivered with optional proof
  const handleMarkAsDelivered = async () => {
    if (!selectedOrder) return;
    
    setActionLoading(true);
    try {
      const success = await markOrderAsDeliveredWithProof(
        selectedOrder.orderID,
        deliveryProofFile,
        adminNote || undefined
      );
      
      if (success) {
        // Update local state
        const updatedOrders = orders.map(order => 
          order.orderID === selectedOrder.orderID 
            ? { 
                ...order, 
                status: 'delivered' as OrderStatus, 
                adminNotes: adminNote || order.adminNotes, 
                updatedAt: new Date()
              } 
            : order
        );
        
        setOrders(updatedOrders);
        setSelectedOrder(prev => prev 
          ? { 
              ...prev, 
              status: 'delivered' as OrderStatus, 
              adminNotes: adminNote || prev.adminNotes, 
              updatedAt: new Date() 
            } 
          : null
        );
        
        // Reset delivery proof state
        setDeliveryProofFile(null);
        setDeliveryProofPreview(null);
        setShowDeliveryModal(false);
        
        // Reload stats
        await loadStats();
      } else {
        setError('Failed to mark order as delivered');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating order');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Cancel an order
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    
    setActionLoading(true);
    try {
      const success = await updateOrderStatus(selectedOrder.orderID, 'cancelled');
      
      if (success) {
        // Update local state
        const updatedOrders = orders.map(order => 
          order.orderID === selectedOrder.orderID 
            ? { ...order, status: 'cancelled' as OrderStatus, updatedAt: new Date() } 
            : order
        );
        
        setOrders(updatedOrders);
        setSelectedOrder(prev => prev ? { ...prev, status: 'cancelled' as OrderStatus, updatedAt: new Date() } : null);
        
        // Reload stats
        await loadStats();
      } else {
        setError('Failed to cancel order');
      }
    } catch (err: any) {
      setError(err.message || 'Error cancelling order');
    } finally {
      setActionLoading(false);
    }
  };

  // Add to filter options
  const FILTER_OPTIONS = [
    { value: 'all', label: 'All Orders' },
    { value: 'queued', label: 'Queued' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'delayed', label: 'Delayed' },
    { value: 'cancelled', label: 'Cancelled' },
    // Add a filter for game orders
    { value: 'games', label: 'Game Orders' }
  ];

  // Get order type icon
  const getOrderTypeIcon = (order: Order) => {
    // Check if it's a Steam game order
    if (order.platform === 'PC' && order.deliveryDetails?.gameUrl?.includes('steampowered.com')) {
      return <Monitor className="w-5 h-5 text-[#1b2838]" />;
    }
    
    // Check if it's a PlayStation game order
    if (order.platform === 'PlayStation' && order.deliveryDetails?.gameUrl?.includes('playstation.com')) {
      return <Gamepad2 className="w-5 h-5 text-[#006FCD]" />;
    }
    
    // Original logic
    if (order.deliveryType === 'Express') {
      return <Clock className="w-5 h-5 text-orange-500" />;
    }
    
    // Default to package icon
    return <Package className="w-5 h-5 text-gray-500" />;
  };

  // Render order details
  const renderOrderDetails = (order: Order) => {
    // Special case for game orders
    if (order.deliveryDetails?.gameUrl) {
      return (
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Game URL:</span>
            <a 
              href={order.deliveryDetails.gameUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 hover:underline truncate max-w-md"
            >
              {order.deliveryDetails.gameUrl}
            </a>
          </div>
          
          {order.deliveryDetails.originalPrice && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Original Price:</span>
              <span className="line-through">{order.deliveryDetails.originalPrice} {order.currency || 'GBP'}</span>
            </div>
          )}
          
          {order.deliveryDetails.imageUrl && (
            <div className="mt-3">
              <img 
                src={order.deliveryDetails.imageUrl} 
                alt={order.product} 
                className="w-32 h-auto rounded-md object-cover" 
              />
            </div>
          )}
        </div>
      );
    }
    
    // Handle regular orders
    return (
      <div className="space-y-2 text-sm">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <div>
            <span className="font-medium">Platform:</span> {order.platform || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Username:</span> {order.gameUsername || 'N/A'}
          </div>
          {order.notes && (
            <div className="w-full">
              <span className="font-medium">Notes:</span> {order.notes}
            </div>
          )}
        </div>
      </div>
    );
  };

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
            Order Management
          </h1>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
              {error}
              <button 
                className="ml-4 underline"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'} border-l-4 border-yellow-500`}>
              <p className="text-sm opacity-70">Queued</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                {stats.queued}
              </p>
            </div>
            
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'} border-l-4 border-blue-500`}>
              <p className="text-sm opacity-70">In Progress</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                {stats.in_progress}
              </p>
            </div>
            
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'} border-l-4 border-green-500`}>
              <p className="text-sm opacity-70">Delivered</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                {stats.delivered}
              </p>
            </div>
            
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'} border-l-4 border-red-500`}>
              <p className="text-sm opacity-70">Cancelled</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                {stats.cancelled}
              </p>
            </div>
          </div>
          
          {/* Filters and Search */}
          <div className={`p-4 rounded-xl mb-8 ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'}`}>
            <div className="flex flex-wrap gap-4 items-center">
              {/* Status Filter */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    filterStatus === 'all'
                      ? 'bg-accent text-white'
                      : isDarkMode
                      ? 'bg-white/5 text-textLight hover:bg-white/10'
                      : 'bg-gray-100 text-textDark hover:bg-gray-200'
                  } transition-colors`}
                >
                  All
                </button>
                
                <button
                  onClick={() => handleFilterChange('queued')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    filterStatus === 'queued'
                      ? 'bg-yellow-500 text-white'
                      : isDarkMode
                      ? 'bg-white/5 text-textLight hover:bg-white/10'
                      : 'bg-gray-100 text-textDark hover:bg-gray-200'
                  } transition-colors`}
                >
                  Queued
                </button>
                
                <button
                  onClick={() => handleFilterChange('in_progress')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    filterStatus === 'in_progress'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode
                      ? 'bg-white/5 text-textLight hover:bg-white/10'
                      : 'bg-gray-100 text-textDark hover:bg-gray-200'
                  } transition-colors`}
                >
                  In Progress
                </button>
                
                <button
                  onClick={() => handleFilterChange('delivered')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    filterStatus === 'delivered'
                      ? 'bg-green-500 text-white'
                      : isDarkMode
                      ? 'bg-white/5 text-textLight hover:bg-white/10'
                      : 'bg-gray-100 text-textDark hover:bg-gray-200'
                  } transition-colors`}
                >
                  Delivered
                </button>
                
                <button
                  onClick={() => handleFilterChange('cancelled')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    filterStatus === 'cancelled'
                      ? 'bg-red-500 text-white'
                      : isDarkMode
                      ? 'bg-white/5 text-textLight hover:bg-white/10'
                      : 'bg-gray-100 text-textDark hover:bg-gray-200'
                  } transition-colors`}
                >
                  Cancelled
                </button>
              </div>
            </div>
          </div>
          
          {/* Filter by verification status */}
          <div className="mt-3 flex items-center">
            <button
              onClick={() => {
                const paypalUnverified = orders.filter(order => 
                  order.paymentMethod === 'PayPal' && 
                  !order.screenshotURL && 
                  order.status !== 'cancelled'
                );
                
                if (paypalUnverified.length > 0) {
                  setOrders(paypalUnverified);
                } else {
                  setError('No PayPal orders pending verification');
                  loadOrders(); // Reload all orders
                }
              }}
              className={`flex items-center px-3 py-1 rounded-lg text-sm space-x-1 ${
                isDarkMode
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              } transition-colors`}
            >
              <AlertTriangle className="h-3 w-3" />
              <span>Show Pending Verification</span>
            </button>
            
            <button
              onClick={() => loadOrders()}
              className={`ml-2 flex items-center px-3 py-1 rounded-lg text-sm space-x-1 ${
                isDarkMode
                  ? 'bg-white/5 hover:bg-white/10'
                  : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}
            >
              <RefreshCw className="h-3 w-3" />
              <span>Show All</span>
            </button>
          </div>
          
          {/* Admin Interface Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Order List */}
            <div className="lg:w-2/3">
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'}`}>
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  {filterStatus === 'all' ? 'All Orders' : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Orders`}
                </h2>
                
                {orders.length === 0 ? (
                  <p className="text-center py-8 opacity-70">No orders found</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.orderID}
                        onClick={() => handleSelectOrder(order)}
                        className={`p-4 rounded-lg cursor-pointer border ${
                          selectedOrder?.orderID === order.orderID
                            ? 'border-accent bg-accent/5'
                            : isDarkMode
                            ? 'border-white/10 hover:bg-white/5'
                            : 'border-gray-200 hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <div className="flex flex-wrap justify-between items-center">
                          <div>
                            <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                              {order.product} - {order.tier}
                            </p>
                            <p className="text-sm opacity-70">
                              Order ID: {order.orderID}
                            </p>
                            <p className="text-sm opacity-70">
                              Customer: {order.buyerEmail}
                            </p>
                            <p className="text-sm opacity-70">
                              Placed on: {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            
                            {/* Payment verification badge */}
                            {order.paymentMethod === 'PayPal' && (
                              <div className={`px-2 py-1 rounded-md text-xs ${
                                order.screenshotURL
                                  ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                  : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                              }`}>
                                {order.screenshotURL
                                  ? 'Payment Verified'
                                  : 'Needs Verification'}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-2">
                          {renderOrderDetails(order)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Order Details and Actions */}
            <div className="lg:w-1/3">
              {selectedOrder ? (
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'}`}>
                  <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    Order Details
                  </h2>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-sm opacity-70">Order ID</p>
                      <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                        {selectedOrder.orderID}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm opacity-70">Status</p>
                      <p className={`font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm opacity-70">Product</p>
                      <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                        {selectedOrder.product} - {selectedOrder.tier}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm opacity-70">Price</p>
                      <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                        {selectedOrder.currency || '£'}{selectedOrder.price}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm opacity-70">Payment Method</p>
                      <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                        {selectedOrder.paymentMethod}
                      </p>
                    </div>
                    
                    {/* Payment Verification Status for PayPal */}
                    {selectedOrder.paymentMethod === 'PayPal' && (
                      <div>
                        <p className="text-sm opacity-70">Payment Verification</p>
                        <div className={`mt-1 p-2 rounded-lg flex items-center space-x-2 ${
                          selectedOrder.screenshotURL
                            ? 'bg-green-500/10 border border-green-500/20' 
                            : 'bg-yellow-500/10 border border-yellow-500/20'
                        }`}>
                          {selectedOrder.screenshotURL ? (
                            <>
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium text-green-500">
                                Payment Proof Uploaded
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-medium text-yellow-500">
                                Payment Proof Required
                              </span>
                            </>
                          )}
                        </div>
                        {selectedOrder.screenshotURL && (
                          <div className="mt-2">
                            <p className="text-sm opacity-70 mb-1">Payment Screenshot:</p>
                            <img 
                              src={selectedOrder.screenshotURL} 
                              alt="Payment Proof" 
                              className="max-w-full h-auto rounded-md border border-gray-300 dark:border-gray-600"
                              style={{ maxHeight: '300px' }} // Optional: constrain height
                            />
                            <a 
                              href={selectedOrder.screenshotURL} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-block mt-1 text-accent hover:underline text-xs"
                            >
                              Open image in new tab
                            </a>
                          </div>
                        )}
                        <p className="text-xs mt-1 opacity-70">
                          {selectedOrder.screenshotURL
                            ? "Review uploaded payment proof."
                            : "Customer must upload PayPal payment proof."
                          }
                        </p>
                      </div>
                    )}

                    {/* Payment Details */}
                    {selectedOrder.paymentDetails && (
                      <div>
                        <p className="text-sm opacity-70">Payment Details</p>
                        <div className={`mt-1 p-2 rounded-lg ${isDarkMode ? 'bg-surface' : 'bg-gray-50'}`}>
                          {selectedOrder.paymentMethod === 'PayPal' && selectedOrder.paymentDetails && 'transactionID' in selectedOrder.paymentDetails && (
                            <p className="text-sm">Transaction ID: {selectedOrder.paymentDetails.transactionID || 'Not provided'}</p>
                          )}
                          
                          {selectedOrder.paymentMethod === 'Paysafecard' && selectedOrder.paymentDetails && 'country' in selectedOrder.paymentDetails && (
                            <>
                              <p className="text-sm">Country: {selectedOrder.paymentDetails.country}</p>
                              {selectedOrder.paymentDetails.code && (
                                <p className="text-sm">Code: {selectedOrder.paymentDetails.code}</p>
                              )}
                            </>
                          )}
                          
                          {selectedOrder.paymentMethod === 'Crypto' && selectedOrder.paymentDetails && 'walletAddress' in selectedOrder.paymentDetails && (
                            <>
                              <div className="text-sm">Wallet: {String(selectedOrder.paymentDetails.walletAddress || 'Not provided')}</div>
                              
                              {/* Transaction ID (if available) */}
                              {'transactionID' in selectedOrder.paymentDetails && selectedOrder.paymentDetails.transactionID ? (
                                <div className="text-sm">Transaction ID: {String(selectedOrder.paymentDetails.transactionID)}</div>
                              ) : null}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedOrder.platform && (
                      <div>
                        <p className="text-sm opacity-70">Platform</p>
                        <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                          {selectedOrder.platform}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm opacity-70">Customer Email</p>
                      <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                        {selectedOrder.buyerEmail}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm opacity-70">Game Username</p>
                      <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                        {selectedOrder.gameUsername}
                      </p>
                    </div>

                    {selectedOrder.deliveryMethod && (
                      <div>
                        <p className="text-sm opacity-70">Delivery Method</p>
                        <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                          {selectedOrder.deliveryMethod.replace('_', ' ').charAt(0).toUpperCase() + selectedOrder.deliveryMethod.replace('_', ' ').slice(1)}
                        </p>
                      </div>
                    )}

                    {selectedOrder.country && (
                      <div>
                        <p className="text-sm opacity-70">Country (from order)</p>
                        <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                          {selectedOrder.country}
                        </p>
                      </div>
                    )}

                    {/* Display Currency if different */}
                    {selectedOrder.displayCurrency && selectedOrder.displayTotalPrice && selectedOrder.displayCurrency !== selectedOrder.currency && (
                      <div>
                        <p className="text-sm opacity-70">Amount Displayed to User</p>
                        <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                          {selectedOrder.displayTotalPrice} {selectedOrder.displayCurrency}
                        </p>
                      </div>
                    )}
                    
                    {/* Promo Code Details */}
                    {selectedOrder.promoCode && (
                      <div>
                        <p className="text-sm opacity-70">Promo Code Applied</p>
                        <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                          {selectedOrder.promoCode}
                          {selectedOrder.promoDiscount !== undefined && (
                            <span className="text-xs opacity-80"> (Discount: {selectedOrder.currency || '£'}{selectedOrder.promoDiscount.toFixed(2)})</span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Delivery Type */}
                    <div>
                      <p className="text-sm opacity-70">Delivery Type</p>
                      <p className={`font-medium ${selectedOrder.deliveryType === 'Express' ? 'text-orange-500' : (isDarkMode ? 'text-textLight' : 'text-textDark')}`}>
                        {selectedOrder.deliveryType}
                      </p>
                    </div>

                    {/* Queue Position and Estimated Delivery */}
                    {(selectedOrder.status === 'queued' || selectedOrder.status === 'in_progress') && (
                      <>
                        {selectedOrder.queuePosition !== undefined && (
                          <div>
                            <p className="text-sm opacity-70">Queue Position</p>
                            <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                              {selectedOrder.queuePosition}
                            </p>
                          </div>
                        )}
                        {selectedOrder.estimatedDeliveryTime && (
                          <div>
                            <p className="text-sm opacity-70">Est. Delivery Time</p>
                            <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                              {formatDate(selectedOrder.estimatedDeliveryTime)}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {selectedOrder.notes && (
                      <div>
                        <p className="text-sm opacity-70">Customer Notes</p>
                        <p className={`p-2 mt-1 rounded-lg ${isDarkMode ? 'bg-surface text-textLight' : 'bg-gray-50 text-textDark'}`}>
                          {selectedOrder.notes}
                        </p>
                      </div>
                    )}
                    
                    {selectedOrder.deliveryDetails && Object.keys(selectedOrder.deliveryDetails).length > 0 && (
                      <div>
                        <p className="text-sm opacity-70">Delivery Details</p>
                        <div className={`mt-1 p-2 rounded-lg ${isDarkMode ? 'bg-surface' : 'bg-gray-50'}`}>
                          {Object.entries(selectedOrder.deliveryDetails).map(([key, value]) => (
                            <p key={key} className="text-sm">
                              <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span> {value as string}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm opacity-70">Created</p>
                      <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                        {formatDate(selectedOrder.createdAt)}
                      </p>
                    </div>
                    
                    {selectedOrder.updatedAt && (
                      <div>
                        <p className="text-sm opacity-70">Last Updated</p>
                        <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                          {formatDate(selectedOrder.updatedAt)}
                        </p>
                      </div>
                    )}
                    
                    {/* Detailed Order Items (if cart order) */}
                    {selectedOrder.items && selectedOrder.items.length > 0 && (
                      <div>
                        <p className="text-sm opacity-70 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">Detailed Items in Order</p>
                        <div className={`mt-1 p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          {selectedOrder.items.map((item, index) => (
                            <div key={index} className={`py-1.5 ${index > 0 ? 'border-t border-gray-300 dark:border-gray-600' : ''}`}>
                              <p className={`text-sm font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>{item.product}</p>
                              <div className="flex justify-between text-xs opacity-90">
                                <span>Amount/Tier: {item.amount}</span>
                                <span>Qty: {item.quantity}</span>
                              </div>
                              <div className="flex justify-between text-xs opacity-90">
                                <span>Unit Price: {selectedOrder.currency || '£'}{item.price}</span>
                                <span>Subtotal: {selectedOrder.currency || '£'}{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                          <div className="border-t border-gray-300 dark:border-gray-600 mt-1.5 pt-1.5 flex justify-between">
                            <span className="text-sm font-bold">Order Total (from items):</span>
                            <span className="text-sm font-bold">
                              {selectedOrder.currency || '£'}{selectedOrder.totalPrice || selectedOrder.price} {/* Fallback to main price if totalPrice not on items sum */}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Admin Notes */}
                    <div>
                      <p className="text-sm opacity-70">Admin Notes</p>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        rows={3}
                        placeholder="Add notes about this order"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-surface-dark border-white/10 text-textLight' 
                            : 'bg-white border-gray-300 text-textDark'
                        } focus:outline-none focus:ring-1 focus:ring-accent mt-1`}
                      />
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedOrder.status !== 'queued' && (
                        <button
                          onClick={() => handleStatusChange('queued')}
                          disabled={actionLoading}
                          className="px-3 py-1 rounded-lg text-sm bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
                        >
                          Mark as Queued
                        </button>
                      )}
                      
                      {selectedOrder.status !== 'in_progress' && (
                        <button
                          onClick={() => handleStatusChange('in_progress')}
                          disabled={actionLoading}
                          className="px-3 py-1 rounded-lg text-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                          Mark In Progress
                        </button>
                      )}
                      
                      {selectedOrder.status !== 'delivered' && (
                        <button
                          onClick={() => setShowDeliveryModal(true)}
                          disabled={actionLoading}
                          className="px-3 py-1 rounded-lg text-sm bg-green-500 text-white hover:bg-green-600 transition-colors"
                        >
                          Mark as Delivered
                        </button>
                      )}
                      
                      {selectedOrder.status !== 'cancelled' && (
                        <button
                          onClick={handleCancelOrder}
                          disabled={actionLoading}
                          className="px-3 py-1 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'}`}>
                  <p className="text-center opacity-70">Select an order to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delivery Modal */}
        {showDeliveryModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`p-6 rounded-xl max-w-lg w-full ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'}`}>
              <h3 className="text-xl font-bold mb-4">Mark Order as Delivered</h3>
              
              <div className="space-y-4">
                <p>
                  You're about to mark order <span className="font-medium">{selectedOrder.orderID}</span> as delivered.
                </p>
                
                {/* Optional delivery proof upload */}
                <div>
                  <p className="text-sm font-medium mb-2">Upload Delivery Proof (Optional)</p>
                  
                  {deliveryProofPreview ? (
                    <div className="relative">
                      <img 
                        src={deliveryProofPreview} 
                        alt="Preview" 
                        className="max-h-60 rounded-lg object-contain bg-gray-900/20 w-full"
                      />
                      
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryProofFile(null);
                          setDeliveryProofPreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer ${
                      isDarkMode ? 'border-white/20 hover:border-white/30' : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <Upload className="h-8 w-8 opacity-50 mb-2" />
                      <span className="text-sm">Click to upload delivery proof</span>
                      <span className="text-xs opacity-50 mt-1">PNG, JPG, GIF up to 5MB</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleDeliveryProofChange}
                        ref={fileInputRef}
                      />
                    </label>
                  )}
                </div>
                
                {/* Admin notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={3}
                    placeholder="Add notes about this order delivery"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-surface-dark border-white/10 text-textLight' 
                        : 'bg-white border-gray-300 text-textDark'
                    } focus:outline-none focus:ring-1 focus:ring-accent`}
                  />
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={() => {
                      setShowDeliveryModal(false);
                      setDeliveryProofFile(null);
                      setDeliveryProofPreview(null);
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      isDarkMode 
                        ? 'bg-white/5 text-textLight hover:bg-white/10' 
                        : 'bg-gray-200 text-textDark hover:bg-gray-300'
                    } transition-colors`}
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleMarkAsDelivered}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-lg ${
                      isDarkMode 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'bg-green-500 text-white hover:bg-green-600'
                    } transition-colors disabled:opacity-50`}
                  >
                    {actionLoading ? 'Processing...' : 'Mark as Delivered'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </MotionWrapper>
    </div>
  );
};

export default OrderManagementPage; 