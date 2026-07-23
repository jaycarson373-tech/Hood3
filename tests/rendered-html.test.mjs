import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const requiredLaunchCopy = [
  "Longcat | The Longest Cat on Solana",
  "THE LONGEST CAT",
  "ON SOLANA.",
  "Creator fees scale into a public SOL long on Hyperliquid.",
  "Realized profits buy back and burn $LONGCAT.",
  "CA: soon on Solana",
  "SOL LONG SIZE",
  "TOTAL FEES DEPLOYED",
  "TOTAL $LONGCAT BURNED",
  "LAST HYPERLIQUID UPDATE",
  "SOLANA THESIS",
  "LONGCAT TURNS MEME FLOW INTO DIRECTIONAL SOL EXPOSURE.",
  "FEES LONG SOL. PROFITS BURN $LONGCAT.",
  "IF SOL WINS,",
  "LONGCAT GETS SCARCER.",
  "Awaiting live integration.",
];
const bannedRenderedCopy =
  /codex-preview|react-loading-skeleton|Your site is taking shape|Codex is working|Hood3|HOOD3|Robinhood Chain|Lighter execution|HOOD long|Cashcat|CASHCAT|guaranteed yield|passive income|dividends|treasury/;

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
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

test("server-renders the Longcat Solana launch homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();

  for (const copy of requiredLaunchCopy) {
    assert.match(html, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(html, /longcat-logo\.png/);
  assert.match(html, /app\.hyperliquid\.xyz/);
  assert.match(html, /<meta[^>]+property=["']og:image["'][^>]+og\.png/i);
  assert.match(html, /https:\/\/x\.com\/LongcatRH_/);
  assert.doesNotMatch(html, bannedRenderedCopy);
});

test("server-renders Longcat dashboard and thesis routes", async () => {
  const [dashboardResponse, thesisResponse] = await Promise.all([render("/dashboard"), render("/thesis")]);
  assert.equal(dashboardResponse.status, 200);
  assert.equal(thesisResponse.status, 200);

  const [dashboardHtml, thesisHtml] = await Promise.all([dashboardResponse.text(), thesisResponse.text()]);

  assert.match(dashboardHtml, /Longcat terminal/);
  assert.match(dashboardHtml, /SOL position telemetry/);
  assert.match(dashboardHtml, /Longcat public Hyperliquid account/);
  assert.match(dashboardHtml, /Current SOL long/);
  assert.match(dashboardHtml, /When the long wins, Longcat gets scarcer/);
  assert.match(dashboardHtml, /Awaiting live integration/);
  assert.doesNotMatch(dashboardHtml, bannedRenderedCopy);

  assert.match(thesisHtml, /SOL Thesis/);
  assert.match(thesisHtml, /SOL is the directional bet/);
  assert.match(thesisHtml, /Solana liquidity\. Hyperliquid execution/);
  assert.match(thesisHtml, /IF SOL WINS/);
  assert.match(thesisHtml, /Buybacks and burns only occur when qualifying realized profits exist/);
  assert.doesNotMatch(thesisHtml, bannedRenderedCopy);
});

test("repo no longer ships preview or stale Hood3 launch copy", async () => {
  const [page, data, layout, visuals, packageJson, readme, supabaseSchema, supabaseReadme, railwayEnv] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/LongcatVisuals.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
    readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8"),
    readFile(new URL("../supabase/README.md", import.meta.url), "utf8"),
    readFile(new URL("../railway.env.example", import.meta.url), "utf8"),
  ]);

  assert.match(packageJson, /"name": "longcat"/);
  assert.match(readme, /^# Longcat/m);
  assert.match(layout, /Longcat \| The Longest Cat on Solana/);
  assert.match(layout, /longcat-logo\.png/);
  assert.match(page, /THE LONGEST CAT/);
  assert.match(page, /longcat-sol-site/);
  assert.match(visuals, /Longcat Hyperliquid flywheel graphic/);
  assert.match(data, /LongcatRH_/);
  assert.match(data, /app\.hyperliquid\.xyz/);
  assert.match(supabaseSchema, /sol_fee_policy/);
  assert.match(supabaseSchema, /hyperliquid_account/);
  assert.match(supabaseSchema, /SOL/);
  assert.match(supabaseReadme, /Solana/);
  assert.match(railwayEnv, /SOLANA_RPC_URL=/);
  assert.match(railwayEnv, /LONGCAT_HYPERLIQUID_ACCOUNT=/);
  assert.doesNotMatch(`${page}\n${data}\n${layout}\n${visuals}\n${readme}\n${supabaseReadme}\n${railwayEnv}`, bannedRenderedCopy);

  await assert.rejects(access(new URL("app/_sites-preview", projectRoot)));
});
