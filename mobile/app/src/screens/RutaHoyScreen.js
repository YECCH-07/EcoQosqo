import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, shadows, alpha } from '../styles/theme';

const routeStops = [
  { time: '06:30', place: 'Callejon Retiro', status: 'Inicio' },
  { time: '06:55', place: 'Av. La Cultura', status: 'En ruta' },
  { time: '07:25', place: 'Mercado Wanchaq', status: 'Siguiente' },
  { time: '08:10', place: 'Urb. Santa Monica', status: 'Final' }
];

export default function RutaHoyScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons color={colors.primaryDark} name="navigate-circle-outline" size={42} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.eyebrow}>Ruta asignada</Text>
          <Text style={styles.title}>Ruta de hoy</Text>
          <Text style={styles.subtitle}>Recojo domiciliario - Zona Santiago</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Ionicons color={colors.primaryDark} name="time-outline" size={22} />
          <Text style={styles.summaryLabel}>Inicio</Text>
          <Text style={styles.summaryValue}>06:30 AM</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Ionicons color={colors.primaryDark} name="bus-outline" size={22} />
          <Text style={styles.summaryLabel}>Camion</Text>
          <Text style={styles.summaryValue}>EQ-04</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Ionicons color={colors.primaryDark} name="location-outline" size={22} />
          <Text style={styles.summaryLabel}>Puntos</Text>
          <Text style={styles.summaryValue}>4</Text>
        </View>
      </View>

      <View style={styles.noticeCard}>
        <Ionicons color={colors.primaryDark} name="notifications-outline" size={22} />
        <Text style={styles.noticeText}>Saca tus residuos 15 minutos antes del paso del camion.</Text>
      </View>

      <Text style={styles.sectionTitle}>Recorrido programado</Text>

      <View style={styles.timeline}>
        {routeStops.map((stop, index) => (
          <View key={stop.place} style={styles.stopRow}>
            <View style={styles.stopRail}>
              <View style={styles.stopDot} />
              {index < routeStops.length - 1 ? <View style={styles.stopLine} /> : null}
            </View>

            <View style={styles.stopCard}>
              <View>
                <Text style={styles.stopTime}>{stop.time}</Text>
                <Text style={styles.stopPlace}>{stop.place}</Text>
              </View>
              <Text style={styles.stopStatus}>{stop.status}</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable style={styles.primaryButton}>
        <Ionicons color={colors.white} name="map-outline" size={18} />
        <Text style={styles.primaryButtonText}>Ver recorrido en mapa</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 30
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
    padding: 18,
    ...shadows.card
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 8,
    height: 74,
    justifyContent: 'center',
    marginRight: 14,
    width: 74
  },
  heroText: {
    flex: 1
  },
  noticeCard: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    flexDirection: 'row',
    marginTop: 14,
    padding: 14
  },
  noticeText: {
    color: colors.primaryDark,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginLeft: 10
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 18,
    paddingVertical: 14
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '700'
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
  stopCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    ...shadows.card
  },
  stopDot: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 14,
    width: 14
  },
  stopLine: {
    backgroundColor: colors.border,
    flex: 1,
    marginVertical: 4,
    width: 2
  },
  stopPlace: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 3
  },
  stopRail: {
    alignItems: 'center',
    marginRight: 12,
    width: 18
  },
  stopRow: {
    flexDirection: 'row',
    minHeight: 78
  },
  stopStatus: {
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  stopTime: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '700'
  },
  subtitle: {
    color: alpha.white86,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 16,
    ...shadows.card
  },
  summaryDivider: {
    backgroundColor: colors.border,
    height: 54,
    width: 1
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1
  },
  summaryLabel: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 7
  },
  summaryValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 3
  },
  timeline: {
    gap: 2
  },
  title: {
    color: colors.white,
    fontSize: 25,
    fontWeight: '700',
    marginTop: 3
  }
});
