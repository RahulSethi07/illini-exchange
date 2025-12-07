import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { favoritesAPI } from '../services/api';
import ListingCard from '../components/ListingCard';
import { Heart } from 'lucide-react';

const Favorites = () => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await favoritesAPI.getAll();
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cloud flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-illini-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="text-illini-orange" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-illini-blue mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view and manage your favorite listings.
          </p>
          <Link to="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cloud">
      {/* Header */}
      <div className="bg-gradient-to-br from-illini-orange/10 to-illini-blue/10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-illini-orange rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-illini-blue mb-2">
                My Favorites
              </h1>
              <p className="text-gray-600">
                {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-[4/3] bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {favorites.map((listing) => (
              <ListingCard key={listing.id} listing={listing} onFavoriteChange={fetchFavorites} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-card">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="text-gray-400" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-6">
              Start saving listings you're interested in by clicking the heart icon.
            </p>
            <Link to="/marketplace" className="btn-primary">
              Browse Marketplace
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;

