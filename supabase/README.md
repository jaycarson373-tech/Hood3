# Longcat Supabase Wiring

Run `supabase/schema.sql` in your Supabase SQL editor first. It is Robinhood ETH only and removes the old chain assumptions from the previous setup.

The browser reads from:

- `longcat_public_terminal` for the Longcat terminal transaction feed.
- `longcat_latest_position` for the current Cashcat long amount backing the native leverage loop.

Frontend env vars:

```bash
SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Keep writes server-side with a trusted backend using the service-role key. Never put private keys, Hyperliquid signing keys, or the service-role key in the frontend.

Suggested backend env vars:

```bash
SITE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ROBINHOOD_RPC_URL=

# Robinhood ETH fee receiver / execution wallet.
LONGCAT_ETH_WALLET_ADDRESS=
LONGCAT_ETH_WALLET_PRIVATE_KEY=
LONGCAT_ETH_GAS_BUFFER_ETH=0.005

LONGCAT_HYPERLIQUID_PERP_ACCOUNT=
HYPERLIQUID_API_WALLET_PRIVATE_KEY=
CLAIM_INTERVAL_MINUTES=15
DRY_RUN=true
```

Automation loop:

1. Create a `longcat_automation_runs` row every 15 minutes.
2. Read or claim available Robinhood ETH creator fees and insert a `longcat_claims` row.
3. Route available ETH above the gas buffer through the approved execution path and insert a `longcat_transfers` row.
4. Swap ETH to USDC if execution requires it and insert a `longcat_swaps` row.
5. Transfer collateral to the perp account and insert another `longcat_transfers` row.
6. Open or add to the Cashcat long and insert a `longcat_long_orders` row.
7. Snapshot exposure into `longcat_positions`.
8. Insert a `longcat_terminal_events` row for every stage so the site can show receipts.

Leave `DRY_RUN=true` and `automation_enabled=false` until the wallet, order sizing, slippage, liquidation, and failure-handling checks are complete.

Route rule:

```ts
const gasBufferEth = 0.005;
const routeableEth = Math.max(0, feeWalletBalanceEth - gasBufferEth);
```

If `routeableEth` is `0`, the worker should skip movement and log an idle terminal event instead of draining the wallet.
