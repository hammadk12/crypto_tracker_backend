const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache')
const cache = new NodeCache ({ stdTTL: 300 }) // cache for 5 min
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

// Proxy endpoint
app.get('/api/coins', async (req, res) => {
    const cacheKey = 'coinData';
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
        console.log('Serving from cache')
        return res.json(cachedData)
    }

  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 10,
        page: 1
      }
    });
    cache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Failed to fetch data:", error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
