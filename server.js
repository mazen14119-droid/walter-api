const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
// يمكنك هنا استخدام مفتاحك الخاص أو مفتاح عام مستقر
const TMDB_API_KEY = "15d2ea6005296a462c7328d3097b3911";

// نقطة جلب الأفلام الخاصة بك
app.get('/api/get-movies', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${page}`);
        const data = await response.json();

        if (!data.results) {
            return res.status(400).json({ success: false, message: "فشل الجلب من المصدر" });
        }

        const movies = data.results.map(item => ({
            tmdbId: item.id,
            title: item.title || item.original_title,
            poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
            overview: item.overview || "لا يوجد وصف متوفر.",
            streamUrl: `https://vidsrc.me/embed/movie?tmdb=${item.id}`,
            type: 'movie'
        }));

        res.json({ success: true, results: movies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// نقطة جلب المسلسلات الخاصة بك
app.get('/api/get-series', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const response = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${page}`);
        const data = await response.json();

        if (!data.results) {
            return res.status(400).json({ success: false, message: "فشل الجلب من المصدر" });
        }

        const series = data.results.map(item => ({
            tmdbId: item.id,
            title: item.name || item.original_name,
            poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
            overview: item.overview || "لا يوجد وصف متوفر.",
            streamUrl: `https://vidsrc.me/embed/tv?tmdb=${item.id}&season=1&episode=1`,
            type: 'series'
        }));

        res.json({ success: true, results: series });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Private API is running on port ${PORT}`);
});