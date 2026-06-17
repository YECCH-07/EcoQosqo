import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors, shadows } from '../styles/theme';
import api from '../api/client';

async function getBrowserLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') throw new Error('Permiso denegado');
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch (err) { throw err; }
}

export default function SeguimientoScreen({ route, navigation }) {
  const rutaParam = route.params?.ruta;
  const [ruta, setRuta] = useState(rutaParam || null);
  const [userLoc, setUserLoc] = useState(null);
  const [loading, setLoading] = useState(!rutaParam);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!rutaParam) {
      getBrowserLocation().then(async (loc) => {
        setUserLoc(loc);
        try {
          const res = await api.get(`/rutas/cercana?lat=${loc.latitude}&lng=${loc.longitude}`);
          if (res.data.success) setRuta(res.data.ruta);
        } catch (e) {}
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      getBrowserLocation().then(loc => setUserLoc(loc)).catch(() => {});
    }
  }, []);

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!ruta) return <View style={styles.centered}><Text style={{ color: colors.muted }}>No se encontró ruta</Text></View>;

  const puntos = (ruta.puntos || []).filter(p => p.latitud && p.longitud);
  const coords = puntos.map(p => [Number(p.latitud), Number(p.longitud)]);
  const center = coords.length > 0 ? coords[0] : [-13.517, -71.978];
  const colorRuta = ruta.color || '#4a001f';

  const mapHTML = `
<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>*{margin:0;padding:0}body,html,#map{width:100%;height:100%}</style>
</head><body><div id="map"></div><script>
var map = L.map('map', { zoomControl: true }).setView([${center[0]},${center[1]}], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution:'&copy; OSM'}).addTo(map);
var puntos = ${JSON.stringify(coords)};
if (puntos.length > 1) {
  L.polyline(puntos, {color:'${colorRuta}', weight:4, opacity:0.8}).addTo(map);
  map.fitBounds(puntos, {padding:[30,30]});
}
puntos.forEach(function(c, i) {
  L.marker(c, {
    icon: L.divIcon({html:'<div style="background:${colorRuta};color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;font-family:sans-serif">'+(i+1)+'</div>', iconSize:[24,24], iconAnchor:[12,12]})
  }).addTo(map).bindPopup('Parada #'+(i+1));
});
${userLoc ? `L.circleMarker([${userLoc.latitude},${userLoc.longitude}], {radius:8,color:'#0d6b2e',fillColor:'#0d6b2e',fillOpacity:0.8,weight:2}).addTo(map).bindPopup('Tu ubicacion');` : ''}
<\/script></body></html>`;

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS === 'web' ? (
        <iframe ref={iframeRef} srcDoc={mapHTML} style={{ flex: 1, border: 'none', width: '100%', height: '100%' }} title="Mapa de ruta" />
      ) : (
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={48} color={colors.primaryLight} />
          <Text style={styles.mapText}>Mapa disponible en versión web</Text>
        </View>
      )}
      <View style={styles.infoBar}>
        <View>
          <Text style={styles.infoTitle}>{ruta.nombre}</Text>
          <Text style={styles.infoSub}>{ruta.zona} · {ruta.dias} · {ruta.horario_inicio?.slice(0,5)}-{ruta.horario_fin?.slice(0,5)}</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => {
          getBrowserLocation().then(loc => setUserLoc(loc)).catch(() => {});
        }}>
          <Ionicons name="locate-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: colors.surface, ...shadows.card },
  infoTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  infoSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  refreshBtn: { padding: 10, backgroundColor: colors.accentSoft, borderRadius: 8 },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0e6ea' },
  mapText: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 8 },
});
