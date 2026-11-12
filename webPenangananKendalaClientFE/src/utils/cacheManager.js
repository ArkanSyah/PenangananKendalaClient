const API_CACHE_NAME = 'api-cache';

export async function purgeApiCache() {
  if (typeof caches === 'undefined') {
    return { purged: false, reason: 'Cache API not supported' };
  }
  try {
    const deleted = await caches.delete(API_CACHE_NAME);
    return { purged: deleted, cacheName: API_CACHE_NAME };
  } catch (err) {
    return { purged: false, reason: err.message };
  }
}

export async function purgeAllCaches() {
  if (typeof caches === 'undefined') {
    return { purged: [], reason: 'Cache API not supported' };
  }
  try {
    const keys = await caches.keys();
    const results = await Promise.all(keys.map((k) => caches.delete(k)));
    return { purged: keys.filter((_, i) => results[i]), total: keys.length };
  } catch (err) {
    return { purged: [], reason: err.message };
  }
}
