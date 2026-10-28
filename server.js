const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MY_KEY = "1ca9345a8971570eb48c1df1e5bb70bf";

app.get('/', (req, res) => {
    res.json({ status: "Walter Store Subbed/Dubbed API is Online!" });
});

// جلب الأفلام مع روابط مشغل تدعم الترجمة العربية
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
                title: arItem.title || item.title || item.original_title, // الاسم مدعوم بالعربية إن توفر أو الإنجليزية
                poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750',
                overview: arItem.overview || item.overview || "لا يوجد وصف متوفر.",
                // استخدام مشغل يدعم خيارات الترجمة وتغيير اللغة داخل السيرفر
                streamUrl: `https://vidsrc.me/embed/movie?tmdb=${item.id}&sub=ar`,
                type: 'movie'
            };
        });

        res.json({ success: true, results: movies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// جلب المسلسلات مع روابط مشغل تدعم الترجمة العربية للمواسم والحلقات
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
                title: arItem.name || item.name || item.original_name,
                poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750',
                overview: arItem.overview || item.overview || "لا يوجد وصف متوفر.",
                // مشغل المسلسلات مع تفعيل خيار الترجمة العربية التلقائية
                streamUrl: `https://vidsrc.me/embed/tv?tmdb=${item.id}&season=1&episode=1&sub=ar`,
                type: 'series'
            };
        });

        res.json({ success: true, results: series });
    } catch (error) {
        res.status(500).json({ success: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
