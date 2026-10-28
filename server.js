const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
// ضع مفتاحك الجديد هنا بين القوسين
const MY_KEY = "1ca9345a8971570eb48c1df1e5bb70bf";

app.get('/', (req, res) => {
    res.json({ status: "API is Working Perfectly!" });
});

app.get('/api/get-movies', async (req, res) => {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${MY_KEY}&language=ar-SA&page=1`);
        const data = await response.json();

        if (!data.results) {
            return res.json({ success: false, results: [] });
        }

        const movies = data.results.map(item => ({
            tmdbId: item.id,
            title: item.title || item.original_title,
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750',
            overview: item.overview || "لا يوجد وصف متوفر.",
            streamUrl: `https://vidsrc.me/embed/movie?tmdb=${item.id}`,
            type: 'movie'
        }));

        res.json({ success: true, results: movies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/get-series', async (req, res) => {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${MY_KEY}&language=ar-SA&page=1`);
        const data = await response.json();

        if (!data.results) {
            return res.json({ success: false, results: [] });
        }

        const series = data.results.map(item => ({
            tmdbId: item.id,
            title: item.name || item.original_name,
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750',
            overview: item.overview || "لا يوجد وصف متوفر.",
            streamUrl: `https://vidsrc.me/embed/tv?tmdb=${item.id}&season=1&episode=1`,
            type: 'series'
        }));

        res.json({ success: true, results: series });
    } catch (error) {
        res.status(500).json({ success: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
