import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Package, Calendar, ArrowRight, CheckCircle, XCircle, Truck } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// Define the Order type based on what's needed for this component
interface Order {
  orderID: string;
  productName: string;
  status: 'queued' | 'in_progress' | 'delivered' | 'delayed' | 'cancelled';
  createdAt: any;
  productType?: string;
  deliveryType?: 'Standard' | 'Express';
  queuePosition?: number;
  estimatedDeliveryTime?: any;
}

interface OrderSummaryPanelProps {
  order: Order;
  onViewDetails: () => void;
}

const OrderSummaryPanel: React.FC<OrderSummaryPanelProps> = ({ order, onViewDetails }) => {
  const { isDarkMode } = useTheme();
  
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
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-5 w-5" />;
      case 'in_progress':
        return <Package className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      case 'delayed':
        return <Clock className="h-5 w-5" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
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
  
  // Estimate delivery time based on delivery type and status
  const getEstimatedDelivery = () => {
    // Use the provided estimatedDeliveryTime if available
    if (order.estimatedDeliveryTime) {
      return formatDate(order.estimatedDeliveryTime);
    }
    
    // Fallback based on delivery type
    if (order.deliveryType === 'Express') {
      return "5-60 minutes";
    } else {
      return "1-3 days";
    }
  };

  return (
    <motion.div 
      className={`rounded-2xl backdrop-blur-xl ${
        isDarkMode ? 'bg-white/5' : 'bg-white/80'
      } shadow-glass p-6 border border-white/10`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
        Latest Order
      </h2>
      
      <div className="space-y-4">
        {/* Product Name */}
        <div>
          <p className="text-sm opacity-70">Product</p>
          <p className={`text-lg font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
            {order.productName}
          </p>
        </div>
        
        {/* Order ID */}
        <div>
          <p className="text-sm opacity-70">Order ID</p>
          <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
            {order.orderID}
          </p>
        </div>
        
        {/* Delivery Type & Queue Position */}
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getDeliveryTypeBadge(order.deliveryType)}`}>
            <Truck className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">
              {order.deliveryType || 'Standard'}
            </span>
          </div>
          
          {order.status === 'queued' && order.queuePosition && (
            <div className="text-sm bg-gray-500/10 px-3 py-1 rounded-full">
              <span className="font-medium">Queue: #{order.queuePosition}</span>
            </div>
          )}
        </div>
        
        {/* Order Date */}
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 opacity-70" />
          <p className={`text-sm ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
            {formatDate(order.createdAt)}
          </p>
        </div>
        
        {/* Status */}
        <div className="mt-2">
          <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusBadge(order.status)}`}>
            {getStatusIcon(order.status)}
            <span className="ml-2 text-sm font-medium capitalize">
              {order.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        {/* Status Progress Bar */}
        <div className="mt-4">
          <div className="h-2 w-full bg-gray-200/20 rounded-full overflow-hidden">
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
          <div className="flex justify-between text-xs mt-1 opacity-70">
            <span>Queued</span>
            <span>In Progress</span>
            <span>Delivered</span>
          </div>
        </div>
        
        {/* Estimated Delivery */}
        <div className="mt-2">
          <p className="text-sm opacity-70">Estimated Delivery</p>
          <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
            {getEstimatedDelivery()}
          </p>
        </div>
        
        {/* View Details Button */}
        <motion.button
          onClick={onViewDetails}
          className="w-full mt-4 flex items-center justify-center px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent hover:text-white transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View Details
          <ArrowRight className="h-4 w-4 ml-2" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default OrderSummaryPanel; 