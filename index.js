/**
 * IMPORTS
 */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

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
app.listen(PORT, () => {
    console.log(`Server is Running on PORT ${PORT}`);
});
