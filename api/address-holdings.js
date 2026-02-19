const { verifyToken } = require('./auth/middleware');
const { getTokens, getHolders } = require('./db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authResult = verifyToken(req);
  if (!authResult.valid) {
    return res.status(401).json({ error: authResult.error });
  }

  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ error: 'Address required' });
    }

    const normalizedAddress = address.toLowerCase();
    const tokens = await getTokens();
    const holdings = [];

    for (const token of tokens) {
      const holders = await getHolders(token.address);
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

    res.json({ holdings });
  } catch (error) {
    console.error('Address holdings error:', error);
    res.status(500).json({ error: error.message });
  }
};
