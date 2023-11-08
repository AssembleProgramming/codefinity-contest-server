/**
 * IMPORTS
 */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { error } = require('console');

/**
 * SERVICES
 */
const app = express();

// Load environment variables from .env
dotenv.config();

app.use(cors());
app.use(express.json());

/**
 * DOTENV
 */
const PORT = process.env.PORT || 3000; // Use a default value (e.g., 3000) if PORT is not set in .env
const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Routes
 */
app.get("/", (req, res) => {
    res.json({
        "running": true
    });
});
app.get("/data", (req, res) => {
    res.json({
        "hi": "hello"
    });
});

/**
 * Start
 */
// Mongodb connection
mongoose.connect(MONGODB_URI);

// Check if the connection is successful
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB Atlas:', err.message);
});

app.listen(PORT, () => {
    console.log(`Server is Running on PORT ${PORT}`);
});
