const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MY_KEY = "1ca9345a8971570eb48c1df1e5bb70bf"; // مفتاحك الخاص الشغال

app.get('/', (req, res) => {
    res.json({ status: "Walter Store Ultimate API is Online!" });
});

// دالة لجلب أرشيف ضخم وشامل للأفلام (الرائجة + الأعلى تقييماً + الجديدة)
app.get('/api/get-movies', async (req, res) => {
    try {
        const page = req.query.page || 1;
        
        // نسحب من عدة قوائم في وقت واحد لنضمن الامتلاء (Popular + Top Rated)
        const [res1, res2] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${MY_KEY}&page=${page}`),
            fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${MY_KEY}&page=${page}`)
        ]);

        const data1 = await res1.json();
        const data2 = await res2.json();

        // دمج النتائج بدون تكرار
        const combined = [...(data1.results || []), ...(data2.results || [])];
        const uniqueMovies = Array.from(new Map(combined.map(item => [item.id, item])).values());

        if (uniqueMovies.length === 0) {
            return res.json({ success: false, results: [] });
        }

        const movies = uniqueMovies.map(item => ({
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

// دالة لجلب أرشيف ضخم وشامل للمسلسلات
app.get('/api/get-series', async (req, res) => {
    try {
        const page = req.query.page || 1;

        const [res1, res2] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${MY_KEY}&page=${page}`),
            fetch(`https://api.themoviedb.org/3/tv/top_rated?api_key=${MY_KEY}&page=${page}`)
        ]);

        const data1 = await res1.json();
        const data2 = await res2.json();

        const combined = [...(data1.results || []), ...(data2.results || [])];
        const uniqueSeries = Array.from(new Map(combined.map(item => [item.id, item])).values());

        if (uniqueSeries.length === 0) {
            return res.json({ success: false, results: [] });
        }

        const series = uniqueSeries.map(item => ({
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
