
# 🎬 TMDb Movie & TV API Proxy

An Express.js API proxy for fetching trending, popular, top-rated, or discovered movies and TV shows from [TMDb (The Movie Database)](https://www.themoviedb.org/), with genre mapping, IMDb ID resolution, and caching for faster performance.

---

## ⭐ Features

✅ Fetch trending, popular, top-rated, and discover lists for movies and TV shows  
✅ Maps TMDb genre IDs to readable genre names  
✅ Supports filtering genres to a predefined list  
✅ Fetches IMDb IDs for each item  
✅ Caches API results and external IDs for improved performance (TTL: 6 hours)  
✅ Simple REST API endpoints  
✅ CORS enabled for frontend integrations

---

## 🚀 Endpoints

All API endpoints follow the pattern:

```

GET /\:category/\:type

```

| Category    | Type   | Description                         |
|-------------|--------|-------------------------------------|
| trending    | all    | Trending across all media types     |
| trending    | movie  | Trending movies                     |
| trending    | tv     | Trending TV shows                   |
| popular     | movie  | Popular movies                      |
| popular     | tv     | Popular TV shows                    |
| top-rated   | movie  | Top-rated movies                    |
| top-rated   | tv     | Top-rated TV shows                  |
| discover    | movie  | Discover movies                     |
| discover    | tv     | Discover TV shows                   |

### ✅ Example

**Request:**

```

GET /trending/movie

````

**Response:**

```json
[
  {
    "id": "tt1234567",
    "title": "Example Movie",
    "media_type": "movie",
    "rating": 7.5,
    "poster": "https://image.tmdb.org/t/p/w500/abc123.jpg",
    "genres": ["action", "adventure"]
  },
  ...
]
````

---

## 🗂 Available Genres

Only these genres are included in API results:

```
action, adventure, animation, anime, comedy, crime, documentary, drama,
family, fantasy, horror, music, musical, mystery, romance, sci-fi,
sport, thriller, western
```

Genres outside this list are filtered out to keep the responses consistent.

---

## ⚙️ How It Works

* Makes requests to TMDb’s REST API using a Bearer token
* Maps TMDb genre IDs to readable genres for movies and TV shows
* Resolves IMDb IDs for each result item via TMDb’s `external_ids` endpoint
* Caches:

  * API results for each route (6-hour TTL)
  * Resolved IMDb IDs for each media item

---

## 🔐 Environment Variables

Create a `.env` file in your project root:

```
TMDB_TOKEN=your_tmdb_api_token
PORT=3000
```

* **TMDB\_TOKEN** → Your TMDb Bearer token
* **PORT** → (Optional) Server port (defaults to 3000)

---

## 🏃‍♂️ Run Locally

1. **Install dependencies**

```
npm install
```

2. **Create your .env file**

```
TMDB_TOKEN=your_tmdb_api_token
PORT=3000
```

3. **Start the server**

```
node index.js
```

or, if you use `nodemon`:

```
npx nodemon index.js
```

The API will run at:

```
http://localhost:3000
```

---

## 💡 Use Cases

* Frontend movie or TV show apps
* Recommendation engines
* Bots that deliver trending movie/TV info
* Quick IMDb integration using TMDb data

---

## 📝 License

[MIT License ©](LICENSE) [Samir Thakuri](https://github.com/notsopreety)

---

## 🙏 Acknowledgements

* [The Movie Database (TMDb)](https://www.themoviedb.org/)
