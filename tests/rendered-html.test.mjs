import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const requiredLaunchCopy = [
  "Longcat | The Longest Long on Robinhood",
  "THE LONGEST LONG",
  "Every fee makes the cat longer.",
  "Current Length",
  "Cat Extension Today",
  "+1.42 metres",
  "ORIGIN LORE",
  "Futaba / 2chan",
  "Know Your Meme",
  "$LONGCAT trades",
  "fees extend $CASHCAT",
  "tail not found",
  "POSITION EXTENDING IN PUBLIC.",
  "LONGCAT GETS SHORTER.",
];
const bannedLaunchCopy =
  /codex-preview|react-loading-skeleton|Your site is taking shape|Codex is working|\bHood[3]\b|\bHOO[D]3\b|\bHOO[D]X\b|The Leveraged Bet|HOO[D] long|Hood Thesis|redeemable reserve|direct redemption|guaranteed yield|passive income|dividends|treasury/i;
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

test("server-renders the Longcat launch homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();

  for (const copy of requiredLaunchCopy) {
    assert.match(html, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(html, /No win, no magic/);
  assert.match(html, /Loooo+ng\./);
  assert.match(html, /longcat-terminal-bg\.jpg/);
  assert.match(html, /https:\/\/amp\.knowyourmeme\.com\/memes\/longcat/);
  assert.match(html, /Leveraged positions can lose money or get liquidated/);
  assert.match(html, /<meta[^>]+property=["']og:image["'][^>]+longcat-terminal-bg\.jpg/i);
  assert.match(html, /<link[^>]+rel=["']icon["'][^>]+favicon\.svg/i);
  assert.doesNotMatch(html, bannedRenderedCopy);
});

test("server-renders Longcat dashboard and thesis routes", async () => {
  const [dashboardResponse, thesisResponse] = await Promise.all([render("/dashboard"), render("/thesis")]);
  assert.equal(dashboardResponse.status, 200);
  assert.equal(thesisResponse.status, 200);

  const [dashboardHtml, thesisHtml] = await Promise.all([dashboardResponse.text(), thesisResponse.text()]);

  assert.match(dashboardHtml, /Longcat terminal/);
  assert.match(dashboardHtml, /Current Cashcat long/);
  assert.match(dashboardHtml, /Longcat public position account/);
  assert.match(dashboardHtml, /View live position on HypurrScan/);
  assert.match(dashboardHtml, /When the long wins, Longcat gets shorter/);
  assert.doesNotMatch(dashboardHtml, bannedRenderedCopy);

  assert.match(thesisHtml, /Cashcat Thesis/);
  assert.match(thesisHtml, /The native cat of Robinhood deserves the longest position on Robinhood/);
  assert.match(thesisHtml, /if Robinhood Chain wins retail attention/i);
  assert.match(thesisHtml, /No buyback is guaranteed|Buybacks are not guaranteed/);
  assert.doesNotMatch(thesisHtml, bannedRenderedCopy);
});

test("repo no longer ships preview or legacy launch wiring", async () => {
  const [page, layout, packageJson, readme] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
  ]);

  assert.match(packageJson, /"name": "longcat"/);
  assert.match(readme, /^# Longcat/m);
  assert.match(layout, /Longcat \| The Longest Long on Robinhood/);
  assert.match(page, /THE LONGEST LONG/);
  assert.match(page, /ORIGIN LORE/);
  assert.doesNotMatch(`${page}\n${layout}\n${packageJson}\n${readme}`, bannedLaunchCopy);

  await assert.rejects(access(new URL("app/_sites-preview", projectRoot)));
});
