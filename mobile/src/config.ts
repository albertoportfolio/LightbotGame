import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Host de desarrollo: en emulador Android usa 10.0.2.2 (alias del host), en iOS/web usa localhost
const DEV_HOST = Platform.select({
  android: '10.0.2.2',
  default: 'localhost',
});

// URL del servidor Vite local en desarrollo (puerto 3000)
const DEV_URL = `http://${DEV_HOST}:3000`;

// URL de producción donde está desplegado el juego web
const PROD_URL = 'http://localhost:3000';

const isDev = __DEV__;

// URL final del juego: usa Vite local en dev o la URL de producción en release
export const GAME_URL = isDev ? DEV_URL : PROD_URL;
