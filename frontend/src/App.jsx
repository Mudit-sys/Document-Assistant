import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = (asAdmin) => {
    setIsAdmin(asAdmin);
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <Dashboard 
              isAdmin={isAdmin} 
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn} 
              handleLogin={handleLogin}
            />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
