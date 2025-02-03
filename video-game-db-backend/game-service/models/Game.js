const mongoose = require('mongoose');
const gameSchema = new mongoose.Schema({
    igdbId: { type: Number, required: true, unique: true }, // IGDB API game ID
    name: { type: String, required: true },
    timePlayed: { type: Number, default: null },
   // systems: {type: Array},
    rating: { type: Number, default: null },
    addedAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
