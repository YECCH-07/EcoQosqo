import React, { useMemo, useState } from 'react';
import LoginForm from './components/LoginForm';
import AdminPanel from './components/AdminPanel';
import './styles.css';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  const handleLoginSuccess = (loginPayload) => {
    // Compatibilidad: si algún backend aún manda solo token string
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

  if (!isAuthenticated) return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  return <AdminPanel onLogout={handleLogout} user={user} />;
}

export default App;
