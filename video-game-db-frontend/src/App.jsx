import './App.css'
import Login from '../pages/Login';
import Collection from '../pages/collection';
import Home from '../pages/Home';  // Import the new homepage component
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from '../components/Header/header';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />  {/* Default route for homepage */}
        <Route path="/login" element={<Login />} />
        <Route path="/collection" element={<Collection />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
