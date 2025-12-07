const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/listings');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
  }
});

// Get all listings with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      category, 
      condition, 
      min_price, 
      max_price, 
      exchange_point,
      search,
      sort = 'newest',
      page = 1,
      limit = 12 
    } = req.query;

    let query = `
      SELECT l.*, u.name as seller_name, u.net_id as seller_net_id, u.profile_picture as seller_picture,
             ep.name as exchange_point_name, ep.location as exchange_point_location
      FROM listings l
      JOIN users u ON l.seller_id = u.id
      LEFT JOIN exchange_points ep ON l.exchange_point_id = ep.id
      WHERE l.status = 'active'
    `;
    const params = [];

    if (category) {
      query += ' AND l.category = ?';
      params.push(category);
    }

    if (condition) {
      // Handle multiple conditions (comma-separated)
      const conditions = condition.split(',').filter(Boolean);
      if (conditions.length > 0) {
        query += ` AND l.condition_status IN (${conditions.map(() => '?').join(',')})`;
        params.push(...conditions);
      }
    }

    if (min_price) {
      query += ' AND l.price >= ?';
      params.push(parseFloat(min_price));
    }

    if (max_price) {
      query += ' AND l.price <= ?';
      params.push(parseFloat(max_price));
    }

    if (exchange_point) {
      // Handle multiple exchange points (comma-separated)
      const exchangePoints = exchange_point.split(',').filter(Boolean);
      if (exchangePoints.length > 0) {
        query += ` AND l.exchange_point_id IN (${exchangePoints.map(() => '?').join(',')})`;
        params.push(...exchangePoints);
      }
    }

    if (search) {
      query += ' AND (l.title LIKE ? OR l.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Sorting
    switch (sort) {
      case 'price_low':
        query += ' ORDER BY l.price ASC';
        break;
      case 'price_high':
        query += ' ORDER BY l.price DESC';
        break;
      case 'oldest':
        query += ' ORDER BY l.created_at ASC';
        break;
      default:
        query += ' ORDER BY l.created_at DESC';
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [listings] = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total FROM listings l
      WHERE l.status = 'active'
    `;
    const countParams = [];

    if (category) {
      countQuery += ' AND l.category = ?';
      countParams.push(category);
    }
    if (condition) {
      countQuery += ' AND l.condition_status = ?';
      countParams.push(condition);
    }
    if (min_price) {
      countQuery += ' AND l.price >= ?';
      countParams.push(parseFloat(min_price));
    }
    if (max_price) {
      countQuery += ' AND l.price <= ?';
      countParams.push(parseFloat(max_price));
    }
    if (exchange_point) {
      countQuery += ' AND l.exchange_point_id = ?';
      countParams.push(exchange_point);
    }
    if (search) {
      countQuery += ' AND (l.title LIKE ? OR l.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get single listing
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [listings] = await pool.query(`
      SELECT l.*, u.name as seller_name, u.email as seller_email, u.net_id as seller_net_id, 
             u.profile_picture as seller_picture, u.is_verified as seller_verified,
             ep.name as exchange_point_name, ep.location as exchange_point_location,
             ep.description as exchange_point_description
      FROM listings l
      JOIN users u ON l.seller_id = u.id
      LEFT JOIN exchange_points ep ON l.exchange_point_id = ep.id
      WHERE l.id = ?
    `, [req.params.id]);

    if (listings.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Increment view count
    await pool.query('UPDATE listings SET views = views + 1 WHERE id = ?', [req.params.id]);

    res.json(listings[0]);
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// Create new listing
router.post('/', authenticateToken, upload.array('images', 5), [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
  body('category').notEmpty().withMessage('Category is required'),
  body('condition_status').isIn(['new', 'like_new', 'good', 'fair', 'poor']).withMessage('Invalid condition'),
  body('exchange_point_id').trim().notEmpty().withMessage('Exchange point is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, price, category, condition_status, exchange_point_id } = req.body;

  try {
    // Validate at least one image is provided
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        errors: [{ 
          type: 'field',
          value: '',
          msg: 'At least one image is required',
          path: 'images',
          location: 'body'
        }]
      });
    }

    // Validate exchange_point_id exists
    const [exchangePoints] = await pool.query(
      'SELECT id FROM exchange_points WHERE id = ? AND is_active = true',
      [exchange_point_id]
    );
    if (exchangePoints.length === 0) {
      return res.status(400).json({ 
        errors: [{ 
          type: 'field',
          value: exchange_point_id,
          msg: 'Invalid exchange point',
          path: 'exchange_point_id',
          location: 'body'
        }]
      });
    }

    const listingId = uuidv4();
    const images = req.files.map(f => `/uploads/listings/${f.filename}`);

    await pool.query(`
      INSERT INTO listings (id, seller_id, title, description, price, category, condition_status, 
                           exchange_point_id, images, status, views, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, NOW(), NOW())
    `, [listingId, req.user.id, title, description, parseFloat(price), category, condition_status, 
        exchange_point_id, JSON.stringify(images)]);

    const [newListing] = await pool.query('SELECT * FROM listings WHERE id = ?', [listingId]);
    res.status(201).json(newListing[0]);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Update listing
router.put('/:id', authenticateToken, upload.array('images', 5), [
  body('title').optional().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional().notEmpty(),
  body('condition_status').optional().isIn(['new', 'like_new', 'good', 'fair', 'poor']),
  body('status').optional().isIn(['active', 'sold', 'reserved', 'inactive'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check ownership
    const [listings] = await pool.query('SELECT * FROM listings WHERE id = ? AND seller_id = ?', 
      [req.params.id, req.user.id]);
    
    if (listings.length === 0) {
      return res.status(404).json({ error: 'Listing not found or unauthorized' });
    }

    const { title, description, price, category, condition_status, exchange_point_id, status } = req.body;
    const updates = [];
    const params = [];

    if (title) { updates.push('title = ?'); params.push(title); }
    if (description) { updates.push('description = ?'); params.push(description); }
    if (price !== undefined) { updates.push('price = ?'); params.push(parseFloat(price)); }
    if (category) { updates.push('category = ?'); params.push(category); }
    if (condition_status) { updates.push('condition_status = ?'); params.push(condition_status); }
    if (exchange_point_id) { updates.push('exchange_point_id = ?'); params.push(exchange_point_id); }
    if (status) { updates.push('status = ?'); params.push(status); }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => `/uploads/listings/${f.filename}`);
      const existingImages = JSON.parse(listings[0].images || '[]');
      updates.push('images = ?');
      params.push(JSON.stringify([...existingImages, ...newImages]));
    }

    updates.push('updated_at = NOW()');
    params.push(req.params.id);

    await pool.query(`UPDATE listings SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updatedListing] = await pool.query('SELECT * FROM listings WHERE id = ?', [req.params.id]);
    res.json(updatedListing[0]);
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// Delete listing
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [listings] = await pool.query('SELECT * FROM listings WHERE id = ? AND seller_id = ?', 
      [req.params.id, req.user.id]);
    
    if (listings.length === 0) {
      return res.status(404).json({ error: 'Listing not found or unauthorized' });
    }

    await pool.query('DELETE FROM listings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// Get categories
router.get('/meta/categories', async (req, res) => {
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
  res.json(categories);
});

module.exports = router;

