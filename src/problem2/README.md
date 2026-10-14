# Problem 2 — Fancy Form / Orbit

Run `npm install`, then `npm run dev`; open the local URL printed in the terminal. The root redirects to `/src/problem2/`. Build with `npm run build`; inspect the production build with `npm run preview`.

Built with Vite and native JavaScript/CSS, extending the provided HTML/CSS/JS files. No wallet, account, or backend is required. The layout adapts from a two-column desktop page to a single-column mobile page. Native labelled selects support keyboard navigation and type-to-select. Token icons are decorative and disappear gracefully if unavailable. All functionality works without the icon service.

## Behavior

- Fetches the challenge's prices.json endpoint with loading, 12-second timeout, error and explicit retry states.
- Deduplicates each currency by newest valid dated quote; ignores missing, invalid or non-positive prices.
- Defaults to ETH → USDC when available; computes output as amount × source USD price / destination USD price.
- Validates a positive decimal input, rejects scientific notation and non-finite/overflow results, and prevents identical currency pairs.
- Reverses the currencies while using the previous unformatted output as the new input (12 significant digits); the displayed quote uses 8 significant digits.
- Shows a review step, disables repeated submission during a simulated delay, then shows success and a reset action.
- Uses semantic labels, visible keyboard focus, an error description, live status messages and explicit focus changes after each step.

## Assumptions and limits

The provided API contains historical reference data, not a live trading feed. The UI labels it accordingly, showing the oldest selected record across supported currencies. No silent fabricated-price fallback is used. A failed API request leaves trading disabled until a successful retry.

Fees are zero for this demo; there is no slippage, wallet balance validation, network routing or settlement. IEEE-754 numbers are appropriate for this quote demonstration; a production system should use decimal/base-unit arithmetic, authoritative server quotes, token-specific precision, quote expiry and wallet integration. Review keeps the current quote fixed until confirmation or editing. No real funds move and no transaction is submitted.
