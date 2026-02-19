// Vercel KV 数据库封装
const { kv } = require('@vercel/kv');

// Token 相关
async function saveToken(address, name, symbol) {
  const key = `token:${address.toLowerCase()}`;
  await kv.hset(key, {
    address: address.toLowerCase(),
    name,
    symbol,
    created_at: new Date().toISOString()
  });
}

async function getTokens() {
  const keys = await kv.keys('token:*');
  const tokens = [];
  for (const key of keys) {
    const token = await kv.hgetall(key);
    if (token) tokens.push(token);
  }
  return tokens.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// Holder 相关
async function saveHolders(tokenAddress, holders) {
  const key = `holders:${tokenAddress.toLowerCase()}`;
  await kv.set(key, JSON.stringify(holders));
}

async function getHolders(tokenAddress) {
  const key = `holders:${tokenAddress.toLowerCase()}`;
  const data = await kv.get(key);
  return data ? JSON.parse(data) : [];
}

// 地址备注
async function saveAddress(address, note) {
  const key = `address:${address.toLowerCase()}`;
  await kv.hset(key, {
    address: address.toLowerCase(),
    note,
    created_at: new Date().toISOString()
  });
}

async function getSavedAddresses() {
  const keys = await kv.keys('address:*');
  const addresses = [];
  for (const key of keys) {
    const addr = await kv.hgetall(key);
    if (addr) addresses.push(addr);
  }
  return addresses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

module.exports = {
  saveToken,
  getTokens,
  saveHolders,
  getHolders,
  saveAddress,
  getSavedAddresses
};
