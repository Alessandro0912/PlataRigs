const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authMiddleware = require('./authMiddleware');

const lagerRoutes = require('./routes/lager');
const pcsRoutes = require('./routes/pcs');
const scrapeRoutes = require('./routes/scrape');

const app = express();
app.use(cors());
app.use(express.json());

// Public-Route (keine Auth)
app.use('/api/scrape', scrapeRoutes);

// Geschützte Routen
app.use('/api/lager', authMiddleware, lagerRoutes);
app.use('/api/pcs', authMiddleware, pcsRoutes);














const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`PlataRigs Backend läuft auf Port ${PORT}`);
});

