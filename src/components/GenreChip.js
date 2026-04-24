import { StyleSheet, Text, View } from 'react-native';

const GENRE_COLORS = {
  'Ação': '#e11d48',
  'Action': '#e11d48',
  'Aventura': '#f59e0b',
  'Adventure': '#f59e0b',
  'Animação': '#8b5cf6',
  'Animation': '#8b5cf6',
  'Comédia': '#eab308',
  'Comedy': '#eab308',
  'Crime': '#64748b',
  'Documentário': '#0ea5e9',
  'Documentary': '#0ea5e9',
  'Drama': '#dc2626',
  'Família': '#f97316',
  'Family': '#f97316',
  'Fantasia': '#a855f7',
  'Fantasy': '#a855f7',
  'História': '#92400e',
  'History': '#92400e',
  'Terror': '#7f1d1d',
  'Horror': '#7f1d1d',
  'Música': '#14b8a6',
  'Music': '#14b8a6',
  'Mistério': '#4f46e5',
  'Mystery': '#4f46e5',
  'Romance': '#f43f5e',
  'Ficção científica': '#06b6d4',
  'Science Fiction': '#06b6d4',
  'Cinema TV': '#475569',
  'TV Movie': '#475569',
  'Thriller': '#78350f',
  'Suspense': '#78350f',
  'Guerra': '#166534',
  'War': '#166534',
  'Faroeste': '#854d0e',
  'Western': '#854d0e',
};

function getColor(name) {
  if (GENRE_COLORS[name]) return GENRE_COLORS[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = ['#e11d48', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#eab308'];
  return palette[Math.abs(hash) % palette.length];
}

export default function GenreChip({ name }) {
  const color = getColor(name);
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: `${color}22`, borderColor: `${color}55` },
      ]}
    >
      <Text style={[styles.text, { color }]}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
