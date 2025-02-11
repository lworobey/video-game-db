import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import "./Header.css";
import { FaDiscord, FaHome } from "react-icons/fa";

const Header = ({ toggleDarkMode }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setLocalSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [collections, setCollections] = useState([]);
  const [username, setUsername] = useState(null); // Manage user data state
  const [avatar, setAvatar] = useState(null); // Manage user avatar
  const searchRef = useRef(null);

  // Fetch collections on mount
  useEffect(() => {
    console.log("Fetching collections and checking user authentication...");
    
    // Check if the user is logged in by looking for the token and username in localStorage
    const token = localStorage.getItem("jwt_token");
    const storedUsername = localStorage.getItem("username");
    
    if (token) {
      console.log("Found JWT token and username...");
      if (storedUsername) {
        setUsername(storedUsername);
        fetchUserCollections(storedUsername, token);
      }
      
      // If token exists, fetch user data from the backend
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log("User data fetched successfully:", response.data);
          setUsername(response.data.username);
          localStorage.setItem("username", response.data.username);
          setAvatar(response.data.avatar);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setUsername(null);
          setAvatar(null);
        });
    } else {
      console.log("No JWT token found, user is not authenticated");
    }
  }, []);


  const fetchUserCollections = async (username, token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_GAME_SERVICE_URL}/api/collections?username=${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log("Collection response data:", response.data);
      setCollections(response.data.map(game => ({
        id: game.game.igdbId, 
        ...game
      })));
    } catch (error) {
      console.error("Error fetching user collections:", error);
    }
  };


  const handleSearch = async () => {
    if (!searchQuery) return;
    console.log("Searching for games with query:", searchQuery);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_GAME_SERVICE_URL}/api/search?query=${searchQuery}`
      );
      console.log("Search results received:", response.data);
      setLocalSearchResults(response.data);
      setShowDropdown(true);
    } catch (error) {
      console.error("Error searching for games:", error);
    }
  };

  // Check if a game is already in the collection
  const isGameInCollection = (gameId) => {
    const exists = collections.some((game) => game.game?.igdbId === gameId);
    console.log(`Checking if game ${gameId} is in collection:`, exists);
    return exists;
  };

  // Handle adding a game to collections
  const handleAddToCollection = async (game) => {
    if (isGameInCollection(game.id)) {
      console.log(`Game "${game.name}" is already in the collection.`);
      return;
    }

    console.log(`Attempting to add game "${game.name}" to collection...`);
    try {
      const token = localStorage.getItem('jwt_token');
      const username = localStorage.getItem('username');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      if (!username) {
        console.error('No username found');
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_GAME_SERVICE_URL}/api/collections`,
        {
          id: game.id,
          name: game.name,
          cover: game.cover ? game.cover.url : null,
          username: username
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Game added successfully:", response.data);
      // Fetch updated collections after adding a game
      await fetchUserCollections(username, token);
      setLocalSearchResults(prevResults =>
        prevResults.map((g) =>
          g.id === game.id ? { ...g, added: true } : g
        )
      );
      console.log(`Added "${game.name}" to collection!`);

      // Check if we're on the collection page and refresh if necessary
      if (window.location.pathname === '/collection' && window.refreshCollection) {
        console.log('On collection page, refreshing collection data...');
        await window.refreshCollection();
      }
    } catch (error) {
      console.error("Error adding game to collection:", error);
      if (error.response?.status === 401) {
        // Handle unauthorized error - could redirect to login or show message
        console.log("User not authenticated. Please log in.");
      }
    }
  };

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        console.log("Clicked outside search dropdown, closing...");
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle login by redirecting to the OAuth route
  const handleLogin = () => {
    console.log("Redirecting user to Discord login...");
    window.location.href = "http://localhost:3000/auth/login"; // Trigger OAuth login
  };

  // Handle logout by removing the JWT token from localStorage
  const handleLogout = () => {
    console.log("Logging out... Removing token from localStorage.");
    localStorage.removeItem("jwt_token"); // Remove the JWT token from localStorage
    localStorage.removeItem("username"); // Remove the username from localStorage
    setUsername(null); // Reset the username state
    setAvatar(null);
    window.location.href = "/"; // Redirect to the home page
  };

  // Handle URL redirection after OAuth login
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const username = urlParams.get('username');
    const avatar = urlParams.get('avatar');

    if (token) {
      console.log("Token and user info received in URL, storing in localStorage..."); 
      localStorage.setItem('jwt_token', token);
      if (username) {
        localStorage.setItem('username', username);
        setUsername(username);
      }
      if (avatar) {
        setAvatar(avatar);
      }
      console.log("Redirecting to home page...");
      window.location.href = "/";
    }
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
                    {game.cover && (
                      <img src={game.cover.url} alt={game.name} width="50" />
                    )}
                    <div className="game-actions">
                      <span className="average-rating">
                        Rating: {game.game?.rating ? game.game.rating.toFixed(1) : 'N/A'}
                      </span>
                      <button
                        className="add-button"
                        onClick={() => handleAddToCollection(game)}
                        disabled={isGameInCollection(game.id)}
                      >
                        {isGameInCollection(game.id) ? "✔ Added" : "+"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="button-container">
          <div className="user-info">
            {username ? (
              <div className="user-container">
                {avatar && (
                  <img 
                    src={avatar}
                    alt="Discord Avatar"
                    className="discord-avatar"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      marginBottom: "4px"
                    }}
                  />
                )}
                <p>Welcome, {username}</p>
                <button type="button" className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <button type="button" className="login-button" onClick={handleLogin}>
                Login with Discord <FaDiscord style={{ transform: "translateY(2.5px)" }} />
              </button>
            )}
          </div>

          <NavLink to="/" className="home-button">
            <button type="button" className="home-button">
              <FaHome /> Home
            </button>
          </NavLink>

          <NavLink to="/collection">
            <button type="button" className="collection-button">Collection</button>
          </NavLink>

          {/* Dark Mode Toggle */}
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>🌙</button> {/* Small moon icon for dark mode */}
        </div>
      </nav>
    </header>
  );
};

export default Header;