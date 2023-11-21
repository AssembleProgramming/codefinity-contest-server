/** ======================================================================
 * ?                            IMPORTS
====================================================================== */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Team = require('./models/Team.js');
const ContestRegister = require('./models/ContestRegister.js')
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');

/** ======================================================================
 * ?                    Services & Configuration
====================================================================== */
const app = express();
// Load environment variables from .env
dotenv.config();

app.use(cors());
app.use(express.json());
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views')); // Specify the views directory
app.use(express.urlencoded({ extended: false }));

/** ======================================================================
 * ?                    Environment Variables
====================================================================== */
const PORT = process.env.PORT || 3000; // Use a default value (e.g., 3000) if PORT is not set in .env
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const MAIL = process.env.MAIL;
const MAIL_PASSWORD = process.env.MAIL_PASSWORD;
const SERVER_LINK = process.env.SERVER_LINK
const QUESTION_ONE_MARKS = 10;
const QUESTION_TWO_MARKS = 20;
const QUESTION_THREE_MARKS = 20;

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
 * ?                          Routes
====================================================================== */
// Test route
app.get("/", (req, res) => {
    res.json({
        "status": "running"
    });
});

// Create a sign-up route
app.post('/signup', async (req, res) => {
    try {
        const { TEAM_NAME, TEAM_MAIL, PASSWORD, TEAM_GRP_NO } = req.body;
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


        let numberOfSignedUpTeams = await Team.countDocuments();
        numberOfSignedUpTeams += 1;


        // Create a new Team document
        const newTeam = new Team({
            TEAM_NAME,
            TEAM_MAIL,
            PASSWORD,
            TEAM_NUMBER: numberOfSignedUpTeams,
            TEAM_GRP_NO
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
        res.status(500).json({ message: 'An error occurred at server side' });
    }
});


// Define a route to get data of entire contest Register
app.get('/get-contest-register', async (req, res) => {
    try {
        // Retrieve all documents from the collection
        const allDocuments = await ContestRegister.find();

        res.json({ allDocuments });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Forgot password API
app.post('/forgot-password', async (req, res) => {
    try {
        const { TEAM_MAIL } = req.body;
        // Find the team by TEAM_MAIL
        const existingTeam = await Team.findOne({ TEAM_MAIL });
        if (!existingTeam) {
            // Team with the provided TEAM_MAIL does not exist
            return res.status(404).json({ message: 'Team not found. Please check entered TEAM_MAIL.' });
        }

        // We will create a secret key
        const secret_key = JWT_SECRET + existingTeam.PASSWORD;

        const token = jwt.sign({ TEAM_MAIL: existingTeam.TEAM_MAIL, ID: existingTeam._id }, secret_key, {
            expiresIn: '5m'
        });

        const password_reset_link = `${SERVER_LINK}/reset-password/${existingTeam._id}/${token}`;

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: MAIL,
                pass: MAIL_PASSWORD
            }
        });

        var mailOptions = {
            from: 'assembleprogramming@gmail.com',
            to: TEAM_MAIL,
            subject: 'Sending Password Reset Link',
            text: `Use this link to reset your password ${password_reset_link}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return res.status(500).json({ message: "A network error has occurred, please try again later." });
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(200).json({ message: "Password reset link has been sent to your team Email." });
            }
        });

    }
    catch (error) {
        return res.status(500).json({ message: "A network error has occurred, please try again later." });
    }
});

// Reset password API
app.get("/reset-password/:id/:token", async (req, res) => {
    const { id, token } = req.params;
    const existingTeam = await Team.findOne({ _id: id });
    if (!existingTeam) {
        // Team with the provided TEAM_MAIL does not exist
        return res.status(404).json({ message: 'Team not found. Please check entered TEAM_MAIL.' });
    }

    // We will create a secret key
    const secret_key = JWT_SECRET + existingTeam.PASSWORD;
    try {
        const isValidToken = jwt.verify(token, secret_key);
        res.render("index", { email: isValidToken.TEAM_MAIL });
    }
    catch (error) {
        return res.status(404).json({ message: 'Credentials are not verified...' });
    }
})

// Reset password API POST
app.post("/reset-password/:id/:token", async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    const existingTeam = await Team.findOne({ _id: id });
    if (!existingTeam) {
        // Team with the provided TEAM_MAIL does not exist
        return res.status(404).json({ message: 'Team not found. Please check entered TEAM_MAIL.' });
    }

    // We will create a secret key
    const secret_key = JWT_SECRET + existingTeam.PASSWORD;
    try {
        const isValidToken = jwt.verify(token, secret_key);
        await Team.updateOne({
            _id: id
        }, {
            $set: {
                PASSWORD: password
            }
        });
        return res.render("success");
    }
    catch (error) {
        return res.render("failure");
    }
})


// register for contest
app.post("/contest-registration", async (req, res) => {
    try {
        const {
            TEAM_MAIL, TEAM_ID,
            LEADER_NAME, LEADER_MAIL, LEADER_PHONE, LEADER_LOCATION,
            PAYMENT_METHOD, TRANSACTION_ID,
            FAV_AVENGER
        } = req.body;


        const numberOfRegisteredTeams = await ContestRegister.countDocuments();
        if (numberOfRegisteredTeams >= 100) {
            return res.status(400).json({ message: `Sorry, Contest registrations are full & we're not accepting new entries.` });
        }

        // If team has already registered
        const existingRegistration = await ContestRegister.findOne({ TEAM_ID: TEAM_ID });
        if (existingRegistration) {
            return res.status(200).json({ message: `This team is already registered.` });
        }

        const existingLeader = await ContestRegister.findOne({ LEADER_MAIL: LEADER_MAIL });
        if (existingLeader) {
            return res.status(400).json({ message: `Team Leader's mail is already registered.` });
        }

        const existingTransactionID = await ContestRegister.findOne({ TRANSACTION_ID: TRANSACTION_ID });
        if (existingTransactionID) {
            return res.status(400).json({ message: `Invalid transaction ID.` });
        }

        // Register the current team
        await Team.updateOne({
            _id: TEAM_ID
        }, {
            $set: {
                Registered: true
            }
        });

        const TEAM = await Team.findOne({ TEAM_MAIL: TEAM_MAIL });
        const TEAM_NAME = TEAM.TEAM_NAME;

        // Create a new Team document to register
        const newRegisterTeam = new ContestRegister({
            TEAM_MAIL, TEAM_ID, TEAM_NAME,
            LEADER_NAME, LEADER_MAIL, LEADER_PHONE, LEADER_LOCATION,
            PAYMENT_METHOD, TRANSACTION_ID,
            FAV_AVENGER
        });

        // Save the new team to the database
        const savedNewRegisterTeam = await newRegisterTeam.save();

        res.status(201).json({ message: 'Team registered successfully' });
    } catch (error) {
        console.error('Team registration error:', error);
        res.status(500).json({ message: 'Team registration failed' });
    }
});


app.post("/submit-question-one", async (req, res) => {
    try {
        const { TEAM_MAIL, LAST_SUBMISSION_TIME_STAMP } = req.body;
        const teamEntry = await Team.findOne({ TEAM_MAIL: TEAM_MAIL });
        const contestRegisterEntry = await ContestRegister.findOne({ TEAM_MAIL: TEAM_MAIL });
        if (!teamEntry) {
            return res.status(400).json({ message: `Team is not authenticated` });
        }
        if (!contestRegisterEntry) {
            return res.status(400).json({ message: `Team is not authenticated` });
        }
        if (teamEntry.QUESTION_ONE_STATUS === true) {
            return res.status(400).json({ message: `Question is already submitted.` });
        }

        let usersContestScore = teamEntry.CONTEST_SCORE;
        usersContestScore += QUESTION_ONE_MARKS;

        // Update team contest status
        await Team.updateOne({
            TEAM_MAIL: TEAM_MAIL
        }, {
            $set: {
                QUESTION_ONE_STATUS: true,
                CONTEST_SCORE: usersContestScore,
                LAST_SUBMISSION_TIME_STAMP: LAST_SUBMISSION_TIME_STAMP
            }
        });

        // Update contest Register
        await ContestRegister.updateOne({
            TEAM_MAIL: TEAM_MAIL
        }, {
            $set: {
                QUESTION_ONE_STATUS: true,
                CONTEST_SCORE: usersContestScore,
                LAST_SUBMISSION_TIME_STAMP: LAST_SUBMISSION_TIME_STAMP
            }
        })

        res.status(201).json({ message: 'Submission Successful!!!' });
    }
    catch (error) {
        res.status(500).json({ message: 'Submission Failed!!!' });
    }
})

app.post("/submit-question-two", async (req, res) => {
    try {
        const { TEAM_MAIL, LAST_SUBMISSION_TIME_STAMP } = req.body;
        const teamEntry = await Team.findOne({ TEAM_MAIL: TEAM_MAIL });
        const contestRegisterEntry = await ContestRegister.findOne({ TEAM_MAIL: TEAM_MAIL });
        if (!teamEntry) {
            return res.status(400).json({ message: `Team is not authenticated` });
        }
        if (!contestRegisterEntry) {
            return res.status(400).json({ message: `Team is not authenticated` });
        }
        if (teamEntry.QUESTION_TWO_STATUS === true) {
            return res.status(400).json({ message: `Question is already submitted.` });
        }

        let usersContestScore = teamEntry.CONTEST_SCORE;
        usersContestScore += QUESTION_TWO_MARKS;

        // Update team contest status
        await Team.updateOne({
            TEAM_MAIL: TEAM_MAIL
        }, {
            $set: {
                QUESTION_TWO_STATUS: true,
                CONTEST_SCORE: usersContestScore,
                LAST_SUBMISSION_TIME_STAMP: LAST_SUBMISSION_TIME_STAMP
            }
        });

        // Update contest Register
        await ContestRegister.updateOne({
            TEAM_MAIL: TEAM_MAIL
        }, {
            $set: {
                QUESTION_TWO_STATUS: true,
                CONTEST_SCORE: usersContestScore,
                LAST_SUBMISSION_TIME_STAMP: LAST_SUBMISSION_TIME_STAMP
            }
        })

        res.status(201).json({ message: 'Submission Successful!!!' });
    }
    catch (error) {
        res.status(500).json({ message: 'Submission Failed!!!' });
    }
})


app.post("/submit-question-three", async (req, res) => {
    try {
        const { TEAM_MAIL, LAST_SUBMISSION_TIME_STAMP } = req.body;
        const teamEntry = await Team.findOne({ TEAM_MAIL: TEAM_MAIL });
        const contestRegisterEntry = await ContestRegister.findOne({ TEAM_MAIL: TEAM_MAIL });
        if (!teamEntry) {
            return res.status(400).json({ message: `Team is not authenticated` });
        }
        if (!contestRegisterEntry) {
            return res.status(400).json({ message: `Team is not authenticated` });
        }
        if (teamEntry.QUESTION_THREE_STATUS === true) {
            return res.status(400).json({ message: `Question is already submitted.` });
        }

        let usersContestScore = teamEntry.CONTEST_SCORE;
        usersContestScore += QUESTION_THREE_MARKS;

        // Update team contest status
        await Team.updateOne({
            TEAM_MAIL: TEAM_MAIL
        }, {
            $set: {
                QUESTION_THREE_STATUS: true,
                CONTEST_SCORE: usersContestScore,
                LAST_SUBMISSION_TIME_STAMP: LAST_SUBMISSION_TIME_STAMP
            }
        });

        // Update contest Register
        await ContestRegister.updateOne({
            TEAM_MAIL: TEAM_MAIL
        }, {
            $set: {
                QUESTION_THREE_STATUS: true,
                CONTEST_SCORE: usersContestScore,
                LAST_SUBMISSION_TIME_STAMP: LAST_SUBMISSION_TIME_STAMP
            }
        })

        res.status(201).json({ message: 'Submission Successful!!!' });
    }
    catch (error) {
        res.status(500).json({ message: 'Submission Failed!!!' });
    }
})


app.get("/contest-register-all", async (req, res) => {
    try {
        const contestRegister = await ContestRegister.find();
        res.status(200).json({ teams: contestRegister });
    } catch (error) {
        res.status(500).json({ message: 'Server side Error' });
    }
});

/** ======================================================================
 * ?                    Run the server
====================================================================== */
app.listen(PORT, () => {
    console.log(`Server is Running on PORT ${PORT}`);
});
