import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ScrollFloat from './ScrollFloat';
import '../styles/Auth.css';

gsap.registerPlugin(ScrollTrigger);

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirm: false,
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(formData.username)}&email=${encodeURIComponent(formData.email)}&password=${encodeURIComponent(formData.password)}&confirm_password=${encodeURIComponent(formData.confirm_password)}`,
      });

      if (response.ok) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError('Username or email already exists');
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
            <a href="/login" className="nav-link login-nav-btn">Login</a>
            <a href="/signup" className="nav-link signup-nav-btn active">Sign Up</a>
          </div>
        </div>
      </nav>

      {/* Auth Section */}
      <section className="auth-section">
        <div className="auth-card signup-card" ref={authCardRef}>
          <h2>CREATE ACCOUNT</h2>
          <p className="auth-desc">Join us to enhance your underwater images</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="username" className="input-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input-field"
                placeholder="Choose a username"
                required
              />
              <div className="input-underline"></div>
            </div>

            <div className="input-group">
              <label htmlFor="email" className="input-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="your@email.com"
                required
              />
              <div className="input-underline"></div>
            </div>

            <div className="input-group">
              <label htmlFor="password" className="input-label">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword.password ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Min. 6 characters"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(prev => ({ ...prev, password: !prev.password }))}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
              <div className="input-underline"></div>
            </div>

            <div className="input-group">
              <label htmlFor="confirm_password" className="input-label">Confirm Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
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
            {success && <div className="success-message">{success}</div>}

            <button type="submit" className="auth-button signup-button" disabled={loading}>
              <span className="button-text">{loading ? 'Creating Account...' : 'Create Account'}</span>
              <span className="button-glow"></span>
            </button>
          </form>

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <a href="/login" className="auth-link login-link-signup">
            Sign in instead
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
