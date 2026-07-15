# Longcat

Longcat is a Robinhood-coded launch site for a Longcat-themed native leverage token:
creator fees extend one public leveraged Cashcat long, and qualifying realized trading
profits buy back and burn $LONGCAT.

## Routes

- `/` - Longcat landing page with hero, mechanism, Cashcat thesis, live placeholders, burns, manifesto, and FAQ.
- `/dashboard` - read-only Hyperliquid account viewer, Cashcat long model, receipt terminal, and burn placeholders.
- `/thesis` - Cashcat thesis, risks, and source links.

## Required Frontend Environment

```bash
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
automation worker should stay in dry-run mode until wallet authority, SOL fee
buffer, transfer routing, swaps, perp collateral movement, Cashcat order sizing,
risk limits, and terminal logging are verified end to end.
