import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Order } from '../../firebase/types';
import { updateOrderDeliveryValue, markOrderAsExpress, processOrder } from '../../firebase/adminService';
import { X, Send, AlertTriangle, Check, Clock, RefreshCw, Ban, Zap } from 'lucide-react';
import { httpsCallable, getFunctions } from 'firebase/functions';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onOrderUpdated: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose, onOrderUpdated }) => {
  const { isDarkMode } = useTheme();
  const [deliveryValue, setDeliveryValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [internalNotes, setInternalNotes] = useState(order.adminNotes || '');
  const [isExpressDelivery, setIsExpressDelivery] = useState(order.isExpress || false);
  const functions = getFunctions();

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore Timestamp objects
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return new Date(timestamp.toDate()).toLocaleString();
    }
    
    // Handle Date objects or ISO strings
    return new Date(timestamp).toLocaleString();
  };

  const handleMarkAsDelivered = async () => {
    if (!deliveryValue.trim()) {
      setError('Please enter delivery content (code, key, or account credentials)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateOrderDeliveryValue(order.orderID, deliveryValue);
      
      // If internal notes were updated, save them separately
      if (internalNotes !== order.adminNotes) {
        await processOrder(order.orderID, 'delivered', internalNotes);
      }
      
      // If express status changed, update it
      if (isExpressDelivery !== order.isExpress) {
        await markOrderAsExpress(order.orderID, isExpressDelivery);
      }
      
      onOrderUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark order as delivered');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setError(null);

    try {
      await processOrder(order.orderID, 'cancelled', internalNotes);
      onOrderUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      const resendEmailFn = httpsCallable(functions, 'resendOrderEmail');
      const result = await resendEmailFn({ orderId: order.orderID });
      
      // Check if the result indicates success
      if (result.data && (result.data as any).success) {
        console.log('Email resent successfully');
        onOrderUpdated();
      } else {
        setError('Failed to resend email');
      }
    } catch (err) {
      console.error('Error resending email:', err);
      setError(err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpress = () => {
    setIsExpressDelivery(!isExpressDelivery);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`relative w-full max-w-4xl rounded-xl p-6 shadow-lg ${
          isDarkMode
            ? 'bg-gray-800 text-white backdrop-blur-lg bg-opacity-80'
            : 'bg-white text-gray-800 backdrop-blur-lg bg-opacity-90'
        }`}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 transition-colors duration-200"
        >
          <X size={24} className={isDarkMode ? 'text-gray-300' : 'text-gray-500'} />
        </button>

        {/* Order header */}
        <div className="mb-6 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Order #{order.orderID.substring(0, 8)}
            </h2>
            <div
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                order.status === 'delivered'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : order.status === 'cancelled'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                  : order.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
              }`}
            >
              {order.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Created: {formatDate(order.createdAt)}
          </p>
          {order.deliveredAt && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Delivered: {formatDate(order.deliveredAt)}
            </p>
          )}
        </div>

        {/* Order details */}
        <div
          className={`mb-6 rounded-lg p-4 ${
            isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-100'
          }`}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">Product Details</h3>
              <p>
                <span className="inline-block w-32 font-medium">Product:</span>{' '}
                {order.product}
              </p>
              <p>
                <span className="inline-block w-32 font-medium">Price:</span>{' '}
                {order.price}
              </p>
              <p>
                <span className="inline-block w-32 font-medium">Platform:</span>{' '}
                {order.platform || 'Not specified'}
              </p>
              <p>
                <span className="inline-block w-32 font-medium">Delivery Type:</span>{' '}
                {order.deliveryType}
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Customer Details</h3>
              <p>
                <span className="inline-block w-32 font-medium">Email:</span>{' '}
                {order.buyerEmail}
              </p>
              <p>
                <span className="inline-block w-32 font-medium">Country:</span>{' '}
                {order.country || 'Not specified'}
              </p>
              {order.gameUsername && (
                <p>
                  <span className="inline-block w-32 font-medium">Game Username:</span>{' '}
                  {order.gameUsername}
                </p>
              )}
              <p>
                <span className="inline-block w-32 font-medium">Notes:</span>{' '}
                {order.notes || 'None'}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Screenshot Section */}
        {order.screenshotURL && (
          <div className="mb-6">
            <h3 className="mb-2 font-semibold">Payment Screenshot</h3>
            <div
              className={`rounded-lg border p-4 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 bg-opacity-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <img 
                src={order.screenshotURL} 
                alt="Payment proof" 
                className="max-w-full rounded-lg cursor-pointer hover:opacity-90"
                onClick={() => window.open(order.screenshotURL, '_blank')}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Click image to view full size
              </p>
            </div>
          </div>
        )}

        {/* Delivery Content Section */}
        <div className="mb-6">
          <h3 className="mb-2 font-semibold">Delivery Content</h3>
          {order.deliveryValue ? (
            <div
              className={`rounded-lg border p-4 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 bg-opacity-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <p className="font-mono text-lg">{order.deliveryValue}</p>
            </div>
          ) : (
            <div className="mb-4">
              <textarea
                className={`w-full rounded-lg border p-3 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-800 placeholder-gray-500'
                }`}
                rows={3}
                placeholder="Enter delivery content here (code, key, account credentials)"
                value={deliveryValue}
                onChange={(e) => setDeliveryValue(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Internal Notes */}
        <div className="mb-6">
          <h3 className="mb-2 font-semibold">Internal Notes (Admin Only)</h3>
          <textarea
            className={`w-full rounded-lg border p-3 ${
              isDarkMode
                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                : 'border-gray-300 bg-white text-gray-800 placeholder-gray-500'
            }`}
            rows={2}
            placeholder="Add internal notes here (not visible to customer)"
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
          />
        </div>

        {/* Express Delivery Toggle */}
        <div className="mb-6">
          <label className="flex cursor-pointer items-center">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={isExpressDelivery}
                onChange={handleToggleExpress}
              />
              <div
                className={`block h-8 w-14 rounded-full ${
                  isExpressDelivery
                    ? 'bg-accent'
                    : isDarkMode
                    ? 'bg-gray-600'
                    : 'bg-gray-300'
                }`}
              ></div>
              <div
                className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition-transform ${
                  isExpressDelivery ? 'translate-x-6' : ''
                }`}
              ></div>
            </div>
            <div className="ml-3 font-medium">
              <Zap
                size={18}
                className={`mr-1 inline ${
                  isExpressDelivery ? 'text-yellow-500' : 'text-gray-400'
                }`}
              />
              Mark as Express Delivery
            </div>
          </label>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700 dark:bg-red-900 dark:bg-opacity-50 dark:text-red-100">
            <div className="flex items-center">
              <AlertTriangle size={18} className="mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-3">
          {!order.deliveryValue && order.status !== 'delivered' && (
            <button
              onClick={handleMarkAsDelivered}
              disabled={loading}
              className={`flex items-center rounded-lg px-4 py-2 font-medium text-white ${
                loading
                  ? 'cursor-not-allowed bg-green-600 opacity-70'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? (
                <Clock size={18} className="mr-2 animate-spin" />
              ) : (
                <Check size={18} className="mr-2" />
              )}
              Mark as Delivered
            </button>
          )}

          {order.status !== 'in_progress' && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  await processOrder(order.orderID, 'in_progress', internalNotes);
                  onOrderUpdated();
                  onClose();
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to update order');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className={`flex items-center rounded-lg px-4 py-2 font-medium text-white ${
                loading
                  ? 'cursor-not-allowed bg-blue-600 opacity-70'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <RefreshCw size={18} className="mr-2" />
              In Progress
            </button>
          )}

          {order.status !== 'delayed' && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  await processOrder(order.orderID, 'delayed', internalNotes);
                  onOrderUpdated();
                  onClose();
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to update order');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className={`flex items-center rounded-lg px-4 py-2 font-medium text-white ${
                loading
                  ? 'cursor-not-allowed bg-orange-600 opacity-70'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              <Clock size={18} className="mr-2" />
              Mark as Delayed
            </button>
          )}

          {order.status !== 'cancelled' && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className={`flex items-center rounded-lg px-4 py-2 font-medium text-white ${
                loading
                  ? 'cursor-not-allowed bg-red-600 opacity-70'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <Ban size={18} className="mr-2" />
              Cancel Order
            </button>
          )}

          {order.deliveryValue && order.status === 'delivered' && (
            <button
              onClick={handleResendEmail}
              disabled={loading}
              className={`flex items-center rounded-lg px-4 py-2 font-medium ${
                loading
                  ? 'cursor-not-allowed opacity-70'
                  : isDarkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <RefreshCw size={18} className="mr-2" />
              Resend Email
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal; 