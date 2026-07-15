# Longcat

Longcat is the longest cat on Robinhood: a meme terminal built around one joke, the cat keeps
getting longer. A 2% creator fee extends one public Cashcat long, and qualifying
realized trading profits can buy back and burn $LONGCAT.

## Routes

- `/` - Longcat landing page with a full-site Longcat wallpaper backing, original meme origin photo, live integration placeholders, meme mechanics, burns, and FAQ.
- `/dashboard` - read-only Hyperliquid account viewer, Cashcat position telemetry, receipt terminal, and burn placeholders.
- `/thesis` - Cashcat thesis, risks, and source links.

## Contract

- Source: `contracts/LongcatToken.sol`
- Fee: fixed `2%`
- Receiver: immutable public mechanism wallet
- Controls: no owner, no pause, no blacklist, no hidden mint

The contract only routes the 2% fee to the mechanism wallet. Cashcat execution,
buybacks, and burns should be handled by audited server-side automation and
published as public terminal receipts.

## X Assets And Copy

- Banner: `public/x-banner.png`
- Avatar: `public/x-avatar.png`

Bio:
```text
The longest cat on Robinhood.

2% creator fees scale into a public $CASHCAT long on Hyperliquid.

Profits buy back & burn $LONGCAT.
```

Community description:
```text
100% of the 2% creator fee scales into a public $CASHCAT long on Hyperliquid.

Realized profits buy back & permanently burn $LONGCAT.
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
automation worker should stay in dry-run mode until Robinhood ETH wallet
authority, gas buffer, transfer routing, swaps, perp collateral movement,
Cashcat order sizing, risk limits, and terminal logging are verified end to end.
