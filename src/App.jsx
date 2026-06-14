import React, { useEffect } from 'react';
import Login from './component/Login';
import Signup from './component/Signup';
import { initAurora } from './scripts/aurora';
import './styles/Auth.css';

function App() {
  const currentPath = window.location.pathname;

  useEffect(() => {
    // Initialize Aurora background
    setTimeout(() => {
      initAurora();
    }, 100);
  }, []);

  return (
    <div className="app">
      {currentPath === '/login' || currentPath === '/' ? <Login /> : <Signup />}
    </div>
  );
}

export default App;
