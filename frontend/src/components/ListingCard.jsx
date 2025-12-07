import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Eye, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { favoritesAPI } from '../services/api';

const ListingCard = ({ listing, onFavoriteChange }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && listing.id) {
      checkFavoriteStatus();
    }
  }, [isAuthenticated, listing.id]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoritesAPI.check(listing.id);
      setIsFavorited(response.data.isFavorited);
    } catch (error) {
      // Silently fail - user might not be authenticated
    }
  };

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      if (isFavorited) {
        await favoritesAPI.remove(listing.id);
        setIsFavorited(false);
      } else {
        await favoritesAPI.add(listing.id);
        setIsFavorited(true);
      }
      // Callback to refresh favorites list if on favorites page
      if (onFavoriteChange) {
        onFavoriteChange();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };
  const images = typeof listing.images === 'string' 
    ? JSON.parse(listing.images || '[]') 
    : listing.images || [];
  
  const conditionLabels = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor'
  };

  const conditionColors = {
    new: 'bg-green-100 text-green-700',
    like_new: 'bg-blue-100 text-blue-700',
    good: 'bg-yellow-100 text-yellow-700',
    fair: 'bg-orange-100 text-orange-700',
    poor: 'bg-red-100 text-red-700'
  };

  const categoryIcons = {
    textbooks: '📚',
    electronics: '💻',
    furniture: '🪑',
    clothing: '👕',
    sports: '⚽',
    tickets: '🎟️',
    transportation: '🚲',
    housing: '🏠',
    services: '🔧',
    other: '📦'
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="card group relative">
      <Link to={`/listing/${listing.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {images.length > 0 ? (
            <img
              src={images[0].startsWith('/') ? `http://localhost:5001${images[0]}` : images[0]}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-5xl">{categoryIcons[listing.category] || '📦'}</span>
            </div>
          )}
          
          {/* Condition badge - top left */}
          <div className="absolute top-2 left-2 z-10">
            <span className={`badge ${conditionColors[listing.condition_status]}`}>
              {conditionLabels[listing.condition_status]}
            </span>
          </div>

          {/* Status badge - below condition if exists */}
          {listing.status !== 'active' && (
            <div className="absolute top-2 left-2 z-10" style={{ marginTop: '28px' }}>
              <span className={`badge ${
                listing.status === 'sold' ? 'bg-red-500 text-white' :
                listing.status === 'reserved' ? 'bg-yellow-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price and Category */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xl font-bold text-illini-orange">
              ${parseFloat(listing.price).toFixed(0)}
            </span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              {categoryIcons[listing.category]}
              <span className="capitalize">{listing.category}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-illini-blue line-clamp-2 mb-2 group-hover:text-illini-orange transition-colors">
            {listing.title}
          </h3>

          {/* Exchange Point */}
          {listing.exchange_point_name && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
              <MapPin size={14} className="text-illini-orange flex-shrink-0" />
              <span className="truncate">{listing.exchange_point_name}</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatDate(listing.created_at)}
            </span>
            {listing.views > 0 && (
              <span className="flex items-center gap-1">
                <Eye size={12} />
                {listing.views} views
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Favorite button - top right, outside Link */}
      {isAuthenticated && (
        <button
          onClick={handleFavoriteToggle}
          disabled={loading}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-lg transition-all z-20 ${
            isFavorited
              ? 'bg-illini-orange text-white'
              : 'bg-white/90 text-gray-400 hover:bg-white hover:text-illini-orange'
          }`}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={18} className={isFavorited ? 'fill-current' : ''} />
        </button>
      )}
    </div>
  );
};

export default ListingCard;

