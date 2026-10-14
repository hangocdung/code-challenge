# Problem 1 — Three ways to sum to n

`solution.js` exports the exact requested function names: `sum_to_n_a`, `sum_to_n_b`, `sum_to_n_c`.

| Implementation | Approach | Time | Extra space |
| --- | --- | --- | --- |
| a | Accumulate 1 through n | O(n) | O(1) |
| b | Arithmetic series n(n+1)/2 | O(1) | O(1) |
| c | Recursive halving, S(2k) = 2S(k) + k² | O(log n) | O(log n) stack |

For odd inputs, add the final term after evaluating S(2k). The recursive version avoids linear-depth recursion and its stack overflow risk. The formula divides the even factor before multiplying, keeping intermediate products within the safe integer range.

Assumptions: the sum is over the positive range 1..n, so n <= 0 yields the empty sum 0. The prompt says any integer but does not define negative ranges; this convention is explicit and consistent in all three functions. Non-safe-integer inputs throw TypeError; positive inputs whose sum exceeds Number.MAX_SAFE_INTEGER throw RangeError. These checks extend the prompt's guaranteed-safe output constraint. The largest supported positive n is 134217727.

Run all tests with `npm test`. Each implementation returns `15` for input `5`.
