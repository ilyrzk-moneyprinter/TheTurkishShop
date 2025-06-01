import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Scale, Shield, AlertCircle, FileText } from 'lucide-react';

const TermsOfServicePage: React.FC = () => {
  const { isDarkMode } = useTheme();

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing and using The Turkish Shop website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      title: "2. Use License",
      content: `Permission is granted to temporarily use The Turkish Shop for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
      • Modify or copy the materials
      • Use the materials for any commercial purpose or for any public display
      • Attempt to reverse engineer any software contained on our website
      • Remove any copyright or other proprietary notations from the materials`
    },
    {
      title: "3. Product Descriptions",
      content: `We make every effort to ensure that our product descriptions are accurate and complete. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free. All features, content, specifications, products and prices described or depicted on this website are subject to change at any time without notice.`
    },
    {
      title: "4. Digital Products & Delivery",
      content: `All products sold on The Turkish Shop are digital goods. Once a purchase is completed and the digital product has been delivered, the sale is final. Due to the nature of digital products, we cannot offer refunds after successful delivery. Delivery times may vary based on product availability and verification requirements.`
    },
    {
      title: "5. Payment Terms",
      content: `• All payments must be made in full before delivery of digital products
      • We accept PayPal (Friends & Family only), Paysafecard, and various cryptocurrencies
      • Payment sent as PayPal Goods & Services will be refunded and the order cancelled
      • You are responsible for any fees associated with your payment method
      • Prices are subject to change without notice`
    },
    {
      title: "6. Refund Policy",
      content: `• Refunds are only provided if we are unable to deliver the purchased product
      • No refunds will be issued after successful delivery of digital products
      • Refund requests must be submitted within 48 hours of purchase
      • Chargebacks or payment disputes after product delivery may result in account suspension`
    },
    {
      title: "7. User Accounts",
      content: `• You are responsible for maintaining the confidentiality of your account credentials
      • You are responsible for all activities that occur under your account
      • You must provide accurate and complete information when creating an account
      • We reserve the right to terminate accounts that violate these terms`
    },
    {
      title: "8. Prohibited Uses",
      content: `You may not use our services:
      • For any illegal purpose or to solicit others to perform illegal acts
      • To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances
      • To infringe upon or violate our intellectual property rights or the intellectual property rights of others
      • To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate
      • To submit false or misleading information`
    },
    {
      title: "9. Disclaimer",
      content: `The materials on The Turkish Shop are provided on an 'as is' basis. The Turkish Shop makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.`
    },
    {
      title: "10. Limitations",
      content: `In no event shall The Turkish Shop or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on The Turkish Shop, even if The Turkish Shop or an authorized representative has been notified orally or in writing of the possibility of such damage.`
    },
    {
      title: "11. Privacy Policy",
      content: `Your use of our services is also governed by our Privacy Policy. We respect your privacy and are committed to protecting your personal information. We only collect necessary information to process your orders and improve our services.`
    },
    {
      title: "12. Governing Law",
      content: `These terms and conditions are governed by and construed in accordance with the laws of Turkey and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.`
    },
    {
      title: "13. Changes to Terms",
      content: `The Turkish Shop reserves the right to update or modify these Terms of Service at any time without prior notice. Your continued use of the service following any changes indicates your acceptance of the new terms.`
    },
    {
      title: "14. Contact Information",
      content: `If you have any questions about these Terms of Service, please contact us at:
      • Email: legal@theturkishshop.com
      • Discord: theturkishshop
      • Support Hours: 9 AM - 11 PM GMT+3`
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-12"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Scale className="h-16 w-16 text-accent" />
          </div>
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'} mb-4`}>
            Terms of Service
          </h1>
          <p className={`text-xl ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Important Notice */}
        <div className={`mb-8 p-6 rounded-lg border ${
          isDarkMode 
            ? 'bg-yellow-900/20 border-yellow-700/50 text-yellow-300' 
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2">Important Notice</h3>
              <p className="text-sm">
                Please read these Terms of Service carefully before using our website. 
                By using our services, you agree to be bound by these terms. 
                If you disagree with any part of these terms, please do not use our services.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={`p-6 rounded-lg ${
                isDarkMode ? 'bg-surface-dark/50' : 'bg-white/50'
              } backdrop-blur-sm border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <h2 className={`text-xl font-semibold mb-3 flex items-center ${
                isDarkMode ? 'text-textLight' : 'text-textDark'
              }`}>
                <FileText className="h-5 w-5 mr-2 text-accent" />
                {section.title}
              </h2>
              <div className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              } whitespace-pre-line`}>
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className={`mt-12 p-6 rounded-lg text-center ${
          isDarkMode ? 'bg-surface-dark/30' : 'bg-gray-100'
        }`}>
          <Shield className="h-8 w-8 text-accent mx-auto mb-3" />
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            By using The Turkish Shop, you acknowledge that you have read, understood, 
            and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TermsOfServicePage; 