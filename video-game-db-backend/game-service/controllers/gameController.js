const axios = require('axios');
const { getCachedToken } = require('../utils/tokenUtils');
require('dotenv').config();

// Get Twitch Access Token
const getAccessToken = async (req, res) => {
    try {
        const token = await getCachedToken();
        res.json({ access_token: token });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch access token' });
    }
};

// Search Games on IGDB
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

module.exports = { getAccessToken, searchGames };
