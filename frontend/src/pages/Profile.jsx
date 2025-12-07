import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI, listingsAPI } from '../services/api';
import ListingCard from '../components/ListingCard';
import { 
  User, Mail, Calendar, Shield, Plus, Edit2, 
  Package, Eye, CheckCircle, Clock, XCircle, Trash2 
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [editingListing, setEditingListing] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchListings();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [activeTab]);

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

  const handleStatusChange = async (listingId, newStatus) => {
    try {
      await listingsAPI.update(listingId, { status: newStatus });
      fetchListings();
      setEditingListing(null);
    } catch (error) {
      console.error('Error updating listing:', error);
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
                  src={user.profile_picture}
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
                
                {/* Quick Actions Overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-xl font-semibold text-illini-blue mb-4">
              Update Listing Status
            </h3>
            <p className="text-gray-600 mb-6">
              Change the status of "{editingListing.title}"
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleStatusChange(editingListing.id, 'active')}
                className={`w-full p-3 rounded-lg border-2 text-left flex items-center gap-3 transition-colors ${
                  editingListing.status === 'active'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CheckCircle className="text-green-500" size={20} />
                <div>
                  <div className="font-medium">Active</div>
                  <div className="text-sm text-gray-500">Visible to buyers</div>
                </div>
              </button>

              <button
                onClick={() => handleStatusChange(editingListing.id, 'reserved')}
                className={`w-full p-3 rounded-lg border-2 text-left flex items-center gap-3 transition-colors ${
                  editingListing.status === 'reserved'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Clock className="text-yellow-500" size={20} />
                <div>
                  <div className="font-medium">Reserved</div>
                  <div className="text-sm text-gray-500">Pending sale</div>
                </div>
              </button>

              <button
                onClick={() => handleStatusChange(editingListing.id, 'sold')}
                className={`w-full p-3 rounded-lg border-2 text-left flex items-center gap-3 transition-colors ${
                  editingListing.status === 'sold'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Package className="text-blue-500" size={20} />
                <div>
                  <div className="font-medium">Sold</div>
                  <div className="text-sm text-gray-500">Transaction complete</div>
                </div>
              </button>

              <button
                onClick={() => handleStatusChange(editingListing.id, 'inactive')}
                className={`w-full p-3 rounded-lg border-2 text-left flex items-center gap-3 transition-colors ${
                  editingListing.status === 'inactive'
                    ? 'border-gray-500 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <XCircle className="text-gray-500" size={20} />
                <div>
                  <div className="font-medium">Inactive</div>
                  <div className="text-sm text-gray-500">Hidden from marketplace</div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setEditingListing(null)}
              className="w-full mt-6 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
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

