import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Plus, User, LogOut, ShoppingBag, Search, Heart } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-illini-orange to-illini-orange-dark rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white font-display font-bold text-xl">I</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-illini-blue text-lg">Illini</span>
              <span className="font-display font-bold text-illini-orange text-lg">Exchange</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/marketplace"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/marketplace')
                  ? 'bg-illini-orange/10 text-illini-orange'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-illini-blue'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShoppingBag size={18} />
                Marketplace
              </span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/favorites"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive('/favorites')
                      ? 'bg-illini-orange/10 text-illini-orange'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-illini-blue'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Heart size={18} />
                    Favorites
                  </span>
                </Link>
                <Link
                  to="/create-listing"
                  className="btn-primary flex items-center gap-2 ml-2"
                >
                  <Plus size={18} />
                  Sell Item
                </Link>
              </>
            )}
          </div>

          {/* Right side - Auth buttons or Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-illini-orange"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-illini-blue flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">{user.name?.split(' ')[0]}</span>
                </button>

                {/* Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 animate-slide-down border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-illini-blue">{user.name}</p>
                      <p className="text-xs text-gray-500">@{user.net_id}</p>
                    </div>
                    <Link
                      to="/favorites"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Heart size={16} />
                      My Favorites
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User size={16} />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-illini-blue font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            <Link
              to="/marketplace"
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium ${
                isActive('/marketplace')
                  ? 'bg-illini-orange/10 text-illini-orange'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingBag size={20} />
              Marketplace
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/favorites"
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium ${
                    isActive('/favorites')
                      ? 'bg-illini-orange/10 text-illini-orange'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart size={20} />
                  Favorites
                </Link>
                <Link
                  to="/create-listing"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-illini-orange bg-illini-orange/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Plus size={20} />
                  Sell an Item
                </Link>
                <Link
                  to="/favorites"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart size={20} />
                  My Favorites
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={20} />
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 space-y-2">
                <Link
                  to="/login"
                  className="block px-4 py-3 text-center rounded-lg font-medium text-illini-blue border border-gray-200 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-3 text-center rounded-lg font-medium text-white bg-illini-orange hover:bg-illini-orange-dark"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

