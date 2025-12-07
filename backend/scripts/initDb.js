const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const initDatabase = async () => {
  // Connect without database to create it if needed
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  const dbName = process.env.DB_NAME || 'illini_exchange';

  console.log('🔧 Initializing Illini Exchange Database...\n');

  try {
    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await connection.query(`USE ${dbName}`);
    console.log(`✅ Database '${dbName}' ready`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        net_id VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255),
        profile_picture TEXT,
        bio TEXT,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_net_id (net_id)
      )
    `);
    console.log('✅ Users table ready');

    // Create exchange_points table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exchange_points (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(500) NOT NULL,
        description TEXT,
        zone VARCHAR(100),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_zone (zone)
      )
    `);
    console.log('✅ Exchange points table ready');

    // Create listings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id VARCHAR(36) PRIMARY KEY,
        seller_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        condition_status ENUM('new', 'like_new', 'good', 'fair', 'poor') NOT NULL,
        exchange_point_id VARCHAR(36),
        images JSON,
        status ENUM('active', 'sold', 'reserved', 'inactive') DEFAULT 'active',
        views INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (exchange_point_id) REFERENCES exchange_points(id) ON DELETE SET NULL,
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_price (price),
        INDEX idx_created (created_at)
      )
    `);
    console.log('✅ Listings table ready');

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
    console.log('✅ Favorites table ready');

    // Insert default exchange points (UIUC Safe Exchange Points)
    const exchangePoints = [
      ['ep-1', 'Illini Union - Main Lobby', '1401 W Green St, Urbana, IL', 'Central campus location with high foot traffic. Security present during business hours.', 'Central Campus', 40.1092, -88.2272],
      ['ep-2', 'Undergraduate Library (UGL)', '1402 W Gregory Dr, Urbana, IL', 'Open late hours. Well-lit and heavily monitored area.', 'Central Campus', 40.1047, -88.2289],
      ['ep-3', 'Grainger Engineering Library', '1301 W Springfield Ave, Urbana, IL', 'Engineering quad location. Ideal for textbook exchanges.', 'Engineering Campus', 40.1125, -88.2269],
      ['ep-4', 'SDRP (Student Dining & Residential Programs)', '301 E Gregory Dr, Champaign, IL', 'ISR area. Good for south campus residents.', 'South Campus', 40.1071, -88.2183],
      ['ep-5', 'Ikenberry Commons', '1101 W Peabody Dr, Urbana, IL', 'Six Pack dorms area. Great for freshmen exchanges.', 'Ikenberry', 40.1002, -88.2293],
      ['ep-6', 'FAR/PAR Commons', '1213 S Fourth St, Champaign, IL', 'Far south campus. Good for FAR/PAR residents.', 'South Campus', 40.0989, -88.2172],
      ['ep-7', 'Campus Recreation Center East (CRCE)', '1102 W Gregory Dr, Urbana, IL', 'Gym location. Popular evening meetup spot.', 'Central Campus', 40.1043, -88.2194],
      ['ep-8', 'Main Library', '1408 W Gregory Dr, Urbana, IL', 'Main quad location. Historic and safe meeting point.', 'Central Campus', 40.1047, -88.2289],
      ['ep-9', 'State Farm Center', '1800 S First St, Champaign, IL', 'South campus arena. Good for large item exchanges.', 'South Campus', 40.0966, -88.2358],
      ['ep-10', 'Green Street Coffee Shop Area', 'Green St, Champaign, IL', 'Multiple cafes available. Casual meetup spot.', 'Campustown', 40.1102, -88.2282]
    ];

    // Check if exchange points already exist
    const [existingPoints] = await connection.query('SELECT COUNT(*) as count FROM exchange_points');
    
    if (existingPoints[0].count === 0) {
      for (const point of exchangePoints) {
        await connection.query(
          'INSERT INTO exchange_points (id, name, location, description, zone, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
          point
        );
      }
      console.log('✅ Default exchange points inserted');
    } else {
      console.log('ℹ️  Exchange points already exist, skipping seed data');
    }

    // Insert demo user (for testing without OAuth)
    const [existingUsers] = await connection.query('SELECT COUNT(*) as count FROM users WHERE email = ?', ['demo@illinois.edu']);
    
    if (existingUsers[0].count === 0) {
      // Password is 'demo123' hashed with bcrypt
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('demo123', 10);
      
      await connection.query(`
        INSERT INTO users (id, email, net_id, name, password, is_verified, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, true, NOW(), NOW())
      `, ['demo-user-id', 'demo@illinois.edu', 'demo', 'Demo User', hashedPassword]);
      
      console.log('✅ Demo user created (email: demo@illinois.edu, password: demo123)');
    }

    // Insert sample listings for demo
    const [existingListings] = await connection.query('SELECT COUNT(*) as count FROM listings');
    
    if (existingListings[0].count === 0) {
      const sampleListings = [
        ['listing-1', 'demo-user-id', 'Calculus Textbook - Stewart 8th Edition', 'Barely used calculus textbook. Some highlighting but otherwise in great condition. Perfect for MATH 241.', 45.00, 'textbooks', 'like_new', 'ep-3'],
        ['listing-2', 'demo-user-id', 'Mini Fridge - Perfect for Dorms', 'Compact mini fridge, works perfectly. Moving out and need to sell. Includes small freezer compartment.', 75.00, 'furniture', 'good', 'ep-5'],
        ['listing-3', 'demo-user-id', 'MacBook Charger 60W MagSafe', 'Original Apple charger. Works with older MacBook Pro models. Minor cosmetic wear.', 25.00, 'electronics', 'fair', 'ep-1'],
        ['listing-4', 'demo-user-id', 'UIUC Football Tickets - vs Northwestern', 'Two tickets for upcoming game. Section 130, great seats! Selling at face value.', 80.00, 'tickets', 'new', 'ep-9'],
        ['listing-5', 'demo-user-id', 'Schwinn Road Bike 21-Speed', 'Great commuter bike for getting around campus. Recently tuned up. Includes lock!', 150.00, 'transportation', 'good', 'ep-7'],
        ['listing-6', 'demo-user-id', 'Chemistry Lab Coat - Size M', 'White lab coat required for CHEM courses. Worn only one semester.', 15.00, 'clothing', 'like_new', 'ep-8']
      ];

      for (const listing of sampleListings) {
        await connection.query(`
          INSERT INTO listings (id, seller_id, title, description, price, category, condition_status, exchange_point_id, images, status, views, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]', 'active', 0, NOW(), NOW())
        `, listing);
      }
      console.log('✅ Sample listings inserted');
    }

    console.log('\n🎉 Database initialization complete!');
    console.log('\nYou can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await connection.end();
  }
};

initDatabase();

