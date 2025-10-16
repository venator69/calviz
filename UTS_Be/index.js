const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

const saltRounds = 10;
const app = express();
app.use(cors({  origin: '*'}));

dotenv.config({ path: './.env' });

const port = process.env.PORT || 3000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mydb',
  password: 'yaldabaoth',
  port: 5432
});

// Multer config — store file in memory so we can save bytes directly
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Test DB connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('Database connection failed:', err);
  else console.log('PostgreSQL connected at', res.rows[0].now);
});

// Register endpoint
app.post('/register', upload.single('profile'), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const profileFile = req.file;

    if (!profileFile) {
      return res.status(400).json({ status: 'error', message: 'Profile image is required' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert into database, storing profile as bytea
    const query = `
      INSERT INTO users(name, email, password, profile)
      VALUES($1, $2, $3, $4) RETURNING id
    `;
    const values = [name, email, hashedPassword, profileFile.buffer]; // buffer contains bytes
    const result = await pool.query(query, values);

    res.status(200).json({ status: 'success', userId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
