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

// Sort collections based on the provided sort option
const sortCollections = (collections, sortOption) => {
  switch (sortOption) {
    case "az":
      return collections.sort((a, b) => a.name.localeCompare(b.name));
    case "za":
      return collections.sort((a, b) => b.name.localeCompare(a.name));
    case "highestRated":
      return collections.sort((a, b) => b.rating - a.rating); // Assuming 'rating' is numeric
    case "lowestRated":
      return collections.sort((a, b) => a.rating - b.rating);
    case "mostTimePlayed":
      return collections.sort((a, b) => b.timePlayed - a.timePlayed); // Assuming 'timePlayed' is numeric
    case "leastTimePlayed":
      return collections.sort((a, b) => a.timePlayed - b.timePlayed);
    default:
      return collections; // No sorting
  }
};

// Temporary in-memory collections storage
let collections = [];

// Handle collections route with sorting
const getCollections = async (req, res) => {
    try {
        const { sort } = req.query;

        let sortedCollections = collections;

        // Sort collections if a sort option is provided
        if (sort) {
            sortedCollections = sortCollections(sortedCollections, sort);
        }

        res.json(sortedCollections);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch collections' });
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

// Handle updating a collection
const updateCollection = (req, res) => {
    const { id } = req.params;
    const { name, rating, timePlayed } = req.body;

    // Find the collection by ID and update it
    let collection = collections.find((col) => col.id == id);
    if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
    }

    // Update fields
    collection.name = name || collection.name;
    collection.rating = rating || collection.rating;
    collection.timePlayed = timePlayed || collection.timePlayed;

    res.status(200).json(collection);
};

// Add a Game to Collection (`POST /api/collections`)
const addToCollection = (req, res) => {
    const { id, name, cover } = req.body;

    if (!id || !name) {
        return res.status(400).json({ error: "Game ID and name are required" });
    }

    // 🔥 Prevent adding duplicate games
    if (collections.some((game) => game.id === id)) {
        return res.status(409).json({ error: "Game is already in the collection" });
    }

    const newGame = { id, name, cover, rating: null, timePlayed: null };
    collections.push(newGame);
    res.status(201).json(newGame);
};

// Delete a Game from Collection (`DELETE /api/collections/:id`)
const deleteCollection = (req, res) => {
  const { id } = req.params;
  const index = collections.findIndex(game => game.id == id); // Ensure ID is compared correctly

  if (index === -1) {
    return res.status(404).json({ error: "Game not found in collections" });
  }

  collections.splice(index, 1);
  res.status(200).json({ message: "Game removed from collections" });
};

// Export the controller functions
module.exports = { getAccessToken, searchGames, getCollections, updateCollection, addToCollection, deleteCollection };