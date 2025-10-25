const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL; 

// --- Database Connection Pool ---
if (!DATABASE_URL) {
    console.error("FATAL ERROR: DATABASE_URL is not defined in .env");
    process.exit(1);
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.query('SELECT NOW()')
    .then(res => {
        console.log('PostgreSQL Cloud Connected successfully at:', res.rows[0].now);
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} 🌍`);
        });
    })
    .catch(err => {
        console.error('FATAL ERROR: Database connection failed. Check DATABASE_URL or Network Access.', err);
        process.exit(1); 
    });

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


// --- Routes ---
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Calviz Backend API is running and connected to PostgreSQL Cloud.');
});

module.exports = { pool, app };