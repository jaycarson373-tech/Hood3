import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const requiredLaunchCopy = [
  "Hood3 | NLT Flywheel",
  "The Leveraged Bet on HOOD.",
  "Powered by the Native Leverage Token (NLT) Flywheel.",
  "E5GgVo7dLPUgebUrNLDR6tWVWktgo74a2FfEJmrtpump",
  "https://x.com/HOOD3pf",
  "0xdF099e764bB99654a7BaE0c0FE89bD8b86ABf45f",
  "https://hypurrscan.io/address/0xdF099e764bB99654a7BaE0c0FE89bD8b86ABf45f",
  "Creator Fees",
  "HOOD Long",
  "Realized Profit",
  "HOOD3 Buyback",
  "Permanent Burn",
];
const bannedLaunchCopy =
  /codex-preview|react-loading-skeleton|Your site is taking shape|Codex is working|HOODX|redeemable reserve|direct redemption|Leverage Terminal|cinematic|demo state|simulated/i;
const bannedRenderedCopy = new RegExp(`${bannedLaunchCopy.source}|NEXT_PUBLIC|Supabase not connected`, "i");

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

  assert.match(html, /100% of creator fees fund a public HOOD long on Hyperliquid/);
  assert.match(html, /The more HOOD wins, the more HOOD3 disappears/);
  assert.match(html, /<meta[^>]+property=["']og:image["'][^>]+hood3-logo\.png/i);
  assert.match(html, /<link[^>]+rel=["']icon["'][^>]+favicon\.png/i);
  assert.doesNotMatch(html, bannedRenderedCopy);
});

test("server-renders dashboard and thesis launch routes", async () => {
  const [dashboardResponse, thesisResponse] = await Promise.all([render("/dashboard"), render("/thesis")]);
  assert.equal(dashboardResponse.status, 200);
  assert.equal(thesisResponse.status, 200);

  const [dashboardHtml, thesisHtml] = await Promise.all([dashboardResponse.text(), thesisResponse.text()]);

  assert.match(dashboardHtml, /NLT Flywheel terminal/);
  assert.match(dashboardHtml, /Native Leverage Token \(NLT\) Flywheel/);
  assert.match(dashboardHtml, /Creator Fees/);
  assert.match(dashboardHtml, /Permanent Burn/);
  assert.match(dashboardHtml, /Hood3 Hyperliquid account/);
  assert.match(dashboardHtml, /View live position on HypurrScan/);
  assert.match(dashboardHtml, /Hood3 terminal/);
  assert.doesNotMatch(dashboardHtml, bannedRenderedCopy);

  assert.match(thesisHtml, /Hood Thesis/);
  assert.match(thesisHtml, /The HOOD bull case/);
  assert.match(thesisHtml, /Native Leverage Token \(NLT\) Flywheel/);
  assert.match(thesisHtml, /Robinhood/);
  assert.doesNotMatch(thesisHtml, bannedRenderedCopy);
});

test("repo no longer ships preview skeleton wiring", async () => {
  const [page, layout, packageJson, readme] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
  ]);

  assert.match(packageJson, /"name": "hood3"/);
  assert.match(readme, /^# Hood3/m);
  assert.match(layout, /Hood3 \| NLT Flywheel/);
  assert.match(page, /The Leveraged Bet on HOOD/);
  assert.doesNotMatch(`${page}\n${layout}\n${packageJson}\n${readme}`, bannedLaunchCopy);

  await assert.rejects(access(new URL("app/_sites-preview", projectRoot)));
});
