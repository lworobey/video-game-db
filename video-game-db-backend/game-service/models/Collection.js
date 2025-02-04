
// models/Collection.js (inside game service)
const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to the User model from the auth service
    required: true,
  },
  games: [{ gameId:
    {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',  // Reference to the Game model
    required: true,
  },
  timePlayed: { type: Number, default: null },
  userRating: { type: Number, default: null}}],
});

module.exports = mongoose.model('Collection', CollectionSchema);
