import { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaEdit } from "react-icons/fa";
import "./collection.css";

const Collection = ({ setSearchResults }) => {
  const [collections, setCollections] = useState([]);
  const [editCollection, setEditCollection] = useState(null);
  const [newName, setNewName] = useState("");
  const [newRating, setNewRating] = useState(null); // Default rating is null
  const [newTimePlayed, setNewTimePlayed] = useState({
    hours: null, 
    minutes: null, 
    seconds: null
  }); // Default timePlayed values to null
  const [sortOption, setSortOption] = useState(""); // Add sort state

  useEffect(() => {
    axios.get(`http://localhost:3001/api/collections${sortOption ? `?sort=${sortOption}` : ''}`)
      .then((response) => {
        setCollections(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => console.error("Error fetching collections:", error));
  }, [sortOption]); // Add sortOption as dependency

  const handleEdit = (collection) => {
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
      const timePlayedInSeconds = newTimePlayed.hours * 3600 + newTimePlayed.minutes * 60 + newTimePlayed.seconds;
      const updatedCollection = { 
        name: newName, 
        rating: newRating === "" ? null : newRating, // If empty, fallback to null
        timePlayed: timePlayedInSeconds 
      };
      
      await axios.put(`http://localhost:3001/api/collections/${collectionId}`, updatedCollection);
      
      setCollections(collections.map(col =>
        col.id === collectionId ? { ...col, ...updatedCollection } : col
      ));
      setEditCollection(null);
    } catch (error) {
      console.error("Error updating collection:", error);
    }
  };

  const handleRemove = async (collectionId) => {
    try {
      await axios.delete(`http://localhost:3001/api/collections/${collectionId}`);
      setCollections(collections.filter(col => col.id !== collectionId));
      setSearchResults((prevSearchResults) =>
        prevSearchResults.map((game) =>
          game.id === collectionId ? { ...game, added: false } : game
        )
      );
    } catch (error) {
      console.error("Error removing game from collection:", error);
    }
  };

  const handleTimeChange = (field, value) => {
    // Ensure the value is a non-negative number, otherwise reset to 0
    const newValue = value < 0 ? 0 : value;
    setNewTimePlayed(prev => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const handleRatingChange = (value) => {
    // Ensure rating is between 1 and 10, or null if empty
    if (value === "") {
      setNewRating(null); // If empty, fallback to null
    } else if (value >= 1 && value <= 10) {
      setNewRating(value); // Set value if within range
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="collections-container">
      <h2>Game Collections</h2>
      
      <div className="sort-controls">
        <label>Sort by: </label>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="">None</option>
          <option value="az">A-Z</option>
          <option value="za">Z-A</option>
          <option value="highestRated">Highest Rated</option>
          <option value="lowestRated">Lowest Rated</option>
          <option value="mostTimePlayed">Most Time Played</option>
          <option value="leastTimePlayed">Least Time Played</option>
        </select>
      </div>

      <ul className="collections-list">
        {collections.map((collection) => (
          <li key={collection.id} className="collection-card">
            {editCollection === collection.id ? (
              <>
                <input 
                  className="edit-input"
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                />
                <div className="rating-input">
                  <label>Rating (1-10):</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={newRating || ""} // Show empty string if null
                    onChange={(e) => handleRatingChange(e.target.value)}
                    placeholder="Enter rating"
                  />
                </div>
                <div className="time-played-input">
                  <label>Time Played:</label>
                  <input
                    type="number"
                    placeholder="Hours"
                    value={newTimePlayed.hours || ""} // Show empty string if null
                    onChange={(e) => handleTimeChange('hours', e.target.value === "" ? null : parseInt(e.target.value))}
                  />
                  <input
                    type="number"
                    placeholder="Minutes"
                    value={newTimePlayed.minutes || ""} // Show empty string if null
                    onChange={(e) => handleTimeChange('minutes', e.target.value === "" ? null : parseInt(e.target.value))}
                  />
                  <input
                    type="number"
                    placeholder="Seconds"
                    value={newTimePlayed.seconds || ""} // Show empty string if null
                    onChange={(e) => handleTimeChange('seconds', e.target.value === "" ? null : parseInt(e.target.value))}
                  />
                </div>
                <button className="save-button" onClick={() => handleUpdate(collection.id)}>Save</button>
              </>
            ) : (
              <>
                <div className="collection-info">
                  <strong>{collection.name}</strong>
                  <p>Rating: {collection.rating || 'Not rated'}</p>
                  <p>Time Played: {formatTime(collection.timePlayed)}</p>
                  {collection.cover && <img className="collection-image" src={collection.cover} alt={collection.name} />}
                </div>
                <div className="action-buttons">
                  <button onClick={() => handleEdit(collection)} className="edit-button"><FaEdit /></button>
                  <button onClick={() => handleRemove(collection.id)} className="remove-button"><FaTrash /></button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Collection;
