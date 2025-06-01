import { useState } from 'react';
import { MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { submitHelpRequest } from '../firebase/helpService';
import { useTheme } from '../contexts/ThemeContext';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "How do I place an order?",
    answer: "Select the product you want to purchase, choose the amount, and click 'Buy Now'. You'll be guided through the payment process, and after payment confirmation, we'll deliver your product according to the instructions."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept PayPal, Paysafecard, and various cryptocurrencies including Bitcoin, Ethereum, and more. Visit our Payment Methods page for more details."
  },
  {
    question: "How long does delivery take?",
    answer: "Most digital products are delivered instantly or within 1-2 hours. Some products may take up to 24 hours depending on availability and verification requirements."
  },
  {
    question: "Is it safe to buy from your store?",
    answer: "Yes, we've been operating for years with hundreds of satisfied customers. We use secure payment methods and don't store your payment information."
  },
  {
    question: "What if I don't receive my product?",
    answer: "If you don't receive your product within the estimated delivery time, please contact us via Discord or email, and we'll resolve the issue immediately."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer refunds if we're unable to deliver the product you purchased. However, due to the digital nature of our products, we cannot offer refunds after successful delivery."
  }
];

const HelpPage = () => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    ticketId?: string;
  }>({ type: null, message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const ticketId = await submitHelpRequest(
        formData.name,
        formData.email,
        formData.subject,
        formData.message
      );

      setSubmitStatus({
        type: 'success',
        message: `Your support request has been submitted successfully! You'll receive a confirmation email shortly.`,
        ticketId
      });

      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Failed to submit your request. Please try again or contact us on Discord.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'} mb-4`}>
            Help & Support
          </h1>
          <p className={`text-xl ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'} max-w-2xl mx-auto`}>
            Need assistance? We're here to help. Check out our FAQs or reach out to us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className={`${isDarkMode ? 'bg-surface-dark' : 'bg-glass'} backdrop-blur-md rounded-2xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-white/10'}`}>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'} mb-6`}>
              Contact Us
            </h2>

            {/* Status Messages */}
            {submitStatus.type && (
              <div className={`mb-6 p-4 rounded-lg flex items-start ${
                submitStatus.type === 'success' 
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                  : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
                {submitStatus.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p>{submitStatus.message}</p>
                  {submitStatus.ticketId && (
                    <p className="text-sm mt-1 opacity-80">
                      Ticket ID: {submitStatus.ticketId}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className={`block text-sm font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'} mb-1`}>
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg ${
                    isDarkMode 
                      ? 'bg-black/20 text-textLight placeholder:text-gray-500' 
                      : 'bg-surface text-textDark placeholder:text-textDark/50'
                  } border ${isDarkMode ? 'border-gray-700' : 'border-white/10'} focus:outline-none focus:ring-2 focus:ring-accent/50`}
                  placeholder="John Doe"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'} mb-1`}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg ${
                    isDarkMode 
                      ? 'bg-black/20 text-textLight placeholder:text-gray-500' 
                      : 'bg-surface text-textDark placeholder:text-textDark/50'
                  } border ${isDarkMode ? 'border-gray-700' : 'border-white/10'} focus:outline-none focus:ring-2 focus:ring-accent/50`}
                  placeholder="your@email.com"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="subject" className={`block text-sm font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'} mb-1`}>
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg ${
                    isDarkMode 
                      ? 'bg-black/20 text-textLight placeholder:text-gray-500' 
                      : 'bg-surface text-textDark placeholder:text-textDark/50'
                  } border ${isDarkMode ? 'border-gray-700' : 'border-white/10'} focus:outline-none focus:ring-2 focus:ring-accent/50`}
                  placeholder="Order issue, payment question, etc."
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className={`block text-sm font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'} mb-1`}>
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full p-3 rounded-lg ${
                    isDarkMode 
                      ? 'bg-black/20 text-textLight placeholder:text-gray-500' 
                      : 'bg-surface text-textDark placeholder:text-textDark/50'
                  } border ${isDarkMode ? 'border-gray-700' : 'border-white/10'} focus:outline-none focus:ring-2 focus:ring-accent/50`}
                  placeholder="Please describe your issue in detail..."
                  required
                  disabled={isSubmitting}
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 bg-accent text-textLight font-medium rounded-lg transition-all ${
                  isSubmitting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-accent/90'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Send Message'}
              </button>
              
              <p className={`text-sm mt-4 ${isDarkMode ? 'text-gray-400' : 'text-textDark/60'}`}>
                ✉️ You'll receive an email confirmation after submitting your request. 
                Our support team typically responds within 1-3 hours during business hours.
              </p>
            </form>

            <div className={`mt-8 pt-8 border-t ${isDarkMode ? 'border-gray-700' : 'border-white/10'}`}>
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-5 h-5 text-accent" />
                <span className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  Discord
                </span>
              </div>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-textDark/70'} mb-4`}>
                For faster support, join our Discord server: 
                <a href="https://discord.gg/theturkishshop" className="text-accent hover:underline ml-1">
                  discord.gg/theturkishshop
                </a>
              </p>
              
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-textDark/70'}`}>
                Our support team is available from 9 AM to 11 PM GMT+3.
              </p>
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'} mb-6`}>
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`${isDarkMode ? 'bg-surface-dark' : 'bg-glass'} backdrop-blur-md rounded-xl p-6 border ${isDarkMode ? 'border-gray-700' : 'border-white/10'}`}
                >
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-textLight' : 'text-textDark'} mb-2`}>
                    {faq.question}
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-textDark/70'}`}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage; 