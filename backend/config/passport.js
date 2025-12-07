const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./database');
const { v4: uuidv4 } = require('uuid');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      
      // Verify it's an illinois.edu email (simulating NetID verification)
      if (!email.endsWith('@illinois.edu')) {
        return done(null, false, { message: 'Only @illinois.edu email addresses are allowed' });
      }

      // Check if user exists
      const [existingUsers] = await pool.query(
        'SELECT * FROM users WHERE google_id = ? OR email = ?',
        [profile.id, email]
      );

      if (existingUsers.length > 0) {
        // Update existing user
        await pool.query(
          'UPDATE users SET google_id = ?, name = ?, profile_picture = ?, updated_at = NOW() WHERE id = ?',
          [profile.id, profile.displayName, profile.photos[0]?.value, existingUsers[0].id]
        );
        return done(null, existingUsers[0]);
      }

      // Create new user
      const userId = uuidv4();
      const netId = email.split('@')[0];
      
      await pool.query(
        `INSERT INTO users (id, google_id, email, net_id, name, profile_picture, is_verified, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, true, NOW(), NOW())`,
        [userId, profile.id, email, netId, profile.displayName, profile.photos[0]?.value]
      );

      const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
      return done(null, newUser[0]);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, users[0]);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

