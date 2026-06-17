import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { colors, shadows } from '../styles/theme';
import api from '../api/client';

export default function RutaHoyScreen({ navigation }) {
  const [miRuta, setMiRuta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/usuario/mi-ruta').then(res => {
      if (res.data.success) setMiRuta(res.data.ruta);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!miRuta) return <View style={styles.centered}><Text style={{ color: colors.muted }}>No tienes ruta asignada</Text></View>;

  const puntos = miRuta.puntos || [];
  const ahora = new Date();
  const diaSemana = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'][ahora.getDay()];
  const diasRuta = (miRuta.dias || '').toLowerCase().replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{miRuta.nombre}</Text>
        <Text style={styles.sub}>{miRuta.zona} · {miRuta.dias}</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Ionicons name="time-outline" size={20} color={colors.primaryLight} />
          <Text style={styles.summaryLabel}>Inicio</Text>
          <Text style={styles.summaryValue}>{miRuta.horario_inicio?.slice(0,5)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="flag-outline" size={20} color={colors.primaryLight} />
          <Text style={styles.summaryLabel}>Paradas</Text>
          <Text style={styles.summaryValue}>{puntos.length}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="time-outline" size={20} color={colors.primaryLight} />
          <Text style={styles.summaryLabel}>Fin</Text>
          <Text style={styles.summaryValue}>{miRuta.horario_fin?.slice(0,5)}</Text>
        </View>
      </View>

      <View style={styles.aviso}>
        <Ionicons name="information-circle-outline" size={18} color={colors.warning} />
        <Text style={styles.avisoText}>Saca tus residuos 15 minutos antes del paso del camión</Text>
      </View>

      <View style={styles.timeline}>
        <Text style={styles.sectionTitle}>Recorrido programado</Text>
        {puntos.map((p, i) => {
          const esPrimero = i === 0;
          const esUltimo = i === puntos.length - 1;
          return (
            <View key={i} style={styles.stopRow}>
              <View style={[styles.stopDot, esPrimero && styles.stopDotStart, esUltimo && styles.stopDotEnd]} />
              <View style={styles.stopInfo}>
                <Text style={styles.stopName}>{p.nombre || `Parada #${i + 1}`}</Text>
                {p.direccion ? <Text style={styles.stopAddr}>{p.direccion}</Text> : null}
                <Text style={styles.stopCoords}>{Number(p.latitud).toFixed(5)}, {Number(p.longitud).toFixed(5)}</Text>
              </View>
              <Text style={styles.stopNum}>#{p.orden || i + 1}</Text>
            </View>
          );
        })}
      </View>

      <Pressable style={styles.mapButton} onPress={() => navigation.navigate('Seguimiento', { ruta: miRuta })}>
        <Ionicons name="map-outline" size={22} color={colors.white} />
        <Text style={styles.mapButtonText}>Ver recorrido en mapa</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  header: { padding: 20, paddingTop: 10, backgroundColor: colors.surface },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  summaryRow: { flexDirection: 'row', padding: 16, gap: 12 },
  summaryItem: { flex: 1, alignItems: 'center', padding: 12, backgroundColor: colors.surface, borderRadius: 10, ...shadows.card },
  summaryLabel: { fontSize: 11, color: colors.muted, marginTop: 4 },
  summaryValue: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 2 },
  aviso: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, padding: 12, backgroundColor: colors.warningBg, borderRadius: 8 },
  avisoText: { fontSize: 12, color: colors.warning, flex: 1 },
  timeline: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  stopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, paddingLeft: 14 },
  stopDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primaryLight, marginTop: 4, marginRight: 12 },
  stopDotStart: { backgroundColor: colors.success, width: 14, height: 14, borderRadius: 7 },
  stopDotEnd: { backgroundColor: colors.danger, width: 14, height: 14, borderRadius: 7 },
  stopInfo: { flex: 1 },
  stopName: { fontSize: 14, fontWeight: '600', color: colors.text },
  stopAddr: { fontSize: 12, color: colors.secondary, marginTop: 2 },
  stopCoords: { fontSize: 10, color: colors.muted, fontFamily: 'monospace', marginTop: 2 },
  stopNum: { fontSize: 12, fontWeight: '700', color: colors.muted, marginLeft: 8 },
  mapButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, padding: 16, backgroundColor: colors.primary, borderRadius: 12 },
  mapButtonText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
