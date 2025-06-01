import { Link } from 'react-router-dom';
import siteConfig from '../config/siteConfig';

const Footer = () => {
  return (
    <footer className="bg-glass backdrop-blur-md border-t border-white/10 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold text-accent mb-4">{siteConfig.siteName}</h3>
            <p className="text-sm text-textDark">
              Fast, safe, and affordable game currency and digital products at the best prices.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold text-accent mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-textDark hover:text-accent">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/vouches" className="text-sm text-textDark hover:text-accent">
                  Vouches
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-sm text-textDark hover:text-accent">
                  Help
                </Link>
              </li>
              <li>
                <Link to="/how-to-receive" className="text-sm text-textDark hover:text-accent">
                  How to Receive
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-sm text-textDark hover:text-accent">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-accent mb-4">Contact</h3>
            <p className="text-sm text-textDark mb-2">Discord: {siteConfig.discord.username}</p>
            <p className="text-sm text-textDark">Email: {siteConfig.supportEmail}</p>
            <p className="text-sm text-textDark mt-2">
              Business Hours: {siteConfig.businessHours.start} - {siteConfig.businessHours.end} {siteConfig.businessHours.timezone}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <p className="text-sm text-center text-textDark">
            &copy; {new Date().getFullYear()} {siteConfig.siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 