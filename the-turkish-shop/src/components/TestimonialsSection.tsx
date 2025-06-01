import { useState, useEffect } from 'react';
import { Star, CheckCircle, ChevronLeft, ChevronRight, Quote, ShieldCheck } from 'lucide-react';
import { getApprovedVouches, Vouch } from '../firebase/vouchService';
import { motion, AnimatePresence } from 'framer-motion';

const TestimonialsSection = () => {
  const [vouches, setVouches] = useState<Vouch[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVouches();
  }, []);

  useEffect(() => {
    if (vouches.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % vouches.length);
      }, 5000); // Auto-scroll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [vouches.length]);

  const loadVouches = async () => {
    try {
      const data = await getApprovedVouches();
      // Get only the highest rated vouches for homepage
      const topVouches = data
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6); // Show max 6 testimonials
      setVouches(topVouches);
    } catch (error) {
      console.error('Error loading vouches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + vouches.length) % vouches.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % vouches.length);
  };

  if (loading || vouches.length === 0) {
    return null;
  }

  const currentVouch = vouches[currentIndex];

  return (
    <section className="py-20 bg-gradient-to-b from-transparent via-purple-50/50 dark:via-purple-900/10 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-purple-500"></div>
            <ShieldCheck className="h-6 w-6 text-green-500" />
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Verified Customer Reviews
            </h2>
            <ShieldCheck className="h-6 w-6 text-green-500" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-pink-500"></div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their digital purchases
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900 dark:to-pink-900 opacity-10 rounded-full blur-3xl -z-10"></div>
              
              {/* Quote Icon */}
              <Quote className="h-12 w-12 text-purple-200 dark:text-purple-700 mb-6" />
              
              {/* Review Content */}
              <div className="relative z-10">
                <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-8">
                  "{currentVouch.message}"
                </p>
                
                {/* Customer Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {currentVouch.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {currentVouch.name}
                        </h4>
                        <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-xs font-medium text-green-700 dark:text-green-400">Verified Purchase</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < currentVouch.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {currentVouch.createdAt?.toDate ? 
                            new Date(currentVouch.createdAt.toDate()).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric'
                            }) : 
                            'Recent'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Platform Badge */}
                  {currentVouch.platform && (
                    <div className="hidden md:flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                      <ShieldCheck className="h-4 w-4" />
                      <span>via {currentVouch.platform}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 hover:shadow-xl transition-all group"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 hover:shadow-xl transition-all group"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {vouches.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 bg-gradient-to-r from-purple-600 to-pink-600' 
                    : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center"
        >
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {vouches.length}+
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Verified Reviews
            </div>
          </div>
          <div className="h-12 w-px bg-gray-300 dark:bg-gray-700 hidden md:block"></div>
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-1">
              {(vouches.reduce((acc, v) => acc + v.rating, 0) / vouches.length).toFixed(1)}
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Average Rating
            </div>
          </div>
          <div className="h-12 w-px bg-gray-300 dark:bg-gray-700 hidden md:block"></div>
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              100%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Satisfaction Rate
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 