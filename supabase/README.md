# Hood3 Supabase Wiring

Run `supabase/schema.sql` in your Supabase SQL editor first. It is Robinhood ETH only and does not require old-chain or Pump-style assumptions.

The browser reads from:

- `longcat_public_terminal` for the Hood3 terminal transaction feed.
- `longcat_latest_position` for the current HOOD long amount backing the native leverage loop.

The database view names currently preserve the earlier prefix for migration safety. The public site copy is Hood3.

Frontend env vars:

```bash
SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Keep writes server-side with a trusted backend using the service-role key. Never put private keys, Lighter signing keys, or the service-role key in the frontend.

Suggested backend env vars:

```bash
SITE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ROBINHOOD_RPC_URL=

# Robinhood ETH fee receiver / execution wallet.
HOOD3_ETH_WALLET_ADDRESS=
HOOD3_ETH_WALLET_PRIVATE_KEY=
HOOD3_ETH_GAS_BUFFER_ETH=0.005

HOOD3_LIGHTER_ACCOUNT=
LIGHTER_API_WALLET_PRIVATE_KEY=
CLAIM_INTERVAL_MINUTES=15
DRY_RUN=true
```

Automation loop:

1. Create an automation run row every 15 minutes.
2. Read or claim available Robinhood ETH creator fees and insert a claim row.
3. Route available ETH above the gas buffer through the approved execution path and insert a transfer row.
4. Swap ETH to execution collateral if Lighter requires it and insert a swap row.
5. Transfer collateral to the Lighter account and insert another transfer row.
6. Open or add to the HOOD long and insert a long-order row.
7. Snapshot exposure into the positions table.
8. Insert a terminal event row for every stage so the site can show receipts.

Leave `DRY_RUN=true` and `automation_enabled=false` until the wallet, order sizing, slippage, liquidation, and failure-handling checks are complete.

Route rule:

```ts
const gasBufferEth = 0.005;
const routeableEth = Math.max(0, feeWalletBalanceEth - gasBufferEth);
```

If `routeableEth` is `0`, the worker should skip movement and log an idle terminal event instead of draining the wallet.
