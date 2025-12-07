const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const addFavoritesTable = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'illini_exchange'
  });

  console.log('🔧 Adding favorites table...\n');

  try {
    // Check if table already exists
    const [tables] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = 'favorites'
    `, [process.env.DB_NAME || 'illini_exchange']);

    if (tables[0].count > 0) {
      console.log('ℹ️  Favorites table already exists');
      await connection.end();
      return;
    }

    // Create favorites table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        listing_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_listing (user_id, listing_id),
        INDEX idx_user_id (user_id),
        INDEX idx_listing_id (listing_id)
      )
    `);
    console.log('✅ Favorites table created successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
};

addFavoritesTable();

