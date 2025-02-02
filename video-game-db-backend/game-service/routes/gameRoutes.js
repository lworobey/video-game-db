const express = require('express');
const router = express.Router();
const { getAccessToken, searchGames, getCollections, updateCollection, addToCollection, deleteCollection } = require('../controllers/gameController');

router.get('/token', getAccessToken);

router.get('/search', searchGames);

router.get('/collections', getCollections);

router.post('/collections', addToCollection);

router.put('/collections/:id', updateCollection);

router.delete('/collections/:id', deleteCollection);

module.exports = router;
