const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MY_KEY = "1ca9345a8971570eb48c1df1e5bb70bf";

app.get('/', (req, res) => {
    res.json({ status: "Walter Store Ultra Player API is Online!" });
});

// جلب الأفلام برابط مشغل عالمي ومتوافق مع جميع الأجهزة (جوال + كمبيوتر) وبدون إعلانات
app.get('/api/get-movies', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const [resEn, resAr] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${MY_KEY}&page=${page}`),
            fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${MY_KEY}&language=ar-SA&page=${page}`)
        ]);

        const dataEn = await resEn.json();
        const dataAr = await resAr.json();

        if (!dataEn.results) return res.json({ success: false, results: [] });

        const movies = dataEn.results.map((item, index) => {
            const arItem = dataAr.results && dataAr.results[index] ? dataAr.results[index] : {};
            return {
                tmdbId: item.id,
                title: item.title || item.original_title,
                poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750',
                overview: arItem.overview || item.overview || "لا يوجد وصف متوفر.",
                // استخدام مشغل VidFast / MultiEmbed النظيف والداعم للغة العربية
                streamUrl: `https://vidsrc.cc/v2/embed/movie/${item.id}?auto_play=1`,
                type: 'movie'
            };
        });

        res.json({ success: true, results: movies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// جلب المسلسلات بروابط متوافقة مع الجوال والكمبيوتر
app.get('/api/get-series', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const [resEn, resAr] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${MY_KEY}&page=${page}`),
            fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${MY_KEY}&language=ar-SA&page=${page}`)
        ]);

        const dataEn = await resEn.json();
        const dataAr = await resAr.json();

        if (!dataEn.results) return res.json({ success: false, results: [] });

        const series = dataEn.results.map((item, index) => {
            const arItem = dataAr.results && dataAr.results[index] ? dataAr.results[index] : {};
            return {
                tmdbId: item.id,
                title: item.name || item.original_name,
                poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750',
                overview: arItem.overview || item.overview || "لا يوجد وصف متوفر.",
                streamUrl: `https://vidsrc.cc/v2/embed/tv/${item.id}/1/1`,
                type: 'series'
            };
        });

        res.json({ success: true, results: series });
    } catch (error) {
        res.status(500).json({ success: error.message });
    }
});

// جلب الحلقات وأوصافها الحقيقية للمسلسلات
app.get('/api/get-episodes', async (req, res) => {
    try {
        const { tmdbId, season } = req.query;
        const response = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${season}?api_key=${MY_KEY}&language=ar-SA`);
        const data = await response.json();

        if (!data.episodes) {
            return res.json({ success: false, episodes: [] });
        }

        const episodes = data.episodes.map(ep => ({
            episodeNumber: ep.episode_number,
            name: ep.name || `الحلقة ${ep.episode_number}`,
            overview: ep.overview || "لا يتوفر وصف دقيق لهذه الحلقة حالياً.",
            stillPath: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null
        }));

        res.json({ success: true, episodes: episodes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
