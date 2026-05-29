import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/theme';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>EQ</Text>
      </View>
      <Text style={styles.title}>App EcoQosqo</Text>
      <Text style={styles.subtitle}>Gestión inteligente de residuos</Text>
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
    padding: 24
  },
  loader: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
    height: 6,
    marginTop: 34,
    overflow: 'hidden',
    width: 180
  },
  loaderFill: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 6,
    width: '68%'
  },
  logo: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 32,
    height: 96,
    justifyContent: 'center',
    marginBottom: 22,
    width: 96
  },
  logoText: {
    color: colors.primaryDark,
    fontSize: 34,
    fontWeight: '900'
  },
  subtitle: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center'
  },
  title: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center'
  }
});
