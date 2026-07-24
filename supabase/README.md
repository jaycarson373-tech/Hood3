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
SITE_URL=https://www.longcatsolana.fun
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SOLANA_RPC_URL=

# Dedicated Solana creator-fee wallet. Do not use the token mint here.
LONGCAT_SOL_WALLET_ADDRESS=
LONGCAT_SOL_WALLET_PRIVATE_KEY=
LONGCAT_SOL_FEE_BUFFER_SOL=0.05
LONGCAT_TOKEN_ADDRESS=FUhEjYbmZv9k6ifagBggdrcU64ioF6FqZMvwZFtppump

LONGCAT_HYPERLIQUID_SOL_DEPOSIT_ADDRESS=
LONGCAT_MIN_ROUTE_SOL=0.12
LONGCAT_HYPERLIQUID_ACCOUNT=0x68F6723727EF5306122D666F92bEDF4d8382E2Fc
HYPERLIQUID_API_URL=https://api.hyperliquid.xyz
HYPERLIQUID_API_WALLET_PRIVATE_KEY=
HYPERLIQUID_MASTER_WALLET_PRIVATE_KEY=
HYPERLIQUID_MANAGED_SPOT_USDC=false
HYPERLIQUID_LONG_LEVERAGE=
HYPERLIQUID_MAX_COLLATERAL_USDC_PER_RUN=
HYPERLIQUID_MAX_SLIPPAGE_BPS=100
HYPERLIQUID_MIN_TRADE_USDC=10
HYPERLIQUID_SPOT_USDC_BUFFER=1
HYPERLIQUID_COLLATERAL_UTILIZATION=0.95
HYPERLIQUID_DEPOSIT_POLL_SECONDS=90

CLAIM_INTERVAL_MINUTES=15
DRY_RUN=true

PUMP_FUN_CLAIM_ENDPOINT=
PUMP_FUN_API_KEY=
LONGCAT_PROFIT_ENDPOINT=
LONGCAT_PROFIT_API_KEY=
LONGCAT_BUYBACK_BURN_ENDPOINT=
LONGCAT_BUYBACK_BURN_API_KEY=
```

Automation loop:

1. Create an automation run row every 15 minutes.
2. Read or claim available Solana creator fees and insert a claim row.
3. Keep the 0.05 SOL buffer untouched.
4. Send available SOL above the fee buffer to the account's unique Hyperliquid Solana deposit address.
5. Wait for Unit SOL (`USOL`) credit, then sell it for USDC on Hyperliquid spot.
6. Transfer newly managed USDC from spot to perps with the master signer.
7. Use the approved API wallet to open or add to the public SOL long within the configured risk limits.
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
