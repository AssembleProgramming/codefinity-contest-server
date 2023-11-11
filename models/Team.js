const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamSchema = new Schema({
    TEAM_NAME: {
        type: String,
        unique: true,
        required: true,
        maxlength: 15,
    },
    TEAM_MAIL: {
        type: String,
        unique: true,
        required: true,
    },
    PASSWORD: {
        type: String,
        required: true,
    },
    Registered: {
        type: Boolean,
        default: false,
    },
    TEAM_NUMBER: {
        type: Number,
        required: true
    },
    TEAM_GRP_NO: {
        type: Number,
        required: true
    },

    CONTEST_SCORE: {
        type: Number,
        default: 0,
    },
    QUESTION_ONE_STATUS: {
        type: Boolean,
        default: false,
    },
    QUESTION_TWO_STATUS: {
        type: Boolean,
        default: false,
    },
    QUESTION_THREE_STATUS: {
        type: Boolean,
        default: false,
    },
    LAST_SUBMISSION_TIME_STAMP: {
        type: Number,
        default: Infinity,
    },
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
