# Hood3

Hood3 is a launch site for the Native Leverage Token (NLT) Flywheel: public
receipts, HOOD long visibility, Hyperliquid account linking, HOOD3 buybacks,
permanent burns, and the Hood Thesis.

## Routes

- `/` - landing page with the Hood3 hero, CA, X link, Hyperliquid account link, and zeroed launch stats.
- `/dashboard` - read-only Hyperliquid account viewer, NLT Flywheel model, automation rail, and Hood3 terminal.
- `/thesis` - Hood stock bull thesis, risks, and source links.

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
buffer, transfer routing, swaps, perp collateral movement, HOOD order sizing,
risk limits, and terminal logging are verified end to end.
