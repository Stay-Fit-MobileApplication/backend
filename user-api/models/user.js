const mongoose = require('mongoose');
const validator = require('validator');

const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({

  phone: {
    type: String,
    required: [true, 'is required'],
    unique: [true, 'Phone already in use'],
    trim: true
  },
  country_code: {
    type: String,
    required: [true, 'is required'],
    trim: true
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 150,
    validate: {
      validator: function (val) {
        let result = val.replace(/ /g, '');
        return validator.isAlpha(result);
      },
      message: 'Name should contain only alphabets with or without spaces'
    },
    trim: true
  },
  username: {
    type: String,
    minlength: 2,
    maxlength: 50,
    lowercase: true,
    validate: {
      validator: function (val) {
        let result = val.replace(/ /g, '');
        return validator.isAlpha(result);
      },
      message: 'Username should contain only alphabets with or without spaces'
    },
    trim: true
  },
  connected_users: [{
    type: ObjectId
  }],
  dob: {
    type: Date,
    trim: true
  },
  height: {
    type: Number
  },
  weight: {
    type: Number
  },
  hip: {
    type: Number
  },
  neck: {
    type: Number
  },
  waist: {
    type: Number
  },
  days: {
    type: Number
  },
  bio: {
    type: String,
    minlength: 2,
    maxlength: 500,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default:'Point'
    },
    coordinates: {
      type: [Number]
    }
  },
  gender: {
    type: String,
    enum: ['male','female','others'],
    lowercase: true
  },
  profile_verified: {
    type: Boolean,
    default: false
  },
  profile_completion: {
    type: Number,
    default: 0
  },
  device: [{
    name: String,
    os: String,
    os_version: String,
    fcm: String,
    app_version: String,
    token: String,
    last_login: Date,
    login_ip: String
  }],
  profile_images: {
    type: Array,
    default: []
  },
  notifications: {
    type: Array,
    default: []
  },
  bmi: {
    type: Number
  },
  bodyfat: {
    type: Number
  },
  bmr: {
    type: Number
  },
  amr: {
    type: Number
  },
  activeness: {
    type: Number
  },
  cal_correction: {
    type: Number
  },
  is_blocked: {
    type: Boolean,
    default: false
  },
  creation_ip: {
    type: String,
    required: [true, 'is required']
  },
  updation_ip: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date
  }
})

userSchema.pre('save', async function save(next) {
  this.increment();
  this.updated_at = new Date;
  return next();
});

userSchema.index({location:"2dsphere"});

module.exports = mongoose.model('Users', userSchema)