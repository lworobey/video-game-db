const axios = require("axios");
const { getCachedToken } = require("../utils/tokenUtils");
const Game = require("../models/Game");
const User = require("../models/User");
const Collection = require("../models/Collection");
require("dotenv").config();

const getAccessToken = async (req, res) => {
  try {
    console.log("Attempting to get cached access token...");
    const token = await getCachedToken();
    console.log("Successfully retrieved cached token");
    res.json({ access_token: token });
  } catch (error) {
    console.error("Failed to fetch access token:", error);
    res.status(500).json({ error: "Failed to fetch access token" });
  }
};

const fetchNewReleases = async (req, res) => {
  try {
    console.log("Fetching new game releases...");
    const token = await getCachedToken();

    const now = Math.floor(Date.now() / 1000);
    const oneWeekAgo = now - 7 * 24 * 60 * 60;

    console.log(
      `Fetching releases between ${new Date(oneWeekAgo * 1000)} and ${new Date(
        now * 1000
      )}`
    );

    const response = await axios({
      url: "https://api.igdb.com/v4/release_dates",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
      data: `fields category,checksum,created_at,date,game,human,m,platform,region,status,updated_at,y;
                   where date >= ${oneWeekAgo} & date <= ${now};
                   sort date desc;`,
    });

    console.log(`Found ${response.data.length} release dates`);

    const gameIds = response.data.map((release) => release.game);
    console.log(`Fetching details for ${gameIds.length} games`);

    const gameDetailsResponse = await axios({
      url: "https://api.igdb.com/v4/games",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
      data: `fields name,cover.url,genres.name,rating,first_release_date;
                   where id = (${gameIds.join(",")});
                   sort first_release_date desc;`,
    });

    const suggestiveWords = [
      "sexy",
      "adult",
      "xxx",
      "erotic",
      "mature",
      "nsfw",
      "harem",
      "hentai",
      "porn",
      "sex",
    ];

    const games = gameDetailsResponse.data
      .filter(
        (game) =>
          !suggestiveWords.some((word) =>
            game.name.toLowerCase().includes(word)
          )
      )
      .map((game) => ({
        ...game,
        release_date: response.data.find((release) => release.game === game.id)
          ?.date,
        cover: game.cover
          ? {
              ...game.cover,
              url: game.cover.url
                .replace("t_thumb", "t_cover_big")
                .replace("//", "https://"),
            }
          : null,
      }));

    console.log(`Returning ${games.length} filtered games`);
    res.json(games);
  } catch (error) {
    console.error("Error fetching new releases:", error);
    res.status(500).json({ error: "Failed to fetch new releases" });
  }
};

const fetchTopRated = async (req, res) => {
  try {
    console.log("Fetching top rated games...");
    const topRated = await Game.find({ rating: { $ne: null } })
      .sort({ rating: -1 })
      .limit(10);

    // Get IGDB token
    const token = await getCachedToken();

    // Get cover images for each game
    const gamesWithCovers = await Promise.all(topRated.map(async (game) => {
      try {
        // Fetch cover from IGDB using game name
        const response = await axios({
          url: "https://api.igdb.com/v4/games",
          method: "POST",
          headers: {
            Accept: "application/json",
            "Client-ID": process.env.TWITCH_CLIENT_ID,
            Authorization: `Bearer ${token}`,
          },
          data: `search "${game.name}"; fields name,cover.url; limit 1;`,
        });

        if (response.data && response.data[0] && response.data[0].cover) {
          return {
            ...game.toObject(),
            cover: {
              url: response.data[0].cover.url.replace("t_thumb", "t_cover_big").replace("//", "https://")
            }
          };
        }
        return game;
      } catch (error) {
        console.error(`Error fetching cover for ${game.name}:`, error);
        return game;
      }
    }));

    res.status(200).json({ data: gamesWithCovers });
  } catch (error) {
    console.error("Error fetching top rated games:", error);
    res.status(500).json({ error: "Failed to fetch top rated games" });
  }
};

const searchGames = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      console.error("Search attempted without query parameter");
      return res.status(400).json({ error: "Query parameter is required" });
    }

    console.log(`Searching for games with query: "${query}"`);
    const token = await getCachedToken();
    const clientId = process.env.TWITCH_CLIENT_ID;

    const response = await axios.post(
      "https://api.igdb.com/v4/games",
      `search "${query}"; fields name,cover.url,genres.name,rating; limit 10;`,
      {
        headers: {
          "Client-ID": clientId,
          Authorization: `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
      }
    );

    console.log(`Found ${response.data.length} games matching query`);

    // For each IGDB game, check if we have it in our database
    const gamesWithRatings = await Promise.all(
      response.data.map(async (igdbGame) => {
        const dbGame = await Game.findOne({ igdbId: igdbGame.id });
        return {
          ...igdbGame,
          game: dbGame // Add our database game info if it exists
        };
      })
    );

    res.json(gamesWithRatings);
  } catch (error) {
    console.error("Error searching games:", error);
    res.status(500).json({ error: "Failed to fetch games" });
  }
};

const getCollections = async (req, res) => {
  try {
    console.log("Fetching collections...");
    console.log("Query parameters:", req.query);
    const { sort } = req.query;
    const { username } = req.query;
    console.log("Username:", username);

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let collections = await Collection.findOne({ user: user._id })
      .populate("games.game")
      .populate({ path: "user", select: "username" });

    if (!collections) {
      return res.json([]);
    }

    let sortedGames = collections.games;
    if (sort) {
      console.log(`Sorting collections by: ${sort}`);
      sortedGames = sortCollections(sortedGames, sort);
    }

    console.log(`Returning ${sortedGames.length} collections`);
    res.json(sortedGames);
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
};

const sortCollections = (games, sortOption) => {
  console.log(`Sorting collections with option: ${sortOption}`);
  switch (sortOption) {
    case "none":
      return games;
    case "az":
      return games.sort((a, b) =>
        (a.game?.name || "").localeCompare(b.game?.name || "")
      );
    case "za":
      return games.sort((a, b) =>
        (b.game?.name || "").localeCompare(a.game?.name || "")
      );
    case "mostPlayed":
      return games.sort((a, b) => (b.timePlayed || 0) - (a.timePlayed || 0));
    case "leastPlayed":
      return games.sort((a, b) => (a.timePlayed || 0) - (b.timePlayed || 0));
    case "highestRated":
      return games.sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
    case "lowestRated":
      return games.sort((a, b) => (a.userRating || 0) - (b.userRating || 0));
    default:
      return games;
  }
};

const addToCollection = async (req, res) => {
  try {
    const {
      id,
      username,
      name,
      cover,
      description,
      releaseDate,
      platforms,
      genres,
    } = req.body;

    if (!username) {
      console.error("Attempted to add game without user data");
      return res
        .status(400)
        .json({ error: "Requires an account to create collection" });
    }

    if (!id || !name) {
      console.error("Attempted to add game without required fields");
      return res.status(400).json({ error: "Game ID and name are required" });
    }

    // Find or create the game in the games collection
    const gameToAdd = await Game.findOneAndUpdate(
      { igdbId: id },
      {
        name,
        platforms,
      },
      { upsert: true, new: true }
    );
    console.log(`Game document created/updated:`, gameToAdd);

    const userTrack = await User.findOne({ username });
    console.log(`Found user:`, userTrack);

    if (!userTrack) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the game is already in the user's collection
    const existingGame = await Collection.findOne({
      user: userTrack._id,
      "games.game": gameToAdd._id,
    });
    console.log(`Existing game check result:`, existingGame);

    if (existingGame) {
      console.log(`Game ${id} already exists in user's collection`);
      return res
        .status(409)
        .json({ error: "Game is already in your collection" });
    }

    // Add the game to the user's collection
    const userCollection = await Collection.findOneAndUpdate(
      { user: userTrack._id },
      {
        $push: {
          games: { game: gameToAdd._id, timePlayed: null, userRating: null },
        },
      },
      { upsert: true, new: true }
    ).populate("games.game");

    console.log(
      `Added game ${name} (${id}) to collection for user ${username}`
    );

    // Find the newly added game in the collection
    const addedGame = userCollection.games.find(
      (game) => game.game._id.toString() === gameToAdd._id.toString()
    );

    res.status(201).json(addedGame);
  } catch (error) {
    console.error("Error adding game to collection:", error);
    console.error("Full error details:", error);
    res.status(500).json({ error: "Failed to add game to collection" });
  }
};

const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, timePlayed, username } = req.body;
    console.log(`Updating game ${id} in collection for user ${username}`);

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedCollection = await Collection.findOneAndUpdate(
      {
        user: user._id,
        "games._id": id,
      },
      {
        $set: {
          "games.$.userRating": rating,
          "games.$.timePlayed": timePlayed,
        },
      },
      { new: true }
    ).populate("games.game");

    if (!updatedCollection) {
      return res.status(404).json({ error: "Game not found in collection" });
    }

    const updatedGame = updatedCollection.games.find(
      (game) => game._id.toString() === id
    );

    if (updatedGame && updatedGame.game) {
      // Find all ratings for this game across all collections
      const allCollections = await Collection.find({
        "games.game": updatedGame.game._id,
      });

      let totalRating = 0;
      let ratingCount = 0;

      allCollections.forEach((collection) => {
        collection.games.forEach((game) => {
          if (
            game.game.toString() === updatedGame.game._id.toString() &&
            game.userRating
          ) {
            totalRating += game.userRating;
            ratingCount++;
          }
        });
      });

      // Update the game's average rating
      if (ratingCount > 0) {
        const averageRating = totalRating / ratingCount;
        console.log(
          `Average rating calculation: total ${totalRating} / count ${ratingCount} = ${averageRating}`
        );
        await Game.findByIdAndUpdate(updatedGame.game._id, {
          rating: averageRating,
          lastUpdated: Date.now(),
        });
        console.log(
          `Updated average rating for game ${updatedGame.game._id} to ${averageRating}`
        );
      }
    }

    console.log(`Successfully updated game ${id} for user ${username}`);
    res.json(updatedGame);
  } catch (error) {
    console.error("Error updating collection:", error);
    res.status(500).json({ error: "Failed to update collection" });
  }
};

const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.query;
    console.log(
      `Attempting to delete game ${id} from collection for user ${username}`
    );

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // First get the collection to find the game's igdbId
    const collection = await Collection.findOne({
      user: user._id,
      "games._id": id,
    }).populate("games.game");

    if (!collection) {
      console.error(`Game ${id} not found in ${username}'s collection`);
      return res
        .status(404)
        .json({ error: "Game not found in your collection" });
    }

    // Get the game's igdbId before removing it
    const gameToRemove = collection.games.find(
      (game) => game._id.toString() === id
    );
    const igdbId = gameToRemove.game.igdbId;

    // Now remove the game from the user's collection
    const result = await Collection.findOneAndUpdate(
      {
        user: user._id,
        "games._id": id,
      },
      { $pull: { games: { _id: id } } },
      { new: true }
    );

    if (!result) {
      console.error(`Game ${id} not found in ${username}'s collection`);
      return res
        .status(404)
        .json({ error: "Game not found in your collection" });
    }

    // Recalculate average rating after removal
    const allCollections = await Collection.find({
      "games.game": gameToRemove.game._id,
    });

    let totalRating = 0;
    let ratingCount = 0;

    allCollections.forEach((collection) => {
      collection.games.forEach((game) => {
        if (
          game.game.toString() === gameToRemove.game._id.toString() &&
          game.userRating
        ) {
          totalRating += game.userRating;
          ratingCount++;
        }
      });
    });

    // Update the game's average rating
    if (ratingCount > 0) {
      const averageRating = totalRating / ratingCount;
      console.log(
        `After removal - Average rating calculation: total ${totalRating} / count ${ratingCount} = ${averageRating}`
      );
      await Game.findByIdAndUpdate(gameToRemove.game._id, {
        rating: averageRating,
        lastUpdated: Date.now(),
      });
      console.log(
        `Updated average rating for game ${igdbId} to ${averageRating}`
      );
    } else {
      // If no ratings left, set rating to null
      await Game.findByIdAndUpdate(gameToRemove.game._id, {
        rating: null,
        lastUpdated: Date.now(),
      });
      console.log(
        `No ratings left for game ${igdbId}, setting average rating to null`
      );
    }

    console.log(
      `Successfully removed game ${id} from ${username}'s collection`
    );
    res.status(200).json({ message: "Game removed from your collection" });
  } catch (error) {
    console.error("Error deleting from collection:", error);
    res.status(500).json({ error: "Failed to delete from collection" });
  }
};

module.exports = {
  getAccessToken,
  fetchNewReleases,
  fetchTopRated,
  searchGames,
  getCollections,
  updateCollection,
  addToCollection,
  deleteCollection,
  sortCollections,
};
