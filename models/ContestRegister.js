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
  LEADER_YEAR: {
    type: String,
    required: true,
  },
  LEADER_DEPT: {
    type: String,
    required: true,
  },
  LEADER_DIV: {
    type: String,
    required: true,
  },
  LEADER_RNO: {
    type: String,
    required: true,
  },




  MEMBER_NAME: {
    type: String,
  },
  MEMBER_MAIL: {
    type: String,
  },
  MEMBER_PHONE: {
    type: String,
  },
  MEMBER_YEAR: {
    type: String,
  },
  MEMBER_DEPT: {
    type: String,
  },
  MEMBER_DIV: {
    type: String,
  },
  MEMBER_RNO: {
    type: String,
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