# Crypto API (Data Dummy)

REST API cryptocurrency sederhana (Node.js + Express) untuk latihan frontend/backend dan fitur filter.
Tanpa database, tanpa API key. Data = **200 cryptocurrency dummy** di `data/crypto.json`.

## Struktur Folder

```
crypto-api/
├── server.js                      # Entry point: setup Express, CORS, 404 & 500 handler
├── package.json
├── data/
│   ├── crypto.json                # 200 data cryptocurrency (dummy)
│   └── categories.json            # 12 kategori
├── src/
│   ├── routes/api.js              # Daftar endpoint
│   ├── controllers/
│   │   └── cryptoController.js    # Handler tiap endpoint
│   └── utils/filters.js           # Validasi + logika filter (category & harga)
├── scripts/generate-data.js       # (Opsional) generator ulang dataset
└── postman/
    └── crypto-api.postman_collection.json   # Koleksi untuk Postman / Bruno
```

## Cara Menjalankan

Syarat: **Node.js 18 atau lebih baru** (cek: `node -v`).

```bash
cd crypto-api
npm install
npm start
```

API berjalan di **http://localhost:3000**. Ganti port dengan: `PORT=4000 npm start`
(Windows PowerShell: `$env:PORT=4000; npm start`).

Mode auto-restart saat edit kode: `npm run dev`.

## Endpoint

| Method | URL | Keterangan |
|--------|-----|-----------|
| GET | `/api/crypto` | Semua coin (field ringkas), mendukung filter |
| GET | `/api/crypto/:symbol` | Detail lengkap 1 coin (case-insensitive) |
| GET | `/api/categories` | Daftar kategori |

### Query filter untuk `/api/crypto`

| Parameter | Contoh | Arti |
|-----------|--------|------|
| `category` | `DeFi` | Hanya coin dengan kategori itu (case-insensitive) |
| `min_price` | `1` | `price_usd >= 1` |
| `max_price` | `100` | `price_usd <= 100` |

Ketiganya boleh dipakai sendiri atau **digabung** (logika AND).
Spasi di URL harus di-encode: `category=Layer%201` atau `category=Layer+1`.

## Contoh URL untuk Testing

```
http://localhost:3000/api/crypto
http://localhost:3000/api/crypto?category=DeFi
http://localhost:3000/api/crypto?category=gaming
http://localhost:3000/api/crypto?category=Layer%201
http://localhost:3000/api/crypto?min_price=1&max_price=100
http://localhost:3000/api/crypto?min_price=1000&max_price=100000
http://localhost:3000/api/crypto?min_price=100000
http://localhost:3000/api/crypto?category=DeFi&min_price=1&max_price=100
http://localhost:3000/api/crypto?category=Meme&max_price=0.001
http://localhost:3000/api/crypto/BTC
http://localhost:3000/api/crypto/eth
http://localhost:3000/api/categories
```

Dengan curl:

```bash
curl "http://localhost:3000/api/crypto?category=DeFi&min_price=1&max_price=100"
```

## Contoh Response

**GET /api/crypto?category=DeFi&min_price=1&max_price=100** → `200`

```json
{
  "status": "success",
  "total": 16,
  "data": [
    {
      "id": 49,
      "symbol": "UNI",
      "name": "Uniswap",
      "category": "DeFi",
      "price_usd": 11.45,
      "market_cap_usd": 6870000000,
      "market_cap_rank": 23,
      "price_change_24h": 2.93
    }
  ]
}
```

(`total` = jumlah hasil setelah filter; hasil di atas dipotong agar singkat.)

**GET /api/crypto/BTC** → `200`

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "symbol": "BTC",
    "name": "Bitcoin",
    "category": "Layer 1",
    "price_usd": 112450.25,
    "market_cap_usd": 2230000000000,
    "market_cap_rank": 1,
    "volume_24h_usd": 48500000000,
    "price_change_1h": 0.25,
    "price_change_24h": 2.45,
    "price_change_7d": 5.82,
    "circulating_supply": 19750000,
    "total_supply": 21000000,
    "max_supply": 21000000,
    "network": "Bitcoin",
    "consensus": "Proof of Work",
    "country": "Global",
    "is_stablecoin": false,
    "launch_year": 2009,
    "last_updated": "2026-10-08T08:00:00Z"
  }
}
```

**GET /api/categories** → `200`

```json
{
  "status": "success",
  "data": ["Layer 1", "Layer 2", "DeFi", "Meme", "Stablecoin", "Gaming", "AI", "NFT", "Infrastructure", "Exchange", "Payment", "Privacy"]
}
```

**Filter valid tapi tidak ada hasil** (`?category=Meme&min_price=1000`) → `200`

```json
{ "status": "success", "total": 0, "data": [] }
```

**Symbol tidak ditemukan** (`/api/crypto/NOPE`) → `404`

```json
{ "status": "error", "message": "Cryptocurrency not found" }
```

**Filter tidak valid** (`?min_price=abc`) → `400`

```json
{
  "status": "error",
  "message": "Invalid filter parameter",
  "details": ["Parameter \"min_price\" must be a non-negative number"]
}
```

Yang dianggap filter tidak valid (400): kategori tidak dikenal, `min_price`/`max_price` bukan angka atau negatif,
`min_price > max_price`, parameter tidak dikenal (mis. salah ketik `minprice`), atau parameter dikirim dobel.

Error tak terduga → `500` `{ "status": "error", "message": "Internal Server Error" }`.
URL yang tidak terdaftar → `404` `{ "status": "error", "message": "Endpoint not found" }`.

## Testing dengan Postman

1. Jalankan API (`npm start`).
2. Postman → **Import** → pilih `postman/crypto-api.postman_collection.json`.
3. Variabel `baseUrl` sudah diisi `http://localhost:3000` (ubah di tab *Variables* jika port berbeda).
4. Buka folder *4. Kombinasi filter* → klik **DeFi + 1..100** → **Send**. Cek tab *Test Results* (hijau = lolos).
5. Untuk menjalankan semuanya: klik kanan koleksi → **Run collection**.

Membuat request manual: method `GET`, URL `http://localhost:3000/api/crypto`, lalu tab **Params** isi
`category = DeFi`, `min_price = 1`, `max_price = 100` (Postman menyusun query string otomatis).

## Testing dengan Bruno

1. Bruno → **Collection → Import Collection → Postman Collection** → pilih file `postman/crypto-api.postman_collection.json`.
2. Pilih lokasi folder penyimpanan → buka request → **Send** (atau `Ctrl+Enter`).
3. Jika variabel `{{baseUrl}}` kosong, tambahkan di *Environments* → `baseUrl = http://localhost:3000`.

Atau buat manual: **New Request** → `GET` → `http://localhost:3000/api/crypto?category=DeFi&min_price=1&max_price=100` → Send.

## Catatan Dataset

- Nama/simbol populer (BTC, ETH, SOL, dst.) hanya dipakai agar terasa nyata; **semua angka dummy**.
- Harga bervariasi dari ±0.000002 sampai 112.450 USD; ada coin di rentang 1–100, 100–1.000, dan 1.000–100.000
  sehingga filter harga bisa diuji dengan baik.
- Stablecoin berharga ~1 USD (beberapa sengaja sedikit *depeg*).
- Ingin data baru / jumlah lain? Ubah `TARGET` di `scripts/generate-data.js`, lalu `npm run generate-data`.

## Tips Latihan

- List `/api/crypto` hanya mengembalikan 8 field ringkas. Ingin field lengkap? Ganti `.map(toSummary)` di
  `src/controllers/cryptoController.js` dengan data utuh (hapus `.map(toSummary)`).
- Tambahkan filter baru (mis. `is_stablecoin`, `consensus`) dengan menambah aturan di `src/utils/filters.js`.
