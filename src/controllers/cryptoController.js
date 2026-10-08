const cryptoData = require('../../data/crypto.json');
const categories = require('../../data/categories.json');
const { validateFilters, applyFilters, toSummary } = require('../utils/filters');

// GET /api/crypto  (+ filter: category, min_price, max_price)
function getAllCrypto(req, res, next) {
  try {
    const { valid, errors, filters } = validateFilters(req.query, categories);

    if (!valid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid filter parameter',
        details: errors, // penjelasan tambahan untuk memudahkan debugging
      });
    }

    const result = applyFilters(cryptoData, filters).map(toSummary);

    return res.status(200).json({
      status: 'success',
      total: result.length,
      data: result,
    });
  } catch (err) {
    next(err); // diteruskan ke error handler (500) di server.js
  }
}

// GET /api/crypto/:symbol  -> detail lengkap satu coin
function getCryptoBySymbol(req, res, next) {
  try {
    const symbol = req.params.symbol.toUpperCase(); // btc / BTC / Btc -> BTC
    const coin = cryptoData.find((c) => c.symbol.toUpperCase() === symbol);

    if (!coin) {
      return res.status(404).json({
        status: 'error',
        message: 'Cryptocurrency not found',
      });
    }

    return res.status(200).json({ status: 'success', data: coin });
  } catch (err) {
    next(err);
  }
}

// GET /api/categories
function getCategories(req, res, next) {
  try {
    return res.status(200).json({ status: 'success', data: categories });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllCrypto, getCryptoBySymbol, getCategories };
