# BragaFlix

Aplicativo mobile de busca e catálogo de filmes construído em React Native (Expo SDK 54), consumindo a API do The Movie Database (TMDB). Inclui busca paginada, tela de detalhes, trailer embutido do YouTube e favoritos persistidos localmente.

![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo&logoColor=white)
![React Navigation](https://img.shields.io/badge/React_Navigation-7-8A4FFF)
![TMDB API](https://img.shields.io/badge/API-TMDB-01B4E4?logo=themoviedatabase&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Sobre o projeto

O **BragaFlix** foi construído como exercício para demonstrar a integração entre frontend mobile e uma API REST pública, aplicando práticas modernas de React Native: componentes funcionais, hooks, Context API, navegação em múltiplas camadas e persistência local. O projeto prioriza **clareza de arquitetura**, **feedback visual consistente** e **separação de responsabilidades**.

A UI segue um design dark inspirado em plataformas de streaming, com microinterações (skeletons animados, round rating progressivo, fade-in escalonado de cards) e gestos nativos (swipe entre abas, pull-to-refresh-like navigation).

---

## Preview

> *Capturas de tela e GIF demonstrativo serão adicionados em breve.*

```
[ busca ]  →  [ lista ]  →  [ detalhes ]  →  [ trailer ]  →  [ favoritos ]
```

---

## Principais funcionalidades

- **Busca de filmes** com paginação incremental (infinite scroll) e dismiss inteligente do teclado.
- **Tela de detalhes** com backdrop animado, círculo de rating SVG progressivo e chips coloridos de gênero.
- **Trailer do YouTube embutido** via WebView (sem sair do app).
- **Favoritos persistentes** armazenados com AsyncStorage — sobrevivem ao fechamento do app.
- **Navegação entre abas com gesto de arraste** (swipe) além do toque.
- **Máquina de estados explícita** (`idle` / `loading` / `success` / `empty` / `error`) para eliminar UI inconsistente.
- **Tratamento completo de erros** com botão de retry em todas as operações de rede.
- **Respeito a safe areas** (home indicator iOS / barra de gestos Android).
- **Localização em português** (pt-BR) em toda a interface e chamadas à API, com fallback para en-US em trailers.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Expo SDK 54 + React Native 0.81 |
| Linguagem | JavaScript (ES2022) |
| Navegação | React Navigation 7 (native-stack + material-top-tabs) |
| Gestos | react-native-pager-view |
| Estado global | Context API + hooks |
| Persistência | @react-native-async-storage/async-storage |
| HTTP | Fetch API (nativo) |
| Gráficos | react-native-svg (rating circle animado) |
| Vídeo | react-native-webview + react-native-youtube-iframe |
| Gradientes | expo-linear-gradient |

---

## Arquitetura

O projeto é dividido em camadas com responsabilidades bem definidas. Cada camada conhece apenas o que precisa:

```
src/
├── services/          # única camada que conversa com a API
├── context/           # estado global compartilhado entre telas
├── navigation/        # estrutura de rotas (Stack + Tabs)
├── screens/           # orquestradores: estado + chamadas + composição
└── components/        # UI pura, sem fetch, reutilizáveis
```

- **Services** isolam a API — se o endpoint mudar, um único arquivo é tocado.
- **Components** são stateless em relação a dados externos — recebem props e renderizam. Testáveis em isolamento.
- **Screens** conectam services a components, gerenciam estados de UI (loading, error, success, empty) e navegação.

---

## Destaques técnicos

Decisões de design que valem a leitura, não só escolhas de biblioteca:

### 1. Máquina de estados em vez de múltiplos booleanos
Em vez de `isLoading`, `isError`, `isSuccess` concorrentes, cada tela usa uma única string de estado (`'idle' | 'loading' | 'success' | 'empty' | 'error'`). Isso torna **impossível** entrar em estados inválidos como "carregando e com erro ao mesmo tempo".

### 2. Paginação incremental com guardas
O `onEndReached` do FlatList dispara uma nova requisição quando o usuário chega a 50% do fim. A próxima página só é pedida se `page < total_pages`, evitando requisições inúteis. Os resultados são concatenados no array existente.

### 3. Fallback inteligente de idioma para trailers
Filmes antigos raramente têm trailer dublado em português. A lógica tenta pt-BR primeiro; se não encontrar, cai em en-US; se ainda assim não houver `Trailer`, aceita `Teaser`; último recurso: qualquer vídeo do YouTube. Isso cobre >95% do catálogo.

### 4. Animação de rating via SVG + Animated API
O círculo de avaliação é um SVG com `strokeDashoffset` interpolado pela Animated API nativa do React Native. Ao montar, o arco preenche progressivamente de 0 até a porcentagem correta em 1s, com cor baseada na nota (verde ≥ 8, amarelo ≥ 6.5, vermelho < 6.5).

### 5. Top bar da tela de detalhes animada por scroll
`Animated.ScrollView` + `onScroll` interpolam o background da top bar e a opacidade do título conforme o usuário rola — a barra aparece gradualmente e o título do filme ganha visibilidade após 120px de scroll, usando `useNativeDriver: false` para animar `backgroundColor`.

### 6. Swipe gesture entre abas
Em vez do `bottom-tabs` padrão, o projeto usa `material-top-tabs` com `tabBarPosition="bottom"` e uma tab bar 100% customizada. Isso preserva a aparência de bottom tabs mas adiciona o gesto nativo de arraste horizontal — experiência típica de apps como Instagram/WhatsApp.

### 7. Skeleton loading com shimmer
Em vez de um spinner genérico, a busca mostra 5 skeletons animados (shimmer via `Animated` em loop). O usuário já vê a estrutura do conteúdo que vai aparecer, o que reduz a percepção de tempo de espera.

### 8. Persistência hidratada automaticamente
O `FavoritesContext` lê o AsyncStorage ao montar e dispara gravação em disco via `useEffect` sempre que a lista muda. Só campos essenciais do filme são persistidos (não a resposta completa da API) para economizar espaço.

### 9. Segurança de API key
A chave TMDB fica em `.env` com prefixo `EXPO_PUBLIC_` (convenção Expo SDK 54), o arquivo está no `.gitignore` e um `.env.example` serve como template. Em produção real, essa chave estaria em um backend proxy — o projeto documenta isso explicitamente.

### 10. Safe areas em todos os edges
A tab bar usa `useSafeAreaInsets()` para calcular dinamicamente o padding inferior e não competir com o home indicator (iOS) ou barra de gestos (Android). `tabBarHideOnKeyboard` esconde a barra quando o teclado sobe.

---

## Como executar

### Pré-requisitos
- Node.js 18+
- App **Expo Go** no celular (Android ou iOS, compatível com SDK 54)
- Celular e computador na mesma rede Wi-Fi

### Passos

```bash
# Clonar o repositório
git clone https://github.com/<seu-usuario>/bragaflix.git
cd bragaflix

# Instalar dependências
npm install

# Copiar template de variáveis e preencher a API key
cp .env.example .env
# edite .env e preencha EXPO_PUBLIC_TMDB_API_KEY com sua chave da TMDB

# Iniciar o bundler (com cache limpo — obrigatório após mudar .env)
npx expo start -c
```

Um **QR code** será exibido no terminal:
- **Android:** abra o Expo Go e escaneie.
- **iOS:** abra o app Câmera e aponte pro QR.

> Para obter uma API key TMDB gratuita, crie uma conta em [themoviedb.org](https://www.themoviedb.org/) e acesse *Settings → API*.

---

## Estrutura de pastas

```
bragaflix/
├── App.js                         # Entry point: providers + navigator
├── app.json                       # Configuração do Expo
├── .env.example                   # Template de variáveis (versionado)
├── package.json
└── src/
    ├── services/
    │   └── tmdb.js                # searchMovies, getMovieDetails, getMovieTrailer, buildPosterUrl
    ├── context/
    │   └── FavoritesContext.js    # Context + persistência AsyncStorage
    ├── navigation/
    │   └── AppNavigator.js        # Stack + Tabs customizadas
    ├── screens/
    │   ├── SearchScreen.js        # Busca com 5 estados + paginação
    │   ├── DetailsScreen.js       # Detalhes com backdrop animado + trailer
    │   └── FavoritesScreen.js     # Lista de favoritos com long-press
    └── components/
        ├── MovieCard.js           # Card com fade-up animado
        ├── RatingCircle.js        # Rating SVG progressivo
        ├── GenreChip.js           # Chip colorido por gênero
        ├── SkeletonCard.js        # Loading placeholder com shimmer
        ├── LoadingView.js
        ├── ErrorView.js
        └── TrailerModal.js        # Modal com player YouTube
```

---

## API TMDB — Endpoints utilizados

Todas as requisições enviam `language=pt-BR` como preferência.

| Método | Endpoint | Uso |
|---|---|---|
| GET | `/search/movie?query={term}&page={N}` | Busca paginada |
| GET | `/movie/{id}` | Detalhes completos do filme |
| GET | `/movie/{id}/videos` | Trailers (YouTube) |

- Pôsteres: `https://image.tmdb.org/t/p/w500{poster_path}`
- Backdrops: `https://image.tmdb.org/t/p/w780{backdrop_path}`

---

## Roadmap

Ideias mapeadas para versões futuras:

- [ ] Cache de requisições com React Query
- [ ] Busca por gênero/ano (`/discover/movie`)
- [ ] Recomendações relacionadas (`/movie/{id}/recommendations`)
- [ ] Elenco e equipe (`/movie/{id}/credits`)
- [ ] Carrossel de múltiplos trailers
- [ ] Compartilhamento nativo (`react-native-share`)
- [ ] Busca por voz (`expo-speech`)
- [ ] Autenticação e favoritos sincronizados em backend próprio
- [ ] Testes unitários e de integração (Jest + RNTL)
- [ ] Build de produção via EAS (.apk / .ipa)

---

## Aprendizados do projeto

- Arquitetura em camadas reduz custo de manutenção e isolamento de falhas.
- Máquinas de estado explícitas são muito superiores a múltiplos booleanos para UI assíncrona.
- Expo SDK 54 entrega uma experiência de desenvolvimento extremamente produtiva sem sacrificar capacidade.
- `Animated.ScrollView` interpolando propriedades nativas dá vida a interfaces sem custo perceptível de performance.
- Segregar "UI pura" (components) de "lógica de tela" (screens) acelera testes e refatorações.

---

## Autor

**Thalys Alves Braga**
Desenvolvedor de software — [linkedin.com/in/thalys-braga](#) | [github.com/thalys-braga](#)

---

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

Dados de filmes fornecidos pela [The Movie Database (TMDB)](https://www.themoviedb.org/). Este produto usa a API TMDB mas não é endossado ou certificado por TMDB.
