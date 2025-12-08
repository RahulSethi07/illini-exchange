import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI, listingsAPI, exchangePointsAPI, getImageUrl } from '../services/api';
import ListingCard from '../components/ListingCard';
import { 
  User, Mail, Calendar, Shield, Plus, Edit2, 
  Package, Eye, CheckCircle, Clock, XCircle, Trash2,
  ImagePlus, X, MapPin, DollarSign, Tag, FileText, AlertCircle, Loader
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [editingListing, setEditingListing] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [exchangePoints, setExchangePoints] = useState([]);
  const [editFormData, setEditFormData] = useState({});
  const [editImages, setEditImages] = useState([]);
  const [editPreviewUrls, setEditPreviewUrls] = useState([]);
  const [editExistingImages, setEditExistingImages] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchListings();
    fetchExchangePoints();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [activeTab]);

  useEffect(() => {
    if (editingListing) {
      const images = typeof editingListing.images === 'string' 
        ? JSON.parse(editingListing.images || '[]') 
        : editingListing.images || [];
      
      setEditFormData({
        title: editingListing.title || '',
        description: editingListing.description || '',
        price: editingListing.price || '',
        category: editingListing.category || '',
        condition_status: editingListing.condition_status || '',
        exchange_point_id: editingListing.exchange_point_id || '',
        status: editingListing.status || 'active'
      });
      setEditExistingImages(images);
      setEditImages([]);
      setEditPreviewUrls([]);
      setEditError('');
    }
  }, [editingListing]);

  const fetchProfile = async () => {
    try {
      const response = await usersAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const status = activeTab === 'all' ? '' : activeTab;
      const response = await usersAPI.getMyListings(status);
      setListings(response.data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangePoints = async () => {
    try {
      const response = await exchangePointsAPI.getAll();
      setExchangePoints(response.data);
    } catch (error) {
      console.error('Error fetching exchange points:', error);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    setEditError('');
  };

  const handleEditImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = editExistingImages.length + editImages.length + files.length;
    
    if (totalImages > 5) {
      setEditError('Maximum 5 images allowed');
      return;
    }

    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setEditPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setEditImages(prev => [...prev, ...files]);
    setEditError('');
  };

  const removeEditImage = (index, isExisting = false) => {
    if (isExisting) {
      setEditExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      URL.revokeObjectURL(editPreviewUrls[index]);
      setEditPreviewUrls(prev => prev.filter((_, i) => i !== index));
      setEditImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');

    try {
      const data = {
        ...editFormData,
        images: editImages.length > 0 ? editImages : undefined
      };

      await listingsAPI.update(editingListing.id, data);
      await fetchListings();
      setEditingListing(null);
    } catch (error) {
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map(err => err.msg || err.message).join(', ');
        setEditError(errorMessages || 'Validation failed');
      } else if (error.response?.data?.error) {
        setEditError(error.response.data.error);
      } else {
        setEditError(error.message || 'Failed to update listing');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (listingId) => {
    try {
      await listingsAPI.delete(listingId);
      fetchListings();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const tabs = [
    { id: 'active', label: 'Active', icon: CheckCircle },
    { id: 'reserved', label: 'Reserved', icon: Clock },
    { id: 'sold', label: 'Sold', icon: Package },
    { id: 'all', label: 'All', icon: Eye }
  ];

  const categories = [
    { id: 'textbooks', name: 'Textbooks', icon: '📚' },
    { id: 'electronics', name: 'Electronics', icon: '💻' },
    { id: 'furniture', name: 'Furniture', icon: '🪑' },
    { id: 'clothing', name: 'Clothing', icon: '👕' },
    { id: 'sports', name: 'Sports & Outdoors', icon: '⚽' },
    { id: 'tickets', name: 'Tickets & Events', icon: '🎟️' },
    { id: 'transportation', name: 'Transportation', icon: '🚲' },
    { id: 'housing', name: 'Housing & Sublease', icon: '🏠' },
    { id: 'services', name: 'Services', icon: '🔧' },
    { id: 'other', name: 'Other', icon: '📦' }
  ];

  const conditions = [
    { id: 'new', name: 'New', desc: 'Never used, still in original packaging' },
    { id: 'like_new', name: 'Like New', desc: 'Used very lightly, no visible wear' },
    { id: 'good', name: 'Good', desc: 'Some signs of use, fully functional' },
    { id: 'fair', name: 'Fair', desc: 'Noticeable wear, still works properly' },
    { id: 'poor', name: 'Poor', desc: 'Heavy wear, may have cosmetic issues' }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-cloud">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-illini-blue to-illini-blue-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              {user?.profile_picture ? (
                <img
                  src={getImageUrl(user.profile_picture)}
                  alt={user.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-illini-orange flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-white font-display font-bold text-4xl">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {profile?.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Shield className="text-white" size={16} />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                {user?.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-300">
                <span className="flex items-center gap-1">
                  <Mail size={16} />
                  @{user?.net_id}
                </span>
                {profile?.created_at && (
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    Joined {formatDate(profile.created_at)}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
                <div className="text-3xl font-bold text-white">{profile?.total_listings || 0}</div>
                <div className="text-sm text-gray-300">Total Listings</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
                <div className="text-3xl font-bold text-illini-orange">{profile?.active_listings || 0}</div>
                <div className="text-sm text-gray-300">Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-xl font-semibold text-illini-blue">My Listings</h2>
          <Link to="/create-listing" className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Create New Listing
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-illini-orange text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-[4/3] bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="relative group">
                <ListingCard listing={listing} />
                
                {/* Quick Actions Overlay - positioned to the left of favorite button */}
                <div className="absolute top-2 right-14 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setEditingListing(listing);
                      }}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} className="text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowDeleteConfirm(listing.id);
                      }}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-card">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No {activeTab !== 'all' ? activeTab : ''} listings
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'active' 
                ? "You don't have any active listings. Start selling today!"
                : `You don't have any ${activeTab} listings.`}
            </p>
            {activeTab === 'active' && (
              <Link to="/create-listing" className="btn-primary">
                Create Your First Listing
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Edit Listing Modal */}
      {editingListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 my-8 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-illini-blue">
                Edit Listing
            </h3>
              <button
                onClick={() => setEditingListing(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {editError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-700">{editError}</p>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Images */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-illini-blue mb-4 flex items-center gap-2">
                  <ImagePlus size={20} />
                  Photos
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Existing images (click X to remove). Add new images below.
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {editExistingImages.map((imagePath, index) => (
                    <div key={index} className="relative aspect-square group">
                      <img
                        src={getImageUrl(imagePath)}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeEditImage(index, true)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {editPreviewUrls.map((url, index) => (
                    <div key={`new-${index}`} className="relative aspect-square group">
                      <img
                        src={url}
                        alt={`New ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeEditImage(index, false)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {(editExistingImages.length + editImages.length) < 5 && (
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-illini-orange hover:bg-illini-orange/5 transition-colors">
                      <ImagePlus className="text-gray-400 mb-1" size={24} />
                      <span className="text-xs text-gray-500">Add Photo</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleEditImageChange}
                        multiple
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditInputChange}
                  className="input-field"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  className="input-field min-h-[120px] resize-none"
                  maxLength={2000}
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="price"
                    value={editFormData.price}
                    onChange={handleEditInputChange}
                    className="input-field pl-10"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setEditFormData(prev => ({ ...prev, category: cat.id }))}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        editFormData.category === cat.id
                          ? 'border-illini-orange bg-illini-orange/10 text-illini-orange'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{cat.icon}</span>
                      <span className="text-xs font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {conditions.map((cond) => (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => setEditFormData(prev => ({ ...prev, condition_status: cond.id }))}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        editFormData.condition_status === cond.id
                          ? 'border-illini-orange bg-illini-orange/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                      <div className="flex items-center justify-between">
                <div>
                          <span className="font-medium text-illini-blue">{cond.name}</span>
                          <p className="text-sm text-gray-500 mt-0.5">{cond.desc}</p>
                        </div>
                        {editFormData.condition_status === cond.id && (
                          <CheckCircle className="text-illini-orange" size={20} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exchange Point */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exchange Point <span className="text-red-500">*</span>
                </label>
                <select
                  name="exchange_point_id"
                  value={editFormData.exchange_point_id}
                  onChange={handleEditInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select an exchange point</option>
                  {exchangePoints.map((point) => (
                    <option key={point.id} value={point.id}>
                      {point.name} - {point.zone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditFormData(prev => ({ ...prev, status: 'active' }))}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      editFormData.status === 'active'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CheckCircle className="text-green-500 mb-1" size={20} />
                    <div className="font-medium">Active</div>
                    <div className="text-xs text-gray-500">Visible to buyers</div>
              </button>
              <button
                    type="button"
                    onClick={() => setEditFormData(prev => ({ ...prev, status: 'reserved' }))}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      editFormData.status === 'reserved'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                    <Clock className="text-yellow-500 mb-1" size={20} />
                  <div className="font-medium">Reserved</div>
                    <div className="text-xs text-gray-500">Pending sale</div>
              </button>
              <button
                    type="button"
                    onClick={() => setEditFormData(prev => ({ ...prev, status: 'sold' }))}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      editFormData.status === 'sold'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                    <Package className="text-blue-500 mb-1" size={20} />
                  <div className="font-medium">Sold</div>
                    <div className="text-xs text-gray-500">Transaction complete</div>
              </button>
              <button
                    type="button"
                    onClick={() => setEditFormData(prev => ({ ...prev, status: 'inactive' }))}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      editFormData.status === 'inactive'
                    ? 'border-gray-500 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                    <XCircle className="text-gray-500 mb-1" size={20} />
                  <div className="font-medium">Inactive</div>
                    <div className="text-xs text-gray-500">Hidden</div>
                  </button>
                </div>
            </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
            <button
                  type="button"
              onClick={() => setEditingListing(null)}
                  className="btn-outline flex-1"
            >
              Cancel
            </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {editLoading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Updating...
                    </>
                  ) : (
                    'Update Listing'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 animate-scale-in">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-500" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-center text-illini-blue mb-2">
              Delete Listing?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              This action cannot be undone. Are you sure you want to delete this listing?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

