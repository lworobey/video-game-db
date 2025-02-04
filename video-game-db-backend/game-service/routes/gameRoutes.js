const express = require('express');
const router = express.Router();
const { getAccessToken, fetchNewReleases, fetchTopRated, getCollections, updateCollection, addToCollection, deleteCollection, searchGames, SanitycheckUser } = require('../controllers/gameController');

router.get('/token', getAccessToken);
router.get('/new-releases', fetchNewReleases);
router.get('/top-rated', fetchTopRated);
router.get('/search', searchGames);
router.get('/collections', getCollections);
router.post('/collections', addToCollection);
router.put('/collections/:id', updateCollection);
router.delete('/collections/:id', deleteCollection);

router.get('/sanity', SanitycheckUser)

module.exports = router;
