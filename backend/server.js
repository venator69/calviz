const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // PostgreSQL client
require('dotenv').config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 5000;
// Use DATABASE_URL from .env for the Railway connection
const DATABASE_URL = process.env.DATABASE_URL; 

// --- Database Connection Pool ---
// We create the pool globally so it can be accessed by the routes
if (!DATABASE_URL) {
    console.error("FATAL ERROR: DATABASE_URL is not defined in .env");
    process.exit(1);
}

// Instantiate the PostgreSQL Pool using the cloud connection string
const pool = new Pool({
    connectionString: DATABASE_URL,
    // Add SSL config for external cloud connections (required by most cloud providers like Railway)
    ssl: {
        rejectUnauthorized: false
    }
});

// Test DB connection immediately and start the server only if successful
pool.query('SELECT NOW()')
    .then(res => {
        console.log('PostgreSQL Cloud Connected successfully at:', res.rows[0].now);
        
        // Start server only if DB connection is successful
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} 🌍`);
        });
    })
    .catch(err => {
        console.error('FATAL ERROR: Database connection failed. Check DATABASE_URL or Network Access.', err);
        // Exit process if DB connection fails
        process.exit(1); 
    });

// --- Middleware ---
app.use(cors());
app.use(express.json()); // For parsing application/json (used by Register/Login)
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded


// --- Routes ---
// Import Authentication routes (Register, Login, /user)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes); // All modular auth routes are now prefixed with /api/auth

// Simple welcome route
app.get('/', (req, res) => {
    res.send('Calviz Backend API is running and connected to PostgreSQL Cloud.');
});


// Export the pool so routes/auth.js can execute queries
module.exports = { pool, app };