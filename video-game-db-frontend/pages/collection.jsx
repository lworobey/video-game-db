import './collection.css';
import { useState } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'; 

const Collection = () => {
  const [games, setGames] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [showAddGameForm, setShowAddGameForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [sortBy, setSortBy] = useState('');

  const fetchAccessToken = async () => {
    const url = "https://id.twitch.tv/oauth2/token";
    const params = new URLSearchParams();
    params.append("client_id", "jcfuukswakoquf5haw7f0j0bcyqn68");
    params.append("client_secret", "cqa6e00r17a2cm33rn2of1mlqed95z");
    params.append("grant_type", "client_credentials");
s
    const response = await fetch(url, {
      method: "POST",
      body: params,
    });
    const data = await response.json();
    return data.access_token;
  };

  const searchGames = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    const accessToken = await fetchAccessToken();
    const url = `https://api.twitch.tv/helix/search/categories?query=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Client-Id": "jcfuukswakoquf5haw7f0j0bcyqn68",
        },
      });
      const data = await response.json();
      setSearchResults(data.data || []);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const addGame = (game) => {
    const newGame = {
      id: game.id,
      title: game.name,
      icon: game.box_art_url.replace("{width}x{height}", "150x200"),
      systems: [],  // Keep this empty by default
      timePlayed: "0 hours",  // Default time played
      rating: 0,
    };
    setGames([...games, newGame]);
    setSearchResults([]);
    setSearchQuery("");
    setShowAddGameForm(false);
  };

  const handleUpdate = (index, system, rating, timePlayed) => {
    const updatedGames = [...games];
    if (system) {
      updatedGames[index].systems.push(system); 
    }
    if (rating >= 1 && rating <= 10) {
      updatedGames[index].rating = rating;
    }
    if (timePlayed) {
      updatedGames[index].timePlayed = timePlayed;  // Update time played
    }
    setGames(updatedGames);
    setEditMode({ ...editMode, [updatedGames[index].id]: false });
  };

  const handleRatingChange = (event, index) => {
    const value = event.target.value;
    if (value <= 10) {
      const updatedGames = [...games];
      updatedGames[index].rating = value;
      setGames(updatedGames);
    }
  };

  const handleTimePlayedChange = (event, index) => {
    const value = event.target.value;
    const updatedGames = [...games];
    updatedGames[index].timePlayed = value;
    setGames(updatedGames);
  };

  const toggleEditMode = (id) => {
    setEditMode({ ...editMode, [id]: !editMode[id] });
  };

  const removeSystem = (gameIndex, systemIndex) => {
    const updatedGames = [...games];
    updatedGames[gameIndex].systems.splice(systemIndex, 1);
    setGames(updatedGames);
  };

  const removeGame = (index) => {
    const updatedGames = games.filter((_, i) => i !== index);
    setGames(updatedGames);
  };

  const sortGames = (games, sortBy) => {
    switch (sortBy) {
      case 'A-Z':
        return [...games].sort((a, b) => a.title.localeCompare(b.title));
      case 'Z-A':
        return [...games].sort((a, b) => b.title.localeCompare(a.title));
      case 'Lowest Rated':
        return [...games].sort((a, b) => a.rating - b.rating);
      case 'Highest Rated':
        return [...games].sort((a, b) => b.rating - a.rating);
      case 'Most Time Played':
        return [...games].sort((a, b) => parseFloat(b.timePlayed) - parseFloat(a.timePlayed));
      case 'Least Time Played':
        return [...games].sort((a, b) => parseFloat(a.timePlayed) - parseFloat(b.timePlayed));
      default:
        return games;
    }
  };

  const sortedGames = sortGames(games, sortBy);

  return (
    <div className="collection container">
      <h1>My Game Library</h1>
      <button className="add-game-button" onClick={() => setShowAddGameForm(!showAddGameForm)}>
        <FaPlus /> Add Game
      </button>

      <div className="sorting-dropdown">
        <label htmlFor="sort-by">Sort By:</label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">None</option>
          <option value="A-Z">A-Z</option>
          <option value="Z-A">Z-A</option>
          <option value="Lowest Rated">Lowest Rated</option>
          <option value="Highest Rated">Highest Rated</option>
          <option value="Most Time Played">Most Time Played</option>
          <option value="Least Time Played">Least Time Played</option>
        </select>
      </div>

      {showAddGameForm && (
        <div className="add-game-form">
          <input
            type="text"
            placeholder="Search for a game..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchGames(e.target.value);
            }}
          />
          <div className="search-results">
            {searchResults.map((game) => (
              <div
                key={game.id}
                className="search-result-item"
                onClick={() => addGame(game)}
              >
                <img
                  src={game.box_art_url.replace("{width}x{height}", "150x200")}
                  alt={game.name}
                  className="search-result-image"
                />
                <div className="search-result-details">
                  <h3>{game.name}</h3>
                  <p>Platform: Twitch</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="game-library">
        {sortedGames.map((game, index) => (
          <div className="game-card" key={game.id}>
            <img src={game.icon} alt={game.title} className="game-icon" />
            <div className="game-details">
              <h2>{game.title}</h2>
              <p>
                <strong>Systems:</strong>
                {game.systems.map((system, systemIndex) => (
                  <span key={systemIndex} className="system-item">
                    {system}
                    {editMode[game.id] && (
                      <FaTrash
                        className="remove-system-icon"
                        onClick={() => removeSystem(index, systemIndex)}
                      />
                    )}
                  </span>
                ))}
              </p>
              <p><strong>Time Played:</strong> {game.timePlayed}</p>
              <p><strong>Rating:</strong> {game.rating}/10</p>

              <div className="edit-icon" onClick={() => toggleEditMode(game.id)}>
                <FaEdit />
              </div>

              {editMode[game.id] && (
                <button
                  className="remove-game-button"
                  onClick={() => removeGame(index)}
                >
                  <FaTrash /> Remove Game
                </button>
              )}

              {editMode[game.id] && (
                <div className="edit-form">
                  <input
                    type="text"
                    placeholder="Add system"
                    id={`system-input-${index}`}
                  />
                  <input
                    type="number"
                    placeholder="Rating (1-10)"
                    min="1"
                    max="10"
                    value={game.rating}
                    onChange={(e) => handleRatingChange(e, index)}
                    id={`rating-input-${index}`}
                  />
                  <input
                    type="text"
                    placeholder="Time Played (e.g., 5 hours)"
                    value={game.timePlayed}
                    onChange={(e) => handleTimePlayedChange(e, index)}
                    id={`time-played-input-${index}`}
                  />
                  <button
                    onClick={() => {
                      const systemInput = document.getElementById(`system-input-${index}`).value;
                      const ratingInput = document.getElementById(`rating-input-${index}`).value;
                      const timePlayedInput = document.getElementById(`time-played-input-${index}`).value;
                      handleUpdate(index, systemInput, parseInt(ratingInput), timePlayedInput);
                    }}
                    className="update-button"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Collection;
