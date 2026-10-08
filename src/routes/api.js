const express = require('express');
const { getAllCrypto, getCryptoBySymbol, getCategories } = require('../controllers/cryptoController');

const router = express.Router();

router.get('/crypto', getAllCrypto);
router.get('/crypto/:symbol', getCryptoBySymbol);
router.get('/categories', getCategories);

module.exports = router;
