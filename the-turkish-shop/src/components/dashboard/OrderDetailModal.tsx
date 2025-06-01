import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, User, CreditCard, Receipt, FileImage, MessageSquare, Truck, Timer, Package } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// Define the Order type based on what's needed for this component
interface Order {
  orderID: string;
  productName: string;
  status: 'queued' | 'in_progress' | 'delivered' | 'delayed' | 'cancelled';
  createdAt: any;
  updatedAt?: any;
  buyerEmail: string;
  gameUsername?: string;
  paymentMethod: string;
  paymentProofURL?: string;
  adminNotes?: string;
  productType?: string;
  deliveryType?: 'Standard' | 'Express';
  queuePosition?: number;
  estimatedDeliveryTime?: any;
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order }) => {
  const { isDarkMode } = useTheme();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  // Format date for display
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore Timestamp objects
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return new Date(timestamp.toDate()).toLocaleString();
    }
    
    // Handle Date objects or ISO strings
    return new Date(timestamp).toLocaleString();
  };
  
  // Determine status badge colors
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
  
  // Get delivery type badge
  const getDeliveryTypeBadge = (type?: string) => {
    if (type === 'Express') {
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    }
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };
  
  // Calculate status progress percentage
  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'queued':
        return 33;
      case 'in_progress':
        return 66;
      case 'delivered':
        return 100;
      case 'delayed':
        return 50;
      case 'cancelled':
        return 100;
      default:
        return 0;
    }
  };
  
  // Estimate delivery time based on delivery type
  const getEstimatedDelivery = () => {
    // Use the provided estimatedDeliveryTime if available
    if (order.estimatedDeliveryTime) {
      return formatDate(order.estimatedDeliveryTime);
    }
    
    if (order.deliveryType === 'Express') {
      return "5-60 minutes";
    } else {
      return "1-3 days";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose}></div>
      
      <AnimatePresence>
        <motion.div 
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className={`w-full max-w-2xl rounded-2xl backdrop-blur-xl ${
              isDarkMode ? 'bg-white/5' : 'bg-white/90'
            } shadow-glass border border-white/10 overflow-hidden`}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  Order Details
                </h2>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mt-2 flex items-center space-x-3">
                <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusBadge(order.status)}`}>
                  <span className="text-sm font-medium capitalize">
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getDeliveryTypeBadge(order.deliveryType)}`}>
                  <Truck className="h-3 w-3 mr-1" />
                  <span className="text-sm font-medium">
                    {order.deliveryType || 'Standard'}
                  </span>
                </div>
                
                {order.status === 'queued' && order.queuePosition && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-500/10 text-sm">
                    <span className="font-medium">Queue: #{order.queuePosition}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Content */}
            <div className={`p-6 overflow-y-auto max-h-[calc(100vh-200px)]`}>
              {/* Progress Tracking */}
              <div className="mb-8">
                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  Order Progress
                </h3>
                
                <div className="h-3 w-full bg-gray-200/20 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full rounded-full ${
                      order.status === 'cancelled' ? 'bg-red-500' : 
                      order.status === 'delayed' ? 'bg-orange-500' : 'bg-accent'
                    }`}
                    initial={{ width: '0%' }}
                    animate={{ width: `${getProgressPercentage(order.status)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                
                <div className="flex justify-between mt-3">
                  <div className={`flex flex-col items-center ${order.status === 'queued' || order.status === 'in_progress' || order.status === 'delivered' ? 'text-accent' : 'opacity-50'}`}>
                    <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center">
                      <Clock className="h-3 w-3" />
                    </div>
                    <span className="text-xs mt-1">Queued</span>
                  </div>
                  
                  <div className={`flex flex-col items-center ${order.status === 'in_progress' || order.status === 'delivered' ? 'text-accent' : 'opacity-50'}`}>
                    <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center">
                      <Package className="h-3 w-3" />
                    </div>
                    <span className="text-xs mt-1">In Progress</span>
                  </div>
                  
                  <div className={`flex flex-col items-center ${order.status === 'delivered' ? 'text-accent' : 'opacity-50'}`}>
                    <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center">
                      <Truck className="h-3 w-3" />
                    </div>
                    <span className="text-xs mt-1">Delivered</span>
                  </div>
                </div>
                
                {order.estimatedDeliveryTime && (
                  <div className="flex items-center mt-4 text-sm">
                    <Timer className="h-4 w-4 mr-2 text-accent" />
                    <span>
                      Estimated Delivery: <strong>{getEstimatedDelivery()}</strong>
                    </span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Order ID & Date */}
                  <div>
                    <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                      Order Information
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs opacity-70">Order ID</p>
                        <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                          {order.orderID}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs opacity-70">Product</p>
                        <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                          {order.productName}
                        </p>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 opacity-70" />
                        <div>
                          <p className="text-xs opacity-70">Order Date</p>
                          <p className={`text-sm ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      {order.updatedAt && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 opacity-70" />
                          <div>
                            <p className="text-xs opacity-70">Last Updated</p>
                            <p className={`text-sm ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                              {formatDate(order.updatedAt)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  {/* User Details */}
                  <div>
                    <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                      User Details
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 opacity-70" />
                        <div>
                          <p className="text-xs opacity-70">Email</p>
                          <p className={`text-sm ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                            {order.buyerEmail}
                          </p>
                        </div>
                      </div>
                      
                      {order.gameUsername && (
                        <div>
                          <p className="text-xs opacity-70">Game Username</p>
                          <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                            {order.gameUsername}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Payment Info */}
                  <div>
                    <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                      Payment Information
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 opacity-70" />
                        <div>
                          <p className="text-xs opacity-70">Payment Method</p>
                          <p className={`text-sm ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                            {order.paymentMethod}
                          </p>
                        </div>
                      </div>
                      
                      {order.paymentProofURL && (
                        <div>
                          <p className="text-xs opacity-70 mb-1">Payment Receipt</p>
                          <div 
                            className="cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setIsImageModalOpen(true)}
                          >
                            <div className="flex items-center space-x-2 text-accent">
                              <Receipt className="h-4 w-4" />
                              <span className="text-sm">View Receipt</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Admin Notes */}
              {order.adminNotes && (
                <div className="mt-6">
                  <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    Order Notes
                  </h3>
                  
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div className="flex items-start">
                      <MessageSquare className="h-4 w-4 mr-2 mt-1 opacity-70" />
                      <p className={`text-sm ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                        {order.adminNotes}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className={`p-6 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'} flex justify-end`}>
              <motion.button
                onClick={onClose}
                className={`px-6 py-2 rounded-lg bg-accent text-white`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      {/* Image Lightbox Modal */}
      {isImageModalOpen && order.paymentProofURL && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={order.paymentProofURL} 
              alt="Payment Receipt" 
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button 
              className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              onClick={() => setIsImageModalOpen(false)}
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailModal; 