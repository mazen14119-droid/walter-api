const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
// مفتاح بديل ومستقر لجلب البيانات بدون توقف
const TMDB_API_KEY = "c819208017371c6680a6713cd10894ae";

app.get('/', (req, res) => {
    res.json({ status: "Server is online and ready!" });
});

app.get('/api/get-movies', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=ar-SA&sort_by=popularity.desc&page=${page}`);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return res.json({ success: false, message: "No results found" });
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
        const page = req.query.page || 1;
        const response = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=ar-SA&sort_by=popularity.desc&page=${page}`);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return res.json({ success: false, message: "No results found" });
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
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Private API is running on port ${PORT}`);
});
