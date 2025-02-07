import './App.css';
import Login from '../pages/Login';
import Collection from '../pages/collection';
import Home from '../pages/Home';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from '../components/Header/Header'
import { useState, useEffect } from 'react';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load the darkMode setting from localStorage
    const storedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(storedMode);
    if (storedMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.body.classList.toggle('dark', newDarkMode);
    // Store the user's preference in localStorage
    localStorage.setItem('darkMode', newDarkMode);
  };

  return (
    <BrowserRouter>
      <Header toggleDarkMode={toggleDarkMode} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/collection" element={<Collection />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
