import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { CreditCard, Shield, Clock, AlertCircle } from 'lucide-react';
import { FaPaypal } from 'react-icons/fa';

const PaymentMethodsPage: React.FC = () => {
  const { isDarkMode } = useTheme();

  const paymentMethods = [
    {
      icon: <FaPaypal className="h-8 w-8" />,
      name: "PayPal",
      subtitle: "Friends & Family Only",
      color: "text-[#00457C]",
      bgColor: isDarkMode ? "bg-[#00457C]/20" : "bg-[#00457C]/10",
      features: [
        "Must be sent as Friends & Family",
        "Instant payment processing",
        "Available worldwide",
        "Screenshot proof required"
      ],
      important: "⚠️ Payments sent as Goods & Services will be refunded and order cancelled",
      instructions: [
        "Send payment to our PayPal address",
        "Select 'Friends & Family' option",
        "Include your Order ID in the notes",
        "Take a screenshot of the completed payment",
        "Upload screenshot during checkout"
      ]
    },
    {
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2z"/>
        </svg>
      ),
      name: "Paysafecard",
      subtitle: "Prepaid Card Payment",
      color: "text-pink-600",
      bgColor: isDarkMode ? "bg-pink-900/20" : "bg-pink-50",
      features: [
        "No bank account needed",
        "Anonymous payment option",
        "Available in 40+ countries",
        "16-digit code required"
      ],
      important: "Card balance must match order total exactly",
      instructions: [
        "Purchase a Paysafecard for the exact order amount",
        "Select your country during checkout",
        "Enter your 16-digit PIN code",
        "We'll verify and process your order",
        "Keep your receipt until order is delivered"
      ]
    }
  ];

  const comingSoon = [
    {
      name: "Cryptocurrency",
      description: "Bitcoin, Ethereum, and other major cryptocurrencies",
      timeline: "Coming Q1 2025"
    },
    {
      name: "Bank Transfer",
      description: "Direct bank transfers for larger orders",
      timeline: "Coming Q1 2025"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`min-h-screen py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className={`text-4xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Payment Methods
          </h1>
          <p className={`text-center mb-12 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Secure and convenient payment options for your purchases
          </p>

          {/* Security Badge */}
          <div className={`flex items-center justify-center mb-12 p-4 rounded-lg ${
            isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
          }`}>
            <Shield className={`h-6 w-6 mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            <span className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
              All payments are secure and encrypted
            </span>
          </div>

          {/* Current Payment Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}
              >
                <div className={`inline-flex p-3 rounded-lg mb-4 ${method.bgColor} ${method.color}`}>
                  {method.icon}
                </div>
                <h3 className={`text-2xl font-semibold mb-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {method.name}
                </h3>
                <p className={`mb-4 font-medium ${method.color}`}>
                  {method.subtitle}
                </p>

                <div className="mb-4">
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Features:
                  </h4>
                  <ul className="space-y-2">
                    {method.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className={`flex items-start ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        <span className={`mr-2 ${method.color}`}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {method.important && (
                  <div className={`p-3 rounded-lg mb-4 ${
                    isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'
                  }`}>
                    <p className="text-sm font-medium">{method.important}</p>
                  </div>
                )}

                <div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    How to pay:
                  </h4>
                  <ol className="space-y-1">
                    {method.instructions.map((instruction, instructionIndex) => (
                      <li
                        key={instructionIndex}
                        className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {instructionIndex + 1}. {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon */}
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {comingSoon.map((method, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border-2 border-dashed ${
                  isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-300'
                }`}
              >
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {method.name}
                </h3>
                <p className={`mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {method.description}
                </p>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                }`}>
                  <Clock className="h-3 w-3 mr-1" />
                  {method.timeline}
                </div>
              </div>
            ))}
          </div>

          {/* Important Information */}
          <div className={`p-6 rounded-xl ${
            isDarkMode ? 'bg-yellow-900/20 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-start">
              <AlertCircle className={`h-6 w-6 mt-0.5 mr-3 flex-shrink-0 ${
                isDarkMode ? 'text-yellow-300' : 'text-yellow-600'
              }`} />
              <div>
                <h3 className={`text-xl font-semibold mb-3 ${
                  isDarkMode ? 'text-yellow-300' : 'text-yellow-800'
                }`}>
                  Payment Guidelines
                </h3>
                <ul className={`space-y-2 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
                  <li>• Always double-check payment details before sending</li>
                  <li>• Keep all payment receipts and screenshots</li>
                  <li>• Include your Order ID in payment notes when possible</li>
                  <li>• Contact support immediately if you encounter issues</li>
                  <li>• Payments are processed in the order they are received</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Refund Policy */}
          <div className={`mt-8 p-6 rounded-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <h3 className={`text-xl font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Refund Policy
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Due to the digital nature of our products, all sales are final once the product has been delivered. 
              However, we offer refunds in the following cases:
            </p>
            <ul className={`mt-3 space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <li>• Order not delivered within 7 days</li>
              <li>• Product received is not as described</li>
              <li>• Technical issues preventing product usage</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentMethodsPage; 