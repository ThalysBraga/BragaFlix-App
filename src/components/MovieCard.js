import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { buildPosterUrl } from '../services/tmdb';

function ratingColor(rating) {
  if (rating >= 8) return '#10b981';
  if (rating >= 6.5) return '#f5c518';
  return '#ef4444';
}

export default function MovieCard({ movie, onPress, onLongPress, index = 0 }) {
  const posterUrl = buildPosterUrl(movie.poster_path);
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '—';
  const overview = movie.overview?.trim() || 'Sem sinopse disponível.';
  const rating = typeof movie.vote_average === 'number' ? movie.vote_average : null;

  const translate = useRef(new Animated.Value(12)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = Math.min(index, 10) * 60;
    Animated.parallel([
      Animated.timing(translate, {
        toValue: 0,
        duration: 380,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translate]);

  return (
    <Animated.View style={{ transform: [{ translateY: translate }], opacity }}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={350}
        activeOpacity={0.75}
      >
        {posterUrl ? (
          <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Text style={styles.placeholderIcon}>🎬</Text>
            <Text style={styles.placeholderText}>Sem imagem</Text>
          </View>
        )}

        {rating !== null && (
          <View
            style={[
              styles.ratingBadge,
              { backgroundColor: `${ratingColor(rating)}22`, borderColor: `${ratingColor(rating)}66` },
            ]}
          >
            <Text style={[styles.ratingIcon, { color: ratingColor(rating) }]}>★</Text>
            <Text style={[styles.ratingText, { color: ratingColor(rating) }]}>
              {rating.toFixed(1)}
            </Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {movie.title}
          </Text>
          <Text style={styles.year}>{year}</Text>
          <Text style={styles.overview} numberOfLines={3}>
            {overview}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  poster: {
    width: 78,
    height: 117,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  posterPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: { fontSize: 20, marginBottom: 4 },
  placeholderText: { color: '#6b7280', fontSize: 10, textAlign: 'center' },
  ratingBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: { fontSize: 11, marginRight: 3 },
  ratingText: { fontSize: 11, fontWeight: '700' },
  info: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 4,
  },
  title: {
    color: '#f3f4f6',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
    paddingRight: 58,
  },
  year: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 6,
  },
  overview: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 17,
  },
});
