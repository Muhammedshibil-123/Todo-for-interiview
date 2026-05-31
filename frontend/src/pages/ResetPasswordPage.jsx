import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', otp: '', new_password: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });
    try {
      const res = await API.post('/auth/reset-password/', form);
      setStatus({ loading: false, error: '', success: res.data.message });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setStatus({ 
        loading: false, 
        success: '', 
        error: err.response?.data?.error || 'Failed to reset password.' 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md bg-surface/80 backdrop-blur-xl border border-border p-8 rounded-2xl shadow-2xl z-10">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary text-white flex items-center justify-center rounded-xl text-2xl font-bold mb-4 shadow-lg shadow-primary/30">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">TaskFlow</h1>
          <p className="text-textMuted text-sm mt-1">Enter OTP and new password</p>
        </div>

        {status.error && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-sm p-3 rounded-lg mb-6">
            {status.error}
          </div>
        )}
        {status.success && (
          <div className="bg-success/10 border border-success/30 text-success text-sm p-3 rounded-lg mb-6">
            {status.success} Redirecting...
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">Email Address</label>
            <input name="email" type="email"
              placeholder="Enter your registered email"
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-textMuted/50"
              value={form.email} onChange={onChange} required autoFocus />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">6-Digit OTP</label>
            <input name="otp" type="text"
              placeholder="e.g. 123456"
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 tracking-widest text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-textMuted/50"
              value={form.otp} onChange={onChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">New Password</label>
            <input name="new_password" type="password"
              placeholder="Enter new password"
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-textMuted/50"
              value={form.new_password} onChange={onChange} required />
          </div>

          <button type="submit" disabled={status.loading}
            className="w-full bg-primary hover:bg-primaryHover text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center mt-2 disabled:opacity-70">
            {status.loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Reset Password →'}
          </button>
        </form>

        <p className="text-center text-textMuted text-sm mt-8">
          <Link to="/login" className="text-primary hover:text-primaryHover font-medium">Back to Sign in</Link>
        </p>
      </div>
    </div>
  );
}
