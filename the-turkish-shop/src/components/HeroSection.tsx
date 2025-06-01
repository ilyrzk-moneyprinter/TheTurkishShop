import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-price/10 z-0"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
        <div className="md:w-2/3">
          <div className="bg-glass backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/10 shadow-xl">
            <h1 className="text-4xl md:text-5xl font-bold text-textDark mb-4">
              Buy Game Currency for Less
            </h1>
            <p className="text-xl md:text-2xl text-textDark/80 mb-8">
              Fast, safe and affordable delivery
            </p>
            <Link
              to="/#products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg bg-accent text-textLight shadow-sm hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
            >
              Explore Deals
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection; 