import test from 'node:test';
import assert from 'node:assert/strict';
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from '../src/problem1/solution.js';
import { normalizePrices, quote } from '../src/problem2/exchange.js';
import { selectBalances, getPriority, getUsdValue } from '../src/problem3/wallet.ts';

for (const sum of [sum_to_n_a, sum_to_n_b, sum_to_n_c]) {
  test(`${sum.name || 'sum'}: sums integers and rejects unsupported inputs`, () => {
    for (const [n, expected] of [[-5, 0], [0, 0], [1, 1], [5, 15], [100, 5050]]) assert.equal(sum(n), expected);
    for (let n = 0; n <= 1000; n++) assert.equal(sum(n), n * (n + 1) / 2);
    for (const n of [NaN, Infinity, 1.5, '5', Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => sum(n), TypeError);
    assert.throws(() => sum(134217728), RangeError);
  });
}
test('constant/logarithmic sums preserve safe-integer boundary precision', () => {
  const n = 134217727;
  const exact = Number(BigInt(n) * BigInt(n + 1) / 2n);
  assert.equal(sum_to_n_b(n), exact); assert.equal(sum_to_n_c(n), exact);
});
test('prices choose the newest valid record per currency and exclude invalid data', () => {
  const records = [
    { currency: 'ETH', price: 2, date: '2023-08-29' },
    { currency: 'ETH', price: 3, date: '2023-08-30' },
    { currency: 'ETH', price: 1, date: '2023-08-28' },
    { currency: 'USD', price: 1, date: '2023-08-30' },
    ...[0, -1, NaN, Infinity, '2'].map((price) => ({ currency: 'BAD', price, date: '2023-08-30' })),
    { currency: 'BAD', price: 1, date: 'bad' }, null,
  ];
  assert.deepEqual(normalizePrices(records).map((t) => [t.symbol, t.price]), [['ETH', 3], ['USD', 1]]);
  assert.throws(() => normalizePrices({}));
});
test('quotes handle normal conversions and invalid/overflow amounts', () => {
  assert.equal(quote('2.5', 2000, 1), 5000);
  assert.equal(quote('0.5', 1, 2000), .00025);
  assert.equal(quote('.5', 1, 2000), .00025);
  assert.equal(quote('1' + '0'.repeat(300), 1e100, 1e100), null);
  for (const amount of ['', '0', '-1', 'abc', '1e3', '1,000', 'Infinity', '1.2.3']) assert.equal(quote(amount, 1, 2), null);
  assert.equal(quote('1', undefined, 1), null); assert.equal(quote('1', 1, 0), null);
  assert.equal(quote('9'.repeat(310), 1, 1), null);
});
test('wallet filters and sorts without mutating inputs; keeps equal-priority order', () => {
  const holding = (id, blockchain, amount = 1) => ({ id, blockchain, amount, currency: 'TEST' });
  const balances = Object.freeze([holding('neo', 'Neo'), holding('eth', 'Ethereum'), holding('zil', 'Zilliqa'), holding('osmo', 'Osmosis'), holding('bad', 'Unknown'), holding('zero', 'Osmosis', 0), holding('negative', 'Ethereum', -1), holding('nan', 'Ethereum', NaN)]);
  assert.deepEqual(selectBalances(balances).map((b) => b.id), ['osmo', 'eth', 'neo', 'zil']);
  assert.equal(balances[0].id, 'neo'); assert.equal(getPriority('toString'), -99);
  assert.equal(getUsdValue(2, 3), 6);
  for (const price of [undefined, 0, -1, NaN, Infinity]) assert.equal(getUsdValue(1, price), null);
});
