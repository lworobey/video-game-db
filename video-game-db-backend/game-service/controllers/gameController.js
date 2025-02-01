const axios = require('axios');
const { getCachedToken } = require('../utils/tokenUtils');
require('dotenv').config();

const getAccessToken = async (req, res) => {
    try {
        const token = await getCachedToken();
        res.json({ access_token: token });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch access token' });
    }
};

const sortCollections = (collections, sortOption) => {
  switch (sortOption) {
    case "az":
      return collections.sort((a, b) => a.name.localeCompare(b.name));
    case "za":
      return collections.sort((a, b) => b.name.localeCompare(a.name));
    case "highestRated":
      return collections.sort((a, b) => b.rating - a.rating);
    case "lowestRated":
      return collections.sort((a, b) => a.rating - b.rating);
    case "mostTimePlayed":
      return collections.sort((a, b) => b.timePlayed - a.timePlayed);
    case "leastTimePlayed":
      return collections.sort((a, b) => a.timePlayed - b.timePlayed);
    default:
      return collections;
  }
};

const getCollections = async (req, res) => {
    try {
        const { sort } = req.query;

        const collections = [
            { id: 1, name: 'Game A', rating: 4.5, timePlayed: 20, cover: 'url_to_cover_image' },
            { id: 2, name: 'Game B', rating: 3.0, timePlayed: 50, cover: 'url_to_cover_image' },
            { id: 3, name: 'Game C', rating: 5.0, timePlayed: 10, cover: 'url_to_cover_image' },
        ];

        let sortedCollections = collections;

        if (sort) {
            sortedCollections = sortCollections(sortedCollections, sort);
        }

        res.json(sortedCollections);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch collections' });
    }
};

const searchGames = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: "Query parameter is required" });
        }

        const token = await getCachedToken();
        const clientId = process.env.CLIENT_ID;

        const response = await axios.post(
            'https://api.igdb.com/v4/games',
            `search "${query}"; fields name,cover.url,genres.name,rating; limit 10;`,
            {
                headers: {
                    'Client-ID': clientId,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'text/plain'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
};

module.exports = { getAccessToken, searchGames, getCollections };
