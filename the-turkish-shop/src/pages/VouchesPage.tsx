import { useState, useEffect } from 'react';
import { Star, CheckCircle, ShieldCheck, Clock, TrendingUp, Award, Users, MessageSquarePlus } from 'lucide-react';
import { getApprovedVouches, Vouch, debugGetAllVouches } from '../firebase/vouchService';
import { motion } from 'framer-motion';
import VouchSubmissionModal from '../components/VouchSubmissionModal';

const VouchesPage = () => {
  const [vouches, setVouches] = useState<Vouch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    loadVouches();
    // Debug: Check all vouches
    debugGetAllVouches().then(allVouches => {
      console.log('DEBUG: All vouches in database:', allVouches);
    });
  }, []);

  const loadVouches = async () => {
    try {
      setLoading(true);
      console.log('Loading approved vouches...');
      const data = await getApprovedVouches();
      console.log('Approved vouches loaded:', data);
      setVouches(data);
    } catch (error) {
      console.error('Error loading vouches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVouches = selectedRating 
    ? vouches.filter(v => v.rating === selectedRating)
    : vouches;

  const averageRating = vouches.length > 0
    ? (vouches.reduce((acc, v) => acc + v.rating, 0) / vouches.length).toFixed(1)
    : '5.0';

  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: vouches.filter(v => v.rating === rating).length,
    percentage: vouches.length > 0 
      ? (vouches.filter(v => v.rating === rating).length / vouches.length * 100).toFixed(0)
      : 0
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShieldCheck className="h-8 w-8 text-green-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Verified Customer Reviews
            </h1>
            <ShieldCheck className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Real feedback from our verified customers. Every review is from a genuine purchase.
          </p>
          
          {/* Submit Review Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSubmitModal(true)}
            className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            <MessageSquarePlus className="h-5 w-5" />
            Submit Your Review
          </motion.button>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">100% Verified Purchases</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">{vouches.length}+ Happy Customers</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Trusted Since 2024</span>
            </div>
          </div>
          
          {/* Temporary debug info */}
          {vouches.length === 0 && !loading && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-left max-w-md mx-auto">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                Debug Info: No vouches found in database.
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Check browser console for more details. You may need to:
                <ul className="list-disc list-inside mt-1">
                  <li>Initialize the database from admin panel</li>
                  <li>Or manually add vouches in admin panel</li>
                  <li>Check Firestore indexes if queries are failing</li>
                </ul>
              </p>
            </div>
          )}
        </motion.div>

        {/* Rating Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <div className="text-5xl font-bold text-gray-900 dark:text-white">{averageRating}</div>
                <div>
                  <div className="flex mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                        className={`w-6 h-6 ${i < Math.round(Number(averageRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Based on {vouches.length} reviews</p>
                </div>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-green-600">
                <Award className="h-5 w-5" />
                <span className="font-medium">Excellent Service Rating</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {ratingCounts.map(({ rating, count, percentage }) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                  className={`w-full flex items-center gap-3 group hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors ${
                    selectedRating === rating ? 'bg-gray-50 dark:bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-1 min-w-[80px]">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[40px] text-right">
                    {count}
                  </span>
                </button>
          ))}
        </div>
          </div>
        </motion.div>

        {/* Vouches Grid */}
        {filteredVouches.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No Reviews Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              Be the first to share your experience!
            </p>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              <MessageSquarePlus className="h-5 w-5" />
              Write a Review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVouches.map((vouch, index) => (
              <motion.div 
                key={vouch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {vouch.profilePicture ? (
                          <img 
                            src={vouch.profilePicture} 
                            alt={vouch.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                            {vouch.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {vouch.name}
                        </h3>
                        <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-xs font-medium text-green-700 dark:text-green-400">Verified</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        {vouch.city && vouch.country && (
                          <>
                            <span>{vouch.city}, {vouch.country}</span>
                            <span>•</span>
                          </>
                        )}
                        <Clock className="h-3 w-3" />
                        <span>
                          {vouch.createdAt?.toDate ? 
                            new Date(vouch.createdAt.toDate()).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 
                            'Recent'
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                          className={`w-4 h-4 ${i < vouch.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
                    </div>
                  </div>
                  
                  {/* Review Text */}
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    "{vouch.message}"
                  </p>
                  
                  {/* Footer with Product Info */}
                  <div className="flex items-center justify-between">
                    {vouch.productPurchased && (
                      <div className="inline-flex items-center gap-1.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-full font-medium">
                        <ShieldCheck className="h-3 w-3" />
                        {vouch.productPurchased}
                      </div>
                    )}
                    {vouch.orderNumber && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Order #{vouch.orderNumber.slice(-6)}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Hover Effect Border */}
                <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 p-1 rounded-2xl">
            <div className="bg-white dark:bg-gray-900 rounded-2xl px-8 py-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Join Our Happy Customers
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Experience the best prices and fastest delivery in the market
              </p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Instant Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  <span className="text-gray-700 dark:text-gray-300">Best Prices</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Vouch Submission Modal */}
      <VouchSubmissionModal 
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSuccess={() => {
          loadVouches(); // Reload vouches after successful submission
        }}
      />
    </div>
  );
};

export default VouchesPage; 