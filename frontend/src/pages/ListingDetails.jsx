import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { listingsAPI, favoritesAPI, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, MapPin, Clock, Eye, Mail, Shield, 
  ChevronLeft, ChevronRight, AlertTriangle, Copy, Check, Heart 
} from 'lucide-react';

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copiedItem, setCopiedItem] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && listing?.id) {
      checkFavoriteStatus();
    }
  }, [isAuthenticated, listing?.id]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoritesAPI.check(listing.id);
      setIsFavorited(response.data.isFavorited);
    } catch (error) {
      // Silently fail
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated || !listing) return;
    
    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        await favoritesAPI.remove(listing.id);
        setIsFavorited(false);
      } else {
        await favoritesAPI.add(listing.id);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const fetchListing = async () => {
    try {
      const response = await listingsAPI.getOne(id);
      setListing(response.data);
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmailSubject = () => {
    return `Interested in your "${listing.title}" on Illini Exchange`;
  };

  const getEmailBody = () => {
    return `Hi ${listing.seller_name},\n\n` +
      `I'm interested in your listing "${listing.title}" priced at $${listing.price}.\n\n` +
      `I'd like to meet at ${listing.exchange_point_name || 'a safe exchange point'} to complete the transaction.\n\n` +
      `Please let me know if it's still available!\n\n` +
      `Thanks,\n${user?.name || 'A fellow Illini'}`;
  };

  const copyToClipboard = async (text, item) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cloud">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-cloud flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">😕</span>
          </div>
          <h2 className="text-2xl font-bold text-illini-blue mb-2">Listing Not Found</h2>
          <p className="text-gray-600 mb-6">This listing may have been removed or doesn't exist.</p>
          <Link to="/marketplace" className="btn-primary">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOwner = user?.id === listing.seller_id;

  return (
    <div className="min-h-screen bg-cloud">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-illini-blue transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Back to listings
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-xl overflow-hidden shadow-card">
              {listing.status !== 'active' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <span className="px-6 py-3 bg-white rounded-full font-semibold text-lg">
                    {listing.status === 'sold' ? '🎉 Sold' : 
                     listing.status === 'reserved' ? '⏳ Reserved' : 'Unavailable'}
                  </span>
                </div>
              )}
              
              {images.length > 0 ? (
                <>
                  <img
                    src={getImageUrl(images[currentImageIndex])}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                      >
                        <ChevronRight size={24} />
                      </button>
                      
                      {/* Image indicators */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2.5 h-2.5 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-illini-orange' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-8xl">{categoryIcons[listing.category] || '📦'}</span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-illini-orange' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${listing.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Listing Info */}
          <div className="space-y-6">
            {/* Price and badges */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-4xl font-bold text-illini-orange">
                  ${parseFloat(listing.price).toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2">
                <span className={`badge ${conditionColors[listing.condition_status]}`}>
                  {conditionLabels[listing.condition_status]}
                </span>
                <span className="badge bg-gray-100 text-gray-700">
                  {categoryIcons[listing.category]} {listing.category}
                </span>
              </div>
            </div>

            {/* Title and Favorite */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-illini-blue flex-1">
                {listing.title}
              </h1>
              {isAuthenticated && !isOwner && (
                <button
                  onClick={handleFavoriteToggle}
                  disabled={favoriteLoading}
                  className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                    isFavorited
                      ? 'bg-illini-orange text-white shadow-md'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-illini-orange'
                  }`}
                  title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart size={24} className={isFavorited ? 'fill-current' : ''} />
                </button>
              )}
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={16} />
                Listed {formatDate(listing.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={16} />
                {listing.views} views
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-illini-blue mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Exchange Point */}
            {listing.exchange_point_name && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-green-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">Safe Exchange Point</h3>
                    <p className="text-green-700 font-medium">{listing.exchange_point_name}</p>
                    {listing.exchange_point_location && (
                      <p className="text-sm text-green-600 mt-1">{listing.exchange_point_location}</p>
                    )}
                    {listing.exchange_point_description && (
                      <p className="text-sm text-green-600 mt-1">{listing.exchange_point_description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Seller Info */}
            <div className="bg-white rounded-xl p-4 shadow-card">
              <div className="flex items-center gap-4">
                {listing.seller_picture ? (
                  <img
                    src={getImageUrl(listing.seller_picture)}
                    alt={listing.seller_name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-illini-orange"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-illini-blue flex items-center justify-center">
                    <span className="text-white font-semibold text-xl">
                      {listing.seller_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-illini-blue">{listing.seller_name}</h3>
                    {listing.seller_verified && (
                      <Shield className="text-green-500" size={16} />
                    )}
                  </div>
                  {/* <p className="text-sm text-gray-500">@{listing.seller_net_id}</p> */}
                </div>
              </div>
            </div>

            {/* Contact Seller Section */}
            {!isOwner && listing.status === 'active' && (
              <div className="bg-gradient-to-br from-illini-blue/5 to-illini-orange/5 border-2 border-illini-blue/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-illini-orange/10 rounded-xl flex items-center justify-center">
                    <Mail className="text-illini-orange" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-illini-blue text-lg">Contact Seller</h3>
                    <p className="text-sm text-gray-600">Copy the information below to email the seller</p>
                  </div>
                </div>

                {!isAuthenticated ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800 mb-3">
                      Please <Link to="/login" state={{ from: { pathname: `/listing/${id}` } }} className="font-semibold underline">sign in</Link> to view seller contact information.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Email Address */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">To (Email Address)</label>
                        <button
                          onClick={() => copyToClipboard(listing.seller_email, 'email')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-illini-orange hover:bg-illini-orange/10 rounded-lg transition-colors"
                        >
                          {copiedItem === 'email' ? (
                            <>
                              <Check size={16} />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-illini-blue break-all">
                        {listing.seller_email}
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Subject</label>
                        <button
                          onClick={() => copyToClipboard(getEmailSubject(), 'subject')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-illini-orange hover:bg-illini-orange/10 rounded-lg transition-colors"
                        >
                          {copiedItem === 'subject' ? (
                            <>
                              <Check size={16} />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                        {getEmailSubject()}
                      </div>
                    </div>

                    {/* Email Body */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Email Body</label>
                        <button
                          onClick={() => copyToClipboard(getEmailBody(), 'body')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-illini-orange hover:bg-illini-orange/10 rounded-lg transition-colors"
                        >
                          {copiedItem === 'body' ? (
                            <>
                              <Check size={16} />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              <span>Copy All</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line font-sans">
                        {getEmailBody()}
                      </div>
                    </div>

                    {/* Helper Text */}
                    <div className="flex items-start gap-2 text-xs text-gray-500 bg-white/50 rounded-lg p-3">
                      <Mail size={16} className="flex-shrink-0 mt-0.5 text-illini-orange" />
                      <p>
                        Copy the email address, subject, and body above. Then open your email client 
                        (Gmail, Outlook, etc.) and paste them to send your message to the seller.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Owner Actions */}
            {isOwner && (
              <Link
                to="/profile"
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                Manage Listing
              </Link>
            )}

            {/* Unavailable Status */}
            {!isOwner && listing.status !== 'active' && (
              <button disabled className="btn-secondary w-full opacity-50 cursor-not-allowed">
                {listing.status === 'sold' ? 'This item has been sold' : 'This item is unavailable'}
              </button>
            )}

            {/* Safety Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800 mb-1">Safety Reminder</p>
                  <p className="text-yellow-700">
                    Always meet at a designated Safe Exchange Point on campus. Never share personal 
                    financial information. If something seems off, trust your instincts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;

