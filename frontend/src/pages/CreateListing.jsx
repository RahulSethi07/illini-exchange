import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI, exchangePointsAPI } from '../services/api';
import { 
  ImagePlus, X, MapPin, DollarSign, Tag, 
  FileText, CheckCircle, AlertCircle, Loader 
} from 'lucide-react';

const CreateListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [exchangePoints, setExchangePoints] = useState([]);
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [showErrors, setShowErrors] = useState(false);
  const errorRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition_status: '',
    exchange_point_id: ''
  });

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

  useEffect(() => {
    fetchExchangePoints();
  }, []);

  const fetchExchangePoints = async () => {
    try {
      const response = await exchangePointsAPI.getAll();
      setExchangePoints(response.data);
    } catch (error) {
      console.error('Error fetching exchange points:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setImages(prev => [...prev, ...files]);
    setError('');
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (images.length === 0) return 'At least one photo is required';
    if (!formData.title.trim()) return 'Title is required';
    if (formData.title.length < 3) return 'Title must be at least 3 characters';
    if (!formData.description.trim()) return 'Description is required';
    if (formData.description.length < 10) return 'Description must be at least 10 characters';
    if (!formData.price || parseFloat(formData.price) <= 0) return 'Valid price is required';
    if (!formData.category) return 'Category is required';
    if (!formData.condition_status) return 'Condition is required';
    if (!formData.exchange_point_id) return 'Exchange point is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowErrors(true);
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      // Scroll to error message
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        images: images
      };

      await listingsAPI.create(data);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      // Handle validation errors from backend
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map(err => err.msg || err.message).join(', ');
        setError(errorMessages || 'Validation failed');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError(error.message || 'Failed to create listing');
      }
      
      // Scroll to error message
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-cloud flex items-center justify-center px-4">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-illini-blue mb-2">Listing Created!</h2>
          <p className="text-gray-600 mb-4">Your item is now live on the marketplace.</p>
          <p className="text-sm text-gray-500">Redirecting to your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cloud py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-illini-blue mb-2">
            Create New Listing
          </h1>
          <p className="text-gray-600">
            Fill out the details below to list your item on Illini Exchange
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Error message */}
          {error && (
            <div 
              ref={errorRef}
              className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-slide-down"
            >
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Images */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-illini-blue mb-4 flex items-center gap-2">
              <ImagePlus size={20} />
              Photos <span className="text-red-500">*</span>
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Add at least one photo (up to 5). The first photo will be your cover image.
            </p>
            {showErrors && images.length === 0 && (
              <p className="text-sm text-red-500 mb-2">At least one photo is required</p>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-illini-orange text-white text-xs px-2 py-0.5 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}
              
              {images.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-illini-orange hover:bg-illini-orange/5 transition-colors">
                  <ImagePlus className="text-gray-400 mb-1" size={24} />
                  <span className="text-xs text-gray-500">Add Photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    multiple
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-illini-blue mb-4 flex items-center gap-2">
              <FileText size={20} />
              Details
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Calculus Textbook - Stewart 8th Edition"
                  className="input-field"
                  maxLength={100}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">{formData.title.length}/100 characters</p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your item in detail. Include any defects, accessories, or important information..."
                  className="input-field min-h-[120px] resize-none"
                  maxLength={2000}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">{formData.description.length}/2000 characters</p>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-illini-blue mb-4 flex items-center gap-2">
              <DollarSign size={20} />
              Price <span className="text-red-500">*</span>
            </h2>

            <div className="relative max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                className="input-field pl-10 text-2xl font-semibold"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-illini-blue mb-4 flex items-center gap-2">
              <Tag size={20} />
              Category <span className="text-red-500">*</span>
            </h2>

            {showErrors && !formData.category && (
              <p className="text-sm text-red-500 mb-2">Please select a category</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    formData.category === cat.id
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
          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-illini-blue mb-4">
              Condition <span className="text-red-500">*</span>
            </h2>

            {showErrors && !formData.condition_status && (
              <p className="text-sm text-red-500 mb-2">Please select a condition</p>
            )}
            <div className="space-y-2">
              {conditions.map((cond) => (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, condition_status: cond.id }))}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    formData.condition_status === cond.id
                      ? 'border-illini-orange bg-illini-orange/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-illini-blue">{cond.name}</span>
                      <p className="text-sm text-gray-500 mt-0.5">{cond.desc}</p>
                    </div>
                    {formData.condition_status === cond.id && (
                      <CheckCircle className="text-illini-orange" size={20} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Exchange Point */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-illini-blue mb-2 flex items-center gap-2">
              <MapPin size={20} />
              Preferred Exchange Point <span className="text-red-500">*</span>
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Choose a safe location where you'd like to meet buyers
            </p>

            <select
              name="exchange_point_id"
              value={formData.exchange_point_id}
              onChange={handleInputChange}
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

            {formData.exchange_point_id && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  {exchangePoints.find(p => p.id === formData.exchange_point_id)?.description}
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Creating...
                </>
              ) : (
                'Create Listing'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;

