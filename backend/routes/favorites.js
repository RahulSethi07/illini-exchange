const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

// Get user's favorites
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [favorites] = await pool.query(`
      SELECT l.*, u.name as seller_name, u.net_id as seller_net_id, u.profile_picture as seller_picture,
             ep.name as exchange_point_name, ep.location as exchange_point_location,
             f.created_at as favorited_at
      FROM favorites f
      JOIN listings l ON f.listing_id = l.id
      JOIN users u ON l.seller_id = u.id
      LEFT JOIN exchange_points ep ON l.exchange_point_id = ep.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [req.user.id]);

    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Check if listing is favorited
router.get('/check/:listingId', authenticateToken, async (req, res) => {
  try {
    const [favorites] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND listing_id = ?',
      [req.user.id, req.params.listingId]
    );

    res.json({ isFavorited: favorites.length > 0 });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

// Add to favorites
router.post('/:listingId', authenticateToken, async (req, res) => {
  try {
    // Check if listing exists
    const [listings] = await pool.query('SELECT id FROM listings WHERE id = ?', [req.params.listingId]);
    if (listings.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check if already favorited
    const [existing] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND listing_id = ?',
      [req.user.id, req.params.listingId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Listing already in favorites' });
    }

    // Add to favorites
    const favoriteId = uuidv4();
    await pool.query(
      'INSERT INTO favorites (id, user_id, listing_id, created_at) VALUES (?, ?, ?, NOW())',
      [favoriteId, req.user.id, req.params.listingId]
    );

    res.status(201).json({ message: 'Added to favorites', id: favoriteId });
  } catch (error) {
    console.error('Error adding favorite:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Listing already in favorites' });
    }
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove from favorites
router.delete('/:listingId', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM favorites WHERE user_id = ? AND listing_id = ?',
      [req.user.id, req.params.listingId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

module.exports = router;

