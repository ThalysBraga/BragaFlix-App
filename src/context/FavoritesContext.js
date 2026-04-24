import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = '@tmdb-movies-app:favorites:v1';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setFavorites(JSON.parse(raw));
      } catch (err) {
        // ignore — start with empty list
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)).catch(() => {});
  }, [favorites, hydrated]);

  const idSet = useMemo(() => new Set(favorites.map((m) => m.id)), [favorites]);

  const isFavorite = useCallback((id) => idSet.has(id), [idSet]);

  const toggleFavorite = useCallback((movie) => {
    setFavorites((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      if (exists) return prev.filter((m) => m.id !== movie.id);
      const minimal = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        overview: movie.overview,
        vote_average: movie.vote_average,
      };
      return [minimal, ...prev];
    });
  }, []);

  const removeFavorite = useCallback((id) => {
    setFavorites((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, removeFavorite, clearFavorites, hydrated }),
    [favorites, isFavorite, toggleFavorite, removeFavorite, clearFavorites, hydrated]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
