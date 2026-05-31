import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon">✓</div>
          <h1>TaskFlow</h1>
        </div>
        <p className="auth-subtitle">Sign in to your workspace</p>

        {error && <div className="error-banner">{error}</div>}

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              name="username"
              type="text"
              placeholder="Enter username"
              value={form.username}
              onChange={onChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={onChange}
              required
            />
          </div>

          <button id="login-submit" type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner-sm" /> : 'Sign In →'}
          </button>
        </form>

        <p className="auth-switch">
          No account? <Link to="/register">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
