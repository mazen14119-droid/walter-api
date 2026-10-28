const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MY_KEY = "1ca9345a8971570eb48c1df1e5bb70bf";

app.get('/', (req, res) => {
    res.json({ status: "Walter Store Smart Search & Multi-Server API is Online!" });
});

// 1. مسار البحث التلقائي الجالب للبوستر والوصف العربي (لتسهيل إضافة المدبلج والخاص)
app.get('/api/search-tmdb', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json({ success: false, results: [] });

        // البحث باللغتين لضمان جلب الوصف العربي مع الاسم الأصلي والبوستر
        const [resAr, resEn] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/search/multi?api_key=${MY_KEY}&language=ar-SA&query=${encodeURIComponent(query)}`),
            fetch(`https://api.themoviedb.org/3/search/multi?api_key=${MY_KEY}&language=en-US&query=${encodeURIComponent(query)}`)
        ]);

        const dataAr = await resAr.json();
        const dataEn = await resEn.json();

        if (!dataAr.results) return res.json({ success: false, results: [] });

        const results = dataAr.results
            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
            .slice(0, 8)
            .map(item => {
                const enMatch = (dataEn.results || []).find(e => e.id === item.id) || {};
                const isMovie = item.media_type === 'movie';
                return {
                    tmdbId: item.id,
                    title: isMovie 
                        ? (enMatch.title || item.original_title || item.title) 
                        : (enMatch.name || item.original_name || item.name),
                    arTitle: isMovie ? item.title : item.name,
                    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster',
                    overview: item.overview || enMatch.overview || "لا يوجد وصف متوفر.",
                    type: isMovie ? 'movie' : 'series',
                    year: (item.release_date || item.first_air_date || '').substring(0, 4)
                };
            });

        res.json({ success: true, results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. جلب الأفلام العامة
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
                streamUrl: `https://multiembed.mov/?video_id=${item.id}&tmdb=1`,
                type: 'movie'
            };
        });

        res.json({ success: true, results: movies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. جلب المسلسلات العامة
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

        const series = dataEn.results.map((item, index
