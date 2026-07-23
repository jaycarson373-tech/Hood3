# Longcat Supabase Wiring

Run `supabase/schema.sql` in your Supabase SQL editor first. It is Solana only and does not require old-chain or Pump-style assumptions.

The browser reads from:

- `longcat_public_terminal` for the Longcat terminal transaction feed.
- `longcat_latest_position` for the current SOL long amount backing the native leverage loop.

The database view names currently preserve the earlier prefix for migration safety. The public site copy is Longcat.

Frontend env vars:

```bash
LAUNCH_STATE=prelaunch
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Keep writes server-side with a trusted backend using the service-role key. Never put private keys, Hyperliquid signing keys, or the service-role key in the frontend.

Suggested backend env vars:

```bash
SITE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SOLANA_RPC_URL=

# Solana fee receiver / execution wallet.
LONGCAT_SOL_WALLET_ADDRESS=
LONGCAT_SOL_WALLET_PRIVATE_KEY=
LONGCAT_SOL_FEE_BUFFER_SOL=0.05
LONGCAT_TOKEN_ADDRESS=

LONGCAT_HYPERLIQUID_ACCOUNT=
HYPERLIQUID_API_WALLET_PRIVATE_KEY=
CLAIM_INTERVAL_MINUTES=15
DRY_RUN=true

FLAP_CLAIM_ENDPOINT=
FLAP_API_KEY=
LONGCAT_BRIDGE_ENDPOINT=
LONGCAT_BRIDGE_API_KEY=
HYPERLIQUID_ORDER_ENDPOINT=
HYPERLIQUID_API_KEY=
LONGCAT_PROFIT_ENDPOINT=
LONGCAT_PROFIT_API_KEY=
LONGCAT_BUYBACK_BURN_ENDPOINT=
LONGCAT_BUYBACK_BURN_API_KEY=
```

Automation loop:

1. Create an automation run row every 15 minutes.
2. Read or claim available Solana creator fees and insert a claim row.
3. Keep the 0.05 SOL buffer untouched.
4. Route available SOL above the fee buffer through the approved bridge/execution path and insert a transfer row.
5. Swap SOL to execution collateral if Hyperliquid requires it and insert a swap row.
6. Transfer collateral to the Hyperliquid account and insert another transfer row.
7. Open or add to the public SOL long and insert a long-order row.
8. Check qualifying realized profit, bridge profit back, buy `$LONGCAT`, and burn purchased tokens.
9. Snapshot exposure into the positions table.
10. Insert a terminal event row for every stage so the site can show receipts.

Leave `DRY_RUN=true` and `automation_enabled=false` until the wallet, order sizing, slippage, liquidation, and failure-handling checks are complete.

Route rule:

```ts
const gasBufferSol = 0.05;
const routeableSol = Math.max(0, feeWalletBalanceSol - gasBufferSol);
```

If `routeableSol` is `0`, the worker should skip movement and log an idle terminal event instead of draining the wallet.
