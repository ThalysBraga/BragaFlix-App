import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

function Shimmer({ style }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const opacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.35, 1, 0.35],
  });

  return <Animated.View style={[styles.shimmerBase, style, { opacity }]} />;
}

export default function SkeletonCard({ delay = 0 }) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      delay,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [fade, delay]);

  return (
    <Animated.View style={[styles.card, { opacity: fade }]}>
      <Shimmer style={styles.poster} />
      <View style={styles.info}>
        <Shimmer style={[styles.line, { width: '70%', height: 16 }]} />
        <Shimmer style={[styles.line, { width: '35%', height: 12, marginTop: 8 }]} />
        <Shimmer style={[styles.line, { width: '100%', height: 10, marginTop: 14 }]} />
        <Shimmer style={[styles.line, { width: '95%', height: 10, marginTop: 6 }]} />
        <Shimmer style={[styles.line, { width: '60%', height: 10, marginTop: 6 }]} />
      </View>
    </Animated.View>
  );
}

export function SkeletonDetails() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0c' }}>
      <Shimmer style={styles.backdropSkeleton} />
      <View style={styles.detailsContent}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <Shimmer style={styles.posterLarge} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Shimmer style={[styles.line, { width: '50%', height: 12 }]} />
            <Shimmer style={[styles.line, { width: '80%', height: 18, marginTop: 10 }]} />
          </View>
        </View>
        <Shimmer style={[styles.line, { width: '60%', height: 12, marginTop: 24 }]} />
        <Shimmer style={[styles.line, { width: '100%', height: 12, marginTop: 14 }]} />
        <Shimmer style={[styles.line, { width: '95%', height: 12, marginTop: 8 }]} />
        <Shimmer style={[styles.line, { width: '90%', height: 12, marginTop: 8 }]} />
        <Shimmer style={[styles.line, { width: '70%', height: 12, marginTop: 8 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shimmerBase: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    overflow: 'hidden',
  },
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
  },
  info: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 4,
  },
  line: {
    borderRadius: 4,
  },
  backdropSkeleton: {
    width: '100%',
    height: 340,
    borderRadius: 0,
  },
  detailsContent: {
    padding: 18,
    marginTop: -60,
  },
  posterLarge: {
    width: 118,
    height: 177,
    borderRadius: 10,
  },
});
