const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET || 'vercel-crypto-tools-secret-2024';

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
  const maxPages = Math.min(totalPages, 100); // Limit to 100 pages for Vercel timeout

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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '未登录' });
    }
    
    jwt.verify(token, JWT_SECRET);
    
    const { tokenAddress } = req.body;
    
    if (!tokenAddress) {
      return res.status(400).json({ success: false, error: '缺少代币地址' });
    }
    
    const holders = await fetchHoldersByScraping(tokenAddress);
    
    res.status(200).json({ success: true, holders });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token 无效' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};
