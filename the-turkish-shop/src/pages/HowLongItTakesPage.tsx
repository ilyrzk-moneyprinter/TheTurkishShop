import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Clock, Zap, Package, AlertCircle } from 'lucide-react';

const HowLongItTakesPage: React.FC = () => {
  const { isDarkMode } = useTheme();

  const deliveryTimes = [
    {
      icon: <Zap className="h-8 w-8" />,
      type: "Express Delivery",
      time: "5-60 minutes",
      color: "text-yellow-500",
      bgColor: isDarkMode ? "bg-yellow-900/20" : "bg-yellow-50",
      description: "Priority queue processing for urgent orders",
      details: [
        "Orders are processed immediately",
        "Skips the standard queue",
        "Ideal for time-sensitive purchases",
        "Available for all products"
      ]
    },
    {
      icon: <Package className="h-8 w-8" />,
      type: "Standard Delivery",
      time: "1-3 days",
      color: "text-blue-500",
      bgColor: isDarkMode ? "bg-blue-900/20" : "bg-blue-50",
      description: "Regular processing through our standard queue",
      details: [
        "Orders processed in sequence",
        "Most orders completed within 24 hours",
        "Perfect for non-urgent purchases",
        "Same quality service at standard price"
      ]
    }
  ];

  const productTimelines = [
    {
      category: "Game Currencies",
      products: ["Valorant Points", "Apex Coins", "FIFA Points"],
      standardTime: "1-2 days",
      expressTime: "15-30 minutes"
    },
    {
      category: "Gift Cards & Codes",
      products: ["Steam Keys", "PlayStation Codes", "Roblox Gift Cards"],
      standardTime: "30 mins - 2 hours",
      expressTime: "5-15 minutes"
    },
    {
      category: "Subscriptions",
      products: ["Spotify Premium", "Discord Nitro"],
      standardTime: "2-6 hours",
      expressTime: "30-60 minutes"
    },
    {
      category: "Mobile Games",
      products: ["Brawl Stars Gems", "Mobile Legends Diamonds"],
      standardTime: "1-3 days",
      expressTime: "30-60 minutes"
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
            Delivery Times
          </h1>
          <p className={`text-center mb-12 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Choose the delivery speed that works best for you
          </p>

          {/* Delivery Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {deliveryTimes.map((delivery, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}
              >
                <div className={`inline-flex p-3 rounded-lg mb-4 ${delivery.bgColor} ${delivery.color}`}>
                  {delivery.icon}
                </div>
                <h3 className={`text-2xl font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {delivery.type}
                </h3>
                <p className={`text-3xl font-bold mb-3 ${delivery.color}`}>
                  {delivery.time}
                </p>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {delivery.description}
                </p>
                <ul className="space-y-2">
                  {delivery.details.map((detail, detailIndex) => (
                    <li
                      key={detailIndex}
                      className={`flex items-start ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      <span className={`mr-2 ${delivery.color}`}>✓</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Product-Specific Times */}
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Delivery Times by Product
          </h2>
          <div className="overflow-x-auto">
            <table className={`w-full rounded-lg overflow-hidden ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                <tr>
                  <th className={`px-6 py-4 text-left ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Category
                  </th>
                  <th className={`px-6 py-4 text-left ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Products
                  </th>
                  <th className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Standard
                  </th>
                  <th className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Express
                  </th>
                </tr>
              </thead>
              <tbody>
                {productTimelines.map((timeline, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? (isDarkMode ? 'bg-gray-800' : 'bg-white') : (isDarkMode ? 'bg-gray-750' : 'bg-gray-50')}
                  >
                    <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {timeline.category}
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {timeline.products.join(", ")}
                    </td>
                    <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {timeline.standardTime}
                    </td>
                    <td className={`px-6 py-4 text-center font-medium text-yellow-500`}>
                      {timeline.expressTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Important Information */}
          <div className={`mt-12 p-6 rounded-xl ${
            isDarkMode ? 'bg-orange-900/20 border border-orange-500/30' : 'bg-orange-50 border border-orange-200'
          }`}>
            <div className="flex items-start">
              <AlertCircle className={`h-6 w-6 mt-0.5 mr-3 flex-shrink-0 ${
                isDarkMode ? 'text-orange-300' : 'text-orange-600'
              }`} />
              <div>
                <h3 className={`text-xl font-semibold mb-3 ${
                  isDarkMode ? 'text-orange-300' : 'text-orange-800'
                }`}>
                  Important Information
                </h3>
                <ul className={`space-y-2 ${isDarkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                  <li>• Delivery times start after payment verification</li>
                  <li>• Times may vary during peak hours or weekends</li>
                  <li>• Express delivery is available 24/7</li>
                  <li>• Complex orders may take additional time</li>
                  <li>• We'll notify you if there are any delays</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Queue Status */}
          <div className={`mt-8 p-6 rounded-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg text-center`}>
            <Clock className={`h-12 w-12 mx-auto mb-4 ${
              isDarkMode ? 'text-accent' : 'text-accent'
            }`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Current Queue Status
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Standard orders: Processing normally<br />
              Express orders: Immediate processing
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HowLongItTakesPage; 