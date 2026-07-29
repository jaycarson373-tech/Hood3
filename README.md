# Hedge the Hedgehog

Hedge the Hedgehog is a Solana community project built around a transparent
perpetual strategy. Creator-fee flow is designed to form managed strategy
capital. Qualifying realized profit may buy and permanently burn `$HEDGE`.

## Routes

- `/` - launch experience, strategy, live terminal, PFP studio, and roadmap
- `/dashboard` - public position telemetry and verified transaction receipts
- `/thesis` - investment mandate and risk disclosures

## Data integrity

The frontend reads the existing public market, position, and receipt
integrations. It does not invent a price, position, transaction, buyback, or
burn. Missing public data is represented with an em dash or a launch-ready
empty state.

## Frontend environment

Use `vercel.env.example` as the Vercel environment checklist.

## Worker

The existing Railway worker and Supabase schema are intentionally preserved for
backward compatibility. Use `railway.env.example` as the Railway environment
checklist and keep `DRY_RUN=true` until execution credentials, risk limits,
funding paths, and dry-run receipts have all been reviewed.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run worker:once
npm test
```
