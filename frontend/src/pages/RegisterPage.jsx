import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ username: '', email: '', password: '', password2: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.password2) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.username, form.email, form.password, form.password2);
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(' ') : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <div className="logo-icon">✓</div>
          <h1>TaskFlow</h1>
        </div>
        <p className="auth-subtitle">Create your free account</p>

        {error && <div className="error-banner">{error}</div>}

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="reg-username">Username</label>
            <input id="reg-username" name="username" type="text"
              placeholder="Choose a username"
              value={form.username} onChange={onChange} required autoFocus />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email <span style={{color:'var(--text2)',fontWeight:400}}>(optional)</span></label>
            <input id="reg-email" name="email" type="email"
              placeholder="you@example.com"
              value={form.email} onChange={onChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input id="reg-password" name="password" type="password"
                placeholder="Min 8 chars"
                value={form.password} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password2">Confirm</label>
              <input id="reg-password2" name="password2" type="password"
                placeholder="Repeat password"
                value={form.password2} onChange={onChange} required />
            </div>
          </div>

          <button id="register-submit" type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner-sm" /> : 'Create Account →'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
