const axios = require('axios');
const { getCachedToken } = require('../utils/tokenUtils');
const Game = require('../models/Game');
const User = require('../../auth-service/models/User')
const Collection = require('../models/Collection')
require('dotenv').config();

const getAccessToken = async (req, res) => {
    try {
        console.log('Attempting to get cached access token...');
        const token = await getCachedToken();
        console.log('Successfully retrieved cached token');
        res.json({ access_token: token });
    } catch (error) {
        console.error('Failed to fetch access token:', error);
        res.status(500).json({ error: 'Failed to fetch access token' });
    }
};

const fetchNewReleases = async (req, res) => {
    try {
        console.log('Fetching new game releases...');
        const token = await getCachedToken();

        // Get current date and 7 days ago for release window (past week)
        const now = Math.floor(Date.now() / 1000); // Current date in Unix timestamp (seconds)
        const oneWeekAgo = now - (7 * 24 * 60 * 60); // 7 days ago in Unix timestamp (seconds)

        console.log(`Fetching releases between ${new Date(oneWeekAgo * 1000)} and ${new Date(now * 1000)}`);

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

        console.log(`Found ${response.data.length} release dates`);

        // Process the games and include game details
        const gameIds = response.data.map(release => release.game);  // Extract game IDs from release dates
        console.log(`Fetching details for ${gameIds.length} games`);

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

        console.log(`Returning ${games.length} filtered games`);
        res.json(games);

    } catch (error) {
        console.error('Error fetching new releases:', error);
        console.error('Error details:', error.response?.data || 'No additional error details');
        res.status(500).json({ error: 'Failed to fetch new releases' });
    }
};

const fetchTopRated = async (req, res) => {
    try {
        console.log('Fetching top rated games...');
        res.json([]); 
    } catch (error) {
        console.error('Error fetching top rated games:', error);
        res.status(500).json({ error: 'Failed to fetch top rated games' });
    }
};

const searchGames = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            console.error('Search attempted without query parameter');
            return res.status(400).json({ error: "Query parameter is required" });
        }

        console.log(`Searching for games with query: "${query}"`);
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

        console.log(`Found ${response.data.length} games matching query`);
        res.json(response.data);
    } catch (error) {
        console.error('Error searching games:', error);
        console.error('Error details:', error.response?.data || 'No additional error details');
        res.status(500).json({ error: 'Failed to fetch games' });
    }
};

let collections = [];

const getCollections = async (req, res) => {
    try {
        console.log('Fetching collections...');
        const { sort } = req.query;
        let sortedCollections = collections;
        if (sort) {
            console.log(`Sorting collections by: ${sort}`);
            sortedCollections = sortCollections(sortedCollections, sort);
        }
        console.log(`Returning ${sortedCollections.length} collections`);
        res.json(sortedCollections);
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ error: 'Failed to fetch collections' });
    }
};

const sortCollections = (collections, sortOption) => {
    console.log(`Sorting collections with option: ${sortOption}`);
    switch (sortOption) {
        case "az":
            return collections.sort((a, b) => a.name.localeCompare(b.name));
        case "za":
            return collections.sort((a, b) => b.name.localeCompare(a.name));
        case "highestRated":
            return collections.sort((a, b) => b.rating - a.rating);
        case "lowestRated":
            return collections.sort((a, b) => a.rating - b.rating);
        default:
            console.log('Using default sort order');
            return collections;
    }
};

const addToCollection = async (req, res) => {
    try {
        const { id, username, name, cover, description, releaseDate, platforms, genres } = req.body;
        
        if (!username){
            console.error('attempted to add game without user data');
            return res.status(400).json({ error: "Requires an account to create collection" });
        }

        // check if both of these are fulfilled
        if (!id || !name) {
            console.error('Attempted to add game without required fields');
            return res.status(400).json({ error: "Game ID and name are required" });
        }

        // Check if game already exists in database
        const existingGame = await Game.findOne({ igdbId: id });
        if (existingGame) {
            console.log(`Game ${id} already exists in collection`);
            return res.status(409).json({ error: "Game is already in the collection" });
        }

        // Create new game document
        const newGame = new Game({
            igdbId: id,
            name,
            cover,
            description,
            releaseDate,
            platforms,
            genres,
            rating: null,
            timePlayed: null
        });

        // Save to database
        const newGameId = (await newGame.save())._id;
        
        console.log(username)
        // taking username, and grabbing the userId from our database
        const userId = await User.findOne({username})
        console.log(userId)
        //check if collection exist
        const userCollection = await Collection.findOneAndUpdate({user: userId}, {$push: {games: newGameId}}, {upsert: true})

        await userCollection.save()

        console.log(`Added game ${name} (${id}) to collection`);
        res.status(201).json(newGame);
    } catch (error) {
        console.error('Error adding game to collection:', error);
        res.status(500).json({ error: 'Failed to add game to collection' });
    }
};

const updateCollection = (req, res) => {
    const { id } = req.params;
    const { rating, timePlayed } = req.body;
    console.log(`Updating game ${id} in collection`);
    const gameIndex = collections.findIndex(game => game.id == id);
    
    if (gameIndex === -1) {
        console.error(`Game ${id} not found in collection`);
        return res.status(404).json({ error: "Game not found in collections" });
    }

    collections[gameIndex] = {
        ...collections[gameIndex],
        rating: rating !== undefined ? rating : collections[gameIndex].rating,
        timePlayed: timePlayed !== undefined ? timePlayed : collections[gameIndex].timePlayed
    };

    console.log(`Successfully updated game ${id}`);
    res.json(collections[gameIndex]);
};

const deleteCollection = (req, res) => {
    const { id } = req.params;
    console.log(`Attempting to delete game ${id} from collection`);
    const index = collections.findIndex(game => game.id == id);
    if (index === -1) {
        console.error(`Game ${id} not found in collection`);
        return res.status(404).json({ error: "Game not found in collections" });
    }
    collections.splice(index, 1);
    console.log(`Successfully removed game ${id} from collection`);
    res.status(200).json({ message: "Game removed from collections" });
};

module.exports = { getAccessToken, fetchNewReleases, fetchTopRated, searchGames, getCollections, updateCollection, addToCollection, deleteCollection, sortCollections };
