import React, { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import api from '../api/client';
import { colors, shadows } from '../styles/theme';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
}

export default function NotificacionesScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadItems = useCallback(async () => {
    try {
      setError('');
      const { data } = await api.get('/notificaciones');
      setItems(data.notificaciones || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'No se pudieron cargar las notificaciones.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function markAsRead(id) {
    await api.patch(`/notificaciones/${id}/leido`);
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, leido: 1 } : item))
    );
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
            loadItems();
          }}
          refreshing={refreshing}
        />
      }
      style={styles.screen}
    >
      <Text style={styles.title}>Notificaciones</Text>
      <Text style={styles.subtitle}>Avisos enviados por el sistema EcoQosqo.</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!items.length && !error ? (
        <View style={styles.empty}>
          <Ionicons color={colors.muted} name="notifications-off-outline" size={34} />
          <Text style={styles.emptyText}>No tienes notificaciones pendientes.</Text>
        </View>
      ) : null}

      {items.map((item) => (
        <View key={item.id} style={[styles.card, !item.leido && styles.cardUnread]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Ionicons
                color={colors.primaryDark}
                name={item.tipo === 'alerta' ? 'warning-outline' : 'notifications-outline'}
                size={20}
              />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <Text style={styles.date}>{formatDate(item.creado_en)}</Text>
            </View>
          </View>
          <Text style={styles.message}>{item.mensaje}</Text>
          {!item.leido ? (
            <Pressable onPress={() => markAsRead(item.id)} style={styles.readButton}>
              <Text style={styles.readButtonText}>Marcar como leida</Text>
            </Pressable>
          ) : (
            <Text style={styles.readLabel}>Leida</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginTop: 14,
    padding: 16,
    ...shadows.card
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  cardText: {
    flex: 1
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700'
  },
  cardUnread: {
    borderLeftColor: colors.accent,
    borderLeftWidth: 5
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
  date: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3
  },
  empty: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginTop: 18,
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
    marginTop: 14
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    marginRight: 12,
    width: 42
  },
  message: {
    color: colors.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12
  },
  readButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  readButtonText: {
    color: colors.white,
    fontWeight: '700'
  },
  readLabel: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1
  },
  subtitle: {
    color: colors.secondary,
    fontSize: 14,
    marginTop: 4
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700'
  }
});
