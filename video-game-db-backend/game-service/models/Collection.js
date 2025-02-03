
// models/Collection.js (inside game service)
const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to the User model from the auth service
    required: true,
  },
  games: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',  // Reference to the Game model
    required: true,
  }],
});

module.exports = mongoose.model('Collection', CollectionSchema);
