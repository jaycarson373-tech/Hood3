import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const requiredHomeCopy = [
  "BBL | Black Bull Long",
  "BLACK BULL",
  "LONG.",
  "Creator fees build one public",
  "Qualifying realized profits buy back and burn",
  "BLACK BULL TERMINAL",
  "ANSEM POSITION",
  "Enter Dashboard",
  "FEES BACK THE BULL.",
  "THE FLYWHEEL HANDLES THE REAR.",
];
const bannedRenderedCopy =
  /coming soon|placeholder|\bmock\b|\bdemo\b|\bTBD\b|guaranteed yield|passive income|dividends|treasury/i;

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`https://blackbulllong.test${path}`, {
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

test("server-renders the BBL homepage without fabricated activity", async () => {
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

  assert.match(html, /bbl-logo\.jpg/);
  assert.match(
    html,
    /property=["']og:image["'][^>]+http:\/\/localhost:3000\/bbl-banner\.jpg/i,
  );
  assert.match(
    html,
    /name=["']twitter:image["'][^>]+http:\/\/localhost:3000\/bbl-banner\.jpg/i,
  );
  assert.match(
    html,
    /rel=["']canonical["'][^>]+http:\/\/localhost:3000\//i,
  );
  assert.match(html, /rel=["']apple-touch-icon["'][^>]+apple-touch-icon\.png/i);
  assert.match(
    html,
    /dexscreener\.com\/solana\/fnzky6x7entq1er3d225dqyt7ybfka4pskbmqhb8l3cc/i,
  );
  assert.match(html, /3LdsM35gCW2u99taAN6kKChhkGNR5yMDzAb15vcRpump/);
  assert.match(html, /https:\/\/x\.com\/BlackBullLong/);
  assert.doesNotMatch(html, />Buy \$BBL<\/a>/);
  assert.doesNotMatch(html, bannedRenderedCopy);
});

test("server-renders dashboard and lore routes with route-specific metadata", async () => {
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

  assert.match(dashboardHtml, /BLACK BULL TERMINAL/);
  assert.match(dashboardHtml, /NO POSITION PUBLISHED/);
  assert.match(
    dashboardHtml,
    /http:\/\/localhost:3000\/dashboard/,
  );
  assert.doesNotMatch(dashboardHtml, /TOTAL \$BBL BURNED|TRANSACTION FEED/);
  assert.doesNotMatch(dashboardHtml, bannedRenderedCopy);

  assert.match(thesisHtml, /BLACK BULL LORE/);
  assert.match(thesisHtml, /THE BULL BEHIND THE BULL/);
  assert.match(thesisHtml, /http:\/\/localhost:3000\/thesis/);
  assert.match(
    thesisHtml,
    /Buybacks and burns only occur when qualifying realized profits exist/,
  );
  assert.doesNotMatch(thesisHtml, bannedRenderedCopy);
});

test("production assets and BBL configuration are present", async () => {
  const [layout, constants, packageJson, globals, visuals, worker] =
    await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/constants.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/components/BullVisuals.tsx", import.meta.url), "utf8"),
    readFile(new URL("../railway-worker.mjs", import.meta.url), "utf8"),
    ]);

  assert.match(packageJson, /"name": "black-bull-long"/);
  assert.match(constants, /9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump/);
  assert.match(constants, /3LdsM35gCW2u99taAN6kKChhkGNR5yMDzAb15vcRpump/);
  assert.match(layout, /apple-touch-icon\.png/);
  assert.match(globals, /--gold: #c59b5f/);
  assert.match(visuals, /bbl-logo\.jpg/);
  assert.match(worker, /BBL_ANSEM_SPOT_EXECUTION_CONFIRMED/);
  assert.match(worker, /buyAnsemSpot/);

  await Promise.all([
    access(new URL("../public/bbl-banner.jpg", import.meta.url)),
    access(new URL("../public/bbl-logo.jpg", import.meta.url)),
    access(new URL("../public/ansem-token.jpg", import.meta.url)),
    access(new URL("../public/favicon.png", import.meta.url)),
    access(new URL("../public/apple-touch-icon.png", import.meta.url)),
  ]);
  await assert.rejects(access(new URL("app/_sites-preview", projectRoot)));
});
