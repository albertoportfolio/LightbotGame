import React, { useRef, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, StatusBar, BackHandler, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from 'expo-router';
import { GAME_URL } from './config';
import * as NavigationBar from 'expo-navigation-bar'
import { getMessaging, getToken, onTokenRefresh, requestPermission } from '@react-native-firebase/messaging'

// Componente principal: envuelve el juego web en un WebView a pantalla completa con soporte para botón atrás de Android
export default function WebViewGame() {
  const webViewRef = useRef<WebView>(null);
  const [error, setError] = useState(false);

  // Solicita permisos de notificaciones, obtiene el token FCM y lo inyecta en el WebView
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    async function setupFCM() {
      try {
        const msg = getMessaging()
        await requestPermission(msg)
        const token = await getToken(msg)
        webViewRef.current?.injectJavaScript(
          `window.__FCM_TOKEN__ = ${JSON.stringify(token)}; window.dispatchEvent(new Event('fcm-token-ready')); true;`
        )

        // Si Firebase renueva el token, re-inyectarlo en el WebView
        unsubscribe = onTokenRefresh(msg, newToken => {
          webViewRef.current?.injectJavaScript(
            `window.__FCM_TOKEN__ = ${JSON.stringify(newToken)}; window.dispatchEvent(new Event('fcm-token-ready')); true;`
          )
        })
      } catch (err) {
        console.warn('FCM setup error:', err)
      }
    }
    setupFCM()

    return () => unsubscribe?.()
  }, [])

  // Oculta la barra de navegación de Android para modo inmersivo (pantalla completa)
   useEffect(() => {
    NavigationBar.setVisibilityAsync('hidden')
    NavigationBar.setBehaviorAsync('overlay-swipe')
  }, [])

  // Captura el botón "atrás" de Android para navegar hacia atrás dentro del WebView en lugar de salir de la app
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

  const handleRetry = () => {
    setError(false);
    webViewRef.current?.reload();
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {error ? (
        <View style={styles.errorScreen}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>No se pudo cargar el juego</Text>
          <Text style={styles.errorMsg}>Comprueba tu conexión a internet e inténtalo de nuevo.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: GAME_URL }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          startInLoadingState
          injectedJavaScriptBeforeContentLoaded="window.__REACT_NATIVE__ = true; true;"
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#64ffda" />
            </View>
          )}
          onError={() => setError(true)}
        />
      )}
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
  errorScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMsg: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#63b3ed',
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
