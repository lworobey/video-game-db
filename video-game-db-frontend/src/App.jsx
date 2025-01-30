import './App.css'
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import { BrowserRouter, Routes, Route} from "react-router";
import Header from '../components/Header/header';
function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
