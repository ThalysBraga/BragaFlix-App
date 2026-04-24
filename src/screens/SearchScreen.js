import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchMovies } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import ErrorView from '../components/ErrorView';
import SkeletonCard from '../components/SkeletonCard';

const TRENDING = ['Matrix', 'Batman', 'Vingadores', 'Inception', 'Nemo', 'Pulp Fiction'];

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastQuery, setLastQuery] = useState('');

  const runSearch = useCallback(
    async (nextPage = 1, searchTerm) => {
      const term = (searchTerm ?? query).trim();
      if (!term) return;

      Keyboard.dismiss();
      if (nextPage === 1) {
        setStatus('loading');
        setMovies([]);
      } else {
        setStatus('loadingMore');
      }
      setErrorMessage('');

      try {
        const data = await searchMovies(term, nextPage);
        setMovies((prev) => (nextPage === 1 ? data.results : [...prev, ...data.results]));
        setPage(data.page);
        setTotalPages(data.total_pages);
        setTotalResults(data.total_results);
        setLastQuery(term);
        setStatus(data.results.length === 0 && nextPage === 1 ? 'empty' : 'success');
      } catch (err) {
        setErrorMessage('Não foi possível buscar filmes. Verifique sua conexão e tente novamente.');
        setStatus('error');
      }
    },
    [query]
  );

  const handleLoadMore = () => {
    if (status !== 'success' || page >= totalPages) return;
    runSearch(page + 1, lastQuery);
  };

  const handleTrendingTap = (term) => {
    setQuery(term);
    runSearch(1, term);
  };

  const handleClear = () => {
    setQuery('');
    setMovies([]);
    setPage(1);
    setTotalPages(0);
    setTotalResults(0);
    setLastQuery('');
    setErrorMessage('');
    setStatus('idle');
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <Text style={styles.brandTitle}>BragaFlix</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>TMDB</Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.inputWrap}>
            <Text style={styles.searchIcon}>🔎</Text>
            <TextInput
              style={styles.input}
              placeholder="Buscar filmes..."
              placeholderTextColor="#6b7280"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => runSearch(1)}
              returnKeyType="search"
              autoCorrect={false}
              selectionColor="#e50914"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.button} onPress={() => runSearch(1)} activeOpacity={0.8}>
            <Text style={styles.buttonLabel}>Buscar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {status === 'idle' && <IdleView onPick={handleTrendingTap} />}

        {status === 'loading' && (
          <View style={styles.listWrap}>
            {[0, 1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} delay={i * 80} />
            ))}
          </View>
        )}

        {status === 'error' && (
          <ErrorView message={errorMessage} onRetry={() => runSearch(1, lastQuery || query)} />
        )}

        {status === 'empty' && <EmptyView query={lastQuery} />}

        {(status === 'success' || status === 'loadingMore') && (
          <FlatList
            data={movies}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item, index }) => (
              <MovieCard
                movie={item}
                index={index}
                onPress={() =>
                  navigation.navigate('Details', { movieId: item.id, title: item.title })
                }
              />
            )}
            ListHeaderComponent={
              <Text style={styles.resultsHeader}>
                {totalResults} resultados para "{lastQuery}"
              </Text>
            }
            contentContainerStyle={styles.list}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              status === 'loadingMore' ? (
                <ActivityIndicator style={{ marginVertical: 20 }} color="#e50914" />
              ) : null
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function IdleView({ onPick }) {
  return (
    <View style={styles.idleWrap}>
      <View style={styles.idleIconWrap}>
        <Text style={styles.idleIcon}>🔎</Text>
      </View>
      <Text style={styles.idleTitle}>Bem-vindo ao BragaFlix</Text>
      <Text style={styles.idleSubtitle}>
        Explore milhares de filmes via TMDB. Digite um nome na barra de busca ou escolha uma sugestão abaixo.
      </Text>

      <Text style={styles.sectionLabel}>Tendências</Text>
      <View style={styles.chipsWrap}>
        {TRENDING.map((term) => (
          <TouchableOpacity
            key={term}
            style={styles.trendChip}
            onPress={() => onPick(term)}
            activeOpacity={0.8}
          >
            <Text style={styles.trendChipText}>{term}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function EmptyView({ query }) {
  return (
    <View style={styles.idleWrap}>
      <View style={[styles.idleIconWrap, { backgroundColor: 'rgba(156,163,175,0.12)' }]}>
        <Text style={styles.idleIcon}>🎬</Text>
      </View>
      <Text style={styles.idleTitle}>Nenhum filme encontrado</Text>
      <Text style={styles.idleSubtitle}>
        Não achamos resultados para "{query}". Tente outro termo ou verifique a ortografia.
      </Text>
      <Text style={styles.sectionLabel}>Tente também</Text>
      <View style={styles.chipsWrap}>
        {['Interstellar', 'Duna', 'Oppenheimer', 'Parasita'].map((term) => (
          <View key={term} style={styles.trendChip}>
            <Text style={styles.trendChipText}>{term}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0c' },
  header: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#0a0a0c',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#e50914',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: { color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: -0.5 },
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    color: '#e50914',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: { fontSize: 14, marginRight: 8, color: '#9ca3af' },
  input: {
    flex: 1,
    color: '#f3f4f6',
    paddingVertical: 10,
    fontSize: 14,
  },
  clearBtn: {
    padding: 6,
    marginLeft: 4,
  },
  clearIcon: { color: '#9ca3af', fontSize: 14, fontWeight: '700' },
  button: {
    marginLeft: 8,
    backgroundColor: '#e50914',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
  },
  buttonLabel: { color: '#fff', fontWeight: '700', fontSize: 13 },
  content: { flex: 1 },
  listWrap: { padding: 16 },
  list: { padding: 16, paddingBottom: 40 },
  resultsHeader: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  idleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
  },
  idleIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(229,9,20,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  idleIcon: { fontSize: 38 },
  idleTitle: {
    color: '#f3f4f6',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  idleSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'stretch',
  },
  trendChip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  trendChipText: {
    color: '#f3f4f6',
    fontSize: 13,
    fontWeight: '600',
  },
});
