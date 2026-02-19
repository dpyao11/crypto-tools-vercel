const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'vercel-crypto-tools-secret-2024';
const VALID_KEYS = ['DEMO2024', 'TEST2024', 'PROD2024'];

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// BSC scraping functions
const BSCSCAN_BASE = 'https://bscscan.com/token/generic-tokenholders2';
const HTTP_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  Accept: 'application/json, text/plain, */*',
  Referer: 'https://bscscan.com/'
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function requestWithRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await delay(700 * (i + 1));
    }
  }
}

function parseHoldersFromHtml(html) {
  const holders = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const row = rowMatch[1];
    const addressMatch = row.match(/\?a=(0x[a-fA-F0-9]{40})|data-highlight-target="(0x[a-fA-F0-9]{40})"/);
    if (!addressMatch) continue;
    
    const address = addressMatch[1] || addressMatch[2];
    if (!address) continue;

    const cols = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => m[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
    if (cols.length < 3) continue;

    const qtyMatch = cols[2].match(/title='([^']+)'/);
    const quantity = qtyMatch ? qtyMatch[1].replace(/,/g, '').trim() : cols[2].replace(/,/g, '').trim();

    holders.push({
      TokenHolderAddress: address,
      TokenHolderQuantity: quantity
    });
  }

  return holders;
}

function parseTotalPages(html) {
  const m = html.match(/Page\s+\d+\s+of\s+(\d+)/i);
  if (!m) return 1;
  const total = parseInt(m[1], 10);
  return isFinite(total) && total > 0 ? total : 1;
}

async function fetchHoldersByScraping(tokenAddress) {
  const holderMap = new Map();
  const pageSize = 50;

  const fetchPage = async (page) => {
    const response = await requestWithRetry(() =>
      axios.get(BSCSCAN_BASE, {
        params: { m: 'normal', a: tokenAddress, p: page, s: 100, sid: '' },
        timeout: 15000,
        headers: HTTP_HEADERS
      })
    );
    return response.data;
  };

  const firstHtml = await fetchPage(1);
  const firstPageHolders = parseHoldersFromHtml(firstHtml);
  firstPageHolders.forEach(h => holderMap.set(h.TokenHolderAddress.toLowerCase(), h));

  const totalPages = parseTotalPages(firstHtml);
  const maxPages = Math.min(totalPages, 100);

  for (let page = 2; page <= maxPages; page++) {
    await delay(350);
    const html = await fetchPage(page);
    const holders = parseHoldersFromHtml(html);
    if (holders.length === 0) break;

    holders.forEach(h => holderMap.set(h.TokenHolderAddress.toLowerCase(), h));
    
    if (holders.length < pageSize) break;
  }

  return Array.from(holderMap.values());
}

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: '未登录' });
  
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token 无效' });
  }
};

// API routes
app.post('/api/auth/login', (req, res) => {
  try {
    const { cardKey } = req.body;
    
    if (!VALID_KEYS.includes(cardKey)) {
      return res.status(401).json({ error: '卡密无效' });
    }
    
    const token = jwt.sign({ cardKey }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({ valid: true });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

app.post('/api/holders', authMiddleware, async (req, res) => {
  try {
    const { tokenAddress } = req.body;
    
    if (!tokenAddress) {
      return res.status(400).json({ success: false, error: '缺少代币地址' });
    }
    
    const holders = await fetchHoldersByScraping(tokenAddress);
    res.json({ success: true, holders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Valid card keys: DEMO2024, TEST2024, PROD2024');
});
