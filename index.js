const express = require("express");
const axios = require("axios");
const cors = require("cors");
const NodeCache = require("node-cache");

const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Setup cache (TTL: 6 hours = 21600 seconds)
const cache = new NodeCache({ stdTTL: 21600 });

const TMDB_TOKEN = process.env.TMDB_TOKEN;
const TMDB_BASE = "https://api.themoviedb.org/3";
const POSTER_URL = "https://image.tmdb.org/t/p/w500";

// Available genres
const AVAILABLE_GENRES = [
  "action", "adventure", "animation", "anime", "comedy", "crime",
  "documentary", "drama", "family", "fantasy", "horror", "music",
  "musical", "mystery", "romance", "sci-fi", "sport", "thriller", "western"
];

// Genre mappings with splitting for combined genres
const movieGenres = {
  28: ["action"],
  12: ["adventure"],
  16: ["animation"],
  35: ["comedy"],
  80: ["crime"],
  99: ["documentary"],
  18: ["drama"],
  10751: ["family"],
  14: ["fantasy"],
  36: ["history"],
  27: ["horror"],
  10402: ["music", "musical"],
  9648: ["mystery"],
  10749: ["romance"],
  878: ["sci-fi"],
  10770: ["drama"], // TV Movie mapped to drama
  53: ["thriller"],
  10752: ["war"], // War mapped to drama or thriller if needed, but excluded as not in AVAILABLE_GENRES
  37: ["western"]
};

const tvGenres = {
  10759: ["action", "adventure"],
  16: ["animation", "anime"],
  35: ["comedy"],
  80: ["crime"],
  99: ["documentary"],
  18: ["drama"],
  10751: ["family"],
  10762: ["family"], // Kids mapped to family
  9648: ["mystery"],
  10763: ["news"], // News excluded as not in AVAILABLE_GENRES
  10764: ["reality"], // Reality excluded as not in AVAILABLE_GENRES
  10765: ["sci-fi", "fantasy"],
  10766: ["drama"], // Soap mapped to drama
  10767: ["talk"], // Talk excluded as not in AVAILABLE_GENRES
  10768: ["war"], // War & Politics mapped to drama or thriller, excluded as not in AVAILABLE_GENRES
  37: ["western"]
};

// Route Map
const routeMap = {
  trending: {
    all: "/trending/all/day?language=en-US",
    movie: "/trending/movie/day?language=en-US",
    tv: "/trending/tv/day?language=en-US"
  },
  popular: {
    movie: "/movie/popular?language=en-US&page=1",
    tv: "/tv/popular?language=en-US&page=1"
  },
  "top-rated": {
    movie: "/movie/top_rated?language=en-US&page=1",
    tv: "/tv/top_rated?language=en-US&page=1"
  },
  discover: {
    movie: "/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc",
    tv: "/discover/tv?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc"
  }
};

// Fetch External IMDb ID with caching
const fetchExternalId = async (id, type) => {
  const cacheKey = `imdb:${type}:${id}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const url = `${TMDB_BASE}/${type}/${id}/external_ids`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
    });

    const imdbId = res.data.imdb_id || null;
    cache.set(cacheKey, imdbId);
    return imdbId;
  } catch {
    return null;
  }
};

// Format Response
const formatItems = async (items) => {
  const formatted = [];

  for (const item of items) {
    const id = item.id;
    const title = item.title || item.name;
    const media_type = item.media_type || (item.first_air_date ? "tv" : "movie");
    const rating = item.vote_average;
    const poster = item.poster_path ? POSTER_URL + item.poster_path : null;
    const genre_ids = item.genre_ids || [];
    const genres = genre_ids
      .flatMap(id => (media_type === "movie" ? movieGenres[id] : tvGenres[id]) || [])
      .filter(genre => AVAILABLE_GENRES.includes(genre));

    const imdb_id = await fetchExternalId(id, media_type);
    if (!imdb_id) continue;

    formatted.push({
      id: imdb_id,
      title,
      media_type,
      rating,
      poster,
      genres
    });
  }

  return formatted;
};

// API Endpoint
app.get("/:category/:type", async (req, res) => {
  const { category, type } = req.params;
  const route = routeMap[category]?.[type];
  if (!route) {
    return res.status(400).json({ error: "Invalid category or type." });
  }

  const cacheKey = `${category}:${type}`;
  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }

  try {
    const response = await axios.get(`${TMDB_BASE}${route}`, {
      headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
    });

    const items = await formatItems(response.data.results);
    cache.set(cacheKey, items);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API running at http://localhost:${PORT}`);
});