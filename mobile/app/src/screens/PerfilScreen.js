import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { colors, shadows } from '../styles/theme';

function DetailRow({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons color={colors.primaryDark} name={icon} size={20} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || 'No registrado'}</Text>
      </View>
    </View>
  );
}

export default function PerfilScreen() {
  const { usuario: sessionUser, logout } = useAuth();
  const [usuario, setUsuario] = useState(sessionUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data } = await api.get('/me');
        setUsuario(data.usuario || sessionUser);
      } catch { setUsuario(sessionUser); } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [sessionUser]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Ionicons color={colors.white} name="person" size={34} />
        </View>
        <Text style={styles.name}>{usuario?.nombre || 'Usuario'}</Text>
        <Text style={styles.role}>{usuario?.rol || 'CLIENTE'}</Text>
      </View>

      <View style={styles.card}>
        <DetailRow icon="mail-outline" label="Correo" value={usuario?.correo} />
        <DetailRow icon="shield-checkmark-outline" label="Rol" value={usuario?.rol} />
        <DetailRow icon="key-outline" label="Codigo de usuario" value={usuario?.id ? `#${usuario.id}` : ''} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => logout()}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 72,
    justifyContent: 'center',
    width: 72
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginTop: 18,
    padding: 16,
    ...shadows.card
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
  hero: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 22,
    ...shadows.card
  },
  label: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '700'
  },
  name: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 14,
    textAlign: 'center'
  },
  role: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6
  },
  row: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 14
  },
  rowIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40
  },
  rowText: {
    flex: 1
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 3
  },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, marginTop: 20, backgroundColor: colors.dangerBg, borderRadius: 10 },
  logoutText: { color: colors.danger, fontWeight: "700", fontSize: 15 },
});
