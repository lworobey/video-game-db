import './App.css'
import Login from '../pages/Login';
import Collection from '../pages/collection';
import { BrowserRouter, Routes, Route} from "react-router";
import Header from '../components/Header/header';
function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/collection" element={<Collection />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App