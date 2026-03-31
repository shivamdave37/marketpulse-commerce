const cache = new Map();

export async function withCache(key, ttlMs, factory) {
  const now = Date.now();
  const hit = cache.get(key);

  if (hit && hit.expiresAt > now) {
    return hit.value;
  }

  const value = await factory();
  cache.set(key, {
    value,
    expiresAt: now + ttlMs
  });

  return value;
}

export function invalidateCache(prefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}
