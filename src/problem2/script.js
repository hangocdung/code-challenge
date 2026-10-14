import { PRICE_URL, normalizePrices, quote } from './exchange.js';
const $ = (id) => document.getElementById(id);
const from = $('from-currency'), to = $('to-currency'), amount = $('input-amount');
const format = (n) => new Intl.NumberFormat('en-US', { maximumSignificantDigits: 8 }).format(n);
const usd = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
let tokens = [], loading = true, pending = false, reviewed = null, controller;
const token = (select) => tokens.find((item) => item.symbol === select.value);
function icon(select, image) {
  image.hidden = false;
  image.onerror = () => { image.hidden = true; };
  image.src = `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${encodeURIComponent(select.value)}.svg`;
}
function update(showError = false) {
  const source = token(from), target = token(to);
  const result = quote(amount.value, source?.price, target?.price);
  const same = from.value === to.value;
  let error = '';
  if (amount.value.trim() && result === null && !loading && tokens.length) error = 'Enter a positive amount using digits and a decimal point.';
  else if (showError && !amount.value.trim()) error = 'Enter an amount to continue.';
  else if (same && tokens.length) error = 'Choose two different currencies.';
  $('amount-error').textContent = error;
  amount.setAttribute('aria-invalid', String(Boolean(error && !same)));
  $('output-amount').value = result !== null && !same ? format(result) : '';
  $('send-usd').textContent = result !== null ? `${usd(Number(amount.value) * source.price)} USD` : '— USD';
  $('rate').textContent = source && target ? `1 ${source.symbol} ≈ ${format(source.price / target.price)} ${target.symbol}` : '—';
  $('submit').disabled = loading || pending || result === null || same;
  return result;
}
async function load() {
  if (pending) return;
  controller?.abort(); controller = new AbortController();
  const currentController = controller;
  const timeout = setTimeout(() => currentController.abort(), 12000);
  loading = true; $('price-status').textContent = 'Loading reference prices…'; $('price-status').dataset.error = 'false';
  $('swap-form').hidden = false; $('review').hidden = true; $('success').hidden = true;
  for (const element of [from, to, amount, $('reverse')]) element.disabled = true;
  update();
  try {
    const response = await fetch(PRICE_URL, { signal: currentController.signal });
    if (!response.ok) throw new Error('Price service unavailable');
    const next = normalizePrices(await response.json());
    if (controller !== currentController) return;
    if (next.length < 2) throw new Error('Not enough priced assets');
    const previousFrom = from.value, previousTo = to.value;
    tokens = next;
    for (const select of [from, to]) select.replaceChildren(...tokens.map(({ symbol }) => new Option(symbol, symbol)));
    from.value = tokens.some((t) => t.symbol === previousFrom) ? previousFrom : (tokens.find((t) => t.symbol === 'ETH')?.symbol ?? tokens[0].symbol);
    to.value = tokens.some((t) => t.symbol === previousTo) ? previousTo : (tokens.find((t) => t.symbol === 'USDC')?.symbol ?? tokens.find((t) => t.symbol !== from.value).symbol);
    if (from.value === to.value) to.value = tokens.find((t) => t.symbol !== from.value).symbol;
    const oldest = Math.min(...tokens.map((t) => t.time));
    $('price-status').textContent = `Reference data · oldest quote ${new Date(oldest).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · Not live market rates`;
    for (const element of [from, to, amount, $('reverse')]) element.disabled = false;
    icon(from, $('from-icon')); icon(to, $('to-icon'));
  } catch {
    if (controller !== currentController) return;
    tokens = []; $('price-status').dataset.error = 'true';
    $('price-status').textContent = 'Prices could not be loaded. Use “Refresh prices” below to retry.';
  } finally {
    clearTimeout(timeout);
    if (controller === currentController) { loading = false; update(); }
  }
}
amount.addEventListener('input', () => update());
amount.addEventListener('blur', () => update(true));
for (const [select, image] of [[from, $('from-icon')], [to, $('to-icon')]]) select.addEventListener('change', () => { icon(select, image); update(); });
$('reverse').addEventListener('click', () => {
  const result = update(); [from.value, to.value] = [to.value, from.value];
  if (result !== null) amount.value = new Intl.NumberFormat('en-US', { useGrouping: false, maximumSignificantDigits: 12 }).format(result);
  icon(from, $('from-icon')); icon(to, $('to-icon')); update();
});
$('swap-form').addEventListener('submit', (event) => {
  event.preventDefault(); const result = update(true);
  if ($('submit').disabled || result === null) return;
  reviewed = { amount: amount.value, from: from.value, to: to.value, result };
  $('review-summary').textContent = `${format(Number(reviewed.amount))} ${reviewed.from} → ${format(reviewed.result)} ${reviewed.to}`;
  $('swap-form').hidden = true; $('review').hidden = false; document.querySelector('.step').textContent = '02 / 02'; $('confirm').focus();
});
$('back').addEventListener('click', () => {
  if (pending) return;
  $('review').hidden = true; $('swap-form').hidden = false; document.querySelector('.step').textContent = '01 / 02'; amount.focus();
});
$('confirm').addEventListener('click', async () => {
  if (pending || !reviewed) return;
  pending = true; $('confirm').disabled = true; $('back').disabled = true; $('retry').disabled = true;
  $('confirm').textContent = 'Simulating swap…'; $('review').setAttribute('aria-busy', 'true');
  await new Promise((resolve) => setTimeout(resolve, 1100));
  $('success-summary').textContent = `${format(Number(reviewed.amount))} ${reviewed.from} → ${format(reviewed.result)} ${reviewed.to}`;
  $('review').hidden = true; $('success').hidden = false; $('success').focus(); $('review').removeAttribute('aria-busy'); pending = false;
  $('confirm').disabled = false; $('back').disabled = false; $('retry').disabled = false; $('confirm').textContent = 'Confirm demo swap';
});
$('again').addEventListener('click', () => {
  reviewed = null; amount.value = ''; $('success').hidden = true; $('swap-form').hidden = false;
  document.querySelector('.step').textContent = '01 / 02'; update(); amount.focus();
});
$('retry').addEventListener('click', () => { document.querySelector('.step').textContent = '01 / 02'; load(); });
load();
