/**
 * Semua logika FILTER ada di file ini:
 *  1. validateFilters() -> cek query string (?category=...&min_price=...&max_price=...)
 *  2. applyFilters()    -> menyaring data berdasarkan filter yang valid
 *  3. toSummary()       -> memilih field ringkas untuk response list
 */

// Hanya parameter ini yang diterima oleh GET /api/crypto
const ALLOWED_PARAMS = ['category', 'min_price', 'max_price'];

// Angka harga: 0, 10, 0.5, 100.25 (tanpa tanda minus, tanpa huruf)
const PRICE_REGEX = /^\d+(\.\d+)?$/;

function validateFilters(query, categories) {
  const errors = [];
  const filters = {};

  // 1) Tolak parameter yang tidak dikenal (misal salah ketik "minprice")
  for (const key of Object.keys(query)) {
    if (!ALLOWED_PARAMS.includes(key)) {
      errors.push(`Unknown parameter "${key}". Allowed: ${ALLOWED_PARAMS.join(', ')}`);
    }
  }

  // 2) Tolak parameter yang dikirim lebih dari sekali (?category=A&category=B)
  for (const key of ALLOWED_PARAMS) {
    if (Array.isArray(query[key])) {
      errors.push(`Parameter "${key}" must be provided only once`);
    }
  }

  // 3) category (case-insensitive)
  if (typeof query.category === 'string') {
    const wanted = query.category.trim().toLowerCase();
    const match = categories.find((c) => c.toLowerCase() === wanted);
    if (!match) {
      errors.push(`Category "${query.category}" is not available. See GET /api/categories`);
    } else {
      filters.category = match; // simpan dengan huruf asli, misal "DeFi"
    }
  }

  // 4) min_price & max_price
  for (const key of ['min_price', 'max_price']) {
    if (typeof query[key] === 'string') {
      const raw = query[key].trim();
      if (!PRICE_REGEX.test(raw)) {
        errors.push(`Parameter "${key}" must be a non-negative number`);
      } else {
        filters[key] = Number(raw);
      }
    }
  }

  // 5) min_price tidak boleh lebih besar dari max_price
  if (filters.min_price !== undefined && filters.max_price !== undefined && filters.min_price > filters.max_price) {
    errors.push('min_price cannot be greater than max_price');
  }

  return { valid: errors.length === 0, errors, filters };
}

// Kedua filter digabung dengan logika AND: coin harus lolos SEMUA kondisi yang diberikan.
function applyFilters(data, { category, min_price, max_price }) {
  return data.filter((coin) => {
    if (category !== undefined && coin.category !== category) return false;
    if (min_price !== undefined && coin.price_usd < min_price) return false; // price_usd >= min_price
    if (max_price !== undefined && coin.price_usd > max_price) return false; // price_usd <= max_price
    return true;
  });
}

// Field ringkas untuk list (sesuai contoh response di brief)
function toSummary(coin) {
  return {
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    category: coin.category,
    price_usd: coin.price_usd,
    market_cap_usd: coin.market_cap_usd,
    market_cap_rank: coin.market_cap_rank,
    price_change_24h: coin.price_change_24h,
  };
}

module.exports = { validateFilters, applyFilters, toSummary };
