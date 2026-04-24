import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

export default function TrailerModal({ visible, onClose, videoKey, title }) {
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(true);

  const width = Dimensions.get('window').width;
  const playerWidth = Math.min(width - 24, 560);
  const playerHeight = Math.round((playerWidth * 9) / 16);

  const onStateChange = useCallback((state) => {
    if (state === 'ended') setPlaying(false);
  }, []);

  const handleClose = () => {
    setPlaying(false);
    setReady(false);
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {title || 'Trailer'}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.playerWrap, { width: playerWidth, height: playerHeight }]}>
          {!ready && (
            <View style={[styles.loading, { width: playerWidth, height: playerHeight }]}>
              <ActivityIndicator size="large" color="#e50914" />
              <Text style={styles.loadingLabel}>Carregando trailer...</Text>
            </View>
          )}
          {videoKey ? (
            <YoutubePlayer
              height={playerHeight}
              width={playerWidth}
              play={playing}
              videoId={videoKey}
              onReady={() => setReady(true)}
              onChangeState={onStateChange}
              webViewProps={{
                androidLayerType: 'hardware',
              }}
            />
          ) : null}
        </View>

        <Text style={styles.hint}>Toque fora da área do vídeo ou no X para fechar.</Text>
        <TouchableOpacity style={styles.outside} onPress={handleClose} activeOpacity={1} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
    zIndex: 2,
  },
  title: {
    color: '#f3f4f6',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    flex: 1,
    marginRight: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: '#f3f4f6',
    fontSize: 16,
    fontWeight: '700',
  },
  playerWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    zIndex: 2,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    zIndex: 1,
  },
  loadingLabel: {
    color: '#9ca3af',
    marginTop: 10,
    fontSize: 13,
  },
  hint: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 16,
    zIndex: 2,
  },
  outside: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});
