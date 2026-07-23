# Longcat

Longcat is a Solana native leverage token powered by Hyperliquid. Creator fees are designed to build one public SOL long; qualifying realized
profits can buy back and permanently burn `$LONGCAT`.

## Routes

- `/` - Longcat launch page with white Solana-coded terminal visuals, live integration placeholders, mechanism, thesis, burns, and FAQ.
- `/dashboard` - Hyperliquid-facing read-only terminal for SOL position telemetry, receipts, and burn placeholders.
- `/thesis` - SOL thesis, risks, and source links.

## Contract

- CA: soon on Solana
- Fee: creator fees
- Mechanism: fees extend the public SOL long; qualifying realized profits buy back and burn `$LONGCAT`

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
SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

The frontend only reads browser-safe Supabase views. Keep service-role keys,
wallet keys, and Hyperliquid signing keys server-side.

## Useful Commands

```bash
npm install
npm run dev
npm run lint
npm run build:vercel
npm run build
npm test
```

## Backend Notes

Run `supabase/schema.sql` in Supabase before connecting live receipts. The
automation worker should stay in dry-run mode until Solana wallet authority, fee claiming, swap routing, Hyperliquid collateral movement, SOL order sizing, risk limits, and terminal logging are verified end to end.
