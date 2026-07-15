import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const requiredLaunchCopy = [
  "Longcat | The Longest Cat on Robinhood",
  "THE ",
  "LONGEST",
  " CAT",
  "ON ROBINHOOD.",
  "2% creator fees scale into a public $CASHCAT long on Hyperliquid.",
  "Realized profits buy back and burn $LONGCAT.",
  "CA: 0xcd026c6da703739fe13e3d6f13caf4c0f9627777",
  "POSITION SIZE",
  "TOTAL FEES DEPLOYED",
  "ENTRY PRICE",
  "CURRENT PRICE",
  "UNREALIZED PNL",
  "TOTAL BUYBACKS",
  "TOTAL TOKENS BURNED",
  "LAST POSITION UPDATE",
  "Awaiting live integration.",
  "ORIGIN LORE",
  "Futaba / 2chan",
  "Know Your Meme",
  "$LONGCAT trades",
  "2% fees extend $CASHCAT",
  "IF CASHCAT WINS,",
  "LONGCAT GETS LONGER.",
];
const bannedLaunchCopy =
  /codex-preview|react-loading-skeleton|Your site is taking shape|Codex is working|\bHood[3]\b|\bHOO[D]3\b|\bHOO[D]X\b|The Leveraged Bet|HOO[D] long|Hood Thesis|redeemable reserve|direct redemption|guaranteed yield|passive income|dividends|treasury/i;
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

test("server-renders the Longcat launch homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();

  for (const copy of requiredLaunchCopy) {
    assert.match(html, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(html, /class=["']hero-longest["'][^>]*>LONGEST</);
  assert.match(html, /longcat-wallpaper-clean\.png/);
  assert.match(html, /longcat-origin-real\.jpg/);
  assert.match(html, /longcat-sky\.jpg/);
  assert.match(html, /longcat-space\.jpg/);
  assert.match(html, /https:\/\/amp\.knowyourmeme\.com\/memes\/longcat/);
  assert.match(html, /Leveraged positions can lose money or get liquidated/);
  assert.match(html, /<meta[^>]+property=["']og:image["'][^>]+og\.png/i);
  assert.match(html, /<link[^>]+rel=["']icon["'][^>]+favicon\.png/i);
  assert.match(html, /https:\/\/x\.com\/LongcatRH_/);
  assert.doesNotMatch(html, /hero-graphic-callout|scribble|THE PLAN|tail not found|Cat Extension Today|Measured Emotionally|\+1\.42|Loooo+ng|No win, no magic|STATUS: EXTENDING/);
  assert.doesNotMatch(html, bannedRenderedCopy);
});

test("server-renders Longcat dashboard and thesis routes", async () => {
  const [dashboardResponse, thesisResponse] = await Promise.all([render("/dashboard"), render("/thesis")]);
  assert.equal(dashboardResponse.status, 200);
  assert.equal(thesisResponse.status, 200);

  const [dashboardHtml, thesisHtml] = await Promise.all([dashboardResponse.text(), thesisResponse.text()]);

  assert.match(dashboardHtml, /Longcat terminal/);
  assert.match(dashboardHtml, /Cashcat position telemetry/);
  assert.match(dashboardHtml, /Longcat public position account/);
  assert.match(dashboardHtml, /Awaiting public account/);
  assert.match(dashboardHtml, /When the long wins, Longcat gets shorter/);
  assert.match(dashboardHtml, /Awaiting live integration/);
  assert.doesNotMatch(dashboardHtml, /Desk controls|Projected long|Monthly \$LONGCAT trading flow|creator fee model/);
  assert.doesNotMatch(dashboardHtml, /0xdF099e764bB99654a7BaE0c0FE89bD8b86ABf45f|0xdF09\.\.\.f45f|View live position on HypurrScan/);
  assert.doesNotMatch(dashboardHtml, bannedRenderedCopy);

  assert.match(thesisHtml, /Cashcat Thesis/);
  assert.match(thesisHtml, /Cashcat is the directional bet/);
  assert.match(thesisHtml, /Robinhood is bringing new retail onchain/);
  assert.match(thesisHtml, /IF CASHCAT WINS/);
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
    readFile(new URL("../contracts/LongcatToken.sol", import.meta.url), "utf8"),
    readFile(new URL("../public/LongcatToken.sol", import.meta.url), "utf8"),
    readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8"),
    readFile(new URL("../supabase/README.md", import.meta.url), "utf8"),
    readFile(new URL("../railway.env.example", import.meta.url), "utf8"),
  ]);

  assert.match(packageJson, /"name": "longcat"/);
  assert.match(readme, /^# Longcat/m);
  assert.match(layout, /Longcat \| The Longest Cat on Robinhood/);
  assert.match(layout, /favicon\.png/);
  assert.match(layout, /og\.png/);
  assert.match(page, /hero-longest/);
  assert.match(page, /hero-ca/);
  assert.match(page, /ORIGIN LORE/);
  assert.match(visuals, /longcat-wallpaper-clean\.png/);
  assert.match(visuals, /longcat-sky\.jpg/);
  assert.match(visuals, /longcat-space\.jpg/);
  assert.doesNotMatch(visuals, /scaleY/);
  assert.match(readme, /The longest cat on Robinhood\./);
  assert.match(readme, /fixed `2%`/);
  assert.match(contract, /uint16 public constant FEE_BPS = 200;/);
  assert.match(publicContract, /uint16 public constant FEE_BPS = 200;/);
  assert.match(contract, /No owner, blacklist, pause, hidden mint, or mutable tax controls/);
  assert.doesNotMatch(contract, /function\s+(setFee|setTax|mint|pause|blacklist|setReceiver|setFeeReceiver)\b/i);
  assert.match(readme, /public\/x-banner\.png/);
  assert.match(readme, /public\/x-avatar\.png/);
  assert.match(xBanner, /THE LONGEST CAT/);
  assert.match(xBanner, /opacity="\.2"/);
  assert.match(data, /LongcatRH_/);
  assert.match(supabaseSchema, /eth_fee_policy/);
  assert.match(supabaseSchema, /eth_wallet_address/);
  assert.match(supabaseReadme, /Robinhood ETH only/);
  assert.match(railwayEnv, /ROBINHOOD_RPC_URL=/);
  assert.doesNotMatch(`${readme}\n${supabaseSchema}\n${supabaseReadme}\n${railwayEnv}`, staleChainCopy);
  assert.doesNotMatch(page, /hero-graphic-callout|scribble--|THE PLAN|chart-meme-section|Cat Extension Today|Measured Emotionally|\+1\.42/);
  assert.doesNotMatch(`${page}\n${layout}\n${visuals}\n${packageJson}\n${readme}`, bannedLaunchCopy);

  await assert.rejects(access(new URL("app/_sites-preview", projectRoot)));
});
