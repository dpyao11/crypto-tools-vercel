const { verifyToken } = require('./auth/middleware');
const { getHolders } = require('./db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authResult = verifyToken(req);
  if (!authResult.valid) {
    return res.status(401).json({ error: authResult.error });
  }

  try {
    const { tokenAddresses } = req.body;

    if (!tokenAddresses || !Array.isArray(tokenAddresses) || tokenAddresses.length === 0) {
      return res.status(400).json({ error: 'Invalid token addresses' });
    }

    // 获取所有 token 的 holders
    const allHolders = [];
    for (const addr of tokenAddresses) {
      const holders = await getHolders(addr);
      allHolders.push(holders.map(h => h.TokenHolderAddress.toLowerCase()));
    }

    // 找共同持有者
    if (allHolders.length === 0) {
      return res.json({ commonHolders: [] });
    }

    const commonSet = new Set(allHolders[0]);
    for (let i = 1; i < allHolders.length; i++) {
      const currentSet = new Set(allHolders[i]);
      for (const addr of commonSet) {
        if (!currentSet.has(addr)) {
          commonSet.delete(addr);
        }
      }
    }

    res.json({ 
      commonHolders: Array.from(commonSet),
      count: commonSet.size
    });
  } catch (error) {
    console.error('Common holders error:', error);
    res.status(500).json({ error: error.message });
  }
};
