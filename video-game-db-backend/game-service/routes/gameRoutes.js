const express = require('express');
const { getAccessToken, searchGames } = require('../controllers/gameController');
const { concurrentRequestLimiter, gameSearchLimiter } = require('../middleware/gameMiddleware');

const router = express.Router();

router.get('/token', async (req, res) => {
    try {
        const token = await getAccessToken();
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Failed to get access token" });
    }
});

router.get('/search', concurrentRequestLimiter, gameSearchLimiter, searchGames);

let collections = [];

router.get('/collections', (req, res) => {
    const { sort } = req.query;

    if (sort) {
        switch (sort) {
            case "az":
                collections.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "za":
                collections.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case "highestRated":
                collections.sort((a, b) => b.rating - a.rating);
                break;
            case "lowestRated":
                collections.sort((a, b) => a.rating - b.rating);
                break;
            case "mostTimePlayed":
                collections.sort((a, b) => b.timePlayed - a.timePlayed);
                break;
            case "leastTimePlayed":
                collections.sort((a, b) => a.timePlayed - b.timePlayed);
                break;
            default:
                break;
        }
    }

    res.json(collections);
});

router.post('/collections', (req, res) => {
    const { id, name, cover } = req.body;

    if (!id || !name) {
        return res.status(400).json({ error: "Game ID and name are required" });
    }

    if (collections.some((game) => game.id === id)) {
        return res.status(409).json({ error: "Game is already in the collection" });
    }

    const newGame = { id, name, cover };
    collections.push(newGame);
    res.status(201).json(newGame);
});

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
