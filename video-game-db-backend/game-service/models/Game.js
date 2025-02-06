const mongoose = require("mongoose");
const gameSchema = new mongoose.Schema({
  igdbId: { type: Number, required: true, unique: true }, // IGDB API game ID
  name: { type: String, required: true },
  // systems: {type: Array},
  rating: { type: Number, default: null },
  addedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

gameSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const gameId = this._id;

    next();
  }
);

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
