export interface WalletBalance {
  /** Stable holding identifier supplied by the data source. */
  id: string;
  blockchain: string;
  currency: string;
  amount: number;
}
export type PriceMap = Readonly<Record<string, number | undefined>>;
export const PRIORITIES: Readonly<Record<string, number>> = Object.freeze({
  Osmosis: 100, Ethereum: 50, Arbitrum: 30, Zilliqa: 20, Neo: 20,
});
export function getPriority(blockchain: string): number {
  return Object.hasOwn(PRIORITIES, blockchain) ? PRIORITIES[blockchain] : -99;
}
export function selectBalances(balances: readonly WalletBalance[]): WalletBalance[] {
  return balances
    .filter((balance) => getPriority(balance.blockchain) > -99 && Number.isFinite(balance.amount) && balance.amount > 0)
    .sort((lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain));
}
export function getUsdValue(amount: number, price: number | undefined): number | null {
  if (price === undefined || !Number.isFinite(price) || price <= 0) return null;
  const value = price * amount;
  return Number.isFinite(value) ? value : null;
}
