/** ======================================================================
 * ?                            IMPORTS
====================================================================== */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { error } = require('console');
const Team = require('./models/Team.js');
const jwt = require('jsonwebtoken');

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
const JWT_SECRET = process.env.JWT_SECRET;


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
        const { TEAM_NAME, TEAM_MAIL, PASSWORD } = req.body;
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

        // Create a new Team document
        const newTeam = new Team({
            TEAM_NAME,
            TEAM_MAIL,
            PASSWORD,
        });

        // Save the new team to the database
        const savedTeam = await newTeam.save();

        res.status(201).json({ message: 'Team registered successfully', team: savedTeam });
    } catch (error) {
        console.error('Team registration error:', error);
        res.status(500).json({ message: 'Team registration failed', error: error.message });
    }
});


// Create a login route
app.post('/login', async (req, res) => {
    try {
        const { TEAM_MAIL, PASSWORD } = req.body;
        clg
        // Find the team by TEAM_MAIL
        const existingTeam = await Team.findOne({ TEAM_MAIL });

        if (!existingTeam) {
            // Team with the provided TEAM_MAIL does not exist
            return res.status(404).json({ message: 'Team not found. Please check your credentials.' });
        }

        if (existingTeam.PASSWORD !== PASSWORD) {
            // Password does not match
            return res.status(401).json({ message: 'Incorrect password. Please check your credentials.' });
        }

        // If credentials are valid, generate a JWT
        const token = jwt.sign({ TEAM_MAIL: existingTeam.TEAM_MAIL }, JWT_SECRET, {
            expiresIn: '30d', // Token expiration time
        });

        res.status(200).json({ message: 'Login successful', team: token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// get user data through jwt token
app.post("/getuserdata", async (req, res) => {
    try {
        const { token } = req.body;

        // Verify and decode the JWT token
        const decodedToken = jwt.verify(token, JWT_SECRET);

        // Assuming that TEAM_NAME is stored in the decoded token
        const teamMail = decodedToken.TEAM_MAIL;

        // Use async/await for database operations to simplify the code
        const teamData = await Team.findOne({ TEAM_MAIL: teamMail });

        if (!teamData) {
            res.status(404).json({ message: 'Team not found' });
        } else {
            res.status(200).json({ team: teamData });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
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
