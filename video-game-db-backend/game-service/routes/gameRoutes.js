const express = require('express');
const router = express.Router();
const { getAccessToken, fetchNewReleases, fetchTopRated, getCollections, updateCollection, addToCollection, deleteCollection, searchGames, SanitycheckUser } = require('../controllers/gameController');

// Get IGDB API access token
router.get('/token', getAccessToken);

// Fetch newly released games from the past week
router.get('/new-releases', fetchNewReleases);

// Get top rated games
router.get('/top-rated', fetchTopRated);

// Search games by query string
router.get('/search', searchGames);

// Get user's game collections
router.get('/collections', getCollections);

// Add a new game to user's collection
router.post('/collections', addToCollection);

// Update an existing collection
router.put('/collections/:id', updateCollection);

// Delete a collection
router.delete('/collections/:id', deleteCollection);

module.exports = router;
