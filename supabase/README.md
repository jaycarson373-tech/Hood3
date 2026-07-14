# Hood3 Supabase Wiring

Run `supabase/schema.sql` in your Supabase SQL editor first. The browser should read from:

- `hood3_public_terminal` for the Hood3 terminal transaction feed.
- `hood3_latest_position` for the current HOOD long amount backing the NLT flywheel.

Frontend env vars:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Keep writes server-side with a Supabase Edge Function, worker, or trusted backend using the service-role key. Do not put private keys, Hyperliquid signing keys, or the service-role key in the frontend.

Suggested backend env vars:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SOLANA_RPC_URL=

# Wallet that claims/holds SOL and signs outgoing transfers.
HOOD3_SOL_WALLET_PUBLIC_KEY=
HOOD3_SOL_WALLET_PRIVATE_KEY=

# If pump.fun fee claiming uses a separate authority, set these too.
# If it is the same wallet as above, use the same public/private key.
PUMP_FUN_FEE_AUTHORITY_PUBLIC_KEY=
PUMP_FUN_FEE_AUTHORITY_PRIVATE_KEY=

# Destination wallet. The worker sends all SOL above the 0.05 SOL buffer here.
HOOD3_HYPERLIQUID_SOL_WALLET=
HOOD3_SOL_FEE_BUFFER_SOL=0.05

HOOD3_HYPERLIQUID_PERP_ACCOUNT=
HYPERLIQUID_API_WALLET_PRIVATE_KEY=
CLAIM_INTERVAL_MINUTES=15
DRY_RUN=true
```

Automation loop:

1. Create a `hood3_automation_runs` row every 15 minutes.
2. Claim available SOL and insert a `hood3_claims` row.
3. Keep `0.05 SOL` in the source wallet for fees, send the remaining SOL to the Hyperliquid wallet, and insert a `hood3_transfers` row.
4. Swap SOL to USDC and insert a `hood3_swaps` row.
5. Transfer USDC to the perp account and insert another `hood3_transfers` row.
6. Open or add to the HOOD long and insert a `hood3_long_orders` row.
7. Snapshot exposure into `hood3_positions`.
8. Insert a `hood3_terminal_events` row for every stage so the site can show receipts.

Leave `DRY_RUN=true` and `automation_enabled=false` until the wallet, order sizing, slippage, liquidation, and failure-handling checks are complete.

Transfer rule:

```ts
const bufferSol = 0.05;
const sendableSol = Math.max(0, sourceWalletBalanceSol - bufferSol);
```

If `sendableSol` is `0`, the worker should skip the transfer and log an idle terminal event instead of draining the wallet.
