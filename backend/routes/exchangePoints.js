const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all exchange points
router.get('/', async (req, res) => {
  try {
    const [exchangePoints] = await pool.query(`
      SELECT * FROM exchange_points 
      WHERE is_active = true 
      ORDER BY name ASC
    `);
    res.json(exchangePoints);
  } catch (error) {
    console.error('Error fetching exchange points:', error);
    res.status(500).json({ error: 'Failed to fetch exchange points' });
  }
});

// Get exchange point by ID
router.get('/:id', async (req, res) => {
  try {
    const [exchangePoints] = await pool.query(
      'SELECT * FROM exchange_points WHERE id = ?',
      [req.params.id]
    );

    if (exchangePoints.length === 0) {
      return res.status(404).json({ error: 'Exchange point not found' });
    }

    // Get listings count at this exchange point
    const [listingsCount] = await pool.query(
      'SELECT COUNT(*) as count FROM listings WHERE exchange_point_id = ? AND status = "active"',
      [req.params.id]
    );

    res.json({
      ...exchangePoints[0],
      active_listings: listingsCount[0].count
    });
  } catch (error) {
    console.error('Error fetching exchange point:', error);
    res.status(500).json({ error: 'Failed to fetch exchange point' });
  }
});

// Get exchange points grouped by zone
router.get('/grouped/zones', async (req, res) => {
  try {
    const [exchangePoints] = await pool.query(`
      SELECT * FROM exchange_points 
      WHERE is_active = true 
      ORDER BY zone, name ASC
    `);

    // Group by zone
    const grouped = exchangePoints.reduce((acc, point) => {
      const zone = point.zone || 'Other';
      if (!acc[zone]) {
        acc[zone] = [];
      }
      acc[zone].push(point);
      return acc;
    }, {});

    res.json(grouped);
  } catch (error) {
    console.error('Error fetching exchange points:', error);
    res.status(500).json({ error: 'Failed to fetch exchange points' });
  }
});

module.exports = router;

