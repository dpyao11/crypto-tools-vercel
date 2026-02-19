const { verifyToken } = require('./auth/middleware');
const { saveToken, saveHolders } = require('./db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authResult = verifyToken(req);
  if (!authResult.valid) {
    return res.status(401).json({ error: authResult.error });
  }

  try {
    const { tokenAddress, holders, tokenName, tokenSymbol } = req.body;

    if (!tokenAddress || !holders || !Array.isArray(holders)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // 保存 token 信息
    await saveToken(tokenAddress, tokenName || 'Unknown', tokenSymbol || 'Unknown');

    // 保存 holders 数据
    await saveHolders(tokenAddress, holders);

    res.json({ 
      success: true, 
      saved: holders.length,
      message: `Saved ${holders.length} holders for ${tokenAddress}`
    });
  } catch (error) {
    console.error('Save holders error:', error);
    res.status(500).json({ error: error.message });
  }
};
