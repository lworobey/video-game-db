import { useState, useEffect } from "react";
import axios from "axios";
// import { FaTrash, FaEdit } from "react-icons/fa";
import "./collection.css";
import GameCard from '../components/GameCard/GameCard';

const Collection = ({ setSearchResults }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("name"); // Default sort by name
  const [editCollection, setEditCollection] = useState(null);
  const [newName, setNewName] = useState("");
  const [newRating, setNewRating] = useState(null); // Default rating is null
  const [newTimePlayed, setNewTimePlayed] = useState({
    hours: null, 
    minutes: null, 
    seconds: null
  }); // Default timePlayed values to null

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const token = localStorage.getItem("jwt_token");
        if (!token) {
          setError("Please log in to view your collection");
          setLoading(false);
          return;
        }

        const username = localStorage.getItem("username");
        const response = await axios.get(`http://localhost:3001/api/collections?username=${username}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log("Collection response data:", response.data);
        
        // Sort the collections based on the selected option
        let sortedGames = [...response.data];
        
        // Map the data to ensure correct structure
        sortedGames = sortedGames.map(game => {
          return {
            id: game._id,
            name: game.gameId?.name || "Unknown Game",
            cover: game.gameId?.cover,
            rating: game.userRating,
            timePlayed: game.timePlayed,
            gameId: game.gameId,
            // Keep the original data for reference
            _original: game
          };
        });

        console.log("Games after mapping:", sortedGames);

        switch (sortOption) {
          case "name":
            sortedGames.sort((a, b) => {
              return (a.name || '').localeCompare(b.name || '');
            });
            break;
          case "rating":
            sortedGames.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
          case "releaseDate":
            sortedGames.sort((a, b) => {
              const dateA = a.released || a.gameId?.released || 0;
              const dateB = b.released || b.gameId?.released || 0;
              return new Date(dateB) - new Date(dateA);
            });
            break;
          default:
            break;
        }

        setCollections(sortedGames);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching collections:", error);
        setError("Failed to load collections");
        setLoading(false);
      }
    };

    fetchCollections();
  }, [sortOption]);

  const handleEdit = (collection) => {
    console.log('Editing collection:', collection);
    setEditCollection(collection.id);
    setNewName(collection.name);
    setNewRating(collection.rating); // Let it be null if not set
    setNewTimePlayed({
      hours: Math.floor(collection.timePlayed / 3600),
      minutes: Math.floor((collection.timePlayed % 3600) / 60),
      seconds: collection.timePlayed % 60,
    }); // Convert timePlayed (in seconds) to hours, minutes, and seconds
  };

  const handleUpdate = async (collectionId) => {
    try {
      console.log('Updating collection:', collectionId);
      const timePlayedInSeconds = 
        (newTimePlayed.hours || 0) * 3600 + 
        (newTimePlayed.minutes || 0) * 60 + 
        (newTimePlayed.seconds || 0);
      
      const username = localStorage.getItem("username");
      const updatedCollection = { 
        username,
        rating: newRating === "" ? null : parseFloat(newRating), // Convert to number or null
        timePlayed: timePlayedInSeconds 
      };
      
      console.log('Sending update with data:', updatedCollection);
      const token = localStorage.getItem("jwt_token");
      const response = await axios.put(
        `http://localhost:3001/api/collections/${collectionId}`, 
        updatedCollection,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setCollections(collections.map(col =>
        col.id === collectionId ? { 
          ...col, 
          rating: response.data.userRating,
          timePlayed: response.data.timePlayed,
        } : col
      ));
      setEditCollection(null);
      setError(null);
      console.log('Successfully updated collection');
    } catch (error) {
      console.error("Error updating collection:", error);
      setError("Failed to update collection. Please try again.");
    }
  };

  const handleRemove = async (collectionId) => {
    try {
      console.log('Removing collection:', collectionId);
      const token = localStorage.getItem("jwt_token");
      
      await axios.delete(
        `http://localhost:3001/api/collections/${collectionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setCollections(collections.filter(col => col.id !== collectionId));
      
      // Only update search results if the function exists
      if (setSearchResults) {
        setSearchResults((prevSearchResults) =>
          prevSearchResults.map((game) =>
            game.id === collectionId ? { ...game, added: false } : game
          )
        );
      }
      
      setError(null);
      console.log('Successfully removed collection');
    } catch (error) {
      console.error("Error removing game from collection:", error);
      setError("Failed to remove game. Please try again.");
    }
  };

  const handleTimeChange = (field, value) => {
    // Ensure the value is a non-negative number, otherwise reset to 0
    const newValue = value < 0 ? 0 : value;
    console.log(`Updating ${field} time to:`, newValue);
    setNewTimePlayed(prev => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const handleRatingChange = (value) => {
    console.log('Setting new rating:', value);
    // Ensure rating is between 1 and 10, or null if empty
    if (value === "") {
      setNewRating(null); // If empty, fallback to null
    } else {
      const numValue = parseFloat(value);
      if (numValue >= 1 && numValue <= 10) {
        setNewRating(numValue); // Set value if within range
      } else {
        console.warn('Invalid rating value:', value);
      }
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0h 0m 0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return <div className="loading">Loading your collection...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="collection-container">
      <h1>My Collection</h1>
      
      <div className="sort-controls">
        <label htmlFor="sort">Sort by: </label>
        <select 
          id="sort" 
          value={sortOption} 
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="name">Name</option>
          <option value="rating">Rating</option>
          <option value="releaseDate">Release Date</option>
        </select>
      </div>

      {collections.length === 0 ? (
        <div className="empty-collection">
          Your collection is empty. Add some games!
        </div>
      ) : (
        <div className="games-grid">
          {collections.map(game => (
            <GameCard
              key={game.id}
              game={game}
              inCollection={true}
              onRemoveFromCollection={() => handleRemove(game.id)}
              onEdit={() => handleEdit(game)}
              isEditing={editCollection === game.id}
              onUpdate={() => handleUpdate(game.id)}
              newRating={newRating}
              onRatingChange={handleRatingChange}
              newTimePlayed={newTimePlayed}
              onTimeChange={handleTimeChange}
              formatTime={formatTime}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Collection;
