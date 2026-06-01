import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import API from '../api/axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1); // 1 = Register, 2 = Verify OTP
  const [form, setForm] = useState({ username: '', email: '', mobile_number: '', password: '', password2: '' });
  const [otp, setOtp] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onRegisterSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.password2) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await API.post('/auth/register/', form);

      setStep(2);
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(' ') : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await API.post('/auth/verify-registration/', { email: form.email, otp });
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Invalid OTP.');
      setLoading(false);
      return;
    }

    try {
      const res = await API.post('/auth/login/', { username: form.username, password: form.password });
      dispatch(setCredentials({ user: { username: form.username }, accessToken: res.data.access }));
      navigate('/');
    } catch (err) {
      console.error("Login Error:", err.response?.data);
      setError(err.response?.data?.detail || err.response?.data?.error || 'OTP Verified! But automatic login failed. Please go to the Login page manually.');
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
      navigate('/');
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
          <p className="text-textMuted text-sm mt-1">
            {step === 1 ? 'Create your free account' : 'Verify your email'}
          </p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {step === 1 ? (
          <>
            <form onSubmit={onRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Username</label>
                <input name="username" type="text"
                  placeholder="Choose a username"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-textMuted/50"
                  value={form.username} onChange={onChange} required autoFocus />
              </div>

              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Email</label>
                <input name="email" type="email"
                  placeholder="you@example.com"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-textMuted/50"
                  value={form.email} onChange={onChange} required />
              </div>

              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Mobile Number</label>
                <input name="mobile_number" type="tel"
                  placeholder="Enter your mobile number"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-textMuted/50"
                  value={form.mobile_number} onChange={onChange} required />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-textMuted mb-1">Password</label>
                  <input name="password" type="password"
                    placeholder="Min 8 chars"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-textMuted/50"
                    value={form.password} onChange={onChange} required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-textMuted mb-1">Confirm</label>
                  <input name="password2" type="password"
                    placeholder="Repeat"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-textMuted/50"
                    value={form.password2} onChange={onChange} required />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-primary hover:bg-primaryHover text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center mt-2 disabled:opacity-70">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Create Account →'}
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
                onError={() => setError('Google Registration Failed')}
                useOneTap
                shape="rectangular"
                theme="filled_black"
              />
            </div>

            <p className="text-center text-textMuted text-sm mt-8">
              Already have an account? <Link to="/login" className="text-primary hover:text-primaryHover font-medium">Sign in</Link>
            </p>
          </>
        ) : (
          <form onSubmit={onOtpSubmit} className="space-y-4">
            <div className="bg-success/10 border border-success/30 text-success text-sm p-3 rounded-lg mb-6 text-center">
              An OTP has been sent to <b>{form.email}</b>.
            </div>

            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Enter 6-Digit OTP</label>
              <input name="otp" type="text"
                placeholder="123456"
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-center tracking-widest text-lg text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-textMuted/50"
                value={otp} onChange={e => setOtp(e.target.value)} required autoFocus />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primaryHover text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center mt-2 disabled:opacity-70">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Verify & Login →'}
            </button>

            <button type="button" onClick={() => setStep(1)} className="w-full text-center text-textMuted text-sm mt-4 hover:text-white transition-colors">
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
