/**
 * Generator dataset cryptocurrency (DATA DUMMY / FIKTIF).
 *
 * Jalankan:  npm run generate-data
 * Hasil   :  data/crypto.json (200 coin) dan data/categories.json
 *
 * - ~80 coin memakai nama/simbol populer, tetapi HARGA & ANGKA-nya dummy.
 * - ~120 coin sisanya fiktif (nama dibuat dari kombinasi kata).
 * - Random-nya "seeded", jadi setiap dijalankan hasilnya SAMA (bisa diulang).
 */
const fs = require('fs');
const path = require('path');

const TOTAL_COINS = 200;

// ---------- Random helper (seeded) ----------
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261008);
const between = (min, max) => min + rand() * (max - min);
const logBetween = (min, max) => Math.exp(between(Math.log(min), Math.log(max)));
const intBetween = (min, max) => Math.floor(between(min, max + 1));
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const gauss = () => (rand() + rand() + rand() + rand() - 2) / 0.5774; // ~N(0,1)

const roundSig = (x, n) => Number(x.toPrecision(n));
const round2 = (x) => Math.round(x * 100) / 100;
const roundPrice = (p) => (p >= 100 ? Number(p.toFixed(2)) : roundSig(p, 5));

// ---------- Kategori ----------
const CATEGORIES = [
  'Layer 1', 'Layer 2', 'DeFi', 'Meme', 'Stablecoin', 'Gaming',
  'AI', 'NFT', 'Infrastructure', 'Exchange', 'Payment', 'Privacy',
];

// Jumlah target per kategori (total = 200)
const TARGET = {
  'Layer 1': 22, 'Layer 2': 14, DeFi: 26, Meme: 24, Stablecoin: 10, Gaming: 20,
  AI: 18, NFT: 12, Infrastructure: 18, Exchange: 10, Payment: 14, Privacy: 12,
};

// Konfigurasi rentang nilai realistis per kategori
// mcap = market cap, circ = circulating supply, price = rentang harga, vol = volatilitas
const CFG = {
  'Layer 1':        { mcap: [3e7, 8e9],   circ: [2e7, 3e10],   price: [0.02, 3000],  year: [2012, 2024], vol: 1.0,  own: 1.0,  high: 0.2,  turnover: [0.02, 0.2] },
  'Layer 2':        { mcap: [2e7, 3e9],   circ: [1e8, 2e10],   price: [0.03, 30],    year: [2019, 2025], vol: 1.3,  own: 1.0,  high: 0,    turnover: [0.03, 0.3] },
  DeFi:             { mcap: [1e7, 3e9],   circ: [5e6, 5e9],    price: [0.1, 600],    year: [2018, 2025], vol: 1.2,  own: 0.1,  high: 0.08, turnover: [0.02, 0.3] },
  Meme:             { mcap: [5e6, 4e9],   circ: [1e10, 1e15], price: [2e-6, 0.5],   year: [2013, 2025], vol: 2.2,  own: 0.1,  high: 0,    turnover: [0.05, 0.6] },
  Stablecoin:       { mcap: [5e7, 3e10],  circ: [5e7, 3e10],  price: [0.9, 1.1],    year: [2014, 2025], vol: 0.03, own: 0,    high: 0,    turnover: [0.05, 0.4] },
  Gaming:           { mcap: [1e7, 1.5e9], circ: [1e8, 5e10],  price: [0.01, 20],    year: [2017, 2025], vol: 1.5,  own: 0.2,  high: 0,    turnover: [0.03, 0.35] },
  AI:               { mcap: [2e7, 6e9],   circ: [5e7, 3e10],  price: [0.05, 400],   year: [2018, 2025], vol: 1.6,  own: 0.25, high: 0,    turnover: [0.03, 0.35] },
  NFT:              { mcap: [5e6, 1e9],   circ: [5e7, 2e10],  price: [0.02, 30],    year: [2020, 2025], vol: 1.5,  own: 0.05, high: 0,    turnover: [0.02, 0.3] },
  Infrastructure:   { mcap: [2e7, 5e9],   circ: [5e7, 5e9],   price: [0.1, 200],    year: [2015, 2025], vol: 1.1,  own: 0.35, high: 0,    turnover: [0.02, 0.2] },
  Exchange:         { mcap: [3e7, 6e9],   circ: [2e7, 3e10],  price: [0.1, 800],    year: [2013, 2024], vol: 0.8,  own: 0.3,  high: 0.1,  turnover: [0.01, 0.15] },
  Payment:          { mcap: [2e7, 8e9],   circ: [2e7, 1e11],  price: [0.01, 300],   year: [2011, 2024], vol: 0.9,  own: 0.4,  high: 0,    turnover: [0.02, 0.2] },
  Privacy:          { mcap: [1e7, 5e9],   circ: [1e7, 2e10],  price: [0.05, 400],   year: [2014, 2024], vol: 1.0,  own: 0.6,  high: 0.06, turnover: [0.01, 0.15] },
};

// ---------- Coin "populer" (angka dummy) ----------
// [symbol, name, category, price, circulating, max, year, consensus, network, country]
const CURATED = [
  // Layer 1
  ['BTC', 'Bitcoin', 'Layer 1', 112450.25, 19750000, 21000000, 2009, 'Proof of Work', 'Bitcoin', 'Global'],
  ['ETH', 'Ethereum', 'Layer 1', 4215.8, 120700000, null, 2015, 'Proof of Stake', 'Ethereum', 'Global'],
  ['SOL', 'Solana', 'Layer 1', 238.4, 480000000, null, 2020, 'Proof of History', 'Solana', 'USA'],
  ['ADA', 'Cardano', 'Layer 1', 0.82, 36500000000, 45000000000, 2017, 'Proof of Stake', 'Cardano', 'Switzerland'],
  ['AVAX', 'Avalanche', 'Layer 1', 41.75, 410000000, 720000000, 2020, 'Snowman Consensus', 'Avalanche', 'USA'],
  ['DOT', 'Polkadot', 'Layer 1', 7.92, 1560000000, null, 2020, 'Nominated Proof of Stake', 'Polkadot', 'Switzerland'],
  ['ATOM', 'Cosmos', 'Layer 1', 8.35, 390000000, null, 2019, 'Tendermint BFT', 'Cosmos Hub', 'USA'],
  ['NEAR', 'NEAR Protocol', 'Layer 1', 5.64, 1210000000, null, 2020, 'Nightshade Proof of Stake', 'NEAR', 'Switzerland'],
  ['ALGO', 'Algorand', 'Layer 1', 0.31, 8300000000, 10000000000, 2019, 'Pure Proof of Stake', 'Algorand', 'USA'],
  ['TON', 'Toncoin', 'Layer 1', 5.88, 2550000000, null, 2021, 'Proof of Stake', 'TON', 'UAE'],
  ['SUI', 'Sui', 'Layer 1', 3.47, 3400000000, 10000000000, 2023, 'Delegated Proof of Stake', 'Sui', 'USA'],
  ['APT', 'Aptos', 'Layer 1', 9.21, 640000000, null, 2022, 'AptosBFT', 'Aptos', 'USA'],
  ['TRX', 'Tron', 'Layer 1', 0.27, 94800000000, null, 2017, 'Delegated Proof of Stake', 'Tron', 'Singapore'],
  ['XTZ', 'Tezos', 'Layer 1', 0.94, 1050000000, null, 2018, 'Liquid Proof of Stake', 'Tezos', 'France'],
  ['ICP', 'Internet Computer', 'Layer 1', 11.6, 480000000, null, 2021, 'Threshold Relay', 'Internet Computer', 'Switzerland'],
  ['KAS', 'Kaspa', 'Layer 1', 0.145, 26200000000, 28700000000, 2021, 'Proof of Work', 'Kaspa', 'Global'],
  ['HBAR', 'Hedera', 'Layer 1', 0.231, 42000000000, 50000000000, 2019, 'Hashgraph Consensus', 'Hedera', 'USA'],
  // Layer 2
  ['POL', 'Polygon', 'Layer 2', 0.46, 10400000000, null, 2017, 'Proof of Stake', 'Polygon', 'India'],
  ['ARB', 'Arbitrum', 'Layer 2', 0.62, 4800000000, 10000000000, 2023, 'Optimistic Rollup', 'Arbitrum One', 'USA'],
  ['OP', 'Optimism', 'Layer 2', 1.74, 1650000000, 4294967296, 2022, 'Optimistic Rollup', 'OP Mainnet', 'USA'],
  ['STRK', 'Starknet', 'Layer 2', 0.38, 3100000000, 10000000000, 2024, 'Validity Rollup', 'Starknet', 'Israel'],
  ['MNT', 'Mantle', 'Layer 2', 1.12, 3250000000, 6219316640, 2023, 'Optimistic Rollup', 'Mantle', 'Singapore'],
  ['ZK', 'zkSync', 'Layer 2', 0.21, 3700000000, 21000000000, 2023, 'Validity Rollup', 'zkSync Era', 'Germany'],
  // DeFi
  ['UNI', 'Uniswap', 'DeFi', 11.45, 600000000, 1000000000, 2018, 'Proof of Stake', 'Ethereum', 'USA'],
  ['AAVE', 'Aave', 'DeFi', 312.8, 15200000, 16000000, 2020, 'Proof of Stake', 'Ethereum', 'United Kingdom'],
  ['MKR', 'Maker', 'DeFi', 2185.4, 910000, 1005577, 2017, 'Proof of Stake', 'Ethereum', 'Global'],
  ['LDO', 'Lido DAO', 'DeFi', 1.38, 890000000, 1000000000, 2020, 'Proof of Stake', 'Ethereum', 'Global'],
  ['CRV', 'Curve DAO', 'DeFi', 0.74, 1350000000, 3030000000, 2020, 'Proof of Stake', 'Ethereum', 'Switzerland'],
  ['COMP', 'Compound', 'DeFi', 62.15, 9800000, 10000000, 2020, 'Proof of Stake', 'Ethereum', 'USA'],
  ['SNX', 'Synthetix', 'DeFi', 1.92, 340000000, null, 2018, 'Optimistic Rollup', 'Optimism', 'Australia'],
  ['SUSHI', 'SushiSwap', 'DeFi', 1.45, 270000000, null, 2020, 'Proof of Stake', 'Ethereum', 'Japan'],
  ['DYDX', 'dYdX', 'DeFi', 1.18, 700000000, 1000000000, 2021, 'Tendermint BFT', 'dYdX Chain', 'USA'],
  ['CAKE', 'PancakeSwap', 'DeFi', 2.84, 300000000, 450000000, 2020, 'Proof of Staked Authority', 'BNB Chain', 'Global'],
  // Meme
  ['DOGE', 'Dogecoin', 'Meme', 0.3012, 150000000000, null, 2013, 'Proof of Work', 'Dogecoin', 'Global'],
  ['SHIB', 'Shiba Inu', 'Meme', 0.00001845, 589000000000000, 1000000000000000, 2020, 'Proof of Stake', 'Ethereum', 'Japan'],
  ['PEPE', 'Pepe', 'Meme', 0.00001162, 420690000000000, 420690000000000, 2023, 'Proof of Stake', 'Ethereum', 'Global'],
  ['FLOKI', 'Floki', 'Meme', 0.0001095, 9700000000000, 10000000000000, 2021, 'Proof of Stake', 'Ethereum', 'Global'],
  ['BONK', 'Bonk', 'Meme', 0.00002384, 77000000000000, 93000000000000, 2022, 'Proof of History', 'Solana', 'Global'],
  ['WIF', 'dogwifhat', 'Meme', 1.92, 998900000, 998900000, 2023, 'Proof of History', 'Solana', 'Global'],
  // Stablecoin
  ['USDT', 'Tether', 'Stablecoin', 1.0002, 135000000000, null, 2014, 'Delegated Proof of Stake', 'Tron', 'British Virgin Islands'],
  ['USDC', 'USD Coin', 'Stablecoin', 0.9998, 74000000000, null, 2018, 'Proof of Stake', 'Ethereum', 'USA'],
  ['DAI', 'Dai', 'Stablecoin', 1.0004, 5300000000, null, 2017, 'Proof of Stake', 'Ethereum', 'Global'],
  ['FDUSD', 'First Digital USD', 'Stablecoin', 0.9996, 2400000000, null, 2023, 'Proof of Staked Authority', 'BNB Chain', 'Hong Kong'],
  ['PYUSD', 'PayPal USD', 'Stablecoin', 1.0001, 1600000000, null, 2023, 'Proof of Stake', 'Ethereum', 'USA'],
  ['USDE', 'Ethena USDe', 'Stablecoin', 0.9993, 6100000000, null, 2024, 'Proof of Stake', 'Ethereum', 'Global'],
  // Gaming
  ['AXS', 'Axie Infinity', 'Gaming', 2.65, 160000000, 270000000, 2020, 'Proof of Authority', 'Ronin', 'Vietnam'],
  ['SAND', 'The Sandbox', 'Gaming', 0.41, 2500000000, 3000000000, 2020, 'Proof of Stake', 'Ethereum', 'Hong Kong'],
  ['MANA', 'Decentraland', 'Gaming', 0.36, 1900000000, null, 2017, 'Proof of Stake', 'Ethereum', 'Argentina'],
  ['GALA', 'Gala', 'Gaming', 0.0195, 40000000000, null, 2020, 'Proof of Stake', 'Ethereum', 'USA'],
  ['IMX', 'Immutable', 'Gaming', 1.46, 1650000000, 2000000000, 2021, 'Validity Rollup', 'Immutable zkEVM', 'Australia'],
  ['BEAM', 'Beam', 'Gaming', 0.0089, 52000000000, 62000000000, 2023, 'Proof of Stake', 'Beam', 'Global'],
  // AI
  ['FET', 'Fetch.ai', 'AI', 0.74, 2630000000, 2630000000, 2019, 'Tendermint BFT', 'Fetch.ai', 'United Kingdom'],
  ['RNDR', 'Render', 'AI', 5.18, 518000000, 644000000, 2020, 'Proof of History', 'Solana', 'USA'],
  ['TAO', 'Bittensor', 'AI', 428.6, 8900000, 21000000, 2021, 'Yuma Consensus', 'Bittensor', 'Global'],
  ['AKT', 'Akash Network', 'AI', 2.31, 243000000, 388000000, 2020, 'Tendermint BFT', 'Akash', 'USA'],
  // NFT
  ['APE', 'ApeCoin', 'NFT', 0.93, 756000000, 1000000000, 2022, 'Proof of Stake', 'Ethereum', 'USA'],
  ['BLUR', 'Blur', 'NFT', 0.21, 2600000000, 3000000000, 2023, 'Proof of Stake', 'Ethereum', 'USA'],
  ['RARI', 'Rarible', 'NFT', 1.36, 12000000, 25000000, 2020, 'Proof of Stake', 'Ethereum', 'USA'],
  ['LOOKS', 'LooksRare', 'NFT', 0.026, 640000000, 1000000000, 2022, 'Proof of Stake', 'Ethereum', 'Global'],
  // Infrastructure
  ['LINK', 'Chainlink', 'Infrastructure', 22.84, 635000000, 1000000000, 2017, 'Proof of Stake', 'Ethereum', 'Cayman Islands'],
  ['GRT', 'The Graph', 'Infrastructure', 0.19, 10700000000, null, 2020, 'Proof of Stake', 'Ethereum', 'USA'],
  ['FIL', 'Filecoin', 'Infrastructure', 5.86, 640000000, 2000000000, 2020, 'Proof of Replication', 'Filecoin', 'USA'],
  ['AR', 'Arweave', 'Infrastructure', 27.4, 65700000, 66000000, 2018, 'Proof of Access', 'Arweave', 'United Kingdom'],
  ['QNT', 'Quant', 'Infrastructure', 108.5, 14500000, 14612493, 2018, 'Proof of Stake', 'Ethereum', 'United Kingdom'],
  ['HNT', 'Helium', 'Infrastructure', 5.12, 175000000, null, 2019, 'Proof of History', 'Solana', 'USA'],
  // Exchange
  ['BNB', 'BNB', 'Exchange', 1048.3, 145000000, 200000000, 2017, 'Proof of Staked Authority', 'BNB Chain', 'Global'],
  ['OKB', 'OKB', 'Exchange', 52.7, 21000000, 21000000, 2018, 'Proof of Stake', 'X Layer', 'Seychelles'],
  ['CRO', 'Cronos', 'Exchange', 0.162, 36000000000, 100000000000, 2018, 'Proof of Authority', 'Cronos', 'Singapore'],
  ['LEO', 'UNUS SED LEO', 'Exchange', 9.42, 920000000, null, 2019, 'Proof of Stake', 'Ethereum', 'British Virgin Islands'],
  ['KCS', 'KuCoin Token', 'Exchange', 13.6, 96000000, 200000000, 2017, 'Proof of Authority', 'KCC', 'Seychelles'],
  ['GT', 'GateToken', 'Exchange', 18.35, 112000000, 300000000, 2019, 'Proof of Stake', 'Gate Chain', 'Cayman Islands'],
  // Payment
  ['XRP', 'XRP', 'Payment', 2.94, 59800000000, 100000000000, 2012, 'Federated Consensus', 'XRP Ledger', 'USA'],
  ['XLM', 'Stellar', 'Payment', 0.395, 31000000000, 50000000000, 2014, 'Stellar Consensus Protocol', 'Stellar', 'USA'],
  ['LTC', 'Litecoin', 'Payment', 118.75, 76000000, 84000000, 2011, 'Proof of Work', 'Litecoin', 'Global'],
  ['BCH', 'Bitcoin Cash', 'Payment', 548.3, 19900000, 21000000, 2017, 'Proof of Work', 'Bitcoin Cash', 'Global'],
  // Privacy
  ['XMR', 'Monero', 'Privacy', 328.4, 18400000, null, 2014, 'Proof of Work', 'Monero', 'Global'],
  ['ZEC', 'Zcash', 'Privacy', 54.9, 16300000, 21000000, 2016, 'Proof of Work', 'Zcash', 'USA'],
  ['DASH', 'Dash', 'Privacy', 31.25, 12100000, 18920000, 2014, 'Proof of Work', 'Dash', 'USA'],
  ['SCRT', 'Secret', 'Privacy', 0.192, 295000000, null, 2020, 'Tendermint BFT', 'Secret Network', 'USA'],
  ['ROSE', 'Oasis Network', 'Privacy', 0.0865, 6800000000, 10000000000, 2020, 'Proof of Stake', 'Oasis', 'USA'],
];

// ---------- Bahan untuk coin fiktif ----------
const PREFIXES = [
  'Nova', 'Astra', 'Zenith', 'Orbit', 'Lumen', 'Vertex', 'Helix', 'Quanta', 'Pulse', 'Aurora',
  'Echo', 'Titan', 'Nimbus', 'Cobalt', 'Ember', 'Solace', 'Vortex', 'Mirage', 'Atlas', 'Kinetic',
  'Halo', 'Cipher', 'Drift', 'Onyx', 'Prism', 'Rift', 'Tundra', 'Zephyr', 'Argon', 'Borealis',
  'Cascade', 'Dynamo', 'Equinox', 'Flux', 'Glacier', 'Horizon', 'Ion', 'Jade', 'Krypton', 'Lyra',
  'Meridian', 'Nebula', 'Opal', 'Phoenix', 'Quartz', 'Radiant', 'Sable', 'Umbra', 'Vega', 'Willow',
  'Xenon', 'Yonder', 'Zircon', 'Bandung', 'Merapi', 'Garuda', 'Komodo', 'Nusa', 'Borneo', 'Rinjani',
];

const SUFFIXES = {
  'Layer 1': ['Chain', 'Net', 'Ledger', 'Protocol'],
  'Layer 2': ['Rollup', 'Link', 'Bridge', 'Layer'],
  DeFi: ['Swap', 'Finance', 'Vault', 'Lend', 'Yield'],
  Meme: ['Inu', 'Cat', 'Moon', 'Frog', 'Coin', 'Rocket'],
  Stablecoin: ['USD', 'Dollar', 'Stable', 'Peg'],
  Gaming: ['Quest', 'Realm', 'Arena', 'Verse', 'Legends'],
  AI: ['AI', 'Mind', 'Neural', 'Brain', 'Compute'],
  NFT: ['Art', 'Mint', 'Canvas', 'Gallery', 'Collect'],
  Infrastructure: ['Node', 'Oracle', 'Grid', 'Storage', 'Relay'],
  Exchange: ['Exchange', 'Token', 'Trade', 'Market'],
  Payment: ['Pay', 'Cash', 'Remit', 'Transfer', 'Wallet'],
  Privacy: ['Shield', 'Cloak', 'Veil', 'Ghost', 'Mask'],
};

const HOSTS = [
  { network: 'Ethereum', consensus: 'Proof of Stake' },
  { network: 'Ethereum', consensus: 'Proof of Stake' },
  { network: 'Solana', consensus: 'Proof of History' },
  { network: 'BNB Chain', consensus: 'Proof of Staked Authority' },
  { network: 'Polygon', consensus: 'Proof of Stake' },
  { network: 'Arbitrum One', consensus: 'Optimistic Rollup' },
  { network: 'Base', consensus: 'Optimistic Rollup' },
  { network: 'Avalanche', consensus: 'Snowman Consensus' },
  { network: 'Tron', consensus: 'Delegated Proof of Stake' },
  { network: 'Sui', consensus: 'Delegated Proof of Stake' },
];

const OWN_CONSENSUS = {
  'Layer 1': ['Proof of Work', 'Proof of Stake', 'Proof of Stake', 'Delegated Proof of Stake', 'Proof of Authority', 'Byzantine Fault Tolerance', 'Proof of History'],
  'Layer 2': ['Optimistic Rollup', 'Validity Rollup', 'Zero-Knowledge Rollup', 'Plasma'],
  Privacy: ['Proof of Work', 'Proof of Work', 'Proof of Stake'],
  default: ['Proof of Stake', 'Delegated Proof of Stake', 'Proof of Authority', 'Byzantine Fault Tolerance'],
};

const COUNTRIES = [
  'Global', 'Global', 'Global', 'USA', 'USA', 'Singapore', 'Switzerland', 'Germany', 'Japan',
  'South Korea', 'United Kingdom', 'UAE', 'Hong Kong', 'Canada', 'Estonia', 'Netherlands',
  'Indonesia', 'Indonesia', 'Brazil', 'Australia', 'Cayman Islands', 'Seychelles', 'Malta', 'Vietnam', 'India',
];

// ---------- Fungsi pembantu ----------
const usedSymbols = new Set(CURATED.map((r) => r[0]));
const usedNames = new Set(CURATED.map((r) => r[1].toLowerCase()));
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function makeSymbol(prefix, suffix, category) {
  const P = prefix.toUpperCase();
  const S = suffix.toUpperCase().replace(/[^A-Z]/g, '');
  const candidates = [P.slice(0, 3), P.slice(0, 4), P.slice(0, 2) + S.slice(0, 1), P.slice(0, 3) + S.slice(0, 1), P[0] + S.slice(0, 3)];
  if (category === 'Stablecoin') candidates.unshift(P[0] + 'USD');
  for (const c of candidates) {
    if (!usedSymbols.has(c)) return c;
  }
  for (;;) {
    const c = P.slice(0, 2) + letters[intBetween(0, 25)] + letters[intBetween(0, 25)];
    if (!usedSymbols.has(c)) return c;
  }
}

function makeFictionalIdentity(category) {
  for (;;) {
    const prefix = pick(PREFIXES);
    const suffix = pick(SUFFIXES[category]);
    const name = `${prefix} ${suffix}`;
    if (usedNames.has(name.toLowerCase())) continue;
    const symbol = makeSymbol(prefix, suffix, category);
    usedNames.add(name.toLowerCase());
    usedSymbols.add(symbol);
    return { name, symbol, prefix, suffix };
  }
}

function sampleFictionalPriceAndSupply(category) {
  const cfg = CFG[category];
  if (category === 'Stablecoin') {
    const price = rand() < 0.12 ? between(0.965, 0.99) : 1 + (rand() - 0.5) * 0.012;
    return { price, circ: logBetween(...cfg.mcap) / price };
  }
  if (rand() < cfg.high) {
    // coin "mahal" dengan supply kecil (mirip BTC / MKR)
    return { price: logBetween(1000, 15000), circ: logBetween(1e5, 3e6) };
  }
  for (let i = 0; i < 300; i++) {
    const mcap = logBetween(...cfg.mcap);
    const circ = logBetween(...cfg.circ);
    const price = mcap / circ;
    if (price >= cfg.price[0] && price <= cfg.price[1]) return { price, circ };
  }
  return { price: logBetween(...cfg.price), circ: logBetween(...cfg.circ) };
}

function buildSupply(circ, maxSupply) {
  let max = maxSupply;
  if (max === undefined) max = rand() < 0.65 ? roundSig(circ * between(1.1, 3), 3) : null;
  let total;
  if (max !== null) {
    total = rand() < 0.5 ? max : Math.min(max, roundSig(circ * between(1.0, 1.4), 3));
  } else {
    total = rand() < 0.4 ? circ : roundSig(circ * between(1.0, 1.15), 3);
  }
  total = Math.max(total, circ);
  return { circulating: circ, total, max };
}

function buildChanges(category) {
  const v = CFG[category].vol;
  return {
    h1: round2(gauss() * 0.9 * v),
    h24: round2(gauss() * 4.5 * v),
    d7: round2(gauss() * 11 * v),
  };
}

function lastUpdated() {
  const mm = String(intBetween(0, 59)).padStart(2, '0');
  const ss = String(intBetween(0, 59)).padStart(2, '0');
  return `2026-10-08T08:${mm}:${ss}Z`;
}

function makeCoin(base) {
  const { symbol, name, category, price, circ, maxSupply, year, consensus, network, country } = base;
  const cfg = CFG[category];
  const finalPrice = roundPrice(price);
  const supply = buildSupply(circ, maxSupply);
  const mcap = Math.round(finalPrice * supply.circulating);
  const changes = buildChanges(category);
  return {
    symbol,
    name,
    category,
    price_usd: finalPrice,
    market_cap_usd: mcap,
    market_cap_rank: 0, // diisi setelah diurutkan
    volume_24h_usd: roundSig(mcap * logBetween(...cfg.turnover), 3),
    price_change_1h: changes.h1,
    price_change_24h: changes.h24,
    price_change_7d: changes.d7,
    circulating_supply: supply.circulating,
    total_supply: supply.total,
    max_supply: supply.max,
    network,
    consensus,
    country,
    is_stablecoin: category === 'Stablecoin',
    launch_year: year,
    last_updated: lastUpdated(),
  };
}

// ---------- Susun semua coin ----------
const coins = [];

for (const row of CURATED) {
  const [symbol, name, category, price, circ, maxSupply, year, consensus, network, country] = row;
  coins.push(makeCoin({ symbol, name, category, price, circ, maxSupply, year, consensus, network, country }));
}

for (const category of CATEGORIES) {
  const have = CURATED.filter((r) => r[2] === category).length;
  const need = Math.max(0, TARGET[category] - have);
  const cfg = CFG[category];
  for (let i = 0; i < need; i++) {
    const id = makeFictionalIdentity(category);
    const { price, circ } = sampleFictionalPriceAndSupply(category);
    let network;
    let consensus;
    if (rand() < cfg.own) {
      network = id.name;
      consensus = pick(OWN_CONSENSUS[category] || OWN_CONSENSUS.default);
    } else {
      const host = pick(HOSTS);
      network = host.network;
      consensus = host.consensus;
    }
    coins.push(
      makeCoin({
        symbol: id.symbol,
        name: id.name,
        category,
        price,
        circ: roundSig(circ, 3),
        maxSupply: category === 'Stablecoin' ? null : undefined,
        year: intBetween(cfg.year[0], cfg.year[1]),
        consensus,
        network,
        country: pick(COUNTRIES),
      })
    );
  }
}

// ---------- Penyesuaian khusus Bitcoin (sesuai contoh di brief) ----------
const btc = coins.find((c) => c.symbol === 'BTC');
Object.assign(btc, {
  market_cap_usd: 2230000000000,
  volume_24h_usd: 48500000000,
  price_change_1h: 0.25,
  price_change_24h: 2.45,
  price_change_7d: 5.82,
  total_supply: 21000000,
  last_updated: '2026-10-08T08:00:00Z',
});

// ---------- Ranking & ID ----------
[...coins].sort((a, b) => b.market_cap_usd - a.market_cap_usd).forEach((c, i) => (c.market_cap_rank = i + 1));

// ID diurutkan dari coin paling lama (launch_year), supaya id != rank
coins.sort((a, b) => a.launch_year - b.launch_year || a.market_cap_rank - b.market_cap_rank);
const output = coins.map((c, i) => ({ id: i + 1, ...c }));

if (output.length !== TOTAL_COINS) {
  throw new Error(`Jumlah coin ${output.length}, seharusnya ${TOTAL_COINS}`);
}

fs.writeFileSync(path.join(__dirname, '..', 'data', 'crypto.json'), JSON.stringify(output, null, 2) + '\n');
fs.writeFileSync(path.join(__dirname, '..', 'data', 'categories.json'), JSON.stringify(CATEGORIES, null, 2) + '\n');
console.log(`OK: ${output.length} coin ditulis ke data/crypto.json`);
