'use strict';

const express = require('express');
const router = new express.Router();
const routeGuard = require('../middleware/route-guard');
const uploadMiddleware = require('../middleware/file-upload');
const listenNotesApiKey = process.env.LISTENNOTES_API_KEY;
const axios = require('axios');

router.get('/result-shuffle', async (req, res, next) => {
  try {
    const response = await axios.get(
      'https://listen-api.listennotes.com/api/v2/just_listen',
      {
        headers: {
          'X-ListenAPI-Key': `${listenNotesApiKey}`
        }
      }
    );
    const episode = response.data;
    console.log(episode);
    res.render('single-episode', { episode });
  } catch (error) {
    next(error);
  }
});

router.get('/result-shuffle-filtered', async (req, res, next) => {
  const length = req.query.duration;
  const genreId = req.query.category;
  const language = req.query.language;
  const keywordQuery = req.query.q;
  try {
    const response = await axios.get(
      `https://listen-api.listennotes.com/api/v2/search?q=${keywordQuery}&type=episode&len_max=${length}&genre_ids=${genreId}&language=${language}`,
      {
        headers: {
          'X-ListenAPI-Key': `${listenNotesApiKey}`
        }
      }
    );
    const episodeObject = response.data;
    const episodeSearchResult =
      episodeObject.results[
        Math.floor(Math.random() * episodeObject.results.length)
      ];
    const episode = {
      ...episodeSearchResult,
      title: episodeSearchResult.title_original,
      description: episodeSearchResult.description_original,
      podcast: {
        ...episodeSearchResult.podcast,
        publisher: episodeSearchResult.podcast.publisher_original
      }
    };
    res.render('single-episode', {
      keywordQuery: keywordQuery,
      episode: episode
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
    try {
      const id = await req.params.id;
      const response = await axios.get(
        `https://listen-api.listennotes.com/api/v2/episodes/${id}`,
        {
          headers: {
            'X-ListenAPI-Key': `${listenNotesApiKey}`
          }
        }
      );
      const episode = response.data;
      res.render('single-episode', { episode });
    } catch (error) {
      next(error);
    }
  });

router.get('/podcast', (req, res, next) => {
  res.render('single-podcast');
});

router.get('/podcast/:id', async (req, res, next) => {
  try {
    const id = await req.params.id;
    const response = await axios.get(
      `https://listen-api.listennotes.com/api/v2/podcasts/${id}?&sort=recent_first`,
      {
        headers: {
          'X-ListenAPI-Key': `${listenNotesApiKey}`
        }
      }
    );
    const podcast = response.data;
    res.render('single-podcast', { podcast });
  } catch (error) {
    next(error);
  }
});

module.exports = router;