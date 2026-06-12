import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, alpha } from '../styles/theme';
import Logo from '../components/Logo';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Logo size={120} />
      <Text style={styles.title}>EcoQosqo</Text>
      <Text style={styles.subtitle}>Gestión Ambiental Inteligente</Text>
      <View style={styles.loader}>
        <View style={styles.loaderFill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loader: {
    backgroundColor: alpha.white15,
    borderRadius: 999,
    height: 5,
    marginTop: 36,
    overflow: 'hidden',
    width: 160,
  },
  loaderFill: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 5,
    width: '68%',
  },
  subtitle: {
    color: alpha.white70,
    fontSize: 15,
    letterSpacing: 1,
    marginTop: 24,
    textAlign: 'center',
  },
  title: {
    color: colors.accent,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 20,
    textAlign: 'center',
  },
});
