# BBL - Black Bull Long

BBL is an independent Solana community project. Creator fees are designed to
build one public ANSEM spot position on Hyperliquid. Qualifying realized
profits may buy back and permanently burn `$BBL`.

## Routes

- `/` - launch page, live ANSEM price, Black Bull Flywheel, lore, burns, and FAQ
- `/dashboard` - public position telemetry and transaction receipts
- `/thesis` - Black Bull lore, thesis, sources, and risks

## Mechanism

1. Creator fees are checked every 15 minutes.
2. Routeable SOL is sent through the account's Unit deposit address.
3. Unit SOL is sold for managed USDC on Hyperliquid spot.
4. Managed USDC buys Unit ANSEM spot within explicit limits.
5. Qualifying realized profit may buy `$BBL`.
6. Purchased `$BBL` is permanently burned and the receipt is published.

This is a spot strategy, not a perpetual futures strategy. ANSEM spot has no
liquidation price, but it can still lose substantial or total value.

## Frontend Environment

Use `vercel.env.example` as the Vercel environment checklist.

Unknown links and the BBL contract are hidden. The site never invents a price,
position, transaction, buyback, or burn.

## Worker

Run `supabase/schema.sql` before connecting the worker. Use
`railway.env.example` as the Railway environment checklist. The included
`railway.json` starts the worker process automatically.

Keep `DRY_RUN=true`, `HYPERLIQUID_MANAGED_SPOT_USDC=false`, and
`BBL_ANSEM_SPOT_EXECUTION_CONFIRMED=false` until the dedicated account,
approved API wallet, deposit address, order cap, slippage cap, and dry-run
receipts have all been reviewed.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run worker:once
npm test
```
