import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, shadows } from '../styles/theme';

const routes = [
  {
    id: 'R-01',
    name: 'Ruta Santiago Centro',
    schedule: 'Lun, Mie, Vie - 06:30 AM',
    stops: 'Callejon Retiro - Av. La Cultura - Wanchaq',
    status: 'Activa'
  },
  {
    id: 'R-02',
    name: 'Ruta San Sebastian',
    schedule: 'Mar, Jue, Sab - 07:00 AM',
    stops: 'Parque Industrial - Larapa - Naciones Unidas',
    status: 'Activa'
  },
  {
    id: 'R-03',
    name: 'Ruta Historico',
    schedule: 'Lun a Sab - 08:00 PM',
    stops: 'Plaza San Francisco - Av. Sol - San Pedro',
    status: 'Nocturna'
  }
];

export default function VerRutasScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.title}>Ver rutas</Text>
          <Text style={styles.subtitle}>Consulta recorridos, horarios y zonas disponibles.</Text>
        </View>
        <View style={styles.mapIcon}>
          <Ionicons color={colors.primaryDark} name="map-outline" size={34} />
        </View>
      </View>

      <View style={styles.filterRow}>
        <Pressable style={[styles.filterButton, styles.filterButtonActive]}>
          <Text style={[styles.filterText, styles.filterTextActive]}>Todas</Text>
        </Pressable>
        <Pressable style={styles.filterButton}>
          <Text style={styles.filterText}>Cerca</Text>
        </Pressable>
        <Pressable style={styles.filterButton}>
          <Text style={styles.filterText}>Hoy</Text>
        </Pressable>
      </View>

      {routes.map((route) => (
        <Pressable
          key={route.id}
          onPress={() => navigation.navigate('Horarios', { title: route.name })}
          style={({ pressed }) => [styles.routeCard, pressed && styles.routeCardPressed]}
        >
          <View style={styles.routeTop}>
            <View style={styles.routeIcon}>
              <Ionicons color={colors.primaryDark} name="bus-outline" size={26} />
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.routeCode}>{route.id}</Text>
              <Text style={styles.routeName}>{route.name}</Text>
            </View>
            <Text style={styles.status}>{route.status}</Text>
          </View>

          <View style={styles.routeDetail}>
            <Ionicons color={colors.secondary} name="time-outline" size={18} />
            <Text style={styles.detailText}>{route.schedule}</Text>
          </View>

          <View style={styles.routeDetail}>
            <Ionicons color={colors.secondary} name="git-branch-outline" size={18} />
            <Text style={styles.detailText}>{route.stops}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 30
  },
  detailText: {
    color: colors.secondary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    height: 42,
    justifyContent: 'center'
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    marginTop: 16
  },
  filterText: {
    color: colors.secondary,
    fontWeight: '800'
  },
  filterTextActive: {
    color: colors.white
  },
  headerCard: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
    ...shadows.card
  },
  mapIcon: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 8,
    height: 70,
    justifyContent: 'center',
    marginLeft: 14,
    width: 70
  },
  routeCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    ...shadows.card
  },
  routeCardPressed: {
    transform: [{ scale: 0.985 }]
  },
  routeCode: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '900'
  },
  routeDetail: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 12
  },
  routeIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    marginRight: 12,
    width: 52
  },
  routeInfo: {
    flex: 1
  },
  routeName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 3
  },
  routeTop: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1
  },
  status: {
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  subtitle: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
    maxWidth: 210
  },
  title: {
    color: colors.white,
    fontSize: 25,
    fontWeight: '900'
  }
});
