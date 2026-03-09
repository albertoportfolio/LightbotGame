import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * URL del juego web.
 *
 * - En desarrollo: apunta al servidor Vite local.
 *   En Android emulator usa 10.0.2.2 (alias del host),
 *   en iOS simulator / dispositivo físico usa la IP de tu máquina.
 *
 * - En producción: apunta a la URL donde esté desplegado el juego,
 *   o usa los assets locales embebidos (ver README).
 */

const DEV_HOST = Platform.select({
  android: '10.0.2.2',
  default: 'localhost',
});

const DEV_URL = `http://${DEV_HOST}:3000`;

// Cambia esto a la URL de producción cuando despliegues el juego web
const PROD_URL = '';

const isDev = __DEV__;

export const GAME_URL = isDev ? DEV_URL : PROD_URL;
