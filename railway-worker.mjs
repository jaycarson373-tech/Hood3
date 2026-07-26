import {
  createAsterClient,
  getAsterAvailableUsdt,
  getAsterPublicPosition,
  inspectAsterMarket,
  openAsterLong,
} from "./railway/aster.mjs";

const DEFAULT_INTERVAL_MINUTES = 15;
const LAMPORTS_PER_SOL = 1_000_000_000;

function env(name, fallback = "") {
  return process.env[name] || fallback;
}

function asBool(value) {
  return String(value ?? "").toLowerCase() === "true";
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function requireEnvironment() {
  const required = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SOLANA_RPC_URL",
    "BBL_SOL_WALLET_ADDRESS",
    "BBL_TOKEN_ADDRESS",
    "BBL_ASTER_WALLET_ADDRESS",
  ];
  const missing = required.filter((name) => !env(name));
  if (missing.length) {
    throw new Error(`Missing required env: ${missing.join(", ")}`);
  }

  if (env("BBL_SOL_WALLET_ADDRESS") === env("BBL_TOKEN_ADDRESS")) {
    throw new Error(
      "BBL_SOL_WALLET_ADDRESS must be the creator-fee wallet, not the token mint.",
    );
  }

  const leverage = asNumber(env("BBL_ASTER_LEVERAGE"), 5);
  if (leverage !== 5) {
    throw new Error("BBL_ASTER_LEVERAGE must remain exactly 5.");
  }

  if (!asBool(env("DRY_RUN", "true"))) {
    const liveRequired = [
      "ASTER_API_KEY",
      "ASTER_API_SECRET",
      "BBL_MAX_COLLATERAL_USDT_PER_RUN",
    ];
    const missingLive = liveRequired.filter((name) => !env(name));
    if (missingLive.length) {
      throw new Error(`Live mode is missing required env: ${missingLive.join(", ")}`);
    }
    if (!asBool(env("BBL_ASTER_EXECUTION_CONFIRMED", "false"))) {
      throw new Error(
        "BBL_ASTER_EXECUTION_CONFIRMED must be true before live orders.",
      );
    }
    if (!asBool(env("ASTER_MANAGED_USDT", "false"))) {
      throw new Error(
        "ASTER_MANAGED_USDT must be true before the worker may deploy Aster USDT.",
      );
    }
    if (asNumber(env("BBL_MAX_COLLATERAL_USDT_PER_RUN")) <= 0) {
      throw new Error("BBL_MAX_COLLATERAL_USDT_PER_RUN must be greater than zero.");
    }
  }
}

async function supabase(path, init = {}) {
  const baseUrl = env("SUPABASE_URL").replace(/\/$/, "");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`Supabase ${path} failed: ${response.status} ${await response.text()}`);
  }
  return response.status === 204 ? null : response.json();
}

async function logEvent(runId, stage, status, action, message, extra = {}) {
  await supabase("bbl_terminal_events", {
    method: "POST",
    body: JSON.stringify({
      run_id: runId,
      event_type: "automation",
      stage,
      status,
      action,
      message,
      wallet_address: extra.wallet_address ?? null,
      asset: extra.asset ?? null,
      amount: extra.amount ?? null,
      tx_hash: extra.tx_hash ?? null,
      scan_url: extra.scan_url ?? null,
      metadata: extra.metadata ?? {},
    }),
  });
}

async function createRun() {
  const rows = await supabase("bbl_automation_runs", {
    method: "POST",
    body: JSON.stringify({
      run_type: "claim_aster_long_buyback_burn",
      status: "running",
      started_at: new Date().toISOString(),
      metadata: {
        venue: "Aster",
        market: "ANSEMUSDT",
        leverage: 5,
        dry_run: asBool(env("DRY_RUN", "true")),
      },
    }),
  });
  return rows[0];
}

async function finishRun(runId, status, errorMessage = null, metadata = {}) {
  await supabase(`bbl_automation_runs?id=eq.${runId}`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      completed_at: new Date().toISOString(),
      error_message: errorMessage,
      metadata,
    }),
  });
}

async function solanaBalance(address) {
  const response = await fetch(env("SOLANA_RPC_URL"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "getBalance",
      params: [address, { commitment: "confirmed" }],
    }),
  });
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error.message);
  return Number(payload.result?.value ?? 0) / LAMPORTS_PER_SOL;
}

async function optionalPost(url, body, apiKey) {
  if (!url) return null;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} failed: ${response.status} ${text}`);
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function recordPosition(runId, position) {
  if (!position) return;
  await supabase("bbl_positions", {
    method: "POST",
    body: JSON.stringify({
      run_id: runId,
      aster_account: position.account,
      market: position.market,
      side: position.side,
      size: position.size,
      notional_usdc: position.notionalUsdt,
      entry_price: position.entryPrice,
      mark_price: position.markPrice,
      leverage: position.leverage,
      unrealized_pnl_usdc: position.unrealizedPnlUsdt,
      margin_used_usdc: position.marginUsedUsdt,
      metadata: { source: "aster_public_wallet_rpc" },
      recorded_at: new Date().toISOString(),
    }),
  });
}

async function executeOnce() {
  requireEnvironment();
  const dryRun = asBool(env("DRY_RUN", "true"));
  const wallet = env("BBL_SOL_WALLET_ADDRESS");
  const asterWallet = env("BBL_ASTER_WALLET_ADDRESS");
  const bufferSol = asNumber(env("BBL_SOL_FEE_BUFFER_SOL"), 0.05);
  const run = await createRun();
  const runId = run.id;

  try {
    await logEvent(
      runId,
      "START",
      "running",
      "BBL Aster cycle started",
      dryRun ? "Dry run: no funds or orders will move." : "Live 5x execution enabled.",
    );

    const before = await solanaBalance(wallet);
    const claim = dryRun
      ? null
      : await optionalPost(
          env("CREATOR_FEE_CLAIM_ENDPOINT"),
          { wallet, token: env("BBL_TOKEN_ADDRESS"), run_id: runId },
          env("CREATOR_FEE_CLAIM_API_KEY"),
        );
    const after = await solanaBalance(wallet);
    const claimed = Math.max(0, after - before);
    const routeableSol = Math.max(0, after - bufferSol);

    await logEvent(
      runId,
      "CLAIM",
      claim ? "succeeded" : "skipped",
      "Check creator fees",
      claim
        ? `${claimed.toFixed(6)} SOL received.`
        : `Wallet checked; ${bufferSol} SOL remains reserved.`,
      { wallet_address: wallet, asset: "SOL", amount: claimed },
    );

    const fund = dryRun
      ? null
      : await optionalPost(
          env("BBL_ASTER_FUND_ENDPOINT"),
          {
            source_wallet: wallet,
            aster_wallet: asterWallet,
            amount_sol: routeableSol,
            run_id: runId,
          },
          env("BBL_ASTER_FUND_API_KEY"),
        );
    await logEvent(
      runId,
      "ROUTE",
      fund ? "succeeded" : "skipped",
      "Route collateral to Aster",
      fund
        ? "Aster funding adapter completed."
        : "No verified Aster funding adapter executed.",
      { asset: "SOL", amount: routeableSol, metadata: { funding_response: fund } },
    );

    let order = null;
    if (env("ASTER_API_KEY") && env("ASTER_API_SECRET")) {
      const client = createAsterClient({
        apiUrl: env("ASTER_API_URL", "https://fapi.asterdex.com"),
        apiKey: env("ASTER_API_KEY"),
        apiSecret: env("ASTER_API_SECRET"),
      });
      const market = await inspectAsterMarket(client);
      const availableUsdt = await getAsterAvailableUsdt(client);
      const bufferUsdt = asNumber(env("ASTER_USDT_BUFFER"), 5);
      const maxCollateral = asNumber(env("BBL_MAX_COLLATERAL_USDT_PER_RUN"), 0);
      const collateralUsdt = Math.min(
        Math.max(0, availableUsdt - bufferUsdt),
        maxCollateral,
      );

      if (!dryRun && collateralUsdt >= 5) {
        order = await openAsterLong({
          client,
          market,
          collateralUsdt,
          leverage: 5,
        });
        await supabase("bbl_long_orders", {
          method: "POST",
          body: JSON.stringify({
            run_id: runId,
            aster_account: asterWallet,
            market: "ANSEMUSDT",
            side: "long",
            order_type: "market",
            collateral_usdc: order.collateralUsdt,
            notional_usdc: order.notionalUsdt,
            leverage: 5,
            exchange_order_id: order.orderId,
            status: "succeeded",
            metadata: order.raw,
            opened_at: new Date().toISOString(),
          }),
        });
      }
      await logEvent(
        runId,
        "LONG",
        order ? "succeeded" : "skipped",
        "Build ANSEMUSDT 5x long",
        order
          ? `$${order.notionalUsdt.toFixed(2)} ANSEMUSDT long opened on Aster.`
          : "No approved Aster collateral was deployed this cycle.",
        { asset: "USDT", amount: order?.notionalUsdt ?? null },
      );
    } else {
      await logEvent(
        runId,
        "LONG",
        "skipped",
        "Build ANSEMUSDT 5x long",
        "Aster execution keys are not configured.",
      );
    }

    const profit = dryRun
      ? null
      : await optionalPost(
          env("BBL_PROFIT_ENDPOINT"),
          { account: asterWallet, market: "ANSEMUSDT", run_id: runId },
          env("BBL_PROFIT_API_KEY"),
        );
    const burn = dryRun
      ? null
      : await optionalPost(
          env("BBL_BUYBACK_BURN_ENDPOINT"),
          { token: env("BBL_TOKEN_ADDRESS"), run_id: runId, profit },
          env("BBL_BUYBACK_BURN_API_KEY"),
        );
    await logEvent(
      runId,
      "BURN",
      burn ? "succeeded" : "skipped",
      "Buy back and burn $BBL",
      burn ? "Buyback and burn receipt recorded." : "No qualifying burn executed.",
      {
        asset: "BBL",
        amount: burn?.tokens_burned ?? null,
        tx_hash: burn?.tx_hash ?? burn?.signature ?? null,
      },
    );

    const position = await getAsterPublicPosition({
      rpcUrl: env("ASTER_PUBLIC_RPC_URL", "https://tapi.asterdex.com/info"),
      wallet: asterWallet,
    });
    await recordPosition(runId, position);
    await finishRun(runId, dryRun ? "skipped" : "succeeded", null, {
      venue: "Aster",
      market: "ANSEMUSDT",
      leverage: 5,
      position_published: Boolean(position),
      dry_run: dryRun,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await logEvent(runId, "ERROR", "failed", "Worker cycle failed", message);
    await finishRun(runId, "failed", message);
    throw error;
  }
}

async function main() {
  const once = process.argv.includes("--once") || asBool(env("RUN_ONCE"));
  const intervalMinutes = asNumber(
    env("CLAIM_INTERVAL_MINUTES"),
    DEFAULT_INTERVAL_MINUTES,
  );
  if (intervalMinutes < 1 || intervalMinutes > 1440) {
    throw new Error("CLAIM_INTERVAL_MINUTES must be between 1 and 1440.");
  }
  if (once) return executeOnce();

  console.log(`BBL Aster worker running every ${intervalMinutes} minutes.`);
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      await executeOnce();
    } catch (error) {
      console.error(error);
    } finally {
      running = false;
    }
  };
  await run();
  setInterval(() => void run(), intervalMinutes * 60_000);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
