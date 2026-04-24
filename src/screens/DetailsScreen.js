import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  buildBackdropUrl,
  buildPosterUrl,
  getMovieDetails,
  getMovieTrailer,
} from '../services/tmdb';
import ErrorView from '../components/ErrorView';
import GenreChip from '../components/GenreChip';
import RatingCircle from '../components/RatingCircle';
import { SkeletonDetails } from '../components/SkeletonCard';
import TrailerModal from '../components/TrailerModal';
import { useFavorites } from '../context/FavoritesContext';

const BACKDROP_HEIGHT = 340;

function formatRuntime(minutes) {
  if (!minutes || minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function formatDate(raw) {
  if (!raw) return '—';
  const [y, m, d] = raw.split('-');
  if (!y || !m || !d) return raw;
  return `${d}/${m}/${y}`;
}

export default function DetailsScreen({ route, navigation }) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const [trailer, setTrailer] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [trailerError, setTrailerError] = useState('');

  const { isFavorite, toggleFavorite } = useFavorites();
  const liked = movie ? isFavorite(movie.id) : false;
  const handleToggleLike = () => {
    if (movie) toggleFavorite(movie);
  };

  const scrollY = useRef(new Animated.Value(0)).current;

  async function load() {
    setStatus('loading');
    setErrorMessage('');
    setTrailer(null);
    setTrailerError('');
    try {
      const data = await getMovieDetails(movieId);
      setMovie(data);
      setStatus('success');

      setTrailerLoading(true);
      try {
        const video = await getMovieTrailer(movieId);
        setTrailer(video);
      } catch (err) {
        setTrailerError('Não foi possível carregar o trailer.');
      } finally {
        setTrailerLoading(false);
      }
    } catch (err) {
      setErrorMessage('Não foi possível carregar os detalhes deste filme.');
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
  }, [movieId]);

  const topBarBg = scrollY.interpolate({
    inputRange: [0, 80, 160],
    outputRange: ['rgba(10,10,12,0)', 'rgba(10,10,12,0.6)', 'rgba(10,10,12,0.95)'],
    extrapolate: 'clamp',
  });
  const titleOpacity = scrollY.interpolate({
    inputRange: [120, 180],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0c' }}>
        <StatusBar style="light" />
        <SkeletonDetails />
        <TopBar
          navigation={navigation}
          title=""
          titleOpacity={0}
          bg="rgba(10,10,12,0)"
          liked={liked}
          onToggleLike={handleToggleLike}
          staticBg
        />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0c' }}>
        <StatusBar style="light" />
        <ErrorView message={errorMessage} onRetry={load} />
        <TopBar
          navigation={navigation}
          title=""
          titleOpacity={0}
          bg="rgba(10,10,12,0.9)"
          liked={liked}
          onToggleLike={handleToggleLike}
          staticBg
        />
      </View>
    );
  }

  if (!movie) return null;

  const backdropUrl = buildBackdropUrl(movie.backdrop_path);
  const posterUrl = buildPosterUrl(movie.poster_path);
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '—';
  const runtime = formatRuntime(movie.runtime);
  const rating = typeof movie.vote_average === 'number' ? movie.vote_average : 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.backdropWrap}>
          {backdropUrl ? (
            <ImageBackground source={{ uri: backdropUrl }} style={styles.backdrop}>
              <LinearGradient
                colors={['rgba(10,10,12,0.3)', 'rgba(10,10,12,0.6)', 'rgba(10,10,12,1)']}
                style={StyleSheet.absoluteFill}
              />
            </ImageBackground>
          ) : (
            <View style={[styles.backdrop, { backgroundColor: '#1a1a1f' }]}>
              <LinearGradient
                colors={['rgba(10,10,12,0.1)', 'rgba(10,10,12,0.7)', 'rgba(10,10,12,1)']}
                style={StyleSheet.absoluteFill}
              />
            </View>
          )}
        </View>

        <View style={styles.headerRow}>
          {posterUrl ? (
            <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={[styles.poster, styles.posterPlaceholder]}>
              <Text style={{ fontSize: 28 }}>🎬</Text>
            </View>
          )}
          <View style={styles.ratingWrap}>
            <RatingCircle rating={rating} size={60} strokeWidth={3.5} />
            <Text style={styles.votesText}>{movie.vote_count || 0} votos</Text>
          </View>
        </View>

        <View style={styles.mainInfo}>
          <Text style={styles.title}>{movie.title}</Text>
          {movie.original_title && movie.original_title !== movie.title ? (
            <Text style={styles.originalTitle}>{movie.original_title}</Text>
          ) : null}
          {movie.tagline ? <Text style={styles.tagline}>"{movie.tagline}"</Text> : null}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📅</Text>
              <Text style={styles.metaText}>{year}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⏱</Text>
              <Text style={styles.metaText}>{runtime}</Text>
            </View>
          </View>

          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={[styles.ctaPrimary, (!trailer || trailerLoading) && styles.ctaPrimaryDisabled]}
              activeOpacity={0.85}
              disabled={!trailer || trailerLoading}
              onPress={() => setTrailerOpen(true)}
            >
              <Text
                style={[
                  styles.ctaPrimaryIcon,
                  (!trailer || trailerLoading) && styles.ctaPrimaryIconDisabled,
                ]}
              >
                ▶
              </Text>
              <Text
                style={[
                  styles.ctaPrimaryLabel,
                  (!trailer || trailerLoading) && styles.ctaPrimaryLabelDisabled,
                ]}
              >
                {trailerLoading
                  ? 'Buscando trailer...'
                  : trailer
                    ? 'Assistir trailer'
                    : trailerError || 'Trailer indisponível'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ctaIconBtn, liked && styles.ctaIconBtnActive]}
              onPress={handleToggleLike}
              activeOpacity={0.7}
            >
              <Text style={[styles.ctaIconText, liked && { color: '#e50914' }]}>
                {liked ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {movie.genres && movie.genres.length > 0 && (
          <Section title="Gêneros">
            <View style={styles.genresWrap}>
              {movie.genres.map((g) => (
                <GenreChip key={g.id} name={g.name} />
              ))}
            </View>
          </Section>
        )}

        <Section title="Sinopse">
          <Text style={styles.overview}>
            {movie.overview?.trim() || 'Sinopse indisponível para este título.'}
          </Text>
        </Section>

        <Section title="Ficha técnica">
          <View style={styles.factCard}>
            <FactRow label="Título original" value={movie.original_title || '—'} />
            <FactRow label="Lançamento" value={formatDate(movie.release_date)} />
            <FactRow label="Duração" value={runtime} />
            <FactRow label="Avaliação" value={`${rating.toFixed(1)} / 10`} />
            <FactRow label="ID TMDB" value={String(movie.id)} last />
          </View>
        </Section>
      </Animated.ScrollView>

      <TopBar
        navigation={navigation}
        title={movie.title}
        titleOpacity={titleOpacity}
        bg={topBarBg}
        liked={liked}
        onToggleLike={handleToggleLike}
      />

      <TrailerModal
        visible={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        videoKey={trailer?.key}
        title={movie.title}
      />
    </View>
  );
}

function TopBar({ navigation, title, titleOpacity, bg, liked, onToggleLike, staticBg }) {
  return (
    <SafeAreaView style={styles.topBarSafe} edges={['top']} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.topBarBg,
          staticBg ? { backgroundColor: bg } : { backgroundColor: bg },
        ]}
        pointerEvents="none"
      />
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.topBarBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.topBarBtnIcon}>←</Text>
        </TouchableOpacity>
        <Animated.Text
          numberOfLines={1}
          style={[styles.topBarTitle, { opacity: titleOpacity }]}
        >
          {title}
        </Animated.Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={onToggleLike}
            style={styles.topBarBtn}
            activeOpacity={0.8}
          >
            <Text style={[styles.topBarBtnIcon, liked && { color: '#e50914' }]}>
              {liked ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {children}
    </View>
  );
}

function FactRow({ label, value, last }) {
  return (
    <View style={[styles.factRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0c' },

  topBarSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topBarBg: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  topBarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarBtnIcon: { color: '#f3f4f6', fontSize: 18, fontWeight: '700' },
  topBarTitle: {
    flex: 1,
    marginHorizontal: 12,
    color: '#f3f4f6',
    fontWeight: '800',
    fontSize: 15,
    textAlign: 'center',
    letterSpacing: -0.2,
  },

  backdropWrap: { width: '100%', height: BACKDROP_HEIGHT },
  backdrop: { width: '100%', height: '100%' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 18,
    marginTop: -90,
  },
  poster: {
    width: 118,
    height: 177,
    borderRadius: 10,
    backgroundColor: '#1a1a1f',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  posterPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  ratingWrap: {
    marginLeft: 16,
    alignItems: 'center',
    paddingBottom: 6,
  },
  votesText: {
    color: '#6b7280',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },

  mainInfo: {
    paddingHorizontal: 18,
    paddingTop: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 18,
  },
  title: {
    color: '#f3f4f6',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  originalTitle: {
    color: '#9ca3af',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  tagline: {
    color: '#e50914',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 10,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaIcon: { fontSize: 13, marginRight: 6 },
  metaText: { color: '#d1d5db', fontSize: 13, fontWeight: '600' },
  metaDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 14,
  },

  ctaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  ctaPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 13,
    borderRadius: 12,
  },
  ctaPrimaryDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ctaPrimaryIcon: { color: '#0a0a0c', fontSize: 14, marginRight: 8, fontWeight: '900' },
  ctaPrimaryIconDisabled: { color: '#6b7280' },
  ctaPrimaryLabel: { color: '#0a0a0c', fontWeight: '800', fontSize: 14, letterSpacing: -0.1 },
  ctaPrimaryLabelDisabled: { color: '#9ca3af' },
  ctaIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaIconBtnActive: {
    backgroundColor: 'rgba(229,9,20,0.15)',
    borderColor: 'rgba(229,9,20,0.5)',
  },
  ctaIconText: { color: '#f3f4f6', fontSize: 20, fontWeight: '700' },

  section: { paddingHorizontal: 18, paddingTop: 22 },
  sectionLabel: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  genresWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  overview: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 22,
  },

  factCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  factLabel: { color: '#9ca3af', fontSize: 13, fontWeight: '600' },
  factValue: {
    color: '#f3f4f6',
    fontSize: 13,
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },
});
