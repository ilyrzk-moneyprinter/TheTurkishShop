import { useRef, useState } from 'react';
import { Order } from '../../firebase/types';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { updateOrderDeliveryValue, markOrderAsExpress, processOrder } from '../../firebase/adminService';
import { X, Send, AlertTriangle, Check, Clock, RefreshCw, Ban, Zap } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'react-hot-toast';
import { getFunctions } from 'firebase/functions';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onOrderUpdated: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose, onOrderUpdated }) => {
  const { isDarkMode } = useDarkMode();
  const [deliveryValue, setDeliveryValue] = useState('');
  const [internalNotes, setInternalNotes] = useState(order.adminNotes || '');
  const [isExpressDelivery, setIsExpressDelivery] = useState(order.isExpress || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const functions = getFunctions();

  // ... rest of the component code

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      const resendEmailFn = httpsCallable(functions, 'resendOrderEmail');
      const result = await resendEmailFn({ orderId: order.orderID });
      
      // Check if the result indicates success
      if (result.data && (result.data as any).success) {
        toast.success('Email resent successfully');
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
} 