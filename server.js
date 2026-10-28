const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({ status: "Server is online and ready!" });
});

// دالة جلب الأفلام البديلة والمضمونة
app.get('/api/get-movies', async (req, res) => {
    try {
        const page = req.query.page || 1;
        // استخدام رابط بديل ومباشر لجلب الأفلام الرائجة بدون أخطاء
        const response = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=15d2ea6005296a462c7328d3097b3911&page=${page}`);
        const data = await response.json();

        if (!data.results) {
            return res.json({ success: false, message: "No results" });
        }

        const movies = data.results.map(item => ({
            tmdbId: item.id,
            title: item.title || item.original_title,
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750',
            overview: item.overview || "No overview available.",
            streamUrl: `https://vidsrc.me/embed/movie?tmdb=${item.id}`,
            type: 'movie'
        }));

        res.json({ success: true, results: movies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// دالة جلب المسلسلات البديلة والمضمونة
app.get('/api/get-series', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const response = await fetch(`https://api.themoviedb.org/3/tv/top_rated?api_key=15d2ea6005296a462c7328d3097b3911&page=${page}`);
        const data = await response.json();

        if (!data.results) {
            return res.json({ success: false, message: "No results" });
        }

        const series = data.results.map(item => ({
            tmdbId: item.id,
            title: item.name || item.original_name,
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750',
            overview: item.overview || "No overview available.",
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
