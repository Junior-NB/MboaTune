import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { Colors } from './src/theme/colors';
import { usePlayerStore } from './src/store/playerStore';

function App(): React.JSX.Element {
  const { setupPlayer } = usePlayerStore();

  useEffect(() => {
    // Initialiser le lecteur audio
    setupPlayer();
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
