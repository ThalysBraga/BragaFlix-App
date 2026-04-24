import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { FavoritesProvider } from './src/context/FavoritesContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <FavoritesProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </FavoritesProvider>
    </SafeAreaProvider>
  );
}
