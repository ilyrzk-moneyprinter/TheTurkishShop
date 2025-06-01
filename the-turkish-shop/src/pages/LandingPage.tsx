import { ArrowRight, Star, ShoppingCart, Shield, Zap, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import MotionWrapper from '../components/animations/MotionWrapper';
import Fortnitelogo from '../assets/images/Fortnite-Logo-1.png';
import FIFAlogo from '../assets/images/ea-sports-fc-logo-png_seeklogo-503896.png';
import ValorantLogo from '../assets/images/Valorant-Logo.png';
import CODLogo from '../assets/images/Call-of-Duty-Logo-2019.png';
import ApexLogo from '../assets/images/apex-legends-logo-png-transparent.png';
import TestimonialsSection from '../components/TestimonialsSection';

const LandingPage = () => {
  // Featured products (just display the first 3)
  const featuredProducts = products.slice(0, 3);
  const { isDarkMode } = useTheme();
  const { formatPrice, currency } = useCurrency();

  return (
    <div className="overflow-hidden">
      {/* Hero Section with curved design */}
      <section className="relative pt-20 pb-40 overflow-hidden">
        {/* Animated Background gradient */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-accent/5 to-price/5 z-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        
        {/* Decorative animated shapes */}
        <motion.div 
          className="absolute top-20 right-10 w-40 h-40 rounded-full bg-accent/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        />
        <motion.div 
          className="absolute bottom-10 left-10 w-60 h-60 rounded-full bg-price/5 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
          }}
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <MotionWrapper variant="slideInLeft" className="lg:w-1/2 max-w-2xl">
              <motion.div 
                className="inline-block mb-4 px-3 py-1 bg-glass backdrop-blur-md rounded-full border border-white/10"
                whileHover={{ scale: 1.05 }}
              >
                <span className={`flex items-center text-sm font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  <span className="flex items-center mr-2 text-accent">
                    <Star className="w-4 h-4 fill-price text-price mr-1" />
                    4.9/5
                  </span>
                  Trusted by 10,000+ customers worldwide
                </span>
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className={isDarkMode ? 'text-textLight' : 'text-textDark'}>Save Big on </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-price">
                  Game Currency
                </span>
              </h1>
              
              <p className={`text-lg md:text-xl ${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'} mb-8`}>
                Get instant access to your favorite game currencies and digital products at Turkish regional prices. Save up to 70% with secure, fast delivery.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/products" 
                    className="px-6 py-3 bg-gradient-to-r from-accent to-accent/80 text-textLight font-medium rounded-lg flex items-center justify-center hover:shadow-lg transition-all"
                  >
                    Shop Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/vouches" 
                    className={`px-6 py-3 bg-glass backdrop-blur-md border border-white/10 ${isDarkMode ? 'text-textLight' : 'text-textDark'} font-medium rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors`}
                  >
                    Customer Reviews
                  </Link>
                </motion.div>
              </div>
              
              <div className="mt-8 grid grid-cols-3 gap-4">
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-price">70%</p>
                  <p className={`text-sm ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>Max Savings</p>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-price">15min</p>
                  <p className={`text-sm ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>Avg. Delivery</p>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-price">24/7</p>
                  <p className={`text-sm ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>Support</p>
                </motion.div>
              </div>
            </MotionWrapper>
            
            <MotionWrapper variant="slideInRight" className="lg:w-1/2 mt-10 lg:mt-0">
              <div className="relative">
                {/* Main product showcase */}
                <motion.div 
                  className="bg-glass backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-accent">Today's Hot Deals</h3>
                    <motion.span 
                      className={`text-sm ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      Live
                    </motion.span>
                  </div>
                  
                  <div className="space-y-4">
                    {featuredProducts.map((product, idx) => (
                      <motion.div 
                        key={idx} 
                        className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                        whileHover={{ x: 5 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="flex items-center">
                          <motion.div 
                            className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mr-3"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <ShoppingCart className="w-5 h-5 text-accent" />
                          </motion.div>
                          <div>
                            <h4 className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>{product.name}</h4>
                            <p className={`text-sm ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                              {product.tiers.length} packages available
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-price">{formatPrice(product.tiers[0].price)}</p>
                          {currency !== 'GBP' && (
                            <p className={`text-xs ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'} line-through`}>
                              {formatPrice((parseFloat(product.tiers[0].price) * 2.5).toFixed(2))}
                            </p>
                          )}
                          <p className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Save 60%</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.div 
                    className="mt-6 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Link 
                      to="/products" 
                      className="text-accent hover:underline flex items-center justify-center font-medium"
                    >
                      View all products
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                  </motion.div>
                </motion.div>
                
                {/* Decorative elements */}
                <motion.div 
                  className="absolute -top-4 -right-4 w-20 h-20 bg-price/10 rounded-full blur-xl -z-10"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                />
                <motion.div 
                  className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/10 rounded-full blur-xl -z-10"
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                />
              </div>
            </MotionWrapper>
          </div>
        </div>
      </section>

      {/* Trusted by section */}
      <section className="py-16 bg-glass backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <MotionWrapper variant="fadeIn">
            <h2 className={`text-center text-xl ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'} mb-10`}>
              Supporting Your Favorite Games
            </h2>
          </MotionWrapper>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {[Fortnitelogo, FIFAlogo, ValorantLogo, CODLogo, ApexLogo].map((logo, idx) => (
              <MotionWrapper key={idx} variant="fadeIn">
                <motion.div 
                  className="h-12 md:h-14 flex items-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <img 
                    src={logo} 
                    alt="Game Logo" 
                    className="h-full object-contain opacity-70 hover:opacity-100 transition-opacity" 
                  />
                </motion.div>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden" id="features">
        <div className="absolute inset-0 bg-gradient-to-bl from-accent/5 to-price/5 z-0"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <MotionWrapper variant="fadeIn">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                Why Choose The Turkish Shop?
              </h2>
              <p className={`text-lg ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                We leverage regional pricing to bring you legitimate products at unbeatable prices.
              </p>
            </div>
          </MotionWrapper>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Best Prices Guaranteed",
                description: "Save 50-70% on all products through Turkish regional pricing. We constantly monitor prices to ensure the best deals.",
                icon: <TrendingUp className="w-6 h-6" />,
                color: "from-green-500 to-emerald-500"
              },
              {
                title: "Lightning Fast Delivery",
                description: "Express orders delivered in 5-60 minutes. Standard orders within 1-3 hours. Track your order in real-time.",
                icon: <Zap className="w-6 h-6" />,
                color: "from-blue-500 to-cyan-500"
              },
              {
                title: "100% Secure & Safe",
                description: "All transactions are encrypted. We never store sensitive data. Trusted by 10,000+ customers worldwide.",
                icon: <Shield className="w-6 h-6" />,
                color: "from-purple-500 to-pink-500"
              }
            ].map((feature, idx) => (
              <MotionWrapper key={idx} variant="fadeIn">
                <motion.div 
                  className="bg-glass backdrop-blur-md rounded-2xl p-8 border border-white/10 transition-all hover:shadow-xl h-full"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 text-white`}>
                    {feature.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    {feature.title}
                  </h3>
                  <p className={isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}>
                    {feature.description}
                  </p>
                </motion.div>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-glass backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <MotionWrapper variant="fadeIn">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                Simple & Fast Process
              </h2>
              <p className={`text-lg ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                Get your game currency in minutes with our streamlined process.
              </p>
            </div>
          </MotionWrapper>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Choose Product", description: "Select from our wide range of game currencies and digital products." },
              { step: "2", title: "Secure Checkout", description: "Complete your order with our encrypted checkout process." },
              { step: "3", title: "Instant Payment", description: "Pay securely via PayPal, card, or cryptocurrency." },
              { step: "4", title: "Quick Delivery", description: "Receive your product within minutes to your account." }
            ].map((step, idx) => (
              <MotionWrapper key={idx} variant="fadeIn">
                <div className="text-center relative">
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-accent to-price flex items-center justify-center text-textLight text-xl font-bold mx-auto mb-6"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {step.step}
                  </motion.div>
                  <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    {step.title}
                  </h3>
                  <p className={isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}>
                    {step.description}
                  </p>
                  
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-accent/30 to-price/30"></div>
                  )}
                </div>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Happy Customers", value: "10,000+", icon: <Users className="w-6 h-6" /> },
              { label: "Orders Delivered", value: "50,000+", icon: <ShoppingCart className="w-6 h-6" /> },
              { label: "Average Rating", value: "4.9/5", icon: <Star className="w-6 h-6" /> },
              { label: "Support Response", value: "<10min", icon: <Zap className="w-6 h-6" /> },
            ].map((stat, idx) => (
              <MotionWrapper key={idx} variant="fadeIn">
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex justify-center mb-3 text-accent">
                    {stat.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-price">
                    {stat.value}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                    {stat.label}
                  </p>
                </motion.div>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Featured Products Section */}
      <section className="py-24 bg-glass backdrop-blur-sm border-y border-white/10" id="products">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>Our Products</h2>
            <p className={`text-lg ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
              Browse our selection of discounted game currencies and digital products.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.slice(0, 6).map((product, idx) => (
              <ProductCard key={idx} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/products" 
              className="px-6 py-3 bg-accent text-textLight font-medium rounded-lg inline-flex items-center hover:bg-accent/90 transition-colors"
            >
              View All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-price/20 z-0"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto bg-glass backdrop-blur-lg rounded-3xl p-12 border border-white/10 shadow-xl">
            <div className="text-center">
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>Ready to Save on Your Game Currency?</h2>
              <p className={`text-lg ${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'} mb-8 max-w-2xl mx-auto`}>
                Join thousands of satisfied customers and start saving on your favorite games and digital products today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/products" 
                  className="px-8 py-4 bg-accent text-textLight font-medium rounded-lg flex items-center justify-center hover:bg-accent/90 transition-colors"
                >
                  Explore Products
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                
                <Link 
                  to="/help" 
                  className={`px-8 py-4 bg-glass backdrop-blur-md border border-white/10 ${isDarkMode ? 'text-textLight' : 'text-textDark'} font-medium rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors`}
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 