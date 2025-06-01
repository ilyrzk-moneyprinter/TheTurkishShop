import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Package, Truck, AlertTriangle, Zap, Timer } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { subscribeToOrder } from '../../firebase/orderService';

interface Order {
  orderID: string;
  status: 'queued' | 'in_progress' | 'delivered' | 'delayed' | 'cancelled';
  deliveryType?: 'Standard' | 'Express';
  queuePosition?: number;
  estimatedDeliveryTime?: any;
}

interface OrderQueueStatusProps {
  initialOrder: Order;
}

// Define a subset of Order type for state to avoid type conflicts
type OrderState = Order;

const OrderQueueStatus: React.FC<OrderQueueStatusProps> = ({ initialOrder }) => {
  const { isDarkMode } = useTheme();
  const [order, setOrder] = useState<OrderState>(initialOrder);
  const [remainingTime, setRemainingTime] = useState<string>('');
  
  // Subscribe to real-time order updates
  useEffect(() => {
    const unsubscribe = subscribeToOrder(initialOrder.orderID, (updatedOrder) => {
      setOrder(updatedOrder as OrderState);
    });
    
    return () => {
      unsubscribe();
    };
  }, [initialOrder.orderID]);
  
  // Update remaining time counter
  useEffect(() => {
    if (order.status === 'delivered' || order.status === 'cancelled') {
      setRemainingTime('');
      return;
    }
    
    if (!order.estimatedDeliveryTime) {
      setRemainingTime(order.deliveryType === 'Express' ? '5-60 minutes' : '1-3 days');
      return;
    }
    
    const estimatedDate = order.estimatedDeliveryTime.toDate();
    
    const timer = setInterval(() => {
      const now = new Date();
      const diff = estimatedDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setRemainingTime('Any moment now...');
        clearInterval(timer);
        return;
      }
      
      // Format remaining time
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (hours > 0) {
        setRemainingTime(`${hours}h ${minutes}m remaining`);
      } else if (minutes > 0) {
        setRemainingTime(`${minutes}m ${seconds}s remaining`);
      } else {
        setRemainingTime(`${seconds}s remaining`);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [order.estimatedDeliveryTime, order.status, order.deliveryType]);
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-5 w-5" />;
      case 'in_progress':
        return <Package className="h-5 w-5" />;
      case 'delivered':
        return <Truck className="h-5 w-5" />;
      case 'delayed':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };
  
  // Get appropriate color for status
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
  
  // Calculate progress percentage
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

  return (
    <div className={`rounded-xl backdrop-blur-xl ${
      isDarkMode ? 'bg-white/5' : 'bg-white/80'
    } shadow-glass p-6 border border-white/10`}>
      <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
        Order Status
      </h3>
      
      <div className="space-y-4">
        {/* Queue Position */}
        {order.status === 'queued' && order.queuePosition && (
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-70">Queue Position</span>
            <div className="flex items-center">
              <span className={`text-lg font-bold ${getStatusColor(order.status)}`}>
                #{order.queuePosition}
              </span>
              {order.deliveryType === 'Express' && (
                <div className="ml-2 bg-purple-500/10 text-purple-500 rounded-full px-2 py-0.5 text-xs font-medium flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  Express
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm opacity-70">Status</span>
          <div className={`flex items-center ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            <span className="ml-2 font-medium capitalize">
              {order.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        {/* Estimated Delivery */}
        <div className="flex items-center justify-between">
          <span className="text-sm opacity-70">Estimated Delivery</span>
          <div className="flex items-center text-accent">
            <Timer className="h-4 w-4 mr-1" />
            <span className="font-medium">
              {remainingTime}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6 mb-2">
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
        </div>
        
        {/* Step Indicator */}
        <div className="flex justify-between text-xs -mt-1">
          <div className={`flex flex-col items-center ${order.status !== 'cancelled' ? (getProgressPercentage(order.status) >= 33 ? 'text-accent' : 'opacity-50') : 'opacity-30'}`}>
            <Clock className="h-3 w-3 mb-1" />
            <span>Queued</span>
          </div>
          <div className={`flex flex-col items-center ${order.status !== 'cancelled' ? (getProgressPercentage(order.status) >= 66 ? 'text-accent' : 'opacity-50') : 'opacity-30'}`}>
            <Package className="h-3 w-3 mb-1" />
            <span>In Progress</span>
          </div>
          <div className={`flex flex-col items-center ${order.status === 'delivered' ? 'text-accent' : 'opacity-50'}`}>
            <Truck className="h-3 w-3 mb-1" />
            <span>Delivered</span>
          </div>
        </div>
      </div>
      
      {/* Status Message */}
      <div className="mt-6 text-sm">
        {order.status === 'queued' && (
          <p>Your order is in queue. We'll start processing it soon.</p>
        )}
        {order.status === 'in_progress' && (
          <p>We're working on your order now. It won't be long!</p>
        )}
        {order.status === 'delivered' && (
          <p>Your order has been delivered successfully!</p>
        )}
        {order.status === 'delayed' && (
          <p>Your order is temporarily delayed. We're working to resolve this quickly.</p>
        )}
        {order.status === 'cancelled' && (
          <p>This order has been cancelled.</p>
        )}
      </div>
    </div>
  );
};

export default OrderQueueStatus; 