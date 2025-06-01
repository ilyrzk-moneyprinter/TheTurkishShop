import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, ChevronLeft, ChevronRight, Filter, ArrowRight, CheckCircle, XCircle, Clock, Package, Truck, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// Define the Order type based on what's needed for this component
interface Order {
  id: string;
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
  price: string;
  currency: string;
  productType?: string;
  deliveryType?: 'Standard' | 'Express';
  queuePosition?: number;
  estimatedDeliveryTime?: any;
}

interface OrderHistoryTableProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
}

const ITEMS_PER_PAGE = 5;

const OrderHistoryTable: React.FC<OrderHistoryTableProps> = ({ orders, onViewDetails }) => {
  const { isDarkMode } = useTheme();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Format date for display
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore Timestamp objects
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return new Date(timestamp.toDate()).toLocaleString();
    }
    
    // Handle Date objects or ISO strings
    const date = new Date(timestamp);
    return date.toLocaleDateString();
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
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <Package className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'delayed':
        return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  // Get delivery type badge
  const getDeliveryTypeBadge = (type?: string) => {
    if (type === 'Express') {
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    }
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };
  
  // Filter and paginate orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => 
        // Filter by status if selected
        (statusFilter ? order.status === statusFilter : true) && 
        // Filter by delivery type if selected
        (deliveryTypeFilter ? order.deliveryType === deliveryTypeFilter : true) &&
        // Filter by search term (order ID)
        (searchTerm 
          ? order.orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.productName.toLowerCase().includes(searchTerm.toLowerCase())
          : true
        )
      )
      .sort((a, b) => {
        // Sort by most recent first
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
  }, [orders, statusFilter, deliveryTypeFilter, searchTerm]);
  
  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  // Handle pagination
  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  return (
    <motion.div 
      className={`rounded-2xl backdrop-blur-xl ${
        isDarkMode ? 'bg-white/5' : 'bg-white/80'
      } shadow-glass p-6 border border-white/10`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
        Order History
      </h2>
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by Order ID"
            className={`w-full pl-9 pr-4 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-black/20 text-textLight placeholder:text-gray-500' 
                : 'bg-white text-textDark placeholder:text-gray-400'
            } border border-transparent focus:border-accent focus:outline-none text-sm`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-gray-400 mr-2" />
            <select
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className={`px-3 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-black/20 text-textLight' 
                  : 'bg-white text-textDark'
              } border border-transparent focus:border-accent focus:outline-none text-sm`}
            >
              <option value="">All Status</option>
              <option value="queued">Queued</option>
              <option value="in_progress">In Progress</option>
              <option value="delivered">Delivered</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          {/* Delivery Type Filter */}
          <div className="flex items-center">
            <Truck className="h-4 w-4 text-gray-400 mr-2" />
            <select
              value={deliveryTypeFilter || ''}
              onChange={(e) => setDeliveryTypeFilter(e.target.value || null)}
              className={`px-3 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-black/20 text-textLight' 
                  : 'bg-white text-textDark'
              } border border-transparent focus:border-accent focus:outline-none text-sm`}
            >
              <option value="">All Types</option>
              <option value="Standard">Standard</option>
              <option value="Express">Express</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-10">
          <p className="opacity-70">No orders found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <th className="text-left text-sm font-medium opacity-70 pb-3">Order ID</th>
                <th className="text-left text-sm font-medium opacity-70 pb-3">Product</th>
                <th className="text-left text-sm font-medium opacity-70 pb-3 hidden md:table-cell">Date</th>
                <th className="text-left text-sm font-medium opacity-70 pb-3">Delivery</th>
                <th className="text-left text-sm font-medium opacity-70 pb-3">Status</th>
                <th className="text-right text-sm font-medium opacity-70 pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <motion.tr 
                  key={order.id}
                  className={`border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'} hover:bg-white/5 transition-colors`}
                  whileHover={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.01)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className={`py-4 text-sm ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    {order.orderID}
                  </td>
                  <td className={`py-4 text-sm ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    {order.productName}
                  </td>
                  <td className={`py-4 text-sm hidden md:table-cell ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="py-4">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full border ${getDeliveryTypeBadge(order.deliveryType)}`}>
                      <Truck className="h-3 w-3 mr-1" />
                      <span className="text-xs font-medium">
                        {order.deliveryType || 'Standard'}
                      </span>
                    </div>
                    {order.status === 'queued' && order.queuePosition && (
                      <div className="text-xs opacity-70 mt-1">
                        Queue: #{order.queuePosition}
                      </div>
                    )}
                  </td>
                  <td className="py-4">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full border ${getStatusBadge(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 text-xs font-medium capitalize">
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <motion.button
                      onClick={() => onViewDetails(order)}
                      className="px-3 py-1 text-sm text-accent hover:bg-accent/10 rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Details
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {filteredOrders.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm opacity-70">
            Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}
          </p>
          
          <div className="flex space-x-1">
            <motion.button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-1 rounded-md ${
                currentPage === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-white/10'
              }`}
              whileHover={currentPage !== 1 ? { scale: 1.1 } : {}}
              whileTap={currentPage !== 1 ? { scale: 0.9 } : {}}
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => goToPage(i + 1)}
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${
                    currentPage === i + 1
                      ? 'bg-accent text-white'
                      : 'hover:bg-white/10'
                  }`}
                  whileHover={currentPage !== i + 1 ? { scale: 1.1 } : {}}
                  whileTap={currentPage !== i + 1 ? { scale: 0.9 } : {}}
                >
                  {i + 1}
                </motion.button>
              ))}
            </div>
            
            <motion.button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-1 rounded-md ${
                currentPage === totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-white/10'
              }`}
              whileHover={currentPage !== totalPages ? { scale: 1.1 } : {}}
              whileTap={currentPage !== totalPages ? { scale: 0.9 } : {}}
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default OrderHistoryTable; 