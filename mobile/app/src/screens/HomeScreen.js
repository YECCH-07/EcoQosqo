import React, { useEffect, useState, useCallback } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { colors, shadows } from '../styles/theme';
import api from '../api/client';

export default function HomeScreen({ navigation }) {
  const { usuario } = useAuth();
  const [miRuta, setMiRuta] = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      // 1. Intentar cargar ruta ya asignada
      const [rutaRes, notifRes] = await Promise.all([
        api.get('/usuario/mi-ruta'),
        api.get('/notificaciones'),
      ]);

      if (rutaRes.data.success && rutaRes.data.ruta) {
        setMiRuta(rutaRes.data.ruta);
      } else {
        // 2. Si no tiene ruta, auto-asignar por GPS
        setMiRuta(null);
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') throw new Error('Permiso de ubicación denegado');
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High, timeInterval: 10000 });
          const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          const asigRes = await api.post('/usuario/asignar-ruta', { lat: loc.latitude, lng: loc.longitude });
          if (asigRes.data.success) setMiRuta(asigRes.data.ruta);
        } catch (gpsErr) {
          // GPS no disponible o sin ruta cercana - se muestra botón de buscar
        }
      }

      const noLeidas = (notifRes.data.notificaciones || []).filter(n => !n.leido).length;
      setNotifCount(noLeidas);
      setError('');
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { const unsub = navigation.addListener('focus', loadData); return unsub; }, [navigation]);

  const getProximosDias = () => {
    if (!miRuta || !miRuta.dias) return [];
    const diasMap = { lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6, domingo: 0 };
    const nombres = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const txt = miRuta.dias.toLowerCase().replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o');
    const match = txt.match(/^(\w+)\s+a\s+(\w+)$/);
    let diasSet;
    if (match) {
      const ini = diasMap[match[1]], fin = diasMap[match[2]];
      diasSet = new Set();
      for (let i = ini; i <= fin; i++) diasSet.add(i);
    } else if (txt === 'todos los dias') {
      diasSet = new Set([1,2,3,4,5,6,0]);
    } else {
      diasSet = new Set(txt.split(',').map(d => diasMap[d.trim()]).filter(d => d !== undefined));
    }
    const hoy = new Date();
    const proximos = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(hoy); d.setDate(hoy.getDate() + i);
      const dow = d.getDay();
      if (diasSet.has(dow)) {
        proximos.push({ dia: nombres[dow], fecha: d.getDate(), mes: d.getMonth() + 1, esHoy: i === 0, esManana: i === 1 });
      }
    }
    return proximos.slice(0, 4);
  };

  const [showPicker, setShowPicker] = useState(false);
  const [rutasDisponibles, setRutasDisponibles] = useState([]);
  const [loadingRutas, setLoadingRutas] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const buscarOtraRuta = async () => {
    setError('');
    setLoadingRutas(true);
    setShowPicker(true);
    try {
      // Obtener ubicación actual
      let loc = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setUserLocation(loc);
        }
      } catch (e) { /* sin GPS, mostramos igual */ }

      // Cargar rutas de recolección (filtrar barrido)
      const res = await api.get('/rutas');
      const rutas = (res.data.rutas || [])
        .filter(r => r.tipo === 'recoleccion')
        .map(r => ({
          ...r,
          distancia: loc ? calcularDistancia(loc.latitude, loc.longitude, r) : null,
        }));
      rutas.sort((a, b) => (a.distancia || Infinity) - (b.distancia || Infinity));
      setRutasDisponibles(rutas);
    } catch (err) {
      setError('Error al cargar rutas');
      setShowPicker(false);
    } finally {
      setLoadingRutas(false);
    }
  };

  const calcularDistancia = (lat, lng, ruta) => {
    // Distancia simple al primer punto de la ruta
    if (!ruta.puntos || !ruta.puntos.length) return null;
    const p = ruta.puntos[0];
    const dLat = (Number(p.latitud) - lat) * Math.PI / 180;
    const dLng = (Number(p.longitud) - lng) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat*Math.PI/180)*Math.cos(Number(p.latitud)*Math.PI/180)*Math.sin(dLng/2)**2;
    return Math.round(6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  };

  const seleccionarRuta = async (ruta) => {
    try {
      await api.post('/usuario/asignar-ruta', { lat: userLocation?.latitude || -13.517, lng: userLocation?.longitude || -71.978, ruta_id: ruta.id });
      setMiRuta(ruta);
      setShowPicker(false);
      setError('');
    } catch (err) {
      setError('Error al cambiar de ruta');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}><Text style={{ color: colors.muted }}>Cargando...</Text></View>
    );
  }

  const proximos = getProximosDias();

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {usuario?.nombre || 'Ciudadano'}</Text>
          {miRuta && <Text style={styles.zone}>{miRuta.zona}</Text>}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notificaciones')} style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={24} color={colors.primary} />
          {notifCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{notifCount}</Text></View>}
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Ruta asignada */}
      {miRuta ? (
        <View style={styles.rutaCard}>
          <View style={styles.rutaHeader}>
            <Ionicons name="bus" size={20} color={colors.primary} />
            <Text style={styles.rutaTitle}>TU RUTA ASIGNADA</Text>
          </View>
          <Text style={styles.rutaName}>{miRuta.nombre}</Text>
          <View style={styles.rutaInfo}>
            <Ionicons name="time-outline" size={14} color={colors.muted} />
            <Text style={styles.rutaSchedule}>{miRuta.horario_inicio?.slice(0,5)} - {miRuta.horario_fin?.slice(0,5)}</Text>
            <Text style={styles.rutaDays}> · {miRuta.dias}</Text>
          </View>
          <View style={styles.rutaActions}>
            <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('Seguimiento', { ruta: miRuta })}>
              <Ionicons name="map-outline" size={16} color={colors.primary} />
              <Text style={styles.btnOutlineText}>Ver en mapa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Horarios')}>
              <Ionicons name="today-outline" size={16} color={colors.white} />
              <Text style={styles.btnPrimaryText}>Detalles</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.rutaCard}>
          <Text style={styles.noRutaTitle}>No tienes ruta asignada</Text>
          <Text style={styles.noRutaSub}>Toca "Buscar ruta" para encontrar la más cercana a tu ubicación</Text>
        </View>
      )}

      {/* Próximos días */}
      {proximos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximas recolecciones</Text>
          <View style={styles.diasRow}>
            {proximos.map((d, i) => (
              <View key={i} style={[styles.diaBadge, d.esHoy && styles.diaHoy, d.esManana && !d.esHoy && styles.diaManana]}>
                <Text style={[styles.diaLabel, (d.esHoy || d.esManana) && styles.diaLabelActivo]}>{d.dia}</Text>
                <Text style={[styles.diaNum, (d.esHoy || d.esManana) && styles.diaNumActivo]}>{d.fecha}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Acciones */}
      <View style={styles.section}>
        {/* Botón principal - Reportar */}
        <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('Reportes')} activeOpacity={0.85}>
          <View style={styles.heroBtnInner}>
            <View style={styles.heroIcon}>
              <Ionicons name="warning" size={28} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Reportar incidencia</Text>
              <Text style={styles.heroSub}>Basura acumulada, contenedor dañado, etc.</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.white} />
          </View>
        </TouchableOpacity>

        {/* Acciones secundarias */}
        <View style={styles.secondaryRow}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={buscarOtraRuta}>
            <Ionicons name="search-outline" size={22} color={colors.primary} />
            <Text style={styles.secondaryText}>Buscar ruta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Notificaciones')}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            <Text style={styles.secondaryText}>Avisos{notifCount > 0 ? ` (${notifCount})` : ''}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Perfil')}>
            <Ionicons name="person-outline" size={22} color={colors.primary} />
            <Text style={styles.secondaryText}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Modal selector de rutas */}
      <Modal visible={showPicker} animationType="slide" onRequestClose={() => setShowPicker(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar ruta</Text>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          {loadingRutas ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={rutasDisponibles}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => {
                const esActual = miRuta && miRuta.id === item.id;
                return (
                  <TouchableOpacity style={[styles.rutaItem, esActual && styles.rutaItemActiva]} onPress={() => seleccionarRuta(item)}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.rutaItemName}>{item.nombre}</Text>
                        {esActual && <View style={styles.rutaActualBadge}><Text style={styles.rutaActualText}>Actual</Text></View>}
                      </View>
                      <Text style={styles.rutaItemInfo}>{item.zona} · {item.dias}</Text>
                      <Text style={styles.rutaItemInfo}>{item.horario_inicio?.slice(0,5)} - {item.horario_fin?.slice(0,5)}</Text>
                      {item.distancia != null && <Text style={styles.rutaItemDist}>A {item.distancia}m de tu ubicación</Text>}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: colors.surface },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.text },
  zone: { fontSize: 13, color: colors.muted, marginTop: 2 },
  notifBtn: { position: 'relative', padding: 8 },
  badge: { position: 'absolute', top: 2, right: 2, backgroundColor: colors.danger, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  error: { color: colors.danger, textAlign: 'center', marginTop: 8 },
  rutaCard: { margin: 16, padding: 20, backgroundColor: colors.surface, borderRadius: 14, ...shadows.card },
  rutaHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  rutaTitle: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 1 },
  rutaName: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 6 },
  rutaInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  rutaSchedule: { fontSize: 13, color: colors.muted, marginLeft: 4 },
  rutaDays: { fontSize: 13, color: colors.muted },
  rutaActions: { flexDirection: 'row', gap: 10 },
  btnOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.primary },
  btnOutlineText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  btnPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 8, backgroundColor: colors.primary },
  btnPrimaryText: { fontSize: 13, fontWeight: '600', color: colors.white },
  noRutaTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  noRutaSub: { fontSize: 13, color: colors.muted, marginTop: 4 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10 },
  diasRow: { flexDirection: 'row', gap: 8 },
  diaBadge: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: colors.surface, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight },
  diaHoy: { backgroundColor: colors.primary, borderColor: colors.primary },
  diaManana: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
  diaLabel: { fontSize: 11, fontWeight: '600', color: colors.muted },
  diaLabelActivo: { color: colors.white },
  diaNum: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 2 },
  diaNumActivo: { color: colors.white },
  heroBtn: { marginBottom: 12, backgroundColor: colors.primary, borderRadius: 16, overflow: 'hidden', ...shadows.card, shadowColor: colors.primary, shadowOpacity: 0.3 },
  heroBtnInner: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  heroIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  heroTitle: { color: colors.white, fontSize: 17, fontWeight: '700' },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  secondaryRow: { flexDirection: 'row', gap: 8 },
  secondaryBtn: { flex: 1, alignItems: 'center', padding: 14, backgroundColor: colors.surface, borderRadius: 12, gap: 6, ...shadows.card },
  secondaryText: { fontSize: 11, fontWeight: '600', color: colors.text },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  rutaItem: { flexDirection: 'row', alignItems: 'center', padding: 16, marginHorizontal: 16, marginTop: 10, backgroundColor: colors.surface, borderRadius: 12, ...shadows.card },
  rutaItemActiva: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.accentSoft },
  rutaItemName: { fontSize: 15, fontWeight: '700', color: colors.text },
  rutaActualBadge: { backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  rutaActualText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  rutaItemInfo: { fontSize: 12, color: colors.muted, marginTop: 2 },
  rutaItemDist: { fontSize: 11, color: colors.primaryLight, fontWeight: '600', marginTop: 4 },
});
