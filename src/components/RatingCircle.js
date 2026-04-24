import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function colorForRating(rating) {
  if (rating >= 8) return '#10b981';
  if (rating >= 6.5) return '#f5c518';
  return '#ef4444';
}

export default function RatingCircle({ rating = 0, size = 52, strokeWidth = 3 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useRef(new Animated.Value(0)).current;

  const target = Math.min(Math.max(rating, 0), 10) / 10;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: target,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress, target]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const color = colorForRating(rating);
  const display = typeof rating === 'number' ? rating.toFixed(1) : '—';

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.value, { color, fontSize: size * 0.34 }]}>{display}</Text>
        <Text style={[styles.max, { fontSize: size * 0.17 }]}>/10</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: undefined,
  },
  max: {
    color: '#6b7280',
    fontWeight: '600',
    marginTop: -2,
  },
});
