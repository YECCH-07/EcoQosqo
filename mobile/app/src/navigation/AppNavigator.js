import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import DashboardScreen from '../screens/DashboardScreen';
import LoginScreen from '../screens/LoginScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import SplashScreen from '../screens/SplashScreen';
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
          <Stack.Screen name="Horarios" component={PlaceholderScreen} />
          <Stack.Screen name="Notificaciones" component={PlaceholderScreen} />
          <Stack.Screen name="Seguimiento" component={PlaceholderScreen} />
          <Stack.Screen name="Perfil" component={PlaceholderScreen} />
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
