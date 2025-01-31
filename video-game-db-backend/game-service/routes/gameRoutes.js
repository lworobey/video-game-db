const express = require('express');
const { getAccessToken, searchGames } = require('../controllers/gameController');
const { concurrentRequestLimiter, gameSearchLimiter } = require('../middleware/gameMiddleware');

const router = express.Router();

// ✅ Get Access Token
router.get('/token', async (req, res) => {
    try {
        const token = await getAccessToken();
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Failed to get access token" });
    }
});

// ✅ Search IGDB API at `/api/search`
router.get('/search', concurrentRequestLimiter, gameSearchLimiter, searchGames);

// ✅ Collection Storage (Temporary In-Memory)
let collections = [];

// ✅ Get All Collections (`GET /api/collections`)
router.get('/collections', (req, res) => {
    res.json(collections);
});

// ✅ Add a Game to Collection (`POST /api/collections`)
router.post('/collections', (req, res) => {
    const { id, name, cover } = req.body;

    if (!id || !name) {
        return res.status(400).json({ error: "Game ID and name are required" });
    }

    // 🔥 Prevent adding duplicate games
    if (collections.some((game) => game.id === id)) {
        return res.status(409).json({ error: "Game is already in the collection" });
    }

    const newGame = { id, name, cover };
    collections.push(newGame);
    res.status(201).json(newGame);
});

// ✅ Remove a Game from Collection (`DELETE /api/collections/:id`)
router.delete('/collections/:id', (req, res) => {
    const { id } = req.params;
    const index = collections.findIndex(game => game.id == id);

    if (index === -1) {
        return res.status(404).json({ error: "Game not found in collections" });
    }

    collections.splice(index, 1);
    res.status(200).json({ message: "Game removed from collections" });
});

module.exports = router;
