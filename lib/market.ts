// Pakistan market pricing types + formatting helper. Per-market prices and
// the price-trend history are both real, admin-entered/recorded data from
// the database now (see lib/backend-data.ts) — this file no longer
// simulates anything, it just carries the shared shapes and a currency
// formatter.

export function formatPkr(value: number): string {
  return `Rs ${Math.round(value).toLocaleString("en-PK")}`;
}

export type MarketRate = {
  market: string;
  city: string;
  price: number;
  priceLabel: string;
  isBest: boolean;
};

export type PricePoint = { label: string; value: number };
