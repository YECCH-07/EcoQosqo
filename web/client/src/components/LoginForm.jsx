import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/login', { usuario, password });
      onLoginSuccess(response.data);
    } catch (err) {
      const backendMessage = err?.response?.data?.message;
      setError(backendMessage || 'No se pudo iniciar sesión. Verifique sus datos y la conexión con el servidor.');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-box">♻</div>
          <h1>EcoQosqo</h1>
          <p>Gestión Inteligente de Residuos</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="field-group">
            <label>Usuario</label>
            <div className="input-wrap">
              <span>👤</span>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                placeholder="Ingrese su usuario"
              />
            </div>
          </div>

          <div className="field-group">
            <label>Contraseña</label>
            <div className="input-wrap">
              <span>🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn">Iniciar Sesión</button>
        </form>

        <p className="login-footer">© 2026 EcoQosqo Operaciones</p>
      </div>
    </div>
  );
};

export default LoginForm;
