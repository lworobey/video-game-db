
import './header.css';
import { NavLink, Route, Routes } from "react-router";
import { FaDiscord } from "react-icons/fa";

const Header = () => {
    return (
      <header className="header">
        <h1>Video Game Database</h1>
        <nav>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search games..."
              className="search-input"
            />
            <button type="button" className="search-button">
              Search
            </button>
          </div>
          <div className="collection-container">
            <div className="dropdown">
              <NavLink to="/collection">
              <button type="button" className="collection-button">
                Collection
              </button>
              </NavLink>
              </div>
          </div>

          
          <div className="login-container">
            <NavLink to="/login" className="login-button">
            Login with Discord  <FaDiscord style={{transform: 'translateY(2.5px)'}} />
            </NavLink>
          </div>
        </nav>
      </header>
    );
  };
  
  export default Header;