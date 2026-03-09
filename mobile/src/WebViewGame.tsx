import React, { useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  StatusBar,
  BackHandler,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from 'expo-router';
import { GAME_URL } from './config';

/**
 * Script inyectado en el WebView tras cargar la página.
 *
 * Problemas en portrait:
 *  1. El canvas de Phaser tiene 680×560 px fijos → desborda cualquier móvil.
 *  2. El panel de instrucciones tiene minWidth:340 y minHeight:460 → demasiado
 *     grande para pantallas estrechas.
 *
 * Solución:
 *  - Espera a que Phaser inserte el canvas (MutationObserver) y lo escala
 *    con CSS transform al ancho real de la pantalla.
 *  - Restringe el contenedor del canvas para que el flexbox del layout React
 *    calcule el espacio restante correctamente (el panel va debajo).
 *  - Ajusta el panel de instrucciones para que ocupe todo el ancho disponible
 *    en pantallas estrechas.
 */
const INJECTED_JS = `
(function () {
  var GAME_W = 680;
  var GAME_H = 560;

  /* ── 1. Escala el canvas de Phaser ─────────────────────────────────────── */
  function scaleCanvas() {
    var canvas = document.querySelector('canvas');
    if (!canvas) return;

    var sw = window.innerWidth;
    if (sw >= GAME_W) {
      canvas.style.transform = '';
      canvas.style.transformOrigin = '';
      var p = canvas.parentNode;
      if (p) { p.style.width = ''; p.style.height = ''; p.style.overflow = ''; }
      return;
    }

    var scale = sw / GAME_W;
    canvas.style.transformOrigin = 'top left';
    canvas.style.transform = 'scale(' + scale + ')';
    canvas.style.display = 'block';

    // Encoger el wrapper al tamaño visual para que el layout fluya bien
    var parent = canvas.parentNode;
    if (parent) {
      parent.style.display  = 'block';
      parent.style.width    = (GAME_W * scale) + 'px';
      parent.style.height   = (GAME_H * scale) + 'px';
      parent.style.overflow = 'hidden';
    }
  }

  /* ── 2. Adapta el panel de instrucciones a pantalla estrecha ────────────── */
  function fixPanels() {
    if (window.innerWidth >= GAME_W) return;

    // Panel flex-1 que contiene LevelHUD + InstructionPanel
    document.querySelectorAll('div').forEach(function (el) {
      var s = el.style;
      // Quitar minWidth fijo para que ocupe todo el ancho disponible
      if (s.minWidth === '340px') {
        s.minWidth = '0';
        s.width    = '100%';
        s.maxWidth = '100%';
      }
      // Reducir minHeight del contenedor del panel de comandos
      if (s.minHeight === '460px') {
        s.minHeight = '240px';
      }
    });
  }

  /* ── 3. Ejecutar ambas funciones en los momentos clave ──────────────────── */
  function apply() { scaleCanvas(); fixPanels(); }

  // MutationObserver: espera a que Phaser inserte el canvas
  var observer = new MutationObserver(function () {
    if (document.querySelector('canvas')) {
      observer.disconnect();
      apply();
    }
  });
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Fallbacks (canvas puede cargarse después de delays variables)
  apply();
  [300, 700, 1200, 2000, 3500].forEach(function (d) { setTimeout(apply, d); });
  window.addEventListener('resize', apply);
})();
true;
`;

export default function WebViewGame() {
  const webViewRef = useRef<WebView>(null);

  // Botón "atrás" de Android navega dentro del WebView
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <WebView
        ref={webViewRef}
        source={{ uri: GAME_URL }}
        style={styles.webview}
        // JS & almacenamiento
        javaScriptEnabled
        domStorageEnabled
        // Escala responsive inyectada
        injectedJavaScript={INJECTED_JS}
        injectedJavaScriptBeforeContentLoaded={undefined}
        // Audio sin interacción del usuario (necesario para el juego)
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        // Scroll — el usuario puede desplazarse si el contenido es más alto
        scrollEnabled
        bounces={false}                          // iOS: sin rebote
        overScrollMode="never"                   // Android: sin efecto glow
        // Carga
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#64ffda" />
          </View>
        )}
        onError={({ nativeEvent }) => console.warn('WebView error:', nativeEvent)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  webview: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
});
