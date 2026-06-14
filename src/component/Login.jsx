import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ScrollFloat from './ScrollFloat';
import '../styles/Auth.css';

gsap.registerPlugin(ScrollTrigger);

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const authCardRef = useRef(null);

  useEffect(() => {
    const card = authCardRef.current;
    
    if (card) {
      card.style.animation = 'none';
      
      const animation = gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          delay: 0.2
        }
      );

      return () => {
        animation.kill();
      };
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      });

      const text = await response.text();
      
      if (response.ok) {
        // Redirect to enhancement page
        window.location.href = '/enhance_page';
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Aurora Background */}
      <canvas id="auroraCanvas" className="aurora-bg"></canvas>

      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="float-element float-1"></div>
        <div className="float-element float-2"></div>
        <div className="float-element float-3"></div>
        <div class="float-element float-4"></div>
        <div class="float-element float-5"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="top-nav">
        <a href="/" className="nav-brand">Subaquatic AI</a>
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <a href="/about" className="nav-link">About</a>
          <div className="nav-auth">
            <a href="/login" className="nav-link login-nav-btn active">Login</a>
            <a href="/signup" className="nav-link signup-nav-btn">Sign Up</a>
          </div>
        </div>
      </nav>

      {/* Auth Section */}
      <section className="auth-section">
        <div className="auth-card login-card" ref={authCardRef}>
          <h2>SIGN IN</h2>
          <p className="auth-desc">Sign in to your account to continue enhancing your images</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="username" className="input-label">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Enter your username"
                required
              />
              <div className="input-underline"></div>
            </div>

            <div className="input-group">
              <label htmlFor="password" className="input-label">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
              <div className="input-underline"></div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="auth-button login-button" disabled={loading}>
              <span className="button-text">{loading ? 'Signing In...' : 'Sign In'}</span>
              <span className="button-glow"></span>
            </button>
          </form>

          <div className="auth-divider">
            <span>New here?</span>
          </div>

          <a href="/signup" className="auth-link signup-link">
            Create an account
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
