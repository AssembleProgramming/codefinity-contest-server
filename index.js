/** ======================================================================
 * ?                            IMPORTS
====================================================================== */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const { error } = require('console');
const Team = require('./models/Team.js');

/** ======================================================================
 * ?                    Services & Configuration
====================================================================== */
const app = express();
// Load environment variables from .env
dotenv.config();

app.use(cors());
app.use(express.json());

/** ======================================================================
 * ?                    Environment Variables
====================================================================== */
const PORT = process.env.PORT || 3000; // Use a default value (e.g., 3000) if PORT is not set in .env
const MONGODB_URI = process.env.MONGODB_URI;


/** ======================================================================
 * ?                    MongoDB connection
====================================================================== */
// Mongodb connection
mongoose.connect(MONGODB_URI);

// Check if the connection is successful
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB Atlas:', err.message);
});

/** ======================================================================
 * ?                    Routes
====================================================================== */
// Test route
app.get("/", (req, res) => {
    res.json({
        "running": true
    });
});

// Create a sign-up route
app.post('/signup', async (req, res) => {
    try {
        const { TEAM_NAME, TEAM_MAIL, PASSWORD } = req.body; // Assuming you're sending these values in the request body
        
        // Check if TEAM_NAME or TEAM_MAIL already exist
        const existingTeamByName = await Team.findOne({ TEAM_NAME });
        const existingTeamByMail = await Team.findOne({ TEAM_MAIL });

        if (existingTeamByName) {
            // Team with the same TEAM_NAME already exists
            return res.status(400).json({ message: 'An account with the provided TEAM_NAME already exists.' });
        }

        if (existingTeamByMail) {
            // Team with the same TEAM_MAIL already exists
            return res.status(400).json({ message: 'An account with the provided TEAM_EMAIL already exists.' });
        }

        const encryptedPassword = await bcrypt.hash(PASSWORD, 27);

        // Create a new Team document
        const newTeam = new Team({
            TEAM_NAME,
            TEAM_MAIL,
            PASSWORD: encryptedPassword,
        });

        // Save the new team to the database
        const savedTeam = await newTeam.save();

        res.status(201).json({ message: 'Team registered successfully', team: savedTeam });
    } catch (error) {
        console.error('Team registration error:', error);
        res.status(500).json({ message: 'Team registration failed', error: error.message });
    }
});

// Define a route to get data where Registered is false
app.get('/get-unregistered-teams', async (req, res) => {
    try {
        // Find all teams where Registered is false
        const unregisteredTeams = await Team.find({ Registered: false });

        // Send the unregistered teams as JSON response
        res.json({ unregisteredTeams });
    } catch (error) {
        console.error('Error fetching unregistered teams:', error);
        res.status(500).json({ message: 'Failed to fetch unregistered teams', error: error.message });
    }
});

/** ======================================================================
 * ?                    Run the server
====================================================================== */
app.listen(PORT, () => {
    console.log(`Server is Running on PORT ${PORT}`);
});
