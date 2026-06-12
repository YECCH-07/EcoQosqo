import React, { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import api from '../api/client';
import { colors, shadows } from '../styles/theme';

const initialForm = {
  categoria: 'general',
  descripcion: '',
  titulo: '',
  ubicacion: ''
};

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
}

export default function ReportesScreen() {
  const [reportes, setReportes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadReportes = useCallback(async () => {
    try {
      setError('');
      const { data } = await api.get('/reportes');
      setReportes(data.reportes || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'No se pudieron cargar los reportes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReportes();
  }, [loadReportes]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitReport() {
    if (!form.titulo.trim() || !form.descripcion.trim()) {
      Alert.alert('Datos incompletos', 'Ingresa titulo y descripcion.');
      return;
    }

    try {
      setSaving(true);
      await api.post('/reportes', form);
      setForm(initialForm);
      await loadReportes();
      Alert.alert('Reporte enviado', 'Tu reporte fue registrado correctamente.');
    } catch (requestError) {
      Alert.alert('No se pudo enviar', requestError?.response?.data?.message || 'Intentalo nuevamente.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          colors={[colors.primary]}
          onRefresh={() => {
            setRefreshing(true);
            loadReportes();
          }}
          refreshing={refreshing}
        />
      }
      style={styles.screen}
    >
      <Text style={styles.title}>Reportes</Text>
      <Text style={styles.subtitle}>Registra incidencias y consulta su estado.</Text>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Nuevo reporte</Text>
        <TextInput
          onChangeText={(value) => updateField('titulo', value)}
          placeholder="Titulo"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={form.titulo}
        />
        <TextInput
          multiline
          onChangeText={(value) => updateField('descripcion', value)}
          placeholder="Descripcion"
          placeholderTextColor={colors.muted}
          style={[styles.input, styles.textArea]}
          value={form.descripcion}
        />
        <TextInput
          onChangeText={(value) => updateField('categoria', value)}
          placeholder="Categoria"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={form.categoria}
        />
        <TextInput
          onChangeText={(value) => updateField('ubicacion', value)}
          placeholder="Ubicacion"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={form.ubicacion}
        />
        <Pressable disabled={saving} onPress={submitReport} style={styles.submitButton}>
          <Ionicons color={colors.white} name="send-outline" size={18} />
          <Text style={styles.submitText}>{saving ? 'Enviando...' : 'Enviar reporte'}</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Mis reportes</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!reportes.length && !error ? (
        <View style={styles.empty}>
          <Ionicons color={colors.muted} name="document-text-outline" size={34} />
          <Text style={styles.emptyText}>Aun no registraste reportes.</Text>
        </View>
      ) : null}

      {reportes.map((item) => (
        <View key={item.id} style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>{item.titulo}</Text>
            <Text style={styles.status}>{item.estado}</Text>
          </View>
          <Text style={styles.reportDescription}>{item.descripcion}</Text>
          <Text style={styles.meta}>
            {item.categoria} {item.ubicacion ? `- ${item.ubicacion}` : ''} - {formatDate(item.creado_en)}
          </Text>
          {item.respuesta ? <Text style={styles.answer}>Respuesta: {item.respuesta}</Text> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  answer: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10
  },
  center: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center'
  },
  content: {
    padding: 18,
    paddingBottom: 30
  },
  empty: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 24,
    ...shadows.card
  },
  emptyText: {
    color: colors.secondary,
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center'
  },
  error: {
    color: colors.danger,
    fontWeight: '700',
    marginBottom: 10
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginTop: 18,
    padding: 16,
    ...shadows.card
  },
  formTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12
  },
  input: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 11
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 10
  },
  reportCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    ...shadows.card
  },
  reportDescription: {
    color: colors.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10
  },
  reportHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  reportTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    paddingRight: 10
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 22
  },
  status: {
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 2,
    paddingVertical: 13
  },
  submitText: {
    color: colors.white,
    fontWeight: '700'
  },
  subtitle: {
    color: colors.secondary,
    fontSize: 14,
    marginTop: 4
  },
  textArea: {
    minHeight: 92,
    textAlignVertical: 'top'
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700'
  }
});
