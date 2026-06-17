import React, { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import api from '../api/client';
import { colors, shadows } from '../styles/theme';

const ESTADOS = { pendiente: { color: '#856404', bg: '#FFF3CD', icon: 'time-outline', label: 'Pendiente' }, en_proceso: { color: '#004085', bg: '#CCE5FF', icon: 'sync-outline', label: 'En proceso' }, atendido: { color: '#155724', bg: '#D4EDDA', icon: 'checkmark-circle-outline', label: 'Atendido' } };

async function getGPS() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High, timeInterval: 8000 });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch { return null; }
}

export default function ReportesScreen() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [fotoBase64, setFotoBase64] = useState(null);
  const [ubicacion, setUbicacion] = useState(null);
  const [editandoUbicacion, setEditandoUbicacion] = useState(false);
  const [ubicacionManual, setUbicacionManual] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const res = await api.get('/reportes');
      setReportes(res.data.reportes || []);
      setError('');
    } catch (e) { setError('Error al cargar'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadData(); getGPS().then(g => g && setUbicacion(g)); }, [loadData]);

  const pickCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permiso', 'Se necesita permiso de cámara'); return; }
    // Capturar ubicación al mismo tiempo que la foto
    const gpsPromise = getGPS();
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.6, base64: true });
    if (!result.canceled && result.assets?.length > 0) {
      setFotoBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
      const gps = await gpsPromise;
      if (gps) setUbicacion(gps);
    }
  };

  const pickGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.6, base64: true, exif: true });
    if (!result.canceled && result.assets?.length > 0) {
      setFotoBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
      // Intentar extraer GPS del EXIF
      const exif = result.assets[0].exif;
      if (exif && exif.GPSLatitude) {
        setUbicacion({ lat: exif.GPSLatitude, lng: exif.GPSLongitude });
      } else {
        const gps = await getGPS();
        if (gps) setUbicacion(gps);
      }
    }
  };

  const handleSubmit = async () => {
    if (!descripcion.trim()) return Alert.alert('Falta información', 'Describí qué está pasando');
    setSaving(true); setError('');
    try {
      // Detectar prioridad por palabras clave
      const txt = descripcion.toLowerCase();
      let prioridadAuto = 'media';
      if (/urgente|peligro|accidente|fuego|explos|derrame|toxico|riesgo/i.test(txt)) prioridadAuto = 'alta';
      else if (/leve|menor|poquito|poco/i.test(txt)) prioridadAuto = 'baja';

      const payload = {
        titulo: descripcion.trim().slice(0, 60),
        descripcion: descripcion.trim(),
        categoria: 'residuos',
        ubicacion: ubicacionManual || (ubicacion ? `${Number(ubicacion.lat).toFixed(6)}, ${Number(ubicacion.lng).toFixed(6)}` : ''),
        prioridad: prioridadAuto,
        lat: ubicacion?.lat || null,
        lng: ubicacion?.lng || null,
      };
      if (fotoBase64) {
        const uploadRes = await api.post('/upload', { imagen: fotoBase64 });
        if (uploadRes.data.success) payload.foto_url = uploadRes.data.url;
      }
      await api.post('/reportes', payload);
      Alert.alert('Reporte enviado', 'Gracias. Te notificaremos cuando sea atendido.');
      setDescripcion(''); setFotoBase64(null); setUbicacionManual('');
      getGPS().then(g => g && setUbicacion(g));
      loadData();
    } catch (e) { Alert.alert('Error', e?.response?.data?.message || 'Error al enviar'); }
    finally { setSaving(false); }
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Reportar incidencia</Text>
        <Text style={styles.sub}>Tu reporte ayuda a mantener Cusco limpio</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* FORMULARIO SIMPLIFICADO */}
      <View style={styles.form}>
        <TextInput style={styles.textarea} placeholder="¿Qué está pasando? Describí el problema..." value={descripcion} onChangeText={setDescripcion} multiline placeholderTextColor={colors.muted} />

        {/* Ubicación */}
        <View style={styles.ubicacionRow}>
          <Ionicons name="location-outline" size={18} color={ubicacion ? colors.success : colors.muted} />
          {editandoUbicacion ? (
            <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
              <TextInput style={[styles.ubicacionInput, { flex: 1 }]} value={ubicacionManual} onChangeText={setUbicacionManual} placeholder="Ej: Av. Sol 123, Cusco" placeholderTextColor={colors.muted} autoFocus />
              <TouchableOpacity onPress={() => setEditandoUbicacion(false)}><Ionicons name="checkmark-circle" size={24} color={colors.success} /></TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setEditandoUbicacion(true)}>
              <Text style={styles.ubicacionText}>
                {ubicacionManual || (ubicacion ? `GPS: ${Number(ubicacion.lat).toFixed(5)}, ${Number(ubicacion.lng).toFixed(5)}` : 'Detectando ubicación...')}
              </Text>
              <Text style={styles.ubicacionHint}>Tocá para editar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Foto */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.camBtn} onPress={pickCamera}>
            <Ionicons name="camera-outline" size={22} color={colors.primary} />
            <Text style={styles.camBtnText}>Cámara</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.camBtn} onPress={pickGallery}>
            <Ionicons name="images-outline" size={22} color={colors.primary} />
            <Text style={styles.camBtnText}>Galería</Text>
          </TouchableOpacity>
        </View>

        {fotoBase64 && (
          <View>
            <Image source={{ uri: fotoBase64 }} style={styles.preview} resizeMode="cover" />
            <TouchableOpacity style={styles.removeFoto} onPress={() => setFotoBase64(null)}>
              <Ionicons name="close-circle" size={22} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={[styles.submitBtn, (!descripcion.trim()) && { opacity: 0.5 }]} onPress={handleSubmit} disabled={saving} activeOpacity={0.8}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="send" size={24} color={colors.white} />
            <View>
              <Text style={styles.submitText}>{saving ? 'Enviando...' : 'Reportar incidencia'}</Text>
              <Text style={styles.submitSub}>Se enviará a la municipalidad</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* LISTA DE REPORTES */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Mis reportes</Text>
        <Text style={styles.listCount}>{reportes.length}</Text>
      </View>

      {loading ? <ActivityIndicator style={{ margin: 20 }} color={colors.primary} /> :
       reportes.length === 0 ? <Text style={styles.empty}>No tenés reportes aún.</Text> :
       reportes.map(r => {
         const e = ESTADOS[r.estado] || ESTADOS.pendiente;
         return (
           <View key={r.id} style={styles.reporteCard}>
             <View style={styles.reporteHeader}>
               <Text style={styles.reporteTitulo} numberOfLines={1}>{r.titulo}</Text>
               <View style={[styles.estadoBadge, { backgroundColor: e.bg }]}>
                 <Ionicons name={e.icon} size={12} color={e.color} />
                 <Text style={[styles.estadoText, { color: e.color }]}>{e.label}</Text>
               </View>
             </View>
             <Text style={styles.reporteDesc} numberOfLines={2}>{r.descripcion}</Text>
             <Text style={styles.reporteMeta}>{r.ubicacion || 'Sin ubicación'} · {r.creado_en?.slice(0, 10)}</Text>
             {r.foto_url ? (
               <Image source={{ uri: r.foto_url.startsWith('http') ? r.foto_url : `http://localhost:5000${r.foto_url}` }} style={{ width: '100%', height: 150, borderRadius: 8, marginTop: 8 }} resizeMode="cover" />
             ) : null}
             {r.respuesta ? (
               <View style={styles.respuestaBox}>
                 <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.success} />
                 <Text style={styles.respuestaText}>{r.respuesta}</Text>
               </View>
             ) : null}
           </View>
         );
       })}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, paddingTop: 50, backgroundColor: colors.surface },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  sub: { fontSize: 13, color: colors.muted, marginTop: 4 },
  error: { color: colors.danger, textAlign: 'center', marginTop: 8 },
  form: { margin: 16, padding: 16, backgroundColor: colors.surface, borderRadius: 14, ...shadows.card, gap: 12 },
  textarea: { backgroundColor: colors.input, borderRadius: 12, padding: 16, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.borderLight, minHeight: 120, textAlignVertical: 'top' },
  ubicacionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  ubicacionText: { fontSize: 13, color: colors.text },
  ubicacionHint: { fontSize: 10, color: colors.muted, marginTop: 2 },
  ubicacionInput: { backgroundColor: colors.input, borderRadius: 6, padding: 6, fontSize: 13, color: colors.text },
  camBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, backgroundColor: colors.accentSoft, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  camBtnText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  preview: { width: '100%', height: 200, borderRadius: 10 },
  removeFoto: { position: 'absolute', top: 6, right: 6, backgroundColor: colors.white, borderRadius: 12 },
  submitBtn: { alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: colors.primary, borderRadius: 14, marginTop: 12, ...shadows.card, shadowColor: colors.primary, shadowOpacity: 0.3 },
  submitText: { color: colors.white, fontWeight: '700', fontSize: 19 },
  submitSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500', marginTop: 2 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 8, marginBottom: 8 },
  listTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  listCount: { fontSize: 14, fontWeight: '700', color: colors.primaryLight },
  empty: { textAlign: 'center', color: colors.muted, padding: 30 },
  reporteCard: { marginHorizontal: 16, marginBottom: 10, padding: 16, backgroundColor: colors.surface, borderRadius: 12, ...shadows.card },
  reporteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reporteTitulo: { fontSize: 14, fontWeight: '700', color: colors.text, flex: 1, marginRight: 8 },
  estadoBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  estadoText: { fontSize: 11, fontWeight: '600' },
  reporteDesc: { fontSize: 13, color: colors.secondary, marginBottom: 6 },
  reporteMeta: { fontSize: 11, color: colors.muted },
  respuestaBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 10, padding: 10, backgroundColor: colors.successBg, borderRadius: 8 },
  respuestaText: { fontSize: 12, color: colors.success, flex: 1 },
});
