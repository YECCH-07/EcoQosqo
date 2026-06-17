import React, { useCallback, useMemo, useState } from 'react';
import SplashScreen from './components/SplashScreen';
import LoginForm from './components/LoginForm';
import AdminPanel from './components/AdminPanel';
import ErrorBoundary from './components/ErrorBoundary';
import './styles.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  const [token, setToken] = useState(() => {
    try {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) return null;
      // Verificar expiración del JWT antes de aceptarlo
      const payload = JSON.parse(atob(savedToken.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
      return savedToken;
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) return null;
      const parsed = JSON.parse(savedUser);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  });

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  const handleSplashFinish = useCallback(() => {
    setAppReady(true);
    setTimeout(() => setShowSplash(false), 100);
  }, []);

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
    <ErrorBoundary>
      <div className={`app-container ${appReady ? 'app-visible' : ''}`}>
        {!isAuthenticated ? (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        ) : (
          <AdminPanel onLogout={handleLogout} user={user} />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
