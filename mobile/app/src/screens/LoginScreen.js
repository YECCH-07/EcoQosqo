import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, shadows } from '../styles/theme';

function getErrorMessage(error) {
  return error?.response?.data?.message || 'No se pudo iniciar sesión. Verifica la conexión.';
}

export default function LoginScreen() {
  const { login } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emailValid = /\S+@\S+\.\S+/.test(correo.trim());
  const formValid = emailValid && password.length >= 6;

  async function handleLogin() {
    setError('');

    if (!formValid) {
      setError('Ingresa un correo válido y una contraseña de al menos 6 caracteres.');
      return;
    }

    try {
      setSubmitting(true);
      await login(correo.trim(), password);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>EQ</Text>
        </View>
        <Text style={styles.title}>App EcoQosqo</Text>
        <Text style={styles.subtitle}>Ciudad limpia, gestión conectada.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setCorreo}
          placeholder="correo@ejemplo.com"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={correo}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          onChangeText={setPassword}
          placeholder="Tu contraseña"
          placeholderTextColor={colors.muted}
          secureTextEntry
          style={styles.input}
          value={password}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          disabled={submitting}
          onPress={handleLogin}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            submitting && styles.buttonDisabled
          ]}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    marginBottom: 28
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    marginTop: 22
  },
  buttonDisabled: {
    opacity: 0.72
  },
  buttonPressed: {
    transform: [{ scale: 0.99 }]
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800'
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: 22
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 18,
    ...shadows.card
  },
  input: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    height: 50,
    marginBottom: 14,
    paddingHorizontal: 14
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8
  },
  logo: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 24,
    height: 74,
    justifyContent: 'center',
    marginBottom: 16,
    width: 74
  },
  logoText: {
    color: colors.primaryDark,
    fontSize: 25,
    fontWeight: '900'
  },
  subtitle: {
    color: colors.secondary,
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center'
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center'
  }
});
