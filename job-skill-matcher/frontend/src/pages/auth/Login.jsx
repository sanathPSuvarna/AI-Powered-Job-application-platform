// frontend/src/pages/auth/Login.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './auth.css';

const Login = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // State for error handling
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        // Redirect based on user type
        navigate(data.userType === 'job_seeker' ? '/jobseeker/dashboard' : '/employer/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to Job Skill Matcher</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn-primary">
            Login
          </button>
        </form>

        <div className="auth-links">
          <Link to="/auth/forgot-password">Forgot Password?</Link>
          <p>
            Don't have an account?{' '}
            <Link to="/auth/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
