import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, shadows } from '../styles/theme';

const menuItems = [
  { title: 'Ruta de hoy', description: 'Horario y camion asignado', route: 'Horarios', icon: 'navigate-circle-outline' },
  { title: 'Ver Rutas', description: 'Consulta zonas y recorridos', route: 'VerRutas', icon: 'map-outline' },
  { title: 'Seguimiento', description: 'Ubicacion del camion', route: 'Seguimiento', icon: 'location-outline' },
  { title: 'Reportes', description: 'Registrar incidencias', route: 'Reportes', icon: 'document-text-outline' },
  { title: 'Notificaciones', description: 'Centro de avisos', route: 'Notificaciones', icon: 'notifications-outline' },
  { title: 'Perfil', description: 'Datos de cuenta', route: 'Perfil', icon: 'person-outline' }
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Buenos dias';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function getCurrentDate() {
  return new Date().toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    weekday: 'long'
  });
}

export default function DashboardScreen({ navigation }) {
  const { usuario, logout } = useAuth();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.menuButton}>
          <Ionicons color={colors.white} name="menu" size={32} />
        </Pressable>

        <View style={styles.brand}>
          <Text style={styles.appName}>App EcoQosqo</Text>
          <Text style={styles.headerCaption}>Gestion de residuos de Cusco</Text>
        </View>

        <View style={styles.truckBadge}>
          <Ionicons color={colors.primaryDark} name="bus-outline" size={28} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.date}>{getCurrentDate()}</Text>
            <Text style={styles.userName}>{usuario?.nombre || 'Ciudadano'}</Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate('Notificaciones')}
            style={styles.alertButton}
          >
            <Ionicons color={colors.white} name="notifications" size={30} />
          </Pressable>
        </View>

        <View style={styles.locationCard}>
          <View style={styles.locationLeft}>
            <Ionicons color={colors.primaryDark} name="location" size={28} />
            <View style={styles.locationText}>
              <Text style={styles.locationNumber}>346</Text>
              <Text style={styles.locationAddress}>Av Universitaria</Text>
            </View>
          </View>

          <View style={styles.weather}>
            <Text style={styles.temperature}>6.84°</Text>
            <Text style={styles.weatherLabel}>CELSIUS</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Mira lo que tenemos</Text>

        <View style={styles.grid}>
          {menuItems.map((item) => (
            <Pressable
              key={item.route}
              onPress={() => navigation.navigate(item.route, { title: item.title })}
              style={({ pressed }) => [styles.menuCard, pressed && styles.menuCardPressed]}
            >
              <View style={styles.menuIcon}>
                <Ionicons color={colors.primaryDark} name={item.icon} size={34} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={logout} style={styles.exitButton}>
          <Ionicons color={colors.primaryDark} name="log-out-outline" size={18} />
          <Text style={styles.exitButtonText}>Cerrar sesion</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  alertButton: {
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: 8,
    height: 72,
    justifyContent: 'center',
    marginLeft: 14,
    width: 72
  },
  appName: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '900'
  },
  brand: {
    flex: 1,
    marginHorizontal: 12
  },
  content: {
    padding: 18,
    paddingBottom: 30
  },
  date: {
    color: colors.white,
    fontSize: 25,
    fontWeight: '900',
    marginTop: 4
  },
  exitButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    height: 44,
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 18
  },
  exitButtonText: {
    color: colors.primaryDark,
    fontWeight: '800'
  },
  greeting: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '500'
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
    paddingBottom: 20,
    paddingHorizontal: 18,
    paddingTop: 50
  },
  headerCaption: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    marginTop: 4
  },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    padding: 18,
    ...shadows.card
  },
  heroText: {
    flex: 1
  },
  locationAddress: {
    color: colors.secondary,
    fontSize: 15,
    lineHeight: 20,
    marginTop: 3
  },
  locationCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 18,
    ...shadows.card
  },
  locationLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row'
  },
  locationNumber: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900'
  },
  locationText: {
    flex: 1,
    marginLeft: 12
  },
  menuButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44
  },
  menuCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 158,
    padding: 14,
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
    marginTop: 7,
    textAlign: 'center'
  },
  menuIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    height: 64,
    justifyContent: 'center',
    marginBottom: 14,
    width: 64
  },
  menuTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center'
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
    marginBottom: 14,
    marginTop: 22
  },
  temperature: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'right'
  },
  truckBadge: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    width: 58
  },
  userName: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10
  },
  weather: {
    alignItems: 'flex-end',
    marginLeft: 12
  },
  weatherLabel: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2
  }
});
