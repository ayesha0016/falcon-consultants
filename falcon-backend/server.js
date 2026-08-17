const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// 1. CORS Setup
app.use(cors());

// 2. High Payload Limit for Base64 Image Uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. MySQL Database Connection Pool
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'afmalik2712',
  database: process.env.DB_NAME || 'falcon_consultants',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test Connection and Initialize Database Schema
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database Connection Failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL Database successfully!');
    
    // Helper to add a column if it doesn't exist
    const addColumnIfNotExists = (connection, table, column, definition) => {
      return new Promise((resolve) => {
        const sql = `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`;
        connection.query(sql, (err) => {
          if (err && err.code === 'ER_DUP_FIELDNAME') {
            console.log(`ℹ️  Column ${column} already exists in ${table}`);
          } else if (err) {
            console.error(`❌ Error adding ${column} to ${table}:`, err.message);
          } else {
            console.log(`✅ Column ${column} added to ${table}`);
          }
          resolve();
        });
      });
    };
    
    // Initialize Users table columns
    Promise.all([
      addColumnIfNotExists(connection, 'users', 'phone', 'VARCHAR(20) DEFAULT ""'),
      addColumnIfNotExists(connection, 'users', 'address', 'VARCHAR(500) DEFAULT ""')
    ]).then(() => {
      console.log('✅ Users table schema verified');
    });
    
    // Initialize Properties table columns
    setTimeout(() => {
      Promise.all([
        addColumnIfNotExists(connection, 'properties', 'agent_name', 'VARCHAR(255) DEFAULT "N/A"'),
        addColumnIfNotExists(connection, 'properties', 'agent_phone', 'VARCHAR(20) DEFAULT "N/A"'),
        addColumnIfNotExists(connection, 'properties', 'agent_email', 'VARCHAR(255) DEFAULT "N/A"'),
        addColumnIfNotExists(connection, 'properties', 'agent_address', 'VARCHAR(500) DEFAULT "N/A"')
      ]).then(() => {
        console.log('✅ Properties table schema verified');
      });
    }, 500);
    
    connection.release();
  }
});

// ------------------- AUTH ROUTES -------------------

// REGISTER USER
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, address } = req.body;
  console.log('📨 Register request received:', { name, email, phone, address });
  
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

// FETCH USER SPECIFIC PROPERTIES (DASHBOARD)
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

// ------------------- START SERVER -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on http://127.0.0.1:${PORT}`));