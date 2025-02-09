import React, { useState, useEffect } from "react";
import axios from "axios";
import './home.css'; // Ensure you have the correct styling
import placeholderImage from '../src/assets/placeholder.png';  // Add this import

const Home = () => {
  const [newReleases, setNewReleases] = useState([]);
  const [topRated, setTopRated] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        console.log('Fetching new releases and top rated games...');
        
        // Fetch New Releases (direct from IGDB API)
        const newReleasesResponse = await axios.get('http://localhost:3001/api/new-releases');
        console.log('Successfully fetched new releases:', newReleasesResponse.data);
        setNewReleases(newReleasesResponse.data);

        // Fetch Top Rated Games from our database
        const topRatedResponse = await axios.get('http://localhost:3001/api/top-rated');
        console.log('Successfully fetched top rated games:', topRatedResponse.data);
        setTopRated(topRatedResponse.data.data); // Note: response includes data in { data: [...] }
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

      {/* Updated Top Rated Games Section */}
      <div className="category-section">
        <h2>Top Rated</h2>
        {topRated.length > 0 ? (
          <div className="games-list">
            {topRated.map((game) => {
              console.log('Rendering top rated game:', game.name);
              return (
                <div key={game._id} className="game-item">
                  <img 
                    src={game.cover?.url || placeholderImage} 
                    alt={game.name} 
                    className="game-image" 
                    onError={(e) => {
                      console.error(`Failed to load image for game: ${game.name}`);
                      e.target.src = placeholderImage;
                    }}
                  />
                  <div className="game-details">
                    <h3>{game.name}</h3>
                    <p>Rating: {game.rating ? game.rating.toFixed(1) : 'N/A'}</p>
                    {game.platforms && (
                      <p>Platforms: {Array.isArray(game.platforms) ? game.platforms.join(', ') : game.platforms}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>Loading top rated games...</p>
        )}
      </div>
    </div>
  );
};

export default Home;
