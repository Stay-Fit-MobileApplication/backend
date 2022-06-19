const mongoose = require('mongoose');
const validator = require('validator');

const { ObjectId } = mongoose.Schema.Types;

const challengeRequestSchema = new mongoose.Schema({
  requester: {
    type: ObjectId
  },
  receiver: {
    type: ObjectId
  },
  requester_score: {
    type: Number
  },
  receiver_score: {
    type: Number
  },
  status: {
    type: String,
    validate: {
      validator: function (val) {
        var re = /^accepted$|^sent$|^rejected$/g;
        if (!re.test(val)) {
          return false;
        }
        return true;
      },
      message: 'Invalid status (accepted values : sent, accepted and rejected)'
    },
    default: 'sent'
  }
})

module.exports = mongoose.model('Challenge_Requests', challengeRequestSchema)