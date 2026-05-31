import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TasksPage from './pages/TasksPage';
import { setCredentials } from './redux/authSlice';
import API from './api/axios';
import { useEffect } from 'react';

// Require Auth Wrapper
const ProtectedRoute = ({ children }) => {
  const { accessToken } = useSelector(state => state.auth);
  if (!accessToken) return <Navigate to="/login" replace />;
  return children;
};

// Auto-Login Check Wrapper
const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.post('/auth/token/refresh/');
        dispatch(setCredentials({ user: res.data.user, accessToken: res.data.access }));
      } catch (err) {
        // Not logged in, that's fine
      }
    };
    if (!document.cookie.includes('refresh_token')) {
      // If we know there's no cookie, skip refresh (optional optimization)
    }
    checkAuth();
  }, [dispatch]);

  return children;
};

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AppInitializer>
          <div className="bg-background min-h-screen text-textMain font-sans selection:bg-primary/30">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <TasksPage />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </AppInitializer>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
