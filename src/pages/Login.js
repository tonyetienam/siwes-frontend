import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegistering) {
      // --- REGISTRATION LOGIC ---
      try {
        const res = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role: 'student' }) // Defaults to student role
        });
        const data = await res.json();
        if (res.ok) {
          alert('Registration successful! Please login with your new account.');
          setIsRegistering(false); // Switch back to login view
          setPassword(''); // Clear password for security
        } else {
          alert('Registration failed: ' + (data.error || 'Email may already be in use.'));
        }
      } catch (err) {
        alert('Network error during registration.');
      }
    } else {
      // --- LOGIN LOGIC ---
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        alert('Login failed: ' + result.error);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isRegistering ? 'Create an Account' : 'SIWES Management Login'}</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Show Name input ONLY when registering */}
          {isRegistering && (
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          )}
          
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />

          <button type="submit" className="btn-primary">
            {isRegistering ? 'Sign Up' : 'Login'}
          </button>
        </form>

        {/* Toggle between Register and Login */}
        <p style={{ marginTop: '20px', cursor: 'pointer', color: '#3182ce', fontSize: '14px' }}>
          <span onClick={() => {
            setIsRegistering(!isRegistering);
            setName(''); // Reset name field when toggling
            setPassword(''); // Reset password field when toggling
          }}>
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;