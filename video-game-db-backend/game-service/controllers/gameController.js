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
const fetchNewReleases = async (req, res) => {
    try {
        const token = await getCachedToken();

        // Get current date and 7 days ago for release window (past week)
        const now = Math.floor(Date.now() / 1000); // Current date in Unix timestamp (seconds)
        const oneWeekAgo = now - (7 * 24 * 60 * 60); // 7 days ago in Unix timestamp (seconds)

        // Fetch release dates from IGDB API for the past week
        const response = await axios({
            url: "https://api.igdb.com/v4/release_dates",
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': process.env.CLIENT_ID,  // Use the correct environment variable
                'Authorization': `Bearer ${token}`,
            },
            data: `fields category,checksum,created_at,date,game,human,m,platform,region,status,updated_at,y;
                   where date >= ${oneWeekAgo} & date <= ${now};
                   sort date desc;`
        });

        // Process the games and include game details
        const gameIds = response.data.map(release => release.game);  // Extract game IDs from release dates

        // Fetch game details using game IDs
        const gameDetailsResponse = await axios({
            url: "https://api.igdb.com/v4/games",
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': process.env.CLIENT_ID,
                'Authorization': `Bearer ${token}`,
            },
            data: `fields name,cover.url,genres.name,rating,first_release_date;
                   where id = (${gameIds.join(',')});
                   sort first_release_date desc;`
        });

        // List of suggestive words to filter out
        const suggestiveWords = ['sexy', 'adult', 'xxx', 'erotic', 'mature', 'nsfw', 'harem', 'hentai', 'porn', 'sex'];

        // Process cover URLs, include release date, and filter out games with suggestive names
        const games = gameDetailsResponse.data
            .filter(game => !suggestiveWords.some(word => 
                game.name.toLowerCase().includes(word)
            ))
            .map(game => ({
                ...game,
                release_date: response.data.find(release => release.game === game.id)?.date,
                cover: game.cover ? {
                    ...game.cover,
                    url: game.cover.url.replace('t_thumb', 't_cover_big').replace('//', 'https://')
                } : null
            }));

        res.json(games);

    } catch (error) {
        console.error('Error fetching new releases:', error.message);
        res.status(500).json({ error: 'Failed to fetch new releases' });
    }
};



// Fetch top-rated games from your database (Placeholder for future DB logic)
const fetchTopRated = async (req, res) => {
    // Placeholder: Replace this with actual DB logic to fetch top-rated games
    res.json([]);
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

// Export the controller functions
module.exports = { getAccessToken, fetchNewReleases, fetchTopRated, getCollections, updateCollection, addToCollection, deleteCollection };
