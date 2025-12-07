import { Link } from 'react-router-dom';
import { Shield, MapPin, Users, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-illini-blue text-white">
      {/* Features strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 bg-illini-orange/20 rounded-lg flex items-center justify-center">
                <Shield className="text-illini-orange" size={20} />
              </div>
              <div>
                <h4 className="font-semibold">Verified Users</h4>
                <p className="text-sm text-gray-300">Only @illinois.edu accounts</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 bg-illini-orange/20 rounded-lg flex items-center justify-center">
                <MapPin className="text-illini-orange" size={20} />
              </div>
              <div>
                <h4 className="font-semibold">Safe Exchange</h4>
                <p className="text-sm text-gray-300">Meet at campus safe zones</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 bg-illini-orange/20 rounded-lg flex items-center justify-center">
                <Users className="text-illini-orange" size={20} />
              </div>
              <div>
                <h4 className="font-semibold">Community</h4>
                <p className="text-sm text-gray-300">Built for Illini by Illini</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-illini-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold text-xl">I</span>
              </div>
              <div>
                <span className="font-display font-bold text-white text-lg">Illini</span>
                <span className="font-display font-bold text-illini-orange text-lg">Exchange</span>
              </div>
            </Link>
            <p className="text-gray-300 text-sm max-w-md">
              The secure marketplace exclusively for University of Illinois Urbana-Champaign 
              students and staff. Buy, sell, and exchange items safely within our campus community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/marketplace" className="text-gray-300 hover:text-illini-orange transition-colors text-sm">
                  Browse Marketplace
                </Link>
              </li>
              <li>
                <Link to="/create-listing" className="text-gray-300 hover:text-illini-orange transition-colors text-sm">
                  Sell an Item
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-illini-orange transition-colors text-sm">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/marketplace?category=textbooks" className="text-gray-300 hover:text-illini-orange transition-colors text-sm">
                  Textbooks
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=electronics" className="text-gray-300 hover:text-illini-orange transition-colors text-sm">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=furniture" className="text-gray-300 hover:text-illini-orange transition-colors text-sm">
                  Furniture
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=tickets" className="text-gray-300 hover:text-illini-orange transition-colors text-sm">
                  Tickets & Events
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Illini Exchange.
            </p>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              Made with <Heart size={14} className="text-illini-orange" /> for the UIUC Community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

