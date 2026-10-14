// Convention: an empty range (n <= 0) sums to 0. Only safe integers are accepted.
function validate(n) {
  if (!Number.isSafeInteger(n)) throw new TypeError('n must be a safe integer');
  if (n > 0 && n > Math.floor((Math.sqrt(1 + 8 * Number.MAX_SAFE_INTEGER) - 1) / 2)) {
    throw new RangeError('The sum exceeds Number.MAX_SAFE_INTEGER');
  }
}

// Iteration: O(n) time, O(1) space.
export var sum_to_n_a = function (n) {
  validate(n);
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i;
  return sum;
};

// Arithmetic series: O(1) time and space. Halve first to avoid an unsafe product.
export var sum_to_n_b = function (n) {
  validate(n);
  if (n <= 0) return 0;
  return n % 2 === 0 ? (n / 2) * (n + 1) : n * ((n + 1) / 2);
};

// Divide and conquer using S(2k) = 2*S(k) + k*k.
// O(log n) time and stack space, without linear-depth recursion.
export var sum_to_n_c = function (n) {
  validate(n);
  function sum(value) {
    if (value <= 0) return 0;
    const half = Math.floor(value / 2);
    const evenSum = 2 * sum(half) + half * half;
    return value % 2 === 0 ? evenSum : evenSum + value;
  }
  return sum(n);
};
