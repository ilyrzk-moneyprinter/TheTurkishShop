import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getOrderById, getOrdersByEmail } from '../firebase/orderService';
import { Order } from '../firebase/types';
import OrderReceiptForm from '../components/OrderReceiptForm';
import MotionWrapper from '../components/animations/MotionWrapper';

const OrderStatusPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchType, setSearchType] = useState<'email' | 'orderID'>('email');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReceiptForm, setShowReceiptForm] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setOrders([]);
    setSelectedOrder(null);
    setShowReceiptForm(false);

    try {
      if (searchType === 'email' && searchTerm) {
        const result = await getOrdersByEmail(searchTerm);
        setOrders(result);
        if (result.length === 0) {
          setError('No orders found for this email address.');
        }
      } else if (searchType === 'orderID' && searchTerm) {
        const result = await getOrderById(searchTerm);
        if (result) {
          setSelectedOrder(result);
          setOrders([result]);
        } else {
          setError('Order not found. Please check the order ID and try again.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while searching for orders.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setShowReceiptForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'confirmed':
        return 'text-blue-500';
      case 'delivered':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore Timestamp objects
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return new Date(timestamp.toDate()).toLocaleString();
    }
    
    // Handle Date objects or ISO strings
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <MotionWrapper variant="bouncyFadeIn">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
            Check Order Status
          </h1>
          
          {/* Search Form */}
          <div className={`p-6 rounded-xl mb-8 ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'}`}>
            <form onSubmit={handleSearch}>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Type Toggle */}
                  <div className="flex rounded-lg overflow-hidden border border-white/10">
                    <button
                      type="button"
                      onClick={() => setSearchType('email')}
                      className={`px-4 py-2 flex-1 transition ${
                        searchType === 'email'
                          ? 'bg-accent text-white'
                          : isDarkMode
                          ? 'bg-surface-dark text-textLight hover:bg-white/5'
                          : 'bg-surface text-textDark hover:bg-gray-100'
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchType('orderID')}
                      className={`px-4 py-2 flex-1 transition ${
                        searchType === 'orderID'
                          ? 'bg-accent text-white'
                          : isDarkMode
                          ? 'bg-surface-dark text-textLight hover:bg-white/5'
                          : 'bg-surface text-textDark hover:bg-gray-100'
                      }`}
                    >
                      Order ID
                    </button>
                  </div>
                  
                  {/* Search Input */}
                  <div className="flex-1">
                    <input
                      type={searchType === 'email' ? 'email' : 'text'}
                      placeholder={searchType === 'email' ? 'Enter your email address' : 'Enter your order ID'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      required
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-surface-dark border-white/10 text-textLight' 
                          : 'bg-white border-gray-300 text-textDark'
                      } focus:outline-none focus:ring-1 focus:ring-accent`}
                    />
                  </div>
                  
                  {/* Search Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !searchTerm}
                    className={`px-6 py-2 rounded-lg ${
                      isDarkMode 
                        ? 'bg-accent text-white hover:bg-accent/90' 
                        : 'bg-accent text-white hover:bg-accent/90'
                    } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent`}
                  >
                    {isLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
              {error}
            </div>
          )}
          
          {/* Results */}
          {orders.length > 0 && (
            <div className="space-y-6">
              {/* Order List (only show if multiple orders and none selected) */}
              {orders.length > 1 && !selectedOrder && (
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'}`}>
                  <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    Your Recent Orders
                  </h2>
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div 
                        key={order.orderID}
                        onClick={() => handleOrderSelect(order)}
                        className={`p-4 rounded-lg cursor-pointer border ${
                          isDarkMode 
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
                              Placed on: {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Selected Order Details */}
              {selectedOrder && (
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'}`}>
                  <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    Order Details
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      
                      <div>
                        <p className="text-sm opacity-70">Order Date</p>
                        <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                          {formatDate(selectedOrder.createdAt)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm opacity-70">Game Username</p>
                        <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                          {selectedOrder.gameUsername}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm opacity-70">Email</p>
                        <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                          {selectedOrder.buyerEmail}
                        </p>
                      </div>
                    </div>
                    
                    {/* Notes (if any) */}
                    {selectedOrder.notes && (
                      <div>
                        <p className="text-sm opacity-70">Notes</p>
                        <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                          {selectedOrder.notes}
                        </p>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 mt-6">
                      {selectedOrder.status === 'in_progress' && !showReceiptForm && (
                        <button
                          onClick={() => setShowReceiptForm(true)}
                          className={`px-6 py-2 rounded-lg ${
                            isDarkMode 
                              ? 'bg-accent text-white hover:bg-accent/90' 
                              : 'bg-accent text-white hover:bg-accent/90'
                          } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent`}
                        >
                          Submit Receipt Form
                        </button>
                      )}
                      
                      {orders.length > 1 && (
                        <button
                          onClick={() => setSelectedOrder(null)}
                          className={`px-6 py-2 rounded-lg ${
                            isDarkMode 
                              ? 'bg-white/5 text-textLight hover:bg-white/10' 
                              : 'bg-gray-200 text-textDark hover:bg-gray-300'
                          } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
                        >
                          Back to Order List
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Receipt Form */}
              {showReceiptForm && selectedOrder && (
                <OrderReceiptForm 
                  orderID={selectedOrder.orderID} 
                  onSubmitSuccess={() => setShowReceiptForm(false)}
                />
              )}
            </div>
          )}
        </div>
      </MotionWrapper>
    </div>
  );
};

export default OrderStatusPage; 