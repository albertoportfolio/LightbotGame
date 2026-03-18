import React, { useRef, useCallback, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, StatusBar, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from 'expo-router';
import { GAME_URL } from './config';
import * as NavigationBar from 'expo-navigation-bar'

// Componente principal: envuelve el juego web en un WebView a pantalla completa con soporte para botón atrás de Android
export default function WebViewGame() {
  const webViewRef = useRef<WebView>(null);
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

  return (
    <View style={styles.container}>
      <StatusBar hidden />
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
