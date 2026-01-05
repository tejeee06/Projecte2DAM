import { Routes, Route } from 'react-router-dom'
import WelcomePage from './components/WelcomePage/WelcomePage';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import HomePage from './components/HomePage/HomePage';
import ProfilePage from './components/ProfilePage/ProfilePage';
import TripDetailsPage from './components/TripDetailsPage/TripDetailsPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<WelcomePage />} />
      
        <Route path="/login" element={<Login />} />
        
        <Route path="/register" element={<Register />} />

        <Route path="/homePage" element={<HomePage />} />
        
        <Route path="/profile" element={<ProfilePage />} />
        
        <Route path="/trip/:tripId" element={<TripDetailsPage />} />
      </Routes>
    </div>
  )
}

export default App