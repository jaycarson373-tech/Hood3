# BBL Supabase Wiring

Run `supabase/schema.sql` in the Supabase SQL editor before connecting Railway.

The browser only reads:

- `bbl_public_terminal` for published transaction receipts
- `bbl_latest_position` for the latest ANSEM spot snapshot

Keep the service-role key, wallet keys, and Hyperliquid API wallet key
server-side.

Frontend:

```bash
SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
BBL_TOKEN_ADDRESS=
NEXT_PUBLIC_BBL_HYPERLIQUID_ACCOUNT=
```

Railway:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SOLANA_RPC_URL=
BBL_SOL_WALLET_ADDRESS=
BBL_SOL_WALLET_PRIVATE_KEY=
BBL_SOL_FEE_BUFFER_SOL=0.05
BBL_TOKEN_ADDRESS=
BBL_HYPERLIQUID_SOL_DEPOSIT_ADDRESS=
BBL_MIN_ROUTE_SOL=0.12
BBL_HYPERLIQUID_ACCOUNT=
HYPERLIQUID_API_URL=https://api.hyperliquid.xyz
HYPERLIQUID_API_WALLET_PRIVATE_KEY=
HYPERLIQUID_MANAGED_SPOT_USDC=false
BBL_ANSEM_SPOT_EXECUTION_CONFIRMED=false
BBL_MAX_SPOT_USDC_PER_RUN=
HYPERLIQUID_MAX_SLIPPAGE_BPS=100
HYPERLIQUID_MIN_TRADE_USDC=10
HYPERLIQUID_SPOT_USDC_BUFFER=1
HYPERLIQUID_DEPOSIT_POLL_SECONDS=90
CLAIM_INTERVAL_MINUTES=15
DRY_RUN=true
PUMP_FUN_CLAIM_ENDPOINT=
PUMP_FUN_API_KEY=
BBL_PROFIT_ENDPOINT=
BBL_PROFIT_API_KEY=
BBL_BUYBACK_BURN_ENDPOINT=
BBL_BUYBACK_BURN_API_KEY=
```

Live execution is fail-closed. It requires managed-spot approval, explicit
ANSEM execution confirmation, a positive per-run USDC cap, and a bounded
slippage setting.
