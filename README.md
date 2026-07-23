# Longcat

Longcat is a Solana native leverage token powered by Hyperliquid. Creator fees are designed to build one public SOL long; qualifying realized
profits can buy back and permanently burn `$LONGCAT`.

## Routes

- `/` - Longcat launch page with Solana-coded terminal visuals, mechanism, thesis, burns, and FAQ.
- `/dashboard` - Hyperliquid-facing public terminal for verified SOL position telemetry and receipts.
- `/thesis` - SOL thesis, risks, and source links.

## Mechanism

- Fee: creator fees
- Flow: fees extend the public SOL long; qualifying realized profits buy back and burn `$LONGCAT`

Solana token creation, fee routing, Hyperliquid execution, SOL position
management, buybacks, and burns should be handled by audited server-side
automation and published as public terminal receipts.

## X Assets And Copy

- Banner: `public/x-banner.png`
- Avatar: `public/x-avatar.png`

Bio:
```text
The longest cat on Solana.

Creator fees scale into a public SOL long on Hyperliquid.

Profits buy back & burn $LONGCAT.
```

Community description:
```text
100% of creator fees are designed to scale into a public SOL long on Hyperliquid.

Qualifying realized profits buy back & permanently burn $LONGCAT.
```

## Required Frontend Environment

```bash
LAUNCH_STATE=prelaunch
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`LAUNCH_STATE` is server-only. Change it to `live` only after verified public
position and receipt rows are available.

The frontend only reads browser-safe Supabase views. Keep service-role keys,
wallet keys, and Hyperliquid signing keys server-side.

## Useful Commands

```bash
npm install
npm run dev
npm run lint
npm run build:vercel
npm run build
npm run start:railway
npm run worker:once
npm test
```

## Backend Notes

Run `supabase/schema.sql` in Supabase before connecting live receipts. The
Railway worker lives in `railway-worker.mjs` and is started with
`npm run start:railway`. It creates a run every 15 minutes, keeps the 0.05 SOL
wallet buffer, checks the fee wallet, and writes every claim, bridge, SOL long,
profit, buyback, and burn stage to Supabase.

Keep `DRY_RUN=true` until Solana wallet authority, fee claiming, bridge routing,
Hyperliquid order execution, profit-taking, buybacks, burns, risk limits, and
terminal logging are verified end to end.
