const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profiles');
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
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT id, email, net_id, name, profile_picture, bio, is_verified, created_at 
      FROM users WHERE id = ?
    `, [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's listings count
    const [listingsCount] = await pool.query(
      'SELECT COUNT(*) as count FROM listings WHERE seller_id = ?',
      [req.user.id]
    );

    // Get user's active listings count
    const [activeListingsCount] = await pool.query(
      'SELECT COUNT(*) as count FROM listings WHERE seller_id = ? AND status = "active"',
      [req.user.id]
    );

    res.json({
      ...users[0],
      total_listings: listingsCount[0].count,
      active_listings: activeListingsCount[0].count
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get user's listings
router.get('/listings', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT l.*, ep.name as exchange_point_name 
      FROM listings l 
      LEFT JOIN exchange_points ep ON l.exchange_point_id = ep.id
      WHERE l.seller_id = ?
    `;
    const params = [req.user.id];

    if (status) {
      query += ' AND l.status = ?';
      params.push(status);
    }

    query += ' ORDER BY l.created_at DESC';

    const [listings] = await pool.query(query, params);
    res.json(listings);
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, upload.single('profile_picture'), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('bio').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, bio } = req.body;
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }

    if (bio !== undefined) {
      updates.push('bio = ?');
      params.push(bio);
    }

    if (req.file) {
      updates.push('profile_picture = ?');
      params.push(`/uploads/profiles/${req.file.filename}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    updates.push('updated_at = NOW()');
    params.push(req.user.id);

    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updatedUser] = await pool.query(
      'SELECT id, email, net_id, name, profile_picture, bio, is_verified FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get public user profile
router.get('/:id', async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT id, net_id, name, profile_picture, bio, is_verified, created_at 
      FROM users WHERE id = ?
    `, [req.params.id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's active listings
    const [listings] = await pool.query(`
      SELECT l.*, ep.name as exchange_point_name 
      FROM listings l 
      LEFT JOIN exchange_points ep ON l.exchange_point_id = ep.id
      WHERE l.seller_id = ? AND l.status = 'active'
      ORDER BY l.created_at DESC
      LIMIT 6
    `, [req.params.id]);

    res.json({
      ...users[0],
      listings
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;

