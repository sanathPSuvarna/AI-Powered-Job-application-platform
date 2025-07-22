// frontend/src/pages/auth/Register.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './auth.css';

const Register = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'job_seeker' // Default value
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
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          userType: formData.userType
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/auth/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create an Account</h2>
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
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="userType">I am a:</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              required
            >
              <option value="job_seeker">Job Seeker</option>
              <option value="employer">Employer</option>
            </select>
          </div>

          <button type="submit" className="btn-primary">
            Register
          </button>
        </form>

        <div className="auth-links">
          <p>
            Already have an account?{' '}
            <Link to="/auth/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
