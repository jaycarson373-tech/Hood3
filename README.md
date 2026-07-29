# Hedge the Hedgehog

Hedge the Hedgehog is a Solana community project built around a transparent
Hyperliquid short book. Creator-fee flow is designed to fund disclosed shorts
in AI and technology blue chips the mandate identifies as overvalued.
Qualifying realized short profit may buy and permanently burn `$HEDGE`.

## Routes

- `/` - launch experience, short-book mechanism, live terminal, PFP studio, and roadmap
- `/dashboard` - public position telemetry and verified transaction receipts
- `/thesis` - investment mandate and risk disclosures

## Data integrity

The frontend reads the public token market, Hyperliquid account, and receipt
integrations. It does not invent a price, short position, transaction, buyback,
or burn. Missing public data is represented with an em dash or a launch-ready
empty state.

## Frontend environment

Use `vercel.env.example` as the Vercel environment checklist.

## Worker

The Railway worker monitors the configured public Hyperliquid account and
publishes verified position snapshots and receipts to the `hedge_*` Supabase
tables. Fund-moving steps are delegated to authenticated signing adapters.

Keep `DRY_RUN=true` until the token mint, creator-fee wallet, Hyperliquid
account, Solana exit wallet, short-market allowlist, adapter credentials,
capital caps, leverage limit, and dry-run receipts have all been reviewed.
The worker refuses live mode unless `HEDGE_LIVE_EXECUTION_CONFIRMED=true` and
every required guardrail is configured.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run worker:once
npm test
```
