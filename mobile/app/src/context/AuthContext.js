import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const TOKEN_KEY = 'ecoqosqo_token';
const USER_KEY = 'ecoqosqo_usuario';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY)
        ]);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUsuario(JSON.parse(storedUser));
        }
      } finally {
        setTimeout(() => setLoading(false), 900);
      }
    }

    restoreSession();
  }, []);

  async function login(correo, password) {
    const { data } = await api.post('/auth/login', { correo, password });

    await AsyncStorage.multiSet([
      [TOKEN_KEY, data.token],
      [USER_KEY, JSON.stringify(data.usuario)]
    ]);

    setToken(data.token);
    setUsuario(data.usuario);

    return data.usuario;
  }

  async function logout() {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setToken(null);
    setUsuario(null);
  }

  const value = useMemo(
    () => ({
      loading,
      login,
      logout,
      token,
      usuario
    }),
    [loading, token, usuario]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
