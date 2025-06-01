import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import OrderSummaryPanel from '../components/dashboard/OrderSummaryPanel';
import OrderHistoryTable from '../components/dashboard/OrderHistoryTable';
import AccountInfoPanel from '../components/dashboard/AccountInfoPanel';
import OrderDetailModal from '../components/dashboard/OrderDetailModal';
import OrderQueueStatus from '../components/dashboard/OrderQueueStatus';
import MotionWrapper from '../components/animations/MotionWrapper';
import { getUserOrders, subscribeToUserOrders } from '../firebase/orderService';

// Define the Order interface based on your existing Order type
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

const UserDashboardPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    // Set up real-time subscription to orders
    if (currentUser.email) {
      const unsubscribe = subscribeToUserOrders(currentUser.email, (updatedOrders) => {
        // Add any missing properties from the Firebase Order type to match the component's Order interface
        const ordersWithCorrectType = updatedOrders.map(order => ({
          ...order,
          productName: order.product || '', // Use product field as productName
        }));
        setOrders(ordersWithCorrectType as unknown as Order[]);
        setIsLoading(false);
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, [currentUser, navigate]);

  // Modal handlers
  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Get latest order
  const latestOrder = orders.length > 0 
    ? orders.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })[0]
    : null;
    
  // Get active orders (queued, in_progress, delayed)
  const activeOrders = orders.filter(order => 
    order.status === 'queued' || order.status === 'in_progress' || order.status === 'delayed'
  ).sort((a, b) => {
    // Sort by queue position, if available
    if (a.queuePosition && b.queuePosition) {
      return a.queuePosition - b.queuePosition;
    }
    
    // Otherwise sort by most recent
    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="min-h-screen">
      <MotionWrapper variant="fadeIn">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
            Your Dashboard
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

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Account Info + Order Summary */}
              <div className="space-y-6">
                <AccountInfoPanel user={currentUser} />
                
                {/* Show active order status if available */}
                {activeOrders.length > 0 ? (
                  <OrderQueueStatus initialOrder={activeOrders[0]} />
                ) : latestOrder && (
                  <OrderSummaryPanel 
                    order={latestOrder} 
                    onViewDetails={() => openOrderDetails(latestOrder)} 
                  />
                )}
              </div>

              {/* Right Column: Order History */}
              <div className="lg:col-span-2">
                <OrderHistoryTable 
                  orders={orders} 
                  onViewDetails={openOrderDetails} 
                />
              </div>
            </div>
          )}

          {/* Order Detail Modal */}
          {selectedOrder && (
            <OrderDetailModal 
              isOpen={isModalOpen} 
              onClose={closeModal} 
              order={selectedOrder}
            />
          )}
        </div>
      </MotionWrapper>
    </div>
  );
};

export default UserDashboardPage; 