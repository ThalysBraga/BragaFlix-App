const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
const BASE_URL = process.env.EXPO_PUBLIC_TMDB_BASE_URL;
const IMAGE_BASE = process.env.EXPO_PUBLIC_TMDB_IMAGE_BASE;
const BACKDROP_BASE = process.env.EXPO_PUBLIC_TMDB_BACKDROP_BASE;

async function request(path, params = {}) {
  const query = new URLSearchParams({
    api_key: API_KEY,
    language: 'pt-BR',
    ...params,
  }).toString();

  const url = `${BASE_URL}${path}?${query}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro ao buscar filmes (status ${response.status})`);
  }
  return response.json();
}

export function searchMovies(query, page = 1) {
  if (!query || !query.trim()) {
    return Promise.resolve({ results: [], total_pages: 0, page: 1, total_results: 0 });
  }
  return request('/search/movie', {
    query: query.trim(),
    page,
    include_adult: 'false',
  });
}

export function getMovieDetails(movieId) {
  return request(`/movie/${movieId}`);
}

export async function getMovieTrailer(movieId) {
  const ptBr = await request(`/movie/${movieId}/videos`, { language: 'pt-BR' });
  const pickYoutubeTrailer = (results = []) =>
    results.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.key) ||
    results.find((v) => v.site === 'YouTube' && v.type === 'Teaser' && v.key) ||
    results.find((v) => v.site === 'YouTube' && v.key) ||
    null;

  const ptTrailer = pickYoutubeTrailer(ptBr.results);
  if (ptTrailer) return ptTrailer;

  const en = await request(`/movie/${movieId}/videos`, { language: 'en-US' });
  return pickYoutubeTrailer(en.results);
}

export function buildPosterUrl(posterPath) {
  if (!posterPath) return null;
  return `${IMAGE_BASE}${posterPath}`;
}

export function buildBackdropUrl(backdropPath) {
  if (!backdropPath) return null;
  return `${BACKDROP_BASE}${backdropPath}`;
}
