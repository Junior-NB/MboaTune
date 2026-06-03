import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { Colors } from './src/theme/colors';
import { usePlayerStore } from './src/store/playerStore';
import { Linking } from 'react-native';
import { supabase } from './src/lib/supabase';

function App(): React.JSX.Element {
  const { setupPlayer } = usePlayerStore();

  useEffect(() => {
    // Initialiser le lecteur audio
    setupPlayer();

    // Gérer les deep links pour l'authentification OAuth
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      if (url.includes('mboatune://auth')) {
        // Flux PKCE
        if (url.includes('?code=')) {
          const codeMatch = url.match(/code=([^&]+)/);
          if (codeMatch && codeMatch[1]) {
            supabase.auth.exchangeCodeForSession(codeMatch[1]).catch(console.error);
          }
        }
        // Flux Implicit
        if (url.includes('#access_token=')) {
          const accessTokenMatch = url.match(/access_token=([^&]+)/);
          const refreshTokenMatch = url.match(/refresh_token=([^&]+)/);
          if (accessTokenMatch && refreshTokenMatch) {
            supabase.auth.setSession({
              access_token: accessTokenMatch[1],
              refresh_token: refreshTokenMatch[1]
            });
          }
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, [setupPlayer]);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background}
      />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

export default App;
