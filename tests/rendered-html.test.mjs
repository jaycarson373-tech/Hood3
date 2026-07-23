import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const requiredHomeCopy = [
  "Long Cat | The Longest Cat on Solana",
  "THE LONGEST CAT",
  "ON SOLANA.",
  "Creator fees scale into a public SOL long on Hyperliquid.",
  "Realized profits bridge back, buy back, and burn $LONGCAT.",
  "THE SOL FLYWHEEL ACTIVATES AT LAUNCH.",
  "Every long position.",
  "Every buyback.",
  "Every burn.",
  "Published here.",
  "FEES LONG SOL. PROFITS BURN $LONGCAT.",
];
const bannedRenderedCopy =
  /codex-preview|react-loading-skeleton|Your site is taking shape|Codex is working|Cash.?cat|guaranteed yield|passive income|dividends|treasury|awaiting|coming soon|placeholder|\bmock\b|\bdemo\b|\bTBD\b/i;

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`https://www.longcatsolana.fun${path}`, {
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

test("server-renders the Long Cat prelaunch homepage without fabricated activity", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();

  for (const copy of requiredHomeCopy) {
    assert.match(html, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(html, /longcat-logo\.png/);
  assert.match(html, /property=["']og:image["'][^>]+https:\/\/www\.longcatsolana\.fun\/og\.png/i);
  assert.match(html, /name=["']twitter:image["'][^>]+https:\/\/www\.longcatsolana\.fun\/og\.png/i);
  assert.match(html, /rel=["']canonical["'][^>]+https:\/\/www\.longcatsolana\.fun\//i);
  assert.match(html, /rel=["']apple-touch-icon["'][^>]+apple-touch-icon\.png/i);
  assert.doesNotMatch(html, /SOL LONG SIZE|TOTAL SOL BRIDGED|TOTAL FEES DEPLOYED|CA:/);
  assert.doesNotMatch(html, bannedRenderedCopy);
});

test("server-renders dashboard and thesis routes with route-specific metadata", async () => {
  const [dashboardResponse, thesisResponse] = await Promise.all([render("/dashboard"), render("/thesis")]);
  assert.equal(dashboardResponse.status, 200);
  assert.equal(thesisResponse.status, 200);

  const [dashboardHtml, thesisHtml] = await Promise.all([dashboardResponse.text(), thesisResponse.text()]);

  assert.match(dashboardHtml, /Longcat terminal/);
  assert.match(dashboardHtml, /THE SOL FLYWHEEL ACTIVATES AT LAUNCH/);
  assert.match(dashboardHtml, /https:\/\/www\.longcatsolana\.fun\/dashboard/);
  assert.doesNotMatch(dashboardHtml, /POSITION SIZE|TOTAL TOKENS BURNED|Transaction feed/);
  assert.doesNotMatch(dashboardHtml, bannedRenderedCopy);

  assert.match(thesisHtml, /SOL Thesis/);
  assert.match(thesisHtml, /SOL is the directional bet/);
  assert.match(thesisHtml, /https:\/\/www\.longcatsolana\.fun\/thesis/);
  assert.match(thesisHtml, /Buybacks and burns only occur when qualifying realized profits exist/);
  assert.doesNotMatch(thesisHtml, bannedRenderedCopy);
});

test("server-only live state removes the prelaunch notice without inventing data", async () => {
  const previousState = process.env.LAUNCH_STATE;
  process.env.LAUNCH_STATE = "live";

  try {
    const [homeResponse, dashboardResponse] = await Promise.all([render("/?state=live"), render("/dashboard?state=live")]);
    const [homeHtml, dashboardHtml] = await Promise.all([homeResponse.text(), dashboardResponse.text()]);

    assert.doesNotMatch(homeHtml, /THE SOL FLYWHEEL ACTIVATES AT LAUNCH/);
    assert.match(homeHtml, /CLAIMS, BRIDGES, LONGS, BUYBACKS, AND BURNS UPDATE IN PUBLIC/);
    assert.doesNotMatch(homeHtml, bannedRenderedCopy);

    assert.doesNotMatch(dashboardHtml, /THE SOL FLYWHEEL ACTIVATES AT LAUNCH/);
    assert.match(dashboardHtml, /Claims every 15 minutes/);
    assert.doesNotMatch(dashboardHtml, /POSITION SIZE|TOTAL TOKENS BURNED|Transaction feed/);
    assert.doesNotMatch(dashboardHtml, bannedRenderedCopy);
  } finally {
    if (previousState === undefined) {
      delete process.env.LAUNCH_STATE;
    } else {
      process.env.LAUNCH_STATE = previousState;
    }
  }
});

test("production assets and server-only launch configuration are present", async () => {
  const [layout, constants, launchState, packageJson, globals] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/constants.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/launch-state.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(packageJson, /"name": "longcat"/);
  assert.match(constants, /https:\/\/www\.longcatsolana\.fun/);
  assert.match(constants, /hyperliquidPosition: null/);
  assert.match(layout, /apple-touch-icon\.png/);
  assert.match(launchState, /process\.env\.LAUNCH_STATE/);
  assert.doesNotMatch(launchState, /NEXT_PUBLIC/);
  assert.match(globals, /longcat-scroll-bg\.jpg/);
  assert.match(globals, /longcat-dashboard-bg\.jpg/);

  await Promise.all([
    access(new URL("../public/og.png", import.meta.url)),
    access(new URL("../public/favicon.png", import.meta.url)),
    access(new URL("../public/favicon.svg", import.meta.url)),
    access(new URL("../public/apple-touch-icon.png", import.meta.url)),
  ]);
  await assert.rejects(access(new URL("app/_sites-preview", projectRoot)));
});
