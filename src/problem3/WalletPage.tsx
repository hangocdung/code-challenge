import { useMemo, type ComponentPropsWithoutRef } from 'react';
import { getUsdValue, selectBalances, type WalletBalance, type PriceMap } from './wallet';

// The challenge does not supply BoxProps, hooks, WalletRow or classes.
// Explicit props keep this component self-contained and independent of a UI kit.
export type WalletPageProps = ComponentPropsWithoutRef<'div'> & {
  balances: readonly WalletBalance[];
  prices: PriceMap;
};
const amountFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 });
const usdFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function WalletPage({ balances, prices, children, ...rest }: WalletPageProps) {
  // Price updates do not rerun filtering/sorting. Sources must update arrays immutably.
  const sortedBalances = useMemo(() => selectBalances(balances), [balances]);
  return (
    <div {...rest}>
      <ul aria-label="Wallet balances">
        {sortedBalances.map((balance) => {
          const usdValue = getUsdValue(balance.amount, prices[balance.currency]);
          return (
            <li key={balance.id}>
              <span>{balance.currency} · {balance.blockchain}</span>{' '}
              <span>{amountFormat.format(balance.amount)}</span>{' '}
              <span>{usdValue === null ? 'Price unavailable' : usdFormat.format(usdValue)}</span>
            </li>
          );
        })}
      </ul>
      {sortedBalances.length === 0 && <p>No supported positive balances.</p>}
      {children}
    </div>
  );
}
