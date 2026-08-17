const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// 1. CORS Setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. High Payload Limit for Base64 Images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. Cloud Database Connection (Fixed to Aiven's defaultdb)
const db = mysql.createPool({
  host: process.env.Host || 'mysql-3d3a04dd-ayeshafatimaa486-ff75.f.aivencloud.com',
  user: process.env.User || 'avnadmin',
  password: process.env.Password,
  database: 'defaultdb',
  port: Number(process.env.Port) || 25952,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Root Health Check
app.get('/', (req, res) => {
  res.send('Falcon Backend is Running Live!');
});

// 4. Test Connection & Auto-Create Tables
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database Connection Failed:', err.message);
  } else {
    console.log('✅ Connected to defaultdb database successfully!');
    
    // Auto Create Users Table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) DEFAULT "",
        address VARCHAR(500) DEFAULT "",
        role VARCHAR(50) DEFAULT "Agent",
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Auto Create Properties Table
    const createPropertiesTable = `
      CREATE TABLE IF NOT EXISTS properties (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255) NOT NULL,
        property_type VARCHAR(100),
        price VARCHAR(100),
        location VARCHAR(255),
        description TEXT,
        image_url LONGTEXT,
        agent_name VARCHAR(255) DEFAULT "N/A",
        agent_phone VARCHAR(20) DEFAULT "N/A",
        agent_email VARCHAR(255) DEFAULT "N/A",
        agent_address VARCHAR(500) DEFAULT "N/A",
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `;

    connection.query(createUsersTable, (err) => {
      if (err) console.error('❌ Error creating users table:', err.message);
      else console.log('✅ Users table ready');

      connection.query(createPropertiesTable, (err) => {
        if (err) console.error('❌ Error creating properties table:', err.message);
        else console.log('✅ Properties table ready');
        
        connection.release();
      });
    });
  }
});

// ------------------- AUTH ROUTES -------------------

// REGISTER USER (Auto table creation fallback included)
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, address } = req.body;
  console.log('📨 Register request received:', { name, email, phone, address });
  
  // 1. Pehle ensure karein ke table maujood hai
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20) DEFAULT "",
      address VARCHAR(500) DEFAULT "",
      role VARCHAR(50) DEFAULT "Agent",
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createTableQuery, (tableErr) => {
    if (tableErr) {
      console.error('❌ Error auto-creating users table:', tableErr.message);
      return res.status(500).json({ error: 'Database table error: ' + tableErr.message });
    }

    // 2. Phir user insert karein
    const sql = 'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [name, email, password, phone || '', address || ''], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Email already registered.' });
        }
        return res.status(500).json({ error: err.message });
      }
      const responseData = { id: result.insertId, name, email, phone: phone || '', address: address || '', role: 'Agent' };
      console.log('📤 Register response:', responseData);
      res.status(201).json(responseData);
    });
  });
});

// LOGIN USER
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT id, name, email, phone, address, role FROM users WHERE email = ? AND password = ?';
  
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    res.json(results[0]);
  });
});

// ------------------- PROPERTY ROUTES -------------------

// FETCH ALL PUBLIC PROPERTIES
app.get('/api/properties', (req, res) => {
  db.query('SELECT * FROM properties ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// FETCH USER SPECIFIC PROPERTIES
app.get('/api/user/properties/:userId', (req, res) => {
  const sql = 'SELECT * FROM properties WHERE user_id = ? ORDER BY id DESC';
  db.query(sql, [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ADD PROPERTY
app.post('/api/properties', (req, res) => {
  const { user_id, title, property_type, price, location, description, image_url, agent_name, agent_phone, agent_email, agent_address } = req.body;
  
  const sql = 'INSERT INTO properties (user_id, title, property_type, price, location, description, image_url, agent_name, agent_phone, agent_email, agent_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  
  db.query(sql, [user_id || null, title, property_type, price, location, description, image_url || null, agent_name || 'N/A', agent_phone || 'N/A', agent_email || 'N/A', agent_address || 'N/A'], (err, result) => {
    if (err) {
      console.error("Database Insert Error:", err);
      return res.status(500).json({ error: 'Failed to insert property into database: ' + err.message });
    }
    res.status(201).json({ 
      message: 'Property created successfully', 
      id: result.insertId 
    });
  });
});

// EDIT / UPDATE PROPERTY
app.put('/api/properties/:id', (req, res) => {
  const propertyId = req.params.id;
  const { title, property_type, price, location, description, image_url, agent_name, agent_phone, agent_email, agent_address } = req.body;

  const sql = `
    UPDATE properties 
    SET title = ?, property_type = ?, price = ?, location = ?, description = ?, image_url = ?, agent_name = ?, agent_phone = ?, agent_email = ?, agent_address = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [title, property_type, price, location, description, image_url, agent_name || 'N/A', agent_phone || 'N/A', agent_email || 'N/A', agent_address || 'N/A', propertyId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Property not found.' });
      }
      res.json({ message: 'Property updated successfully.' });
    }
  );
});

// DELETE PROPERTY
app.delete('/api/properties/:id', (req, res) => {
  const propertyId = req.params.id;
  const sql = 'DELETE FROM properties WHERE id = ?';

  db.query(sql, [propertyId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Property not found.' });
    }
    res.json({ message: 'Property deleted successfully.' });
  });
});

// Server Listen (Local Dev Only)
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;