# BBL Supabase Wiring

Run `supabase/schema.sql` in the Supabase SQL editor before connecting Railway.

The browser only reads:

- `bbl_public_terminal` for published transaction receipts
- `bbl_latest_position` for archived ANSEMUSDT position snapshots

Keep the service-role key and all execution keys
server-side.

Use `vercel.env.example` for the browser-facing environment and
`railway.env.example` for the private worker environment.

Live execution is fail-closed. It requires explicit Aster execution approval,
managed USDT approval, a positive per-run collateral cap, and leverage fixed
at 5x.
