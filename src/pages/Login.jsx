import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user profile info using the access token
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();
        
        if (!userInfo.email.endsWith('@masaischool.com')) {
          setError('Access Denied: Only @masaischool.com accounts are allowed.');
          return;
        }

        login(tokenResponse.access_token, userInfo);
        navigate('/');
      } catch (err) {
        setError('Failed to fetch user profile.');
      }
    },
    onError: () => setError('Google Login Failed.'),
    scope: 'https://www.googleapis.com/auth/gmail.send',
  });

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="icon-wrapper bg-accent">
            <Mail size={28} color="white" />
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in with Google to send institutional emails directly from your account.</p>
        </div>
        
        <div className="login-form">
          {error && <p style={{ color: 'var(--danger)', marginBottom: '10px', textAlign: 'center' }}>{error}</p>}
          <button onClick={() => googleLogin()} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem' }}>
            Sign In with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
