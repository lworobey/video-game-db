import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './home.css';

const Home = () => {
  const [newReleases, setNewReleases] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [trending, setTrending] = useState([]);

  // Fetch game data for each category
  useEffect(() => {
    const fetchGamesByCategory = async () => {
      try {
        // Fetch New Releases 
       // const newReleasesResponse = await axios.get('http://localhost:3001/api/search?query=new+releases');
       // setNewReleases(newReleasesResponse.data);

        // Fetch Top Rated games
       // const topRatedResponse = await axios.get('http://localhost:3001/api/search?query=top+rated');
       // setTopRated(topRatedResponse.data);

        // Fetch Trending games 
     //   const trendingResponse = await axios.get('http://localhost:3001/api/search?query=trending');
     //   setTrending(trendingResponse.data);
      } catch (error) {
        console.error('Error fetching game categories:', error);
      }
    };

    fetchGamesByCategory();
  }, []);

  return (
    <div className="home">
      <h1>Welcome to the Video Game Database</h1>

      {/* Display New Releases */}
      <div className="category-section">
        <h2>New Releases</h2>
        <div className="games-list">
          {newReleases.length > 0 ? (
            newReleases.map((game) => (
              <div key={game.id} className="game-item">
                <img src={game.cover?.url} alt={game.name} width="100" />
                <div className="game-info">
                  <h3>{game.name}</h3>
                  <p>Genres: {game.genres?.map(genre => genre.name).join(', ')}</p>
                  <p>Rating: {game.rating || 'N/A'}</p>
                </div>
              </div>
            ))
          ) : (
            <p>Loading new releases...</p>
          )}
        </div>
      </div>

      {/* Display Top Rated Games */}
      <div className="category-section">
        <h2>Top Rated</h2>
        <div className="games-list">
          {topRated.length > 0 ? (
            topRated.map((game) => (
              <div key={game.id} className="game-item">
                <img src={game.cover?.url} alt={game.name} width="100" />
                <div className="game-info">
                  <h3>{game.name}</h3>
                  <p>Genres: {game.genres?.map(genre => genre.name).join(', ')}</p>
                  <p>Rating: {game.rating || 'N/A'}</p>
                </div>
              </div>
            ))
          ) : (
            <p>Loading top rated games...</p>
          )}
        </div>
      </div>

      {/* Display Trending Games */}
      <div className="category-section">
        <h2>Trending</h2>
        <div className="games-list">
          {trending.length > 0 ? (
            trending.map((game) => (
              <div key={game.id} className="game-item">
                <img src={game.cover?.url} alt={game.name} width="100" />
                <div className="game-info">
                  <h3>{game.name}</h3>
                  <p>Genres: {game.genres?.map(genre => genre.name).join(', ')}</p>
                  <p>Rating: {game.rating || 'N/A'}</p>
                </div>
              </div>
            ))
          ) : (
            <p>Loading trending games...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
