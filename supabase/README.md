# Hedge Supabase Wiring

Run `schema.sql` once in the Supabase SQL editor. It creates:

- `hedge_public_terminal` for verified creator-fee, bridge, short-order,
  buyback, and burn receipts
- `hedge_latest_positions` for archived Hyperliquid short snapshots
- `hedge_public_totals` for verified lifetime fee, bridge, buyback, and burn
  totals

The browser uses only the Supabase anon key. The Railway worker uses the
service-role key and must never expose it to Vercel or the browser.

The schema is idempotent and does not delete legacy tables. Live execution is
fail-closed and requires explicit adapter credentials, addresses, allowlisted
markets, capital limits, leverage limits, and `HEDGE_LIVE_EXECUTION_CONFIRMED`.
