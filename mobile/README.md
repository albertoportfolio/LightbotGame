# Lightbot Mobile

App React Native (Expo) que carga el juego Lightbot dentro de un WebView.

## Requisitos

- Node.js 18+
- Expo CLI (`npx expo`)
- Para Android: Android Studio + emulador o dispositivo físico
- Para iOS: Xcode (solo macOS)

## Instalacion

```bash
cd mobile
npm install
```

## Desarrollo

1. Arranca el servidor web del juego desde la raiz del proyecto:

```bash
cd ..
npm run dev
```

2. En otra terminal, arranca la app movil:

```bash
cd mobile
npx expo start
```

3. Escanea el QR con Expo Go o pulsa `a` para abrir en el emulador Android / `i` para iOS.

> **Nota Android emulador**: La app usa `10.0.2.2:3000` automaticamente para conectar al servidor local del host.
>
> **Nota dispositivo fisico**: Cambia la IP en `src/config.ts` a la IP de tu maquina en la red local.

## Build de produccion

1. Compila el juego web:

```bash
cd ..
npm run build
```

2. Despliega la carpeta `dist/` en un servidor (Vercel, Netlify, etc.)

3. Actualiza `PROD_URL` en `src/config.ts` con la URL del deploy.

4. Genera los binarios nativos:

```bash
npx expo prebuild
npx expo run:android  # o run:ios
```

## Estructura

```
mobile/
  app/
    _layout.tsx    -- Layout raiz (expo-router)
    index.tsx      -- Pantalla principal -> WebViewGame
  src/
    config.ts      -- URLs del juego (dev/prod)
    WebViewGame.tsx -- Componente WebView con loading y back handler
  app.json         -- Configuracion Expo
  package.json
```
