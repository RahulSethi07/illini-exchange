const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const [users] = await pool.query('SELECT id, email, name, net_id, profile_picture, is_verified FROM users WHERE id = ?', [decoded.userId]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const [users] = await pool.query('SELECT id, email, name, net_id, profile_picture, is_verified FROM users WHERE id = ?', [decoded.userId]);
    
    if (users.length > 0) {
      req.user = users[0];
    }
  } catch (error) {
    // Token invalid, but continue without auth
  }
  
  next();
};

module.exports = { authenticateToken, optionalAuth };

