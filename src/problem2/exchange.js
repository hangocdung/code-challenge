export const PRICE_URL = 'https://interview.switcheo.com/prices.json';

// Choose the newest valid record per symbol; ignore unavailable/non-positive prices.
export function normalizePrices(records) {
  if (!Array.isArray(records)) throw new Error('Unexpected price response');
  const latest = new Map();
  for (const record of records) {
    if (!record || typeof record.currency !== 'string' || !/^[A-Za-z0-9._-]+$/.test(record.currency) ||
        typeof record.price !== 'number' || !Number.isFinite(record.price) || record.price <= 0) continue;
    const time = Date.parse(record.date);
    if (!Number.isFinite(time)) continue;
    const previous = latest.get(record.currency);
    if (!previous || time > previous.time) latest.set(record.currency, { symbol: record.currency, price: record.price, time });
  }
  return [...latest.values()].sort((a, b) => a.symbol.localeCompare(b.symbol));
}

export function quote(amount, fromPrice, toPrice) {
  if (typeof amount !== 'string' || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(amount.trim())) return null;
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0 || !Number.isFinite(fromPrice) || fromPrice <= 0 || !Number.isFinite(toPrice) || toPrice <= 0) return null;
  const result = value * (fromPrice / toPrice);
  return Number.isFinite(value * fromPrice) && Number.isFinite(result) && result > 0 ? result : null;
}
