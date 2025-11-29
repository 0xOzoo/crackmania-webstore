import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { MessageSquarePlus, Shield } from 'lucide-react';

import RequestModal from './components/RequestModal';
import AdminRequests from './pages/AdminRequests';
import './App.css';

import GameList from './components/GameList';

function Home() {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  return (
    <div className="container">
      <header className="header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      </header>

      <GameList />

      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/requests" element={<AdminRequests />} />
      </Routes>
    </Router>
  );
}

export default App;
