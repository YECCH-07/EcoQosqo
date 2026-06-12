import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import DashboardScreen from '../screens/DashboardScreen';
import LoginScreen from '../screens/LoginScreen';
import NotificacionesScreen from '../screens/NotificacionesScreen';
import PerfilScreen from '../screens/PerfilScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import ReportesScreen from '../screens/ReportesScreen';
import RutaHoyScreen from '../screens/RutaHoyScreen';
import SeguimientoScreen from '../screens/SeguimientoScreen';
import SplashScreen from '../screens/SplashScreen';
import VerRutasScreen from '../screens/VerRutasScreen';
import { colors } from '../styles/theme';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: colors.surface
  },
  headerTintColor: colors.text,
  headerTitleStyle: {
    fontWeight: '700'
  }
};

export default function AppNavigator() {
  const { loading, usuario } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {usuario ? (
        <>
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Horarios" component={RutaHoyScreen} options={{ title: 'Ruta de hoy' }} />
          <Stack.Screen name="VerRutas" component={VerRutasScreen} options={{ title: 'Ver Rutas' }} />
          <Stack.Screen name="Seguimiento" component={SeguimientoScreen} />
          <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
          <Stack.Screen name="Reportes" component={ReportesScreen} />
          <Stack.Screen name="Perfil" component={PerfilScreen} />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}
