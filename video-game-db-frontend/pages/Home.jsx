import React, { useState, useEffect } from "react";
import axios from "axios";
import './home.css'; // Ensure you have the correct styling

const Home = () => {
  const [newReleases, setNewReleases] = useState([]);
  const [topRated, setTopRated] = useState([]); // Placeholder for top-rated games

  useEffect(() => {
    const fetchGames = async () => {
      try {
        console.log('Fetching new releases and top rated games...');
        
        // Fetch New Releases (direct from IGDB API)
        const newReleasesResponse = await axios.get('http://localhost:3001/api/new-releases');
        console.log('Successfully fetched new releases:', newReleasesResponse.data);
        setNewReleases(newReleasesResponse.data);

        // Fetch Top Rated Games (placeholder for future DB logic)
        const topRatedResponse = await axios.get('http://localhost:3001/api/top-rated');
        console.log('Successfully fetched top rated games:', topRatedResponse.data);
        setTopRated(topRatedResponse.data);
      } catch (error) {
        console.error('Error fetching games:', error);
        console.error('Error details:', error.response?.data || error.message);
      }
    };

    console.log('Home component mounted, initiating data fetch...');
    fetchGames();
  }, []);
  return (
    <div className="home">
      <h1>New Releases</h1>
      <div className="category-section">
        {newReleases.length > 0 ? (
          <div className="games-list">
            {newReleases.map((game) => {
              console.log('Rendering new release game:', game.name);
              return (
                <div key={game.id} className="game-item">
                  <img 
                    src={game.cover?.url} 
                    alt={game.name} 
                    className="game-image" 
                    onError={(e) => {
                      console.error(`Failed to load image for game: ${game.name}`);
                      e.target.src = 'fallback-image-url';
                    }}
                  />
                  <div className="game-details">
                    <h3>{game.name}</h3>
                    <p>Genres: {game.genres?.map(genre => genre.name).join(', ')}</p>
                    <p>Rating: {game.rating || 'N/A'}</p>
                    <p>Release Date: {new Date(game.release_date * 1000).toLocaleDateString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>Loading new releases...</p>
        )}
      </div>

      {/* Placeholder for Top Rated Games */}
      <div className="category-section">
        <h2>Top Rated</h2>
        {topRated.length > 0 ? (
          <ul className="game-list">
            {topRated.map((game) => {
              console.log('Rendering top rated game:', game.name);
              return (
                <li key={game.id} className="game-item">
                  <img 
                    src={game.cover?.url} 
                    alt={game.name} 
                    className="game-image" 
                    onError={(e) => {
                      console.error(`Failed to load image for game: ${game.name}`);
                      e.target.src = 'fallback-image-url';
                    }}
                  />
                  <div className="game-details">
                    <h3>{game.name}</h3>
                    <p>Genres: {game.genres?.map(genre => genre.name).join(', ')}</p>
                    <p>Rating: {game.rating || 'N/A'}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>Loading top rated games...</p>
        )}
      </div>
    </div>
  );
};

export default Home;
