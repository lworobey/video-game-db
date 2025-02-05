import React from 'react';
import { FaTrash, FaEdit } from "react-icons/fa";
import './GameCard.css';

const GameCard = ({ 
  game, 
  inCollection, 
  onRemoveFromCollection, 
  onEdit, 
  isEditing,
  onUpdate,
  newRating,
  onRatingChange,
  newTimePlayed,
  onTimeChange,
  formatTime 
}) => {

  
  // Access the game data directly since we've already structured it
  const name = game.name || game.gameId?.name || 'Unknown Game';
  const cover = game.cover?.url || game.gameId?.cover?.url;
  const rating = game.rating || game.userRating || 'N/A';
  const timePlayed = game.timePlayed || 0;


  return (
    <div className="game-card">
      {cover && (
        <img 
          src={cover} 
          alt={name} 
          className="game-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/200x300?text=No+Image';
          }}
        />
      )}
      <div className="game-info">
        <h3>{name}</h3>
        
        {isEditing ? (
          <div className="edit-form">
            <div className="rating-input">
              <label>Rating (1-10):</label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={newRating || ''}
                onChange={(e) => onRatingChange(e.target.value)}
              />
            </div>
            
            <div className="time-input">
              <label>Time Played:</label>
              <div className="time-fields">
                <input
                  type="number"
                  min="0"
                  value={newTimePlayed.hours || ''}
                  onChange={(e) => onTimeChange('hours', parseInt(e.target.value))}
                  placeholder="Hours"
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={newTimePlayed.minutes || ''}
                  onChange={(e) => onTimeChange('minutes', parseInt(e.target.value))}
                  placeholder="Minutes"
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={newTimePlayed.seconds || ''}
                  onChange={(e) => onTimeChange('seconds', parseInt(e.target.value))}
                  placeholder="Seconds"
                />
              </div>
            </div>
            
            <button onClick={onUpdate}>Save</button>
          </div>
        ) : (
          <>
            <p>Rating: {rating || 'N/A'}</p>
            <p>Time Played: {formatTime ? formatTime(timePlayed) : (timePlayed || '0h 0m 0s')}</p>
            <div className="action-buttons">
              <button onClick={() => onEdit(game)} className="edit-button">
                <FaEdit />
              </button>
              <button onClick={() => onRemoveFromCollection(game.id)} className="delete-button">
                <FaTrash />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GameCard; 