import React, { useMemo, useState } from 'react';
import SplashScreen from './components/SplashScreen';
import LoginForm from './components/LoginForm';
import AdminPanel from './components/AdminPanel';
import './styles.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  const handleSplashFinish = () => {
    setAppReady(true);
    setTimeout(() => setShowSplash(false), 100);
  };

  const handleLoginSuccess = (loginPayload) => {
    if (typeof loginPayload === 'string') {
      localStorage.setItem('token', loginPayload);
      setToken(loginPayload);
      return;
    }

    const jwtToken = loginPayload?.token;
    const authUser = loginPayload?.user || null;

    if (jwtToken) {
      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
    }

    if (authUser) {
      localStorage.setItem('user', JSON.stringify(authUser));
      setUser(authUser);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <div className={`app-container ${appReady ? 'app-visible' : ''}`}>
      {!isAuthenticated ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <AdminPanel onLogout={handleLogout} user={user} />
      )}
    </div>
  );
}

export default App;
