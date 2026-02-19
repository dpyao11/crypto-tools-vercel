const { verifyToken } = require('./auth/middleware');
const { saveAddress } = require('./db');

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
    const { address, note } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address required' });
    }

    await saveAddress(address, note || '');

    res.json({ success: true });
  } catch (error) {
    console.error('Save address error:', error);
    res.status(500).json({ error: error.message });
  }
};
