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
    TEAM_GRP_NO:{
        type:Number,
        required: true
    }
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
