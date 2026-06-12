import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, shadows, alpha } from '../styles/theme';

const menuItems = [
  { title: 'Ruta de hoy', description: 'Horario y camión asignado', route: 'Horarios', icon: 'navigate-circle-outline' },
  { title: 'Ver Rutas', description: 'Consulta zonas y recorridos', route: 'VerRutas', icon: 'map-outline' },
  { title: 'Seguimiento', description: 'Ubicación del camión', route: 'Seguimiento', icon: 'location-outline' },
  { title: 'Reportes', description: 'Registrar incidencias', route: 'Reportes', icon: 'document-text-outline' },
  { title: 'Notificaciones', description: 'Centro de avisos', route: 'Notificaciones', icon: 'notifications-outline' },
  { title: 'Perfil', description: 'Datos de cuenta', route: 'Perfil', icon: 'person-outline' },
];

export default function DashboardScreen({ navigation }) {
  const { usuario, logout } = useAuth();

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appName}>EcoQosqo</Text>
          <Text style={styles.headerCaption}>Gestión de residuos · Cusco</Text>
        </View>
        <Pressable onPress={logout} style={styles.exitButton}>
          <Ionicons name="log-out-outline" size={18} color={colors.white} />
          <Text style={styles.exitText}>Salir</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Bienvenida */}
        <View style={styles.welcome}>
          <View style={styles.welcomeBar} />
          <View style={styles.welcomeBody}>
            <Text style={styles.welcomeLabel}>Bienvenido</Text>
            <Text style={styles.userName}>{usuario?.nombre || 'Ciudadano'}</Text>
            <Text style={styles.roleText}>Rol: {usuario?.rol || 'CIUDADANO'}</Text>
          </View>
        </View>

        {/* Menú */}
        <Text style={styles.sectionTitle}>Menú principal</Text>

        <View style={styles.grid}>
          {menuItems.map((item) => (
            <Pressable
              key={item.route}
              onPress={() => navigation.navigate(item.route, { title: item.title })}
              style={({ pressed }) => [styles.menuCard, pressed && styles.menuCardPressed]}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={22} color={colors.primaryLight} />
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
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 18,
    paddingBottom: 30,
  },
  exitButton: {
    alignItems: 'center',
    backgroundColor: alpha.white15,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  exitText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 22,
    paddingHorizontal: 18,
    paddingTop: 52,
  },
  headerCaption: {
    color: alpha.white70,
    fontSize: 12,
    marginTop: 3,
  },
  headerLeft: {
    flex: 1,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
    padding: 16,
    width: '48%',
    ...shadows.card,
  },
  menuCardPressed: {
    borderColor: colors.primaryLight,
    transform: [{ scale: 0.985 }],
  },
  menuDescription: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  menuIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    marginBottom: 12,
    width: 42,
  },
  menuTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  roleText: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
    marginTop: 6,
  },
  userName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  welcome: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 20,
    overflow: 'hidden',
    ...shadows.card,
  },
  welcomeBar: {
    backgroundColor: colors.primaryLight,
    width: 5,
  },
  welcomeBody: {
    flex: 1,
    padding: 16,
  },
  welcomeLabel: {
    color: colors.muted,
    fontSize: 13,
  },
});
