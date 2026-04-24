import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites } from '../context/FavoritesContext';
import MovieCard from '../components/MovieCard';

export default function FavoritesScreen({ navigation }) {
  const { favorites, clearFavorites, removeFavorite } = useFavorites();

  const handleClear = () => {
    if (favorites.length === 0) return;
    Alert.alert(
      'Limpar favoritos',
      'Remover todos os filmes da sua lista de favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: clearFavorites },
      ]
    );
  };

  const handleLongPress = (movie) => {
    Alert.alert(movie.title, 'Remover este filme dos favoritos?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removeFavorite(movie.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>♥</Text>
          </View>
          <Text style={styles.brandTitle}>Favoritos</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{favorites.length}</Text>
          </View>
        </View>
        {favorites.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn} activeOpacity={0.7}>
            <Text style={styles.clearLabel}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <Text style={styles.emptyIcon}>♡</Text>
          </View>
          <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
          <Text style={styles.emptySubtitle}>
            Toque no coração na tela de detalhes de um filme para salvá-lo aqui.
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaLabel}>Buscar filmes</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <MovieCard
              movie={item}
              index={index}
              onPress={() =>
                navigation.navigate('Details', { movieId: item.id, title: item.title })
              }
              onLongPress={() => handleLongPress(item)}
            />
          )}
          ListHeaderComponent={
            <Text style={styles.listHeader}>
              {favorites.length === 1
                ? '1 filme salvo'
                : `${favorites.length} filmes salvos`}
            </Text>
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0c' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#e50914',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  brandTitle: {
    color: '#f3f4f6',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  badge: {
    marginLeft: 10,
    backgroundColor: 'rgba(229,9,20,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(229,9,20,0.35)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    minWidth: 26,
    alignItems: 'center',
  },
  badgeText: {
    color: '#e50914',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearLabel: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
  },

  list: { padding: 16, paddingBottom: 40 },
  listHeader: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: -40,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(229,9,20,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    color: '#e50914',
    fontSize: 44,
  },
  emptyTitle: {
    color: '#f3f4f6',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  ctaBtn: {
    backgroundColor: '#e50914',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },
  ctaLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
