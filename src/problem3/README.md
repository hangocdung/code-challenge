# Problem 3 — Messy React

## Issues and improvements

1. **Undefined `lhsPriority`.** The filter computes `balancePriority` but reads a different variable. This is a compile-time error (or a runtime ReferenceError if type checking is bypassed). Compare `balancePriority` instead.
2. **Missing `blockchain` in WalletBalance.** Both the filter and comparator access a field absent from the declared interface. Add it to the source model; do not hide the error with `any`.
3. **Inverted amount filter.** `amount <= 0` retains zero and negative holdings. Assumption: a wallet should show supported, positive holdings. Use `amount > 0`, also excluding NaN and infinities. If debt positions are intended, this product rule must change.
4. **Comparator does not return 0 for ties.** Its inferred return type includes undefined. Return the priority difference, giving a complete numeric comparator. Modern JavaScript stable sort preserves source order for equal priorities.
5. **Unused formattedBalances.** The code allocates an extra array and objects on every render, then maps sortedBalances instead. Consequently `balance.formatted` is undefined. Format the amount in the actual render pass (or memoize a single derived view-model if profiling justifies it).
6. **Incorrect callback annotation.** Labeling unformatted source items as FormattedWalletBalance does not transform them; it conflicts with the array type. Let TypeScript infer the callback type.
7. **Unrelated memo dependency.** `prices` is not used by filtering/sorting, so price updates unnecessarily repeat O(n log n) work. Depend only on balances, and read current prices when rendering rows.
8. **Repeated priority helper creation and weak parameter type.** The pure getPriority function is recreated inside every render, while `any` disables useful checks. Hoist the helper and a fixed lookup table, accepting a string with an explicit unknown-chain fallback. The original hook closure is not stale because the helper is pure; hoisting also avoids dependency ambiguity.
9. **Index keys.** Reordering balances can associate existing component state with a different holding. Use a persistent source ID. A currency alone is insufficient across chains or accounts. The refactor explicitly requires a unique holding ID rather than inventing one per render.
10. **Missing or invalid prices.** An absent price produces NaN; multiplication can overflow. Represent unavailable valuations explicitly instead of displaying NaN or silently treating them as zero.
11. **Unintentional integer formatting.** `toFixed()` defaults to zero decimals and loses meaningful token precision. Use a reusable formatter with an explicit display policy. Display rounding must not be used as transaction arithmetic.
12. **Discarded children.** children is removed from props and never rendered. Either deliberately exclude children from the contract or render them; this refactor renders them.
13. **BoxProps on a div.** If BoxProps includes UI-kit-only properties, spreading them onto a native element can emit invalid DOM attributes. Use native div props, or actually render that UI kit's Box. The challenge omits definitions of BoxProps, WalletRow, hooks, and classes; they are integration dependencies, not necessarily defects in the wider original app.

## Refactor

`WalletPage.tsx` is a complete, strictly typed React component with explicit data props. `wallet.ts` holds the pure selection and valuation logic. A real app can call its existing `useWalletBalances()` and `usePrices()` in a container and pass their results here. The source must supply stable IDs and immutable arrays for useMemo to remain correct. Hooks remain at component top level.

Filtering creates a new array before `.sort()`, so **the original code does not mutate the input balances**; calling its sort an input mutation would be incorrect. The refactor retains that property. It costs O(n log n) time, O(n) storage, with filtering/sorting recomputed only when balances changes. Rendering is O(n), required to display the list. Per-row memoization and list virtualization are optional optimizations for measured large-list bottlenecks, not automatic requirements.

Assumptions: supported chains and priorities remain as given; supported positive finite holdings are visible; equal priorities retain source order; missing/non-positive prices display “Price unavailable”; amounts use up to 8 decimal places and USD uses 2. This is a display component, not a financial settlement engine. Existing hooks should handle their own loading/error states in the container.
