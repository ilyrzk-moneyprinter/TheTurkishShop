import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Package, MessageSquare, Mail, Key } from 'lucide-react';

const HowToReceivePage: React.FC = () => {
  const { isDarkMode } = useTheme();

  const deliveryMethods = [
    {
      icon: <Key className="h-8 w-8" />,
      title: "Game Keys & Codes",
      description: "For Steam, PlayStation, and gift cards",
      steps: [
        "Complete your payment and upload proof",
        "We verify your payment (usually within 30 minutes)",
        "Receive your code via email",
        "Redeem the code on your platform"
      ]
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: "Direct Top-up",
      description: "For Valorant Points, Apex Coins, etc.",
      steps: [
        "Provide your game username/ID during checkout",
        "We log into the game store on your behalf",
        "Purchase is added directly to your account",
        "You'll see the items when you next log in"
      ]
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Account Delivery",
      description: "For Spotify Premium and similar services",
      steps: [
        "Choose between fresh account or upgrade",
        "For upgrades: provide your account details",
        "We apply the subscription to your account",
        "Receive confirmation email with details"
      ]
    },
    {
      icon: <Mail className="h-8 w-8" />,
      title: "Gift Links",
      description: "For Discord Nitro and similar",
      steps: [
        "Complete your order as normal",
        "Receive a gift link via email",
        "Click the link to redeem on your account",
        "Enjoy your purchase immediately"
      ]
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
            How to Receive Your Purchase
          </h1>
          <p className={`text-center mb-12 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            We offer multiple delivery methods depending on what you purchase
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {deliveryMethods.map((method, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}
              >
                <div className={`inline-flex p-3 rounded-lg mb-4 ${
                  isDarkMode ? 'bg-accent/20 text-accent' : 'bg-accent/10 text-accent'
                }`}>
                  {method.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {method.title}
                </h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {method.description}
                </p>
                <ol className="space-y-2">
                  {method.steps.map((step, stepIndex) => (
                    <li
                      key={stepIndex}
                      className={`flex items-start ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      <span className={`mr-2 font-semibold ${
                        isDarkMode ? 'text-accent' : 'text-accent'
                      }`}>
                        {stepIndex + 1}.
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          <div className={`mt-12 p-6 rounded-xl ${
            isDarkMode ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'
          }`}>
            <h2 className={`text-2xl font-semibold mb-4 ${
              isDarkMode ? 'text-blue-300' : 'text-blue-800'
            }`}>
              Important Notes
            </h2>
            <ul className={`space-y-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
              <li>• Always check your spam folder if you don't receive our emails</li>
              <li>• Keep your order ID safe - you'll need it for support</li>
              <li>• Redeem codes as soon as possible after receiving them</li>
              <li>• Contact support immediately if you have any issues</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HowToReceivePage; 