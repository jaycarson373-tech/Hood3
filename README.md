# Hedge the Hedgehog

Hedge the Hedgehog is a Solana community project built around a transparent
Hyperliquid short book. Creator-fee flow is designed to fund disclosed shorts
in AI and technology blue chips the mandate identifies as overvalued.
Qualifying realized short profit may buy and permanently burn `$HEDGE`.

## Routes

- `/` - launch experience, strategy, live terminal, PFP studio, and roadmap
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

The existing Railway worker and Supabase schema are intentionally preserved for
backward compatibility. The worker does not execute this Hyperliquid AI-short
mandate yet. Keep `DRY_RUN=true` until a dedicated Hyperliquid account, market
allowlist, leverage limits, position caps, funding paths, and dry-run receipts
have all been reviewed.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run worker:once
npm test
```
