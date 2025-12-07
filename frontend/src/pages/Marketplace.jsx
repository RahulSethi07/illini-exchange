import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listingsAPI, exchangePointsAPI } from '../services/api';
import ListingCard from '../components/ListingCard';
import { 
  Search, Filter, X, ChevronDown, ChevronUp, 
  SlidersHorizontal, Grid, List, MapPin 
} from 'lucide-react';

const normalizePriceValue = (value) => {
  if (value === undefined || value === null) {
    return '';
  }

  const trimmedValue = value.toString().trim();
  if (trimmedValue === '') {
    return '';
  }

  const numericValue = parseFloat(trimmedValue);
  if (Number.isNaN(numericValue)) {
    return '';
  }

  return numericValue < 0 ? '0' : numericValue.toString();
};

const normalizePriceRange = (minValue, maxValue, changedKey = 'min_price') => {
  let normalizedMin = normalizePriceValue(minValue);
  let normalizedMax = normalizePriceValue(maxValue);

  if (normalizedMin && normalizedMax) {
    const minNum = parseFloat(normalizedMin);
    const maxNum = parseFloat(normalizedMax);

    if (minNum > maxNum) {
      if (changedKey === 'min_price') {
        normalizedMax = normalizedMin;
      } else {
        normalizedMin = normalizedMax;
      }
    }
  }

  return { min_price: normalizedMin, max_price: normalizedMax };
};

const FilterSection = memo(({ title, section, children, isExpanded, onToggle }) => (
  <div className="border-b border-gray-100 last:border-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-3 text-left font-medium text-illini-blue hover:text-illini-orange transition-colors"
    >
      {title}
      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
    </button>
    {isExpanded && (
      <div className="pb-4">
        {children}
      </div>
    )}
  </div>
));

const FiltersSidebar = memo(({ 
  filters, 
  expandedFilters, 
  localPriceFilters,
  categories,
  conditions,
  exchangePoints,
  activeFiltersCount,
  toggleFilterSection,
  updateFilters,
  toggleArrayFilter,
  handlePriceInputChange,
  clearFilters
}) => (
  <aside className="hidden lg:block w-64 flex-shrink-0">
    <div className="bg-white rounded-xl shadow-card p-5 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-illini-blue flex items-center gap-2">
          <Filter size={18} />
          Filters
        </h2>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-illini-orange hover:text-illini-orange-dark"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category Filter */}
      <FilterSection 
        title="Category" 
        section="category"
        isExpanded={expandedFilters.category}
        onToggle={() => toggleFilterSection('category')}
      >
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                filters.category === cat.id
                  ? 'bg-illini-orange/10 text-illini-orange'
                  : 'hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="category"
                value={cat.id}
                checked={filters.category === cat.id}
                onChange={(e) => updateFilters('category', e.target.value)}
                className="sr-only"
              />
              <span>{cat.icon}</span>
              <span className="text-sm">{cat.name}</span>
            </label>
          ))}
          {filters.category && (
            <button
              onClick={() => updateFilters('category', '')}
              className="text-sm text-gray-500 hover:text-illini-orange mt-2"
            >
              Clear category
            </button>
          )}
        </div>
      </FilterSection>

      {/* Price Range Filter */}
      <FilterSection 
        title="Price Range" 
        section="price"
        isExpanded={expandedFilters.price}
        onToggle={() => toggleFilterSection('price')}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Min Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="0"
                value={localPriceFilters.min_price}
                onChange={(e) => handlePriceInputChange('min_price', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-illini-orange/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Max Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="Any"
                value={localPriceFilters.max_price}
                onChange={(e) => handlePriceInputChange('max_price', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-illini-orange/50"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">Leave blank to show all prices.</p>
        </div>
      </FilterSection>

      {/* Condition Filter - Multi-select */}
      <FilterSection 
        title="Condition" 
        section="condition"
        isExpanded={expandedFilters.condition}
        onToggle={() => toggleFilterSection('condition')}
      >
        <div className="space-y-2">
          {conditions.map((cond) => (
            <label
              key={cond.id}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                filters.condition?.includes(cond.id)
                  ? 'bg-illini-orange/10 text-illini-orange'
                  : 'hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                name="condition"
                value={cond.id}
                checked={filters.condition?.includes(cond.id) || false}
                onChange={() => toggleArrayFilter('condition', cond.id)}
                className="w-4 h-4 text-illini-orange border-gray-300 rounded focus:ring-illini-orange"
              />
              <span className="text-sm">{cond.name}</span>
            </label>
          ))}
          {filters.condition?.length > 0 && (
            <button
              onClick={() => updateFilters('condition', [])}
              className="text-sm text-gray-500 hover:text-illini-orange mt-2"
            >
              Clear condition
            </button>
          )}
        </div>
      </FilterSection>

      {/* Exchange Point Filter - Multi-select */}
      <FilterSection 
        title="Exchange Location" 
        section="location"
        isExpanded={expandedFilters.location}
        onToggle={() => toggleFilterSection('location')}
      >
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {exchangePoints.map((point) => (
            <label
              key={point.id}
              className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                filters.exchange_point?.includes(point.id)
                  ? 'bg-illini-orange/10 text-illini-orange'
                  : 'hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                name="exchange_point"
                value={point.id}
                checked={filters.exchange_point?.includes(point.id) || false}
                onChange={() => toggleArrayFilter('exchange_point', point.id)}
                className="w-4 h-4 text-illini-orange border-gray-300 rounded focus:ring-illini-orange mt-0.5 flex-shrink-0"
              />
              <MapPin size={14} className="flex-shrink-0 mt-0.5" />
              <span className="text-sm">{point.name}</span>
            </label>
          ))}
          {filters.exchange_point?.length > 0 && (
            <button
              onClick={() => updateFilters('exchange_point', [])}
              className="text-sm text-gray-500 hover:text-illini-orange mt-2"
            >
              Clear location
            </button>
          )}
        </div>
      </FilterSection>
    </div>
  </aside>
), (prevProps, nextProps) => {
  const prevCondition = prevProps.filters.condition || [];
  const nextCondition = nextProps.filters.condition || [];
  const prevExchangePoint = prevProps.filters.exchange_point || [];
  const nextExchangePoint = nextProps.filters.exchange_point || [];
  
  return (
    prevProps.filters.category === nextProps.filters.category &&
    prevCondition.length === nextCondition.length &&
    prevCondition.every((val, idx) => val === nextCondition[idx]) &&
    prevExchangePoint.length === nextExchangePoint.length &&
    prevExchangePoint.every((val, idx) => val === nextExchangePoint[idx]) &&
    prevProps.filters.min_price === nextProps.filters.min_price &&
    prevProps.filters.max_price === nextProps.filters.max_price &&
    prevProps.localPriceFilters.min_price === nextProps.localPriceFilters.min_price &&
    prevProps.localPriceFilters.max_price === nextProps.localPriceFilters.max_price &&
    prevProps.expandedFilters.category === nextProps.expandedFilters.category &&
    prevProps.expandedFilters.price === nextProps.expandedFilters.price &&
    prevProps.expandedFilters.condition === nextProps.expandedFilters.condition &&
    prevProps.expandedFilters.location === nextProps.expandedFilters.location &&
    prevProps.activeFiltersCount === nextProps.activeFiltersCount &&
    prevProps.exchangePoints.length === nextProps.exchangePoints.length
  );
});

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [exchangePoints, setExchangePoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    category: true,
    price: true,
    condition: true,
    location: true
  });

  // Parse condition and exchange_point as arrays from URL
  const parseArrayParam = (param) => {
    const value = searchParams.get(param);
    return value ? value.split(',').filter(Boolean) : [];
  };

  // Filter state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    condition: parseArrayParam('condition'),
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    exchange_point: parseArrayParam('exchange_point'),
    sort: searchParams.get('sort') || 'newest'
  });

  // Local state for price inputs (to prevent re-render on every keystroke)
  const [localPriceFilters, setLocalPriceFilters] = useState({
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || ''
  });

  // Local state for search input (to prevent re-render on every keystroke)
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

  // Refs
  const searchInputRef = useRef(null);
  const lastChangedPriceFieldRef = useRef(null);
  const lastAppliedPriceRef = useRef({
    min_price: filters.min_price,
    max_price: filters.max_price
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
    { id: 'new', name: 'New' },
    { id: 'like_new', name: 'Like New' },
    { id: 'good', name: 'Good' },
    { id: 'fair', name: 'Fair' },
    { id: 'poor', name: 'Poor' }
  ];

  const sortOptions = [
    { id: 'newest', name: 'Newest First' },
    { id: 'oldest', name: 'Oldest First' },
    { id: 'price_low', name: 'Price: Low to High' },
    { id: 'price_high', name: 'Price: High to Low' }
  ];

  useEffect(() => {
    fetchExchangePoints();
    // Fetch listings on initial load
    fetchListings();
  }, []);

  // Track if we're currently typing in search to prevent unnecessary fetches
  const isTypingRef = useRef(false);
  const searchTimeoutRef = useRef(null);
  const lastSearchParamsStringRef = useRef('');
  const isInitialLoad = useRef(true);

  useEffect(() => {
    // Skip on initial load since we fetch in the other useEffect
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      lastSearchParamsStringRef.current = searchParams.toString();
      return;
    }

    // Convert searchParams to string for comparison
    const currentParamsString = searchParams.toString();
    
    // Skip if params haven't actually changed
    if (currentParamsString === lastSearchParamsStringRef.current) {
      return;
    }
    
    lastSearchParamsStringRef.current = currentParamsString;

    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't fetch if user is currently typing in search
    if (isTypingRef.current) {
      return;
    }

    // Small delay to batch rapid changes and prevent flicker
    searchTimeoutRef.current = setTimeout(() => {
      fetchListings();
    }, 150);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchParams]);

  // Sync local price filters with URL params
  useEffect(() => {
    setLocalPriceFilters({
      min_price: searchParams.get('min_price') || '',
      max_price: searchParams.get('max_price') || ''
    });
    lastChangedPriceFieldRef.current = null;
  }, [searchParams.get('min_price'), searchParams.get('max_price')]);

  // Sync local search with URL params only when input is not focused
  useEffect(() => {
    const searchFocused = document.activeElement === searchInputRef.current;
    
    if (!searchFocused) {
      setLocalSearch(searchParams.get('search') || '');
    }
  }, [searchParams.get('search')]);

  // Sync filter state with URL params (only for condition and exchange_point arrays)
  useEffect(() => {
    const conditionParam = parseArrayParam('condition');
    const exchangePointParam = parseArrayParam('exchange_point');
    
    setFilters(prev => ({
      ...prev,
      condition: conditionParam,
      exchange_point: exchangePointParam
    }));
  }, [searchParams.get('condition'), searchParams.get('exchange_point')]);

  const fetchExchangePoints = async () => {
    try {
      const response = await exchangePointsAPI.getAll();
      setExchangePoints(response.data);
    } catch (error) {
      console.error('Error fetching exchange points:', error);
    }
  };

  const fetchListings = async () => {
    // Only show loading for listings area, not filters
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams);
      const response = await listingsAPI.getAll(params);
      setListings(response.data.listings);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      // Use a small delay to prevent flicker
      setTimeout(() => {
        setLoading(false);
      }, 50);
    }
  };

  const updateFilters = useCallback((key, value) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, [key]: value };
      
      // Update URL params
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v) {
          // Handle arrays (condition, exchange_point)
          if (Array.isArray(v) && v.length > 0) {
            params.set(k, v.join(','));
          } else if (!Array.isArray(v) && v) {
            params.set(k, v);
          }
        }
      });
      setSearchParams(params);
      
      return newFilters;
    });
  }, [setSearchParams]);

  // Toggle array filter (for condition and exchange_point)
  const toggleArrayFilter = useCallback((key, value) => {
    setFilters(prevFilters => {
      const currentValues = prevFilters[key] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      const newFilters = { ...prevFilters, [key]: newValues };
      
      // Update URL params
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v) {
          // Handle arrays (condition, exchange_point)
          if (Array.isArray(v) && v.length > 0) {
            params.set(k, v.join(','));
          } else if (!Array.isArray(v) && v) {
            params.set(k, v);
          }
        }
      });
      setSearchParams(params);
      
      return newFilters;
    });
  }, [setSearchParams]);

  const applyPriceFilters = useCallback((priceValues) => {
    setFilters(prevFilters => {
      const updatedFilters = { 
        ...prevFilters, 
        min_price: priceValues.min_price,
        max_price: priceValues.max_price
      };

      const params = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([k, v]) => {
        if (v) {
          if (Array.isArray(v) && v.length > 0) {
            params.set(k, v.join(','));
          } else if (!Array.isArray(v) && v) {
            params.set(k, v);
          }
        }
      });
      setSearchParams(params);
      
      return updatedFilters;
    });
  }, [setSearchParams]);

  const handlePriceInputChange = useCallback((key, value) => {
    lastChangedPriceFieldRef.current = key;
    setLocalPriceFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      const normalized = normalizePriceRange(
        localPriceFilters.min_price,
        localPriceFilters.max_price,
        lastChangedPriceFieldRef.current || 'min_price'
      );

      if (
        normalized.min_price === lastAppliedPriceRef.current.min_price &&
        normalized.max_price === lastAppliedPriceRef.current.max_price
      ) {
        return;
      }

      lastAppliedPriceRef.current = normalized;
      applyPriceFilters(normalized);
    }, 250);

    return () => clearTimeout(handler);
  }, [localPriceFilters, applyPriceFilters]);

  useEffect(() => {
    lastAppliedPriceRef.current = {
      min_price: filters.min_price,
      max_price: filters.max_price
    };
  }, [filters.min_price, filters.max_price]);


  // Handle search input changes (local state only)
  const handleSearchChange = (value) => {
    isTypingRef.current = true;
    setLocalSearch(value);
  };

  // Apply search filter (called on Enter or blur)
  const applySearch = () => {
    isTypingRef.current = false;
    updateFilters('search', localSearch);
  };

  // Handle Enter key in search input
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      isTypingRef.current = false;
      e.target.blur(); // This will trigger onBlur which calls applySearch
    }
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    isTypingRef.current = true;
  };

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      condition: [],
      min_price: '',
      max_price: '',
      exchange_point: [],
      sort: 'newest'
    });
    setLocalPriceFilters({
      min_price: '',
      max_price: ''
    });
    lastChangedPriceFieldRef.current = null;
    lastAppliedPriceRef.current = { min_price: '', max_price: '' };
    setLocalSearch('');
    setSearchParams({});
  }, [setSearchParams]);

  const activeFiltersCount = useMemo(() => [
    filters.category,
    ...(Array.isArray(filters.condition) ? filters.condition : []),
    filters.min_price,
    filters.max_price,
    ...(Array.isArray(filters.exchange_point) ? filters.exchange_point : [])
  ].filter(Boolean).length, [filters.category, filters.condition, filters.min_price, filters.max_price, filters.exchange_point]);

  const toggleFilterSection = useCallback((section) => {
    setExpandedFilters(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  return (
    <div className="min-h-screen bg-cloud">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-illini-blue">
                Marketplace
              </h1>
              <p className="text-gray-600 mt-1">
                {pagination.total || 0} items available
              </p>
            </div>
            
            {/* Search bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={localSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={applySearch}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Search for items... (Press Enter to search)"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-illini-orange/50 focus:border-illini-orange transition-all"
                />
                {localSearch && (
                  <button
                    onClick={() => {
                      isTypingRef.current = false;
                      setLocalSearch('');
                      updateFilters('search', '');
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar - Desktop - Memoized to prevent re-renders */}
          <FiltersSidebar
            filters={filters}
            expandedFilters={expandedFilters}
            localPriceFilters={localPriceFilters}
            categories={categories}
            conditions={conditions}
            exchangePoints={exchangePoints}
            activeFiltersCount={activeFiltersCount}
            toggleFilterSection={toggleFilterSection}
            updateFilters={updateFilters}
            toggleArrayFilter={toggleArrayFilter}
            handlePriceInputChange={handlePriceInputChange}
            clearFilters={clearFilters}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Toggle & Sort */}
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <SlidersHorizontal size={18} />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-illini-orange text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden sm:block">Sort by:</span>
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilters('sort', e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-illini-orange/50"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden bg-white rounded-xl shadow-card p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X size={20} />
                  </button>
                </div>
                
                {/* Category */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilters('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Condition - Multi-select */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {conditions.map((cond) => (
                      <label
                        key={cond.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={cond.id}
                          checked={filters.condition?.includes(cond.id) || false}
                          onChange={() => toggleArrayFilter('condition', cond.id)}
                          className="w-4 h-4 text-illini-orange border-gray-300 rounded focus:ring-illini-orange"
                        />
                        <span className="text-sm">{cond.name}</span>
                      </label>
                    ))}
                  </div>
                  {filters.condition?.length > 0 && (
                    <button
                      onClick={() => updateFilters('condition', [])}
                      className="text-xs text-gray-500 hover:text-illini-orange mt-2"
                    >
                      Clear condition
                    </button>
                  )}
                </div>

                {/* Price Range */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Min</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="0"
                        value={localPriceFilters.min_price}
                        onChange={(e) => handlePriceInputChange('min_price', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-illini-orange/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Max</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="Any"
                        value={localPriceFilters.max_price}
                        onChange={(e) => handlePriceInputChange('max_price', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-illini-orange/50"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Leave blank to show all prices.</p>
                </div>

                {/* Exchange Point - Multi-select */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {exchangePoints.map((point) => (
                      <label
                        key={point.id}
                        className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={point.id}
                          checked={filters.exchange_point?.includes(point.id) || false}
                          onChange={() => toggleArrayFilter('exchange_point', point.id)}
                          className="w-4 h-4 text-illini-orange border-gray-300 rounded focus:ring-illini-orange mt-0.5 flex-shrink-0"
                        />
                        <div className="flex items-start gap-1.5">
                          <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{point.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {filters.exchange_point?.length > 0 && (
                    <button
                      onClick={() => updateFilters('exchange_point', [])}
                      className="text-xs text-gray-500 hover:text-illini-orange mt-2"
                    >
                      Clear location
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={clearFilters}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 btn-primary"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {/* Active Filters Tags */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-illini-orange/10 text-illini-orange rounded-full text-sm">
                    {categories.find(c => c.id === filters.category)?.name}
                    <button onClick={() => updateFilters('category', '')}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filters.condition?.map((condId) => (
                  <span key={condId} className="inline-flex items-center gap-1 px-3 py-1 bg-illini-blue/10 text-illini-blue rounded-full text-sm">
                    {conditions.find(c => c.id === condId)?.name}
                    <button onClick={() => toggleArrayFilter('condition', condId)}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
                {(filters.min_price || filters.max_price) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    ${filters.min_price || '0'} - ${filters.max_price || '∞'}
                    <button onClick={() => { 
                      updateFilters('min_price', ''); 
                      updateFilters('max_price', '');
                      setLocalPriceFilters({ min_price: '', max_price: '' });
                    }}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filters.exchange_point?.map((pointId) => (
                  <span key={pointId} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {exchangePoints.find(p => p.id === pointId)?.name}
                    <button onClick={() => toggleArrayFilter('exchange_point', pointId)}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Listings Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.set('page', i + 1);
                          setSearchParams(params);
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          pagination.page === i + 1
                            ? 'bg-illini-orange text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No listings found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
