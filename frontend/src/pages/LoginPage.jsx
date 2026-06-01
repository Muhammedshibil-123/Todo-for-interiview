import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import API from '../api/axios';

export default function LoginPage() {
  const dispatch = useDispatch();
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
      const res = await API.post('/auth/login/', form);
      const user = { username: form.username }; 
      dispatch(setCredentials({ user, accessToken: res.data.access }));
      navigate('/', { replace: true });
    } catch {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/google/', { token: credentialResponse.credential });
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.access }));
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
    
      <div className="w-full max-w-md bg-surface border border-border p-8 rounded-2xl shadow-2xl z-10">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary text-white flex items-center justify-center rounded-xl text-2xl font-bold mb-4 shadow-lg shadow-primary/30">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">TaskFlow</h1>
          <p className="text-textMuted text-sm mt-1">Sign in to your workspace</p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">Username</label>
            <input name="username" type="text"
              placeholder="Enter username"
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-textMuted/50"
              value={form.username} onChange={onChange} required autoFocus />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-textMuted">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary hover:text-primaryHover transition-colors">Forgot Password?</Link>
            </div>
            <input name="password" type="password"
              placeholder="Enter password"
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-textMuted/50"
              value={form.password} onChange={onChange} required />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-primaryHover text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center mt-2 disabled:opacity-70">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Sign In →'}
          </button>
        </form>

        <div className="flex items-center my-6 gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-textMuted text-xs font-medium tracking-wider uppercase">or continue with</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={() => setError('Google Login Failed')}
            useOneTap
            shape="rectangular"
            theme="filled_black"
          />
        </div>
        
        <p className="text-center text-textMuted text-sm mt-8">
          No account? <Link to="/register" className="text-primary hover:text-primaryHover font-medium">Create one free</Link>
        </p>

      </div>
    </div>
  );
}
