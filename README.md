# Hood3

Hood3 is a Robinhood Chain native leverage token powered by Lighter. A fixed
2% creator fee is designed to build one public HOOD long; qualifying realized
profits can buy back and permanently burn `$HOOD3`.

## Routes

- `/` - Hood3 launch page with black/neon Robinhood-coded terminal visuals, live integration placeholders, mechanism, thesis, burns, and FAQ.
- `/dashboard` - Lighter-facing read-only terminal for HOOD position telemetry, receipts, and burn placeholders.
- `/thesis` - HOOD thesis, risks, and source links.

## Contract

- Source: `contracts/Hood3Token.sol`
- Fee: fixed `2%`
- Receiver: immutable public mechanism wallet
- Controls: no owner, no pause, no blacklist, no hidden mint

The contract only routes the 2% fee to the mechanism wallet. Lighter execution,
HOOD position management, buybacks, and burns should be handled by audited
server-side automation and published as public terminal receipts.

## X Assets And Copy

- Banner: `public/x-banner.png`
- Avatar: `public/x-avatar.png`

Bio:
```text
The leveraged bet on HOOD.

2% creator fees scale into a public HOOD long on Lighter.

Profits buy back & burn $HOOD3.
```

Community description:
```text
100% of the 2% creator fee is designed to scale into a public HOOD long on Lighter.

Qualifying realized profits buy back & permanently burn $HOOD3.
```

## Required Frontend Environment

```bash
SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

The frontend only reads browser-safe Supabase views. Keep service-role keys,
wallet keys, and Lighter signing keys server-side.

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
authority, gas buffer, transfer routing, swaps, Lighter collateral movement,
HOOD order sizing, risk limits, and terminal logging are verified end to end.
