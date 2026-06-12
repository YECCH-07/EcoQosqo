import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/theme';

// Logo institucional EcoQosqo — escudo estilizado con iniciales
export default function Logo({ size = 72 }) {
  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: size * 0.22 }]}>
      <Text style={[styles.text, { fontSize: size * 0.36 }]}>EQ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  text: {
    color: colors.accent,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
