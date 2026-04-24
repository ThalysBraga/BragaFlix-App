import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ErrorView({ message, onRetry, title = 'Algo deu errado' }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>⚠️</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.buttonLabel}>Tentar novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#0a0a0c',
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(239,68,68,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  icon: { fontSize: 38 },
  title: {
    color: '#f3f4f6',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
    textAlign: 'center',
  },
  message: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  button: {
    backgroundColor: '#e50914',
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
