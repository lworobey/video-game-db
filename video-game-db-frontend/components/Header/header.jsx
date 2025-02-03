import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import "./header.css";
import { FaDiscord, FaHome } from "react-icons/fa";

const Header = ({ setSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setLocalSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [collections, setCollections] = useState([]);
  const [username, setUsername] = useState(null); // Manage user data state
  const searchRef = useRef(null);

  // Fetch collections on mount
  useEffect(() => {
    console.log("Fetching collections and checking user authentication...");
    // Fetch collections data
    axios
      .get("http://localhost:3001/api/collections")
      .then((response) => {
        console.log("Collections fetched successfully:", response.data);
        setCollections(response.data);
      })
      .catch((error) => console.error("Error fetching collections:", error));

    // Check if the user is logged in by looking for the token in localStorage
    const token = localStorage.getItem("jwt_token"); // Get token from localStorage
    if (token) {
      console.log("Found JWT token, fetching user data...");
      // If token exists, fetch user data from the backend
      axios
        .get("http://localhost:3000/api/user", {
          headers: { Authorization: `Bearer ${token}` }, // Send token in the Authorization header
        })
        .then((response) => {
          console.log("User data fetched successfully:", response.data);
          setUsername(response.data.username); // Set username if logged in
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setUsername(null); // Reset username if the token is invalid or expired
        });
    } else {
      console.log("No JWT token found, user is not authenticated");
    }
  }, []);

  // Handle search input and fetch results
  const handleSearch = async () => {
    if (!searchQuery) return;
    console.log("Searching for games with query:", searchQuery);
    try {
      const response = await axios.get(
        `http://localhost:3001/api/search?query=${searchQuery}`
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
    const exists = collections.some((game) => game.id === gameId);
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
      const response = await axios.post("http://localhost:3001/api/collections", {
        id: game.id,
        name: game.name,
        cover: game.cover ? game.cover.url : null,
      });

      console.log("Game added successfully:", response.data);
      setCollections([...collections, response.data]); // Update collection state
      setLocalSearchResults(
        searchResults.map((g) =>
          g.id === game.id ? { ...g, added: true } : g
        )
      );
      console.log(`Added "${game.name}" to collection!`);
    } catch (error) {
      console.error("Error adding game to collection:", error);
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
    setUsername(null); // Reset the username state
    window.location.href = "/"; // Redirect to the home page
  };

  // Handle URL redirection after OAuth login
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token'); // Get token from URL

    if (token) {
      console.log("Token received in URL, storing in localStorage..."); 
      localStorage.setItem('jwt_token', token); // Store token in localStorage
      console.log("Redirecting to home page...");
      window.location.href = "/"; // Redirect to home after storing token
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
          <div className="user-info">
            {username ? (
              <div className="user-container">
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
        </div>
      </nav>
    </header>
  );
};

export default Header;
