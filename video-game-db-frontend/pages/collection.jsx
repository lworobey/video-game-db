import { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaEdit } from "react-icons/fa";
import "./collection.css";

const Collection = ({ setSearchResults }) => {
  const [collections, setCollections] = useState([]);
  const [editCollection, setEditCollection] = useState(null);
  const [newName, setNewName] = useState("");
  const [sortOption, setSortOption] = useState("az");

  useEffect(() => {
    fetchSortedCollections(sortOption);
  }, [sortOption]);

  const fetchSortedCollections = async (sortOption) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/collections?sort=${sortOption}`);
      setCollections(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleEdit = (collection) => {
    setEditCollection(collection.id);
    setNewName(collection.name);
  };

  const handleUpdate = async (collectionId) => {
    try {
      await axios.put(`http://localhost:3001/api/collections/${collectionId}`, { name: newName });
      setCollections(collections.map(col => col.id === collectionId ? { ...col, name: newName } : col));
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

  return (
    <div className="collections-container">
      <h2>Game Collections</h2>

      <div className="sorting-dropdown">
        <label htmlFor="sort">Sort By:</label>
        <select id="sort" value={sortOption} onChange={handleSortChange}>
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
                <button className="save-button" onClick={() => handleUpdate(collection.id)}>Save</button>
              </>
            ) : (
              <>
                <div className="collection-info">
                  <strong>{collection.name}</strong>
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
