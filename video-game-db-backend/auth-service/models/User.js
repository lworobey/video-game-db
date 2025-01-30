const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    discordId: { type: String, required: true, unique: true }, // Discord user ID
    username: { type: String, required: true },
    email: { type: String }, // Optional: Not all Discord users have public emails
    avatar: { type: String }, // Stores the Discord avatar hash
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;