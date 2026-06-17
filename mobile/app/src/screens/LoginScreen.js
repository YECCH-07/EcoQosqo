import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, shadows, alpha } from '../styles/theme';
import Logo from '../components/Logo';

function getErrorMessage(error) {
  return error?.response?.data?.message || 'No se pudo iniciar sesión. Verifica la conexión.';
}

export default function LoginScreen() {
  const { login } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emailValid = /\S+@\S+\.\S+/.test(correo.trim());
  const formValid = emailValid && password.length >= 6;

  async function handleLogin() {
    setError('');
    setInfo('');
    if (!formValid) {
      setError('Ingresa un correo válido y una contraseña de al menos 6 caracteres.');
      return;
    }
    try {
      setSubmitting(true);
      await login(correo.trim(), password, rememberMe);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  function handleForgotPassword() {
    setError('');
    setInfo('Para restablecer su contraseña, comuníquese con el administrador del sistema o envíe un correo a soporte@ecoqosqo.pe');
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        {/* Header / Logo */}
        <View style={styles.brand}>
          <Logo size={68} />
          <Text style={styles.title}>EcoQosqo</Text>
          <Text style={styles.subtitle}>Panel de Acceso · Gestión Ambiental</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Campo correo */}
          <Text style={styles.label}>Correo electrónico</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color={colors.muted} style={styles.inputIcon} />
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setCorreo}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={colors.muted}
              style={styles.inputField}
              value={correo}
            />
          </View>

          {/* Campo contraseña */}
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.muted} style={styles.inputIcon} />
            <TextInput
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              secureTextEntry={!showPassword}
              style={styles.inputField}
              value={password}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              hitSlop={8}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.muted}
              />
            </Pressable>
          </View>

          {/* Opciones: recordarme + olvidé contraseña */}
          <View style={styles.optionsRow}>
            <Pressable style={styles.rememberRow} onPress={() => setRememberMe(!rememberMe)}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Ionicons name="checkmark" size={14} color={colors.white} />}
              </View>
              <Text style={styles.rememberText}>Recordarme</Text>
            </Pressable>
            <Pressable onPress={handleForgotPassword}>
              <Text style={styles.forgotLink}>¿Olvidaste tu contraseña?</Text>
            </Pressable>
          </View>

          {/* Mensajes */}
          {info ? (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={colors.secondary} />
              <Text style={styles.infoText}>{info}</Text>
            </View>
          ) : null}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Botón */}
          <Pressable
            disabled={submitting}
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              submitting && styles.buttonDisabled,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="log-in-outline" size={18} color={colors.white} />
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
              </View>
            )}
          </Pressable>
        </View>

        <Text style={styles.footer}>&copy; 2026 EcoQosqo · Gestión Ambiental Inteligente</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    marginBottom: 28,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonPressed: { transform: [{ scale: 0.98 }] },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 32,
    ...shadows.card,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 4,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkboxChecked: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLight,
  },
  container: {
    backgroundColor: colors.primary,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerBg,
    borderColor: alpha.danger20,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    padding: 10,
  },
  errorText: {
    color: colors.danger,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  eyeButton: {
    padding: 4,
  },
  footer: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 24,
    textAlign: 'center',
  },
  forgotLink: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '500',
  },
  form: {
    // contenedor
  },
  infoBox: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    padding: 10,
  },
  infoText: {
    color: colors.secondary,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  inputField: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    height: 48,
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  label: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    height: 72,
    justifyContent: 'center',
    marginBottom: 18,
    padding: 12,
    width: 72,
  },
  logoImg: {
    height: '100%',
    width: '100%',
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rememberRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  rememberText: {
    color: colors.secondary,
    fontSize: 13,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
});
