import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import "./header.css";
import { FaDiscord, FaHome } from "react-icons/fa"; 

const Header = ({ setSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setLocalSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [collections, setCollections] = useState([]);
  const searchRef = useRef(null);

  // Fetch collections on mount
  useEffect(() => {
    axios.get("http://localhost:3001/api/collections")
      .then((response) => setCollections(response.data))
      .catch((error) => console.error("Error fetching collections:", error));
  }, []);

  // Handle search input and fetch results
  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const response = await axios.get(`http://localhost:3001/api/search?query=${searchQuery}`);
      setLocalSearchResults(response.data);
      setShowDropdown(true);
    } catch (error) {
      console.error("Error searching for games:", error);
    }
  };

  // Check if a game is already in the collection
  const isGameInCollection = (gameId) => {
    return collections.some((game) => game.id === gameId);
  };

  // Handle adding a game to collections
  const handleAddToCollection = async (game) => {
    if (isGameInCollection(game.id)) {
      console.log(`Game "${game.name}" is already in the collection.`);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/api/collections", {
        id: game.id,
        name: game.name,
        cover: game.cover ? game.cover.url : null
      });

      setCollections([...collections, response.data]); // Update collection state
      // Update search results to reflect the "Added" status
      setLocalSearchResults(searchResults.map(g => 
        g.id === game.id ? { ...g, added: true } : g
      ));
      console.log(`Added "${game.name}" to collection!`);
    } catch (error) {
      console.error("Error adding game to collection:", error);
    }
  };

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header">
      <h1>Video Game Database</h1>
      <nav>
        <div className="search-container" ref={searchRef}>
          <input
            type="text"
            placeholder="Search games..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
          />
          <button type="button" className="search-button" onClick={handleSearch}>
            Search
          </button>

          {/* Dropdown Search Results */}
          {showDropdown && searchResults.length > 0 && (
            <div className="search-dropdown">
              <ul>
                {searchResults.map((game) => (
                  <li key={game.id} className="search-item">
                    <strong>{game.name}</strong>
                    {game.cover && <img src={game.cover.url} alt={game.name} width="50" />}
                    <button 
                      className="add-button" 
                      onClick={() => handleAddToCollection(game)}
                      disabled={isGameInCollection(game.id)} // Disable button if game is already in collection
                    >
                      {isGameInCollection(game.id) ? "✔ Added" : "+"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="button-container">
          <NavLink to="/" className="home-button">
            <button type="button" className="home-button">
              <FaHome /> Home
            </button>
          </NavLink>

          <NavLink to="/collection">
            <button type="button" className="collection-button">Collection</button>
          </NavLink>
          <NavLink to="/login" className="login-button">
            Login with <FaDiscord />
          </NavLink>
        </div>
      </nav>
    </header>
  );
};

export default Header;
