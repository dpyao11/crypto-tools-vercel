const { verifyToken } = require('./auth/middleware');

// 内存存储
const storage = {
  tokens: new Map(),
  holders: new Map(),
  addresses: new Map()
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authResult = verifyToken(req);
  if (!authResult.valid) {
    return res.status(401).json({ error: authResult.error });
  }

  const { action } = req.query;

  try {
    // GET /api/data?action=tokens
    if (action === 'tokens') {
      const tokens = Array.from(storage.tokens.values())
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return res.json({ tokens });
    }

    // GET /api/data?action=saved-addresses
    if (action === 'saved-addresses') {
      const addresses = Array.from(storage.addresses.values())
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return res.json({ addresses });
    }

    // GET /api/data?action=address-holdings&address=0x...
    if (action === 'address-holdings') {
      const { address } = req.query;
      if (!address) return res.status(400).json({ error: 'Address required' });
      
      const normalizedAddress = address.toLowerCase();
      const tokens = Array.from(storage.tokens.values());
      const holdings = [];

      for (const token of tokens) {
        const holders = storage.holders.get(token.address) || [];
        const holding = holders.find(h => h.TokenHolderAddress.toLowerCase() === normalizedAddress);
        
        if (holding) {
          holdings.push({
            tokenAddress: token.address,
            tokenName: token.name,
            tokenSymbol: token.symbol,
            balance: holding.TokenHolderQuantity
          });
        }
      }

      return res.json({ holdings });
    }

    // POST /api/data?action=save-holders
    if (action === 'save-holders' && req.method === 'POST') {
      const { tokenAddress, holders, tokenName, tokenSymbol } = req.body;
      if (!tokenAddress || !holders) return res.status(400).json({ error: 'Invalid request' });

      const key = tokenAddress.toLowerCase();
      storage.tokens.set(key, {
        address: key,
        name: tokenName || 'Unknown',
        symbol: tokenSymbol || 'Unknown',
        created_at: new Date().toISOString()
      });
      storage.holders.set(key, holders);

      return res.json({ success: true, saved: holders.length });
    }

    // POST /api/data?action=common-holders
    if (action === 'common-holders' && req.method === 'POST') {
      const { tokenAddresses } = req.body;
      if (!tokenAddresses || !Array.isArray(tokenAddresses)) {
        return res.status(400).json({ error: 'Invalid token addresses' });
      }

      const allHolders = [];
      for (const addr of tokenAddresses) {
        const holders = storage.holders.get(addr.toLowerCase()) || [];
        allHolders.push(holders.map(h => h.TokenHolderAddress.toLowerCase()));
      }

      if (allHolders.length === 0) {
        return res.json({ commonHolders: [] });
      }

      const commonSet = new Set(allHolders[0]);
      for (let i = 1; i < allHolders.length; i++) {
        const currentSet = new Set(allHolders[i]);
        for (const addr of commonSet) {
          if (!currentSet.has(addr)) commonSet.delete(addr);
        }
      }

      return res.json({ commonHolders: Array.from(commonSet), count: commonSet.size });
    }

    // POST /api/data?action=save-address
    if (action === 'save-address' && req.method === 'POST') {
      const { address, note } = req.body;
      if (!address) return res.status(400).json({ error: 'Address required' });

      const key = address.toLowerCase();
      storage.addresses.set(key, {
        address: key,
        note: note || '',
        created_at: new Date().toISOString()
      });

      return res.json({ success: true });
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
};
