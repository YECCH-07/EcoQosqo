import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/theme';

export default function PlaceholderScreen({ route }) {
  const title = route.params?.title || route.name;

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons color={colors.primaryDark} name="construct-outline" size={30} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>Módulo en preparación.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: 24
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    height: 72,
    justifyContent: 'center',
    marginBottom: 18,
    width: 72
  },
  text: {
    color: colors.secondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center'
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center'
  }
});
