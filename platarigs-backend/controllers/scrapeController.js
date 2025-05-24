const axios = require('axios');
const cheerio = require('cheerio');

async function scrapePrice(req, res) {
  const query = req.params.query;
  const searchUrl = `https://geizhals.de/?fs=${encodeURIComponent(query)}`;

  try {
    const { data } = await axios.get(searchUrl);
    const $ = cheerio.load(data);

    const first = $('.gh_price').first().text().trim();

    res.json({ query, price: first });
  } catch (error) {
    res.status(500).json({ error: 'Scraping failed', details: error.message });
  }
}

module.exports = { scrapePrice };
