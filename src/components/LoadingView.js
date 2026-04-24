import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function LoadingView({ label = 'Carregando...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#e50914" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0a0a0c',
  },
  label: {
    marginTop: 12,
    color: '#9ca3af',
    fontSize: 14,
  },
});
