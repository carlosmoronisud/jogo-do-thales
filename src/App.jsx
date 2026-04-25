// src/App.jsx (com hash router para Vercel)
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import HubPage from './pages/HubPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profiles" element={<ProfilePage />} />
        <Route path="/hub" element={<HubPage />} />
      </Routes>
    </Router>
  )
}

export default App