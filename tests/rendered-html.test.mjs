import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const requiredHomeCopy = [
  "Hedge the Hedgehog | $HEDGE",
  "HEDGE",
  "THE HEDGEHOG",
  "The first perpetual short fund on Solana.",
  "THE FUND HAS ONE JOB.",
  "Creator Fees",
  "AI Blue-Chip Shorts",
  "THE SHORT BOOK. WITHOUT THE BLACK BOX.",
  "EVERYTHING IS VERIFIABLE.",
  "BUILD YOUR HEDGE FUND IDENTITY",
  "View Short Book",
];
const bannedRenderedCopy =
  /Black Bull|\bBBL\b|LONGCAT|HOOD3|Aster|ANSEM|LONG EXPOSURE|managed strategy|coming soon|placeholder|\bmock\b|\bdemo\b|\bTBD\b|guaranteed yield|passive income|dividends|NO PUBLIC RECEIPT|NO POSITION PUBLISHED|>SYNCING<|>LOADING<|>\$0/i;

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`https://hedgethehedgehog.test${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Hedge homepage without fabricated activity", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();

  for (const copy of requiredHomeCopy) {
    assert.match(
      html,
      new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }

  assert.match(html, /hedge-logo\.jpg/);
  assert.match(html, /hedge-banner\.jpg/);
  assert.match(
    html,
    /property=["']og:image["'][^>]+http:\/\/localhost:3000\/hedge-banner\.jpg/i,
  );
  assert.match(
    html,
    /name=["']twitter:image["'][^>]+http:\/\/localhost:3000\/hedge-banner\.jpg/i,
  );
  assert.match(
    html,
    /rel=["']canonical["'][^>]+http:\/\/localhost:3000\//i,
  );
  assert.match(html, /rel=["']apple-touch-icon["'][^>]+hedge-logo\.jpg/i);
  assert.doesNotMatch(
    html,
    /3LdsM35gCW2u99taAN6kKChhkGNR5yMDzAb15vcRpump/,
  );
  assert.doesNotMatch(html, bannedRenderedCopy);
});

test("server-renders dashboard and mandate with route-specific metadata", async () => {
  const [dashboardResponse, thesisResponse] = await Promise.all([
    render("/dashboard"),
    render("/thesis"),
  ]);
  assert.equal(dashboardResponse.status, 200);
  assert.equal(thesisResponse.status, 200);

  const [dashboardHtml, thesisHtml] = await Promise.all([
    dashboardResponse.text(),
    thesisResponse.text(),
  ]);

  assert.match(dashboardHtml, /THE SHORT BOOK, MARKED TO MARKET/);
  assert.match(dashboardHtml, /ARMED · AWAITING ACCOUNT/);
  assert.match(dashboardHtml, /SHORT-BOOK TELEMETRY/);
  assert.match(dashboardHtml, /PUBLIC RECEIPT TAPE/);
  assert.match(dashboardHtml, /http:\/\/localhost:3000\/dashboard/);
  assert.doesNotMatch(dashboardHtml, bannedRenderedCopy);

  assert.match(thesisHtml, /THE INVESTMENT MANDATE/);
  assert.match(thesisHtml, /A MEME COIN WITH/);
  assert.match(thesisHtml, /THE SHORT CAN GET SQUEEZED/);
  assert.match(thesisHtml, /http:\/\/localhost:3000\/thesis/);
  assert.doesNotMatch(thesisHtml, bannedRenderedCopy);
});

test("production assets and Hedge configuration are present", async () => {
  const [layout, constants, links, packageJson, globals, terminal, worker, schema] =
    await Promise.all([
      readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/constants.ts", import.meta.url), "utf8"),
      readFile(new URL("../lib/links.ts", import.meta.url), "utf8"),
      readFile(new URL("../package.json", import.meta.url), "utf8"),
      readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
      readFile(
        new URL("../app/components/HedgeTerminal.tsx", import.meta.url),
        "utf8",
      ),
      readFile(new URL("../railway-worker.mjs", import.meta.url), "utf8"),
      readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8"),
    ]);

  assert.match(packageJson, /"name": "hedge-the-hedgehog"/);
  assert.match(links, /NEXT_PUBLIC_HEDGE_TOKEN_ADDRESS/);
  assert.match(links, /PUMP_FUN_URL/);
  assert.match(links, /HYPERLIQUID_INFO_URL/);
  assert.match(links, /HYPERLIQUID_ACCOUNT_URL/);
  assert.match(links, /POSITION_URL/);
  assert.match(constants, /Hedge the Hedgehog/);
  assert.match(layout, /hedge-logo\.jpg/);
  assert.match(globals, /--gold: #b58a3d/);
  assert.match(globals, /--market-green: #119447/);
  assert.match(globals, /\.hedge-hero/);
  assert.match(globals, /prefers-reduced-motion/);
  assert.match(terminal, /HEDGE CAPITAL/);
  assert.match(terminal, /AI SHORT MANDATE/);
  assert.match(worker, /HEDGE_HYPERLIQUID_EXECUTION_ENDPOINT/);
  assert.match(worker, /hedge_terminal_events/);
  assert.doesNotMatch(worker, /Aster|ANSEM|\bBBL\b/);
  assert.match(schema, /create table if not exists public\.hedge_bridges/);
  assert.match(schema, /create table if not exists public\.hedge_buybacks/);
  assert.match(schema, /create table if not exists public\.hedge_burns/);
  assert.match(schema, /create or replace view public\.hedge_public_terminal/);

  const hyperliquidRoute = await readFile(
    new URL("../app/api/hyperliquid-positions/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(hyperliquidRoute, /clearinghouseState/);
  assert.match(hyperliquidRoute, /signedSize < 0/);

  await Promise.all([
    access(new URL("../public/hedge-banner.jpg", import.meta.url)),
    access(new URL("../public/hedge-logo.jpg", import.meta.url)),
  ]);
  await assert.rejects(access(new URL("app/_sites-preview", projectRoot)));
});
