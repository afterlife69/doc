import React from 'react';
import './pixelcanvas';
import './login.css';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
const nav = useNavigate();
  return (
    <div className="login-container">
      <div className="login-form">
        <h1 className="form-title">Welcome back!</h1>
        <form>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="login-button" onClick={() => nav('/home')}>
            Sign In
          </button>
        </form>
        <div className="additional-links">
          <Link to="/forgot-pass">Forgot password?</Link>
          <Link to="/signup">Sign up</Link>
        </div>
        
          <pixel-canvas
            data-gap="15"
            data-speed="20"
            data-colors="#e0f2fe, #7dd3fc, #0ea5e9"
          />
        
      </div>
    </div>
  );
}