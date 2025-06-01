import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import MotionWrapper from '../components/animations/MotionWrapper';
import MultiStepOrderForm from '../components/MultiStepOrderForm';

const CheckoutPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { currentUser } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  
  // Handle successful order creation
  const handleOrderCreated = (orderID: string) => {
    // Navigate to order status page to see the newly created order
    navigate(`/order-status?id=${orderID}`);
  };
  
  // Check if cart is empty and redirect to cart page if it is
  React.useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <MotionWrapper variant="bouncyFadeIn">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
            Complete Your Order
          </h1>
          
          <MultiStepOrderForm onOrderCreated={handleOrderCreated} />
        </div>
      </MotionWrapper>
    </div>
  );
};

export default CheckoutPage; 