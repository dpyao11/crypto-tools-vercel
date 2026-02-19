// 简单内存存储（无需 KV）
const storage = {
  tokens: new Map(),
  holders: new Map(),
  addresses: new Map()
};

// Token 相关
async function saveToken(address, name, symbol) {
  const key = address.toLowerCase();
  storage.tokens.set(key, {
    address: key,
    name,
    symbol,
    created_at: new Date().toISOString()
  });
}

async function getTokens() {
  return Array.from(storage.tokens.values())
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// Holder 相关
async function saveHolders(tokenAddress, holders) {
  const key = tokenAddress.toLowerCase();
  storage.holders.set(key, holders);
}

async function getHolders(tokenAddress) {
  const key = tokenAddress.toLowerCase();
  return storage.holders.get(key) || [];
}

// 地址备注
async function saveAddress(address, note) {
  const key = address.toLowerCase();
  storage.addresses.set(key, {
    address: key,
    note,
    created_at: new Date().toISOString()
  });
}

async function getSavedAddresses() {
  return Array.from(storage.addresses.values())
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

module.exports = {
  saveToken,
  getTokens,
  saveHolders,
  getHolders,
  saveAddress,
  getSavedAddresses
};
