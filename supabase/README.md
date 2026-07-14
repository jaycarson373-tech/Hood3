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
HOOD3_SOL_WALLET_ADDRESS=
HOOD3_HYPERLIQUID_WALLET=
HOOD3_HYPERLIQUID_PERP_ACCOUNT=
HYPERLIQUID_API_WALLET_PRIVATE_KEY=
CLAIM_INTERVAL_MINUTES=15
DRY_RUN=true
```

Automation loop:

1. Create a `hood3_automation_runs` row every 15 minutes.
2. Claim available SOL and insert a `hood3_claims` row.
3. Send SOL to the Hyperliquid wallet and insert a `hood3_transfers` row.
4. Swap SOL to USDC and insert a `hood3_swaps` row.
5. Transfer USDC to the perp account and insert another `hood3_transfers` row.
6. Open or add to the HOOD long and insert a `hood3_long_orders` row.
7. Snapshot exposure into `hood3_positions`.
8. Insert a `hood3_terminal_events` row for every stage so the site can show receipts.

Leave `DRY_RUN=true` and `automation_enabled=false` until the wallet, order sizing, slippage, liquidation, and failure-handling checks are complete.
