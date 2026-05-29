import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, shadows } from '../styles/theme';

const menuItems = [
  { title: 'Horarios', description: 'Vista inicial del módulo', route: 'Horarios', icon: 'calendar-outline' },
  { title: 'Notificaciones', description: 'Centro de avisos', route: 'Notificaciones', icon: 'notifications-outline' },
  { title: 'Seguimiento', description: 'Espacio reservado', route: 'Seguimiento', icon: 'navigate-outline' },
  { title: 'Perfil', description: 'Datos de cuenta', route: 'Perfil', icon: 'person-outline' }
];

export default function DashboardScreen({ navigation }) {
  const { usuario, logout } = useAuth();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>App EcoQosqo</Text>
          <Text style={styles.headerCaption}>Gestión de residuos de Cusco</Text>
        </View>
        <Pressable onPress={logout} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>Salir</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.welcome}>
          <Text style={styles.welcomeText}>Bienvenido,</Text>
          <Text style={styles.userName}>{usuario?.nombre || 'Ciudadano'}</Text>
          <Text style={styles.role}>Rol: {usuario?.rol || 'CLIENTE'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Menú principal</Text>

        <View style={styles.grid}>
          {menuItems.map((item) => (
            <Pressable
              key={item.route}
              onPress={() => navigation.navigate(item.route, { title: item.title })}
              style={({ pressed }) => [styles.menuCard, pressed && styles.menuCardPressed]}
            >
              <View style={styles.menuIcon}>
                <Ionicons color={colors.primaryDark} name={item.icon} size={22} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  appName: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900'
  },
  content: {
    padding: 18,
    paddingBottom: 30
  },
  exitButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    minWidth: 72
  },
  exitButtonText: {
    color: colors.white,
    fontWeight: '800'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 24,
    paddingHorizontal: 18,
    paddingTop: 54
  },
  headerCaption: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    marginTop: 4
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    minHeight: 146,
    marginBottom: 12,
    padding: 16,
    width: '48%',
    ...shadows.card
  },
  menuCardPressed: {
    transform: [{ scale: 0.985 }]
  },
  menuDescription: {
    color: colors.secondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6
  },
  menuIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    marginBottom: 16,
    width: 42
  },
  menuTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800'
  },
  role: {
    color: colors.secondary,
    fontSize: 14,
    marginTop: 10
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
    marginTop: 22
  },
  userName: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 4
  },
  welcome: {
    backgroundColor: colors.surface,
    borderLeftColor: colors.accent,
    borderLeftWidth: 5,
    borderRadius: 8,
    padding: 18,
    ...shadows.card
  },
  welcomeText: {
    color: colors.secondary,
    fontSize: 15
  }
});
