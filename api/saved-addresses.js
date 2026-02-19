const { verifyToken } = require('./auth/middleware');
const { getSavedAddresses } = require('./db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authResult = verifyToken(req);
  if (!authResult.valid) {
    return res.status(401).json({ error: authResult.error });
  }

  try {
    const addresses = await getSavedAddresses();
    res.json({ addresses });
  } catch (error) {
    console.error('Get saved addresses error:', error);
    res.status(500).json({ error: error.message });
  }
};
