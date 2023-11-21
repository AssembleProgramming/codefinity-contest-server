const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contestRegisterSchema = new Schema({
  TEAM_ID: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    unique: true,
  },
  TEAM_MAIL: {
    type: String,
    required: true,
    unique: true,
  },
  TEAM_NAME: {
    type: String,
    required: true,
    unique: true,
  },


  LEADER_NAME: {
    type: String,
    required: true,
  },
  LEADER_MAIL: {
    type: String,
    required: true,
    unique: true,
  },
  LEADER_PHONE: {
    type: String,
    required: true,
  },
  LEADER_LOCATION: {
    type: String,
    required: true,
  },

  
  PAYMENT_METHOD: {
    type: String,
    required: true,
  },
  TRANSACTION_ID: {
    type: String,
    unique: true,
    required: true,
  },


  FAV_AVENGER: {
    type: String,
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

const ContestRegister = mongoose.model('ContestRegister', contestRegisterSchema);

module.exports = ContestRegister;