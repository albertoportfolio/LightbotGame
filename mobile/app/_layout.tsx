import { Stack } from 'expo-router';

// Layout raíz de Expo Router: configura el Stack de navegación sin header y sin animaciones de transición
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    />
  );
}
