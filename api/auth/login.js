const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'vercel-crypto-tools-secret-2024';
const VALID_KEYS = ['DEMO2024', 'TEST2024', 'PROD2024'];

module.exports = async (req, res) => {
  // CORS
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
    const { cardKey } = req.body;
    
    if (!VALID_KEYS.includes(cardKey)) {
      return res.status(401).json({ error: '卡密无效' });
    }
    
    const token = jwt.sign({ cardKey }, JWT_SECRET, { expiresIn: '30d' });
    
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
