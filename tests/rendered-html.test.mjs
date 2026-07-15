import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const requiredLaunchCopy = [
  "Hood3 | The Leveraged Bet on HOOD",
  "THE LEVERAGED BET",
  "ON HOOD.",
  "Powered by Lighter.",
  "2% creator fees build a public HOOD long.",
  "Realized profits buy back and burn $HOOD3.",
  "CA: soon on Robinhood Chain",
  "HOOD LONG SIZE",
  "TOTAL FEES DEPLOYED",
  "ENTRY PRICE",
  "CURRENT PRICE",
  "UNREALIZED PNL",
  "TOTAL BUYBACKS",
  "TOTAL $HOOD3 BURNED",
  "LAST LIGHTER UPDATE",
  "Awaiting live integration.",
  "ROBINHOOD CHAIN",
  "Lighter execution",
  "$HOOD3 trades",
  "Lighter longs HOOD",
  "IF HOOD WINS,",
  "HOOD3 GETS SCARCER.",
];
const bannedLaunchCopy =
  /codex-preview|react-loading-skeleton|Your site is taking shape|Codex is working|\bLONGCAT\b|\$LONGCAT|The longest cat|Cashcat|CASHCAT|Know Your Meme|Shiro|HypurrScan|Hyperliquid|redeemable reserve|direct redemption|guaranteed yield|passive income|dividends|treasury/i;
const bannedRenderedCopy = new RegExp(`${bannedLaunchCopy.source}|NEXT_PUBLIC|Supabase not connected`, "i");
const staleChainCopy = new RegExp(
  [
    "SO" + "LANA",
    "So" + "lana",
    "\\b" + "SO" + "L\\b",
    "pump\\.fun",
    "PUMP" + "_FUN",
    "s" + "ol_wallet",
    "buffer_" + "sol",
    "SO" + "L_FEE",
  ].join("|"),
);

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

test("server-renders the Hood3 launch homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();

  for (const copy of requiredLaunchCopy) {
    assert.match(html, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(html, /hood3-logo\.png/);
  assert.match(html, /lighter\.xyz/);
  assert.match(html, /Leveraged positions can lose money or get liquidated/);
  assert.match(html, /<meta[^>]+property=["']og:image["'][^>]+og\.png/i);
  assert.match(html, /<link[^>]+rel=["']icon["'][^>]+favicon\.png/i);
  assert.match(html, /https:\/\/x\.com\/HOOD3pf/);
  assert.doesNotMatch(html, /hero-graphic-callout|scribble|THE PLAN|tail not found|Cat Extension Today|Measured Emotionally|\+1\.42|Loooo+ng|No win, no magic|STATUS: EXTENDING/);
  assert.doesNotMatch(html, bannedRenderedCopy);
});

test("server-renders Hood3 dashboard and thesis routes", async () => {
  const [dashboardResponse, thesisResponse] = await Promise.all([render("/dashboard"), render("/thesis")]);
  assert.equal(dashboardResponse.status, 200);
  assert.equal(thesisResponse.status, 200);

  const [dashboardHtml, thesisHtml] = await Promise.all([dashboardResponse.text(), thesisResponse.text()]);

  assert.match(dashboardHtml, /Hood3 terminal/);
  assert.match(dashboardHtml, /HOOD position telemetry/);
  assert.match(dashboardHtml, /Hood3 public Lighter account/);
  assert.match(dashboardHtml, /Awaiting Lighter account/);
  assert.match(dashboardHtml, /Open Lighter/);
  assert.match(dashboardHtml, /When the long wins, Hood3 gets scarcer/);
  assert.match(dashboardHtml, /Awaiting live integration/);
  assert.doesNotMatch(dashboardHtml, /Desk controls|Projected long|Monthly \$LONGCAT trading flow|creator fee model/);
  assert.doesNotMatch(dashboardHtml, /0xdF099e764bB99654a7BaE0c0FE89bD8b86ABf45f|0xdF09\.\.\.f45f|Awaiting public account|HypurrScan|Hyperliquid/);
  assert.doesNotMatch(dashboardHtml, bannedRenderedCopy);

  assert.match(thesisHtml, /HOOD Thesis/);
  assert.match(thesisHtml, /HOOD is the directional bet/);
  assert.match(thesisHtml, /Robinhood Chain can bring mainstream retail directly onchain/);
  assert.match(thesisHtml, /IF HOOD WINS/);
  assert.match(thesisHtml, /Buybacks and burns only occur when qualifying realized profits exist/);
  assert.doesNotMatch(thesisHtml, bannedRenderedCopy);
});

test("repo no longer ships preview or legacy launch wiring", async () => {
  const [page, data, layout, visuals, packageJson, readme, xBanner, contract, publicContract, supabaseSchema, supabaseReadme, railwayEnv] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/LongcatVisuals.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
    readFile(new URL("../public/x-banner.svg", import.meta.url), "utf8"),
    readFile(new URL("../contracts/Hood3Token.sol", import.meta.url), "utf8"),
    readFile(new URL("../public/Hood3Token.sol", import.meta.url), "utf8"),
    readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8"),
    readFile(new URL("../supabase/README.md", import.meta.url), "utf8"),
    readFile(new URL("../railway.env.example", import.meta.url), "utf8"),
  ]);

  assert.match(packageJson, /"name": "hood3"/);
  assert.match(readme, /^# Hood3/m);
  assert.match(layout, /Hood3 \| The Leveraged Bet on HOOD/);
  assert.match(layout, /favicon\.png/);
  assert.match(layout, /og\.png/);
  assert.match(page, /THE LEVERAGED BET/);
  assert.match(page, /hero-ca/);
  assert.match(page, /ROBINHOOD CHAIN/);
  assert.match(visuals, /Hood3SignalField/);
  assert.match(visuals, /SignalGraphicStack/);
  assert.doesNotMatch(visuals, /scaleY/);
  assert.match(readme, /powered by Lighter/);
  assert.match(readme, /fixed `2%`/);
  assert.match(contract, /uint16 public constant FEE_BPS = 200;/);
  assert.match(publicContract, /uint16 public constant FEE_BPS = 200;/);
  assert.match(contract, /No owner, blacklist, pause, hidden mint, or mutable tax controls/);
  assert.doesNotMatch(contract, /function\s+(setFee|setTax|mint|pause|blacklist|setReceiver|setFeeReceiver)\b/i);
  assert.match(readme, /public\/x-banner\.png/);
  assert.match(readme, /public\/x-avatar\.png/);
  assert.match(xBanner, /THE LEVERAGED BET/);
  assert.match(xBanner, /Powered by Lighter/);
  assert.match(data, /HOOD3pf/);
  assert.match(supabaseSchema, /eth_fee_policy/);
  assert.match(supabaseSchema, /eth_wallet_address/);
  assert.match(supabaseSchema, /lighter_account/);
  assert.match(supabaseSchema, /HOOD/);
  assert.match(supabaseReadme, /Robinhood ETH only/);
  assert.match(railwayEnv, /ROBINHOOD_RPC_URL=/);
  assert.match(railwayEnv, /HOOD3_LIGHTER_ACCOUNT=/);
  assert.doesNotMatch(`${readme}\n${supabaseSchema}\n${supabaseReadme}\n${railwayEnv}`, staleChainCopy);
  assert.doesNotMatch(page, /hero-graphic-callout|scribble--|THE PLAN|chart-meme-section|Cat Extension Today|Measured Emotionally|\+1\.42/);
  assert.doesNotMatch(`${page}\n${layout}\n${visuals}\n${packageJson}\n${readme}`, bannedLaunchCopy);

  await assert.rejects(access(new URL("app/_sites-preview", projectRoot)));
});
