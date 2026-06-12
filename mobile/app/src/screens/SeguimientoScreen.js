import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, shadows, alpha } from '../styles/theme';

const trackingEvents = [
  { time: '06:30', label: 'Inicio de recorrido', place: 'Base EcoQosqo' },
  { time: '06:55', label: 'Recojo en progreso', place: 'Av Universitaria' },
  { time: '07:20', label: 'Proximo punto', place: 'Mercado Wanchaq' }
];

export default function SeguimientoScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.eyebrow}>Seguimiento en tiempo real</Text>
          <Text style={styles.title}>Camion recolector</Text>
          <Text style={styles.subtitle}>Unidad EQ-04 cerca de Av Universitaria.</Text>
        </View>
        <View style={styles.heroIcon}>
          <Ionicons color={colors.primaryDark} name="location-outline" size={38} />
        </View>
      </View>

      <View style={styles.mapCard}>
        <View style={styles.mapGrid}>
          <View style={[styles.mapPin, styles.mapPinPrimary]}>
            <Ionicons color={colors.white} name="bus-outline" size={24} />
          </View>
          <View style={[styles.mapPin, styles.mapPinSecondary]}>
            <Ionicons color={colors.primaryDark} name="home-outline" size={22} />
          </View>
          <View style={styles.routeLine} />
        </View>
        <Text style={styles.mapTitle}>Ubicacion estimada</Text>
        <Text style={styles.mapText}>El camion se encuentra a 8 minutos de tu zona.</Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusItem}>
          <Text style={styles.statusValue}>8 min</Text>
          <Text style={styles.statusLabel}>Llegada</Text>
        </View>
        <View style={styles.statusDivider} />
        <View style={styles.statusItem}>
          <Text style={styles.statusValue}>1.2 km</Text>
          <Text style={styles.statusLabel}>Distancia</Text>
        </View>
        <View style={styles.statusDivider} />
        <View style={styles.statusItem}>
          <Text style={styles.statusValue}>Activo</Text>
          <Text style={styles.statusLabel}>Estado</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Actividad reciente</Text>

      {trackingEvents.map((event) => (
        <View key={`${event.time}-${event.place}`} style={styles.eventCard}>
          <View style={styles.eventIcon}>
            <Ionicons color={colors.primaryDark} name="radio-button-on-outline" size={20} />
          </View>
          <View style={styles.eventText}>
            <Text style={styles.eventLabel}>{event.label}</Text>
            <Text style={styles.eventPlace}>{event.place}</Text>
          </View>
          <Text style={styles.eventTime}>{event.time}</Text>
        </View>
      ))}

      <Pressable style={styles.primaryButton}>
        <Ionicons color={colors.white} name="refresh-outline" size={18} />
        <Text style={styles.primaryButtonText}>Actualizar ubicacion</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 30
  },
  eventCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 14,
    ...shadows.card
  },
  eventIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    marginRight: 12,
    width: 42
  },
  eventLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700'
  },
  eventPlace: {
    color: colors.secondary,
    fontSize: 13,
    marginTop: 3
  },
  eventText: {
    flex: 1
  },
  eventTime: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700'
  },
  eyebrow: {
    color: alpha.white82,
    fontSize: 13,
    fontWeight: '700'
  },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
    ...shadows.card
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 8,
    height: 72,
    justifyContent: 'center',
    marginLeft: 14,
    width: 72
  },
  heroText: {
    flex: 1
  },
  mapCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginTop: 16,
    overflow: 'hidden',
    padding: 16,
    ...shadows.card
  },
  mapGrid: {
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    height: 170,
    justifyContent: 'center',
    marginBottom: 14,
    position: 'relative'
  },
  mapPin: {
    alignItems: 'center',
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    position: 'absolute',
    width: 52,
    zIndex: 2
  },
  mapPinPrimary: {
    backgroundColor: colors.primary,
    left: 48,
    top: 70
  },
  mapPinSecondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    right: 42,
    top: 38
  },
  mapText: {
    color: colors.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5
  },
  mapTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700'
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 14
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '700'
  },
  routeLine: {
    backgroundColor: colors.primary,
    height: 4,
    left: 92,
    opacity: 0.35,
    position: 'absolute',
    top: 92,
    transform: [{ rotate: '-24deg' }],
    width: 160
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
    marginTop: 22
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    padding: 16,
    ...shadows.card
  },
  statusDivider: {
    backgroundColor: colors.border,
    height: 48,
    width: 1
  },
  statusItem: {
    alignItems: 'center',
    flex: 1
  },
  statusLabel: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4
  },
  statusValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700'
  },
  subtitle: {
    color: alpha.white86,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7
  },
  title: {
    color: colors.white,
    fontSize: 25,
    fontWeight: '700',
    marginTop: 3
  }
});
