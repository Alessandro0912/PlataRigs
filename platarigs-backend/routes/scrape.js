const express = require('express');
const router = express.Router();
const { scrapePrice } = require('../controllers/scrapeController');

// GET /api/scrape/:query
router.get('/:query', scrapePrice);

module.exports = router;
