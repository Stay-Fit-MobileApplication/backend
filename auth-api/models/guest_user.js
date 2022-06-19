const mongoose = require('mongoose');
const validator = require('validator');

const GuestuserSchema = new mongoose.Schema({

  fcm: {
    type: String,
    required: [true, 'is required'],
    unique: [true, 'FCM already in present'],
    trim: true
  },
  ip: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Guest_Users', GuestuserSchema)