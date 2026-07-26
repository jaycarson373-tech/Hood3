# BBL - Black Bull Long

BBL is an independent Solana community project. Creator fees are designed to
build one public ANSEMUSDT 5x long on Aster. Qualifying realized
profits may buy back and permanently burn `$BBL`.

## Routes

- `/` - launch page, live ANSEM price, Black Bull Flywheel, lore, burns, and FAQ
- `/dashboard` - public position telemetry and transaction receipts
- `/thesis` - Black Bull lore, thesis, sources, and risks

## Mechanism

1. Creator fees are checked every 15 minutes.
2. Routeable creator fees move to the dedicated Aster execution account.
3. Managed collateral builds the ANSEMUSDT long at 5x.
4. The public Aster wallet is read directly for position telemetry.
5. Qualifying realized profit may buy `$BBL`.
6. Purchased `$BBL` is permanently burned and the receipt is published.

This is a leveraged perpetual strategy. The position can lose money or be
liquidated.

## Frontend Environment

Use `vercel.env.example` as the Vercel environment checklist.

Unknown links and the BBL contract are hidden. The site never invents a price,
position, transaction, buyback, or burn.

## Worker

Run `supabase/schema.sql` before connecting the worker. Use
`railway.env.example` as the Railway environment checklist. The included
`railway.json` starts the worker process automatically.

Keep `DRY_RUN=true` until the dedicated Aster account, API credentials,
funding path, order cap, leverage, and dry-run receipts have all been reviewed.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run worker:once
npm test
```
