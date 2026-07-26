# BBL Supabase Wiring

Run `supabase/schema.sql` in the Supabase SQL editor before connecting Railway.

The browser only reads:

- `bbl_public_terminal` for published transaction receipts
- `bbl_latest_position` for the latest ANSEM spot snapshot

Keep the service-role key, wallet keys, and Hyperliquid API wallet key
server-side.

Use `vercel.env.example` for the browser-facing environment and
`railway.env.example` for the private worker environment.

Live execution is fail-closed. It requires managed-spot approval, explicit
ANSEM execution confirmation, a positive per-run USDC cap, and a bounded
slippage setting.
