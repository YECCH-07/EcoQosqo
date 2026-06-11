import React, { useState } from 'react';
import axios from 'axios';
import { User, Lock, LogIn, Eye, EyeOff } from 'lucide-react';

const LoginForm = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setForgotMessage('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await axios.post(`${apiUrl}/login`, { usuario, password, rememberMe });
      onLoginSuccess(response.data);
    } catch (err) {
      const backendMessage = err?.response?.data?.message;
      setError(backendMessage || 'No se pudo iniciar sesión. Verifique sus datos y la conexión con el servidor.');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setError('');
    setForgotMessage(
      'Para restablecer su contraseña, comuníquese con el administrador del sistema o envíe un correo a soporte@ecoqosqo.pe'
    );
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <img
            src="/logo-cusco.svg"
            alt="EcoQosqo"
            className="login-logo"
          />
          <h1>EcoQosqo</h1>
          <p>Panel Administrativo &middot; Gestión Ambiental</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="field-group">
            <label htmlFor="usuario">Usuario</label>
            <div className="input-wrap">
              <User size={18} className="input-icon" />
              <input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                placeholder="Ingrese su usuario"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrap">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Recordarme</span>
            </label>
            <a href="#" onClick={handleForgotPassword} className="forgot-link">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {forgotMessage && <p className="login-info">{forgotMessage}</p>}
          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn">
            <LogIn size={18} />
            Iniciar Sesión
          </button>
        </form>

        <p className="login-footer">&copy; 2026 EcoQosqo &middot; Gestión Ambiental Inteligente</p>
      </div>
    </div>
  );
};

export default LoginForm;
