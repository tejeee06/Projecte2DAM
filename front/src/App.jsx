import { Routes, Route } from 'react-router-dom' // 1. Importa Routes y Route
import WelcomePage from './components/WelcomePage/WelcomePage';
import Login from './components/Login/Login';
import Register from './components/Register/Register';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<WelcomePage />} />
      
        <Route path="/login" element={<Login />} />
        
        <Route path="/register" element={<Register />} />
        
      </Routes>
    </div>
  )
}

export default App