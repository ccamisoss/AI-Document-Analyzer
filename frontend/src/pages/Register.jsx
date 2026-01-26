import { useState } from 'react';
import authService from '../services/auth.service';
import './Auth.css';

function Register({ onRegisterSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authService.register(email, password);
      
      authService.saveToken(result.token);
      authService.saveUser(result.user);

      onRegisterSuccess(result.user);
    } catch (err) {
      setError(err.message || 'Error registering user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Sign Up</h1>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="form-input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="form-input"
              placeholder="Minimum 8 characters"
              required
              minLength={8}
            />
            <small className="form-hint">
              Password must be at least 8 characters
            </small>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="auth-button"
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
