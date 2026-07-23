const DEFAULT_INTERVAL_MINUTES = 15;
const LAMPORTS_PER_SOL = 1_000_000_000;

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SOLANA_RPC_URL"];

function env(name, fallback = "") {
  return process.env[name] || fallback;
}

function requireEnv() {
  const missing = required.filter((name) => !env(name));
  if (missing.length) {
    throw new Error(`Missing required env: ${missing.join(", ")}`);
  }
}

function asBool(value) {
  return String(value ?? "").toLowerCase() === "true";
}

function asNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function solScanUrl(signature) {
  return signature ? `https://solscan.io/tx/${signature}` : null;
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
    const body = await response.text();
    throw new Error(`Supabase ${path} failed: ${response.status} ${body}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function createRun() {
  const rows = await supabase("longcat_automation_runs", {
    method: "POST",
    body: JSON.stringify({
      run_type: "claim_bridge_long_buyback_burn",
      status: "running",
      started_at: new Date().toISOString(),
      metadata: {
        dry_run: asBool(env("DRY_RUN", "true")),
        interval_minutes: asNumber(env("CLAIM_INTERVAL_MINUTES"), DEFAULT_INTERVAL_MINUTES),
      },
    }),
  });
  return rows[0];
}

async function finishRun(runId, status, errorMessage = null, metadata = {}) {
  await supabase(`longcat_automation_runs?id=eq.${runId}`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      completed_at: new Date().toISOString(),
      error_message: errorMessage,
      metadata,
    }),
  });
}

async function logEvent(runId, stage, status, action, message, extra = {}) {
  await supabase("longcat_terminal_events", {
    method: "POST",
    body: JSON.stringify({
      run_id: runId,
      event_type: extra.event_type ?? "automation",
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

async function rpc(method, params) {
  const response = await fetch(env("SOLANA_RPC_URL"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
  });
  const payload = await response.json();
  if (payload.error) {
    throw new Error(`${method} RPC error: ${payload.error.message ?? JSON.stringify(payload.error)}`);
  }
  return payload.result;
}

async function getSolBalance(address) {
  if (!address) return 0;
  const result = await rpc("getBalance", [address, { commitment: "confirmed" }]);
  return Number(result.value ?? 0) / LAMPORTS_PER_SOL;
}

async function optionalPost(url, body, headers = {}) {
  if (!url) return null;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${url} failed: ${response.status} ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function recordClaim(runId, amount, status, txHash = null, metadata = {}) {
  await supabase("longcat_claims", {
    method: "POST",
    body: JSON.stringify({
      run_id: runId,
      source: "creator_fees",
      token_symbol: "SOL",
      amount,
      from_wallet: env("LONGCAT_SOL_WALLET_ADDRESS") || null,
      to_wallet: env("LONGCAT_HYPERLIQUID_ACCOUNT") || null,
      tx_hash: txHash,
      scan_url: solScanUrl(txHash),
      status,
      metadata,
      claimed_at: status === "succeeded" ? new Date().toISOString() : null,
    }),
  });
}

async function recordTransfer(runId, type, asset, amount, status, txHash = null, metadata = {}) {
  await supabase("longcat_transfers", {
    method: "POST",
    body: JSON.stringify({
      run_id: runId,
      transfer_type: type,
      from_wallet: env("LONGCAT_SOL_WALLET_ADDRESS") || null,
      to_wallet: env("LONGCAT_HYPERLIQUID_ACCOUNT") || null,
      asset,
      amount,
      tx_hash: txHash,
      scan_url: solScanUrl(txHash),
      status,
      metadata,
      transferred_at: status === "succeeded" ? new Date().toISOString() : null,
    }),
  });
}

async function recordOrder(runId, status, metadata = {}) {
  await supabase("longcat_long_orders", {
    method: "POST",
    body: JSON.stringify({
      run_id: runId,
      hyperliquid_account: env("LONGCAT_HYPERLIQUID_ACCOUNT") || null,
      market: "SOL",
      side: "long",
      order_type: "market",
      collateral_usdc: metadata.collateral_usdc ?? 0,
      notional_usdc: metadata.notional_usdc ?? 0,
      leverage: metadata.leverage ?? 0,
      exchange_order_id: metadata.exchange_order_id ?? null,
      tx_hash: metadata.tx_hash ?? null,
      scan_url: metadata.scan_url ?? null,
      status,
      metadata,
      opened_at: status === "succeeded" ? new Date().toISOString() : null,
    }),
  });
}

async function executeOnce() {
  requireEnv();

  const dryRun = asBool(env("DRY_RUN", "true"));
  const solWallet = env("LONGCAT_SOL_WALLET_ADDRESS");
  const bufferSol = asNumber(env("LONGCAT_SOL_FEE_BUFFER_SOL"), 0.05);
  const run = await createRun();
  const runId = run.id;

  try {
    await logEvent(runId, "START", "running", "15-minute Longcat worker started", dryRun ? "Dry-run mode. No funds will move." : "Live mode requested.");

    await logEvent(runId, "CLAIM", "running", "Check creator fee wallet", `Reading SOL balance with ${bufferSol} SOL fee buffer.`, {
      wallet_address: solWallet || null,
      asset: "SOL",
    });

    const balanceSol = await getSolBalance(solWallet);
    const routeableSol = Math.max(0, balanceSol - bufferSol);

    if (routeableSol <= 0) {
      await recordClaim(runId, 0, "skipped", null, { balance_sol: balanceSol, buffer_sol: bufferSol });
      await logEvent(runId, "CLAIM", "skipped", "No routeable SOL", `Wallet has ${balanceSol.toFixed(6)} SOL; buffer keeps ${bufferSol} SOL untouched.`, {
        wallet_address: solWallet || null,
        asset: "SOL",
        amount: 0,
        metadata: { balance_sol: balanceSol, buffer_sol: bufferSol },
      });
      await finishRun(runId, "skipped", null, { balance_sol: balanceSol, routeable_sol: 0, dry_run: dryRun });
      return;
    }

    const pumpFunClaim = await optionalPost(env("PUMP_FUN_CLAIM_ENDPOINT"), {
      wallet: solWallet,
      token: env("LONGCAT_TOKEN_ADDRESS", ""),
      run_id: runId,
      dry_run: dryRun,
    }, env("PUMP_FUN_API_KEY") ? { Authorization: `Bearer ${env("PUMP_FUN_API_KEY")}` } : {});

    const claimTx = pumpFunClaim?.tx_hash ?? pumpFunClaim?.signature ?? null;
    await recordClaim(runId, routeableSol, dryRun ? "skipped" : claimTx ? "succeeded" : "pending", claimTx, {
      balance_sol: balanceSol,
      buffer_sol: bufferSol,
      routeable_sol: routeableSol,
      pump_fun_response: pumpFunClaim,
      note: pumpFunClaim ? "Pump.fun claim endpoint returned a response." : "Set PUMP_FUN_CLAIM_ENDPOINT to perform real creator-fee claiming.",
    });
    await logEvent(runId, "CLAIM", dryRun ? "skipped" : pumpFunClaim ? "succeeded" : "pending", "Creator fees checked", `${routeableSol.toFixed(6)} SOL available after fee buffer.`, {
      wallet_address: solWallet || null,
      asset: "SOL",
      amount: routeableSol,
      tx_hash: claimTx,
      scan_url: solScanUrl(claimTx),
      metadata: { dry_run: dryRun, pump_fun_response: pumpFunClaim },
    });

    const bridge = await optionalPost(env("LONGCAT_BRIDGE_ENDPOINT"), {
      from_wallet: solWallet,
      hyperliquid_account: env("LONGCAT_HYPERLIQUID_ACCOUNT"),
      asset: "SOL",
      amount: routeableSol,
      run_id: runId,
      dry_run: dryRun,
    }, env("LONGCAT_BRIDGE_API_KEY") ? { Authorization: `Bearer ${env("LONGCAT_BRIDGE_API_KEY")}` } : {});
    const bridgeTx = bridge?.tx_hash ?? bridge?.signature ?? null;
    await recordTransfer(runId, "sol_to_hyperliquid", "SOL", routeableSol, dryRun ? "skipped" : bridge ? "succeeded" : "pending", bridgeTx, {
      bridge_response: bridge,
      note: bridge ? "Bridge endpoint returned a response." : "Set LONGCAT_BRIDGE_ENDPOINT to move SOL/collateral toward Hyperliquid.",
    });
    await logEvent(runId, "BRIDGE", dryRun ? "skipped" : bridge ? "succeeded" : "pending", "Route SOL toward Hyperliquid", bridge ? "Bridge route recorded." : "Bridge endpoint not configured.", {
      asset: "SOL",
      amount: routeableSol,
      tx_hash: bridgeTx,
      scan_url: solScanUrl(bridgeTx),
      metadata: { dry_run: dryRun, bridge_response: bridge },
    });

    const order = await optionalPost(env("HYPERLIQUID_ORDER_ENDPOINT"), {
      account: env("LONGCAT_HYPERLIQUID_ACCOUNT"),
      market: "SOL",
      side: "long",
      amount_sol: routeableSol,
      api_wallet_private_key_present: Boolean(env("HYPERLIQUID_API_WALLET_PRIVATE_KEY")),
      run_id: runId,
      dry_run: dryRun,
    }, env("HYPERLIQUID_API_KEY") ? { Authorization: `Bearer ${env("HYPERLIQUID_API_KEY")}` } : {});
    await recordOrder(runId, dryRun ? "skipped" : order ? "succeeded" : "pending", {
      routeable_sol: routeableSol,
      hyperliquid_response: order,
      note: order ? "Hyperliquid order endpoint returned a response." : "Set HYPERLIQUID_ORDER_ENDPOINT or wire native signing before live orders.",
    });
    await logEvent(runId, "LONG", dryRun ? "skipped" : order ? "succeeded" : "pending", "Scale public SOL long", order ? "SOL long order recorded." : "Hyperliquid order integration pending.", {
      asset: "SOL",
      amount: routeableSol,
      metadata: { dry_run: dryRun, hyperliquid_response: order },
    });

    const profit = await optionalPost(env("LONGCAT_PROFIT_ENDPOINT"), {
      account: env("LONGCAT_HYPERLIQUID_ACCOUNT"),
      market: "SOL",
      run_id: runId,
      dry_run: dryRun,
    }, env("LONGCAT_PROFIT_API_KEY") ? { Authorization: `Bearer ${env("LONGCAT_PROFIT_API_KEY")}` } : {});
    await logEvent(runId, "PROFIT", dryRun ? "skipped" : profit ? "succeeded" : "pending", "Check realized profit", profit ? "Profit route recorded." : "Profit-taking endpoint not configured.", {
      asset: "USDC",
      amount: profit?.realized_profit_usdc ?? null,
      metadata: { dry_run: dryRun, profit_response: profit },
    });

    const burn = await optionalPost(env("LONGCAT_BUYBACK_BURN_ENDPOINT"), {
      token: env("LONGCAT_TOKEN_ADDRESS", ""),
      run_id: runId,
      dry_run: dryRun,
      profit,
    }, env("LONGCAT_BUYBACK_BURN_API_KEY") ? { Authorization: `Bearer ${env("LONGCAT_BUYBACK_BURN_API_KEY")}` } : {});
    await logEvent(runId, "BURN", dryRun ? "skipped" : burn ? "succeeded" : "pending", "Buy back and burn $LONGCAT", burn ? "Buyback/burn route recorded." : "Buyback/burn endpoint not configured.", {
      asset: "LONGCAT",
      amount: burn?.tokens_burned ?? null,
      tx_hash: burn?.tx_hash ?? burn?.signature ?? null,
      scan_url: solScanUrl(burn?.tx_hash ?? burn?.signature ?? null),
      metadata: { dry_run: dryRun, burn_response: burn },
    });

    await finishRun(runId, dryRun ? "skipped" : "succeeded", null, {
      balance_sol: balanceSol,
      routeable_sol: routeableSol,
      dry_run: dryRun,
      live_integrations: {
        pump_fun_claim: Boolean(env("PUMP_FUN_CLAIM_ENDPOINT")),
        bridge: Boolean(env("LONGCAT_BRIDGE_ENDPOINT")),
        hyperliquid_order: Boolean(env("HYPERLIQUID_ORDER_ENDPOINT")),
        profit: Boolean(env("LONGCAT_PROFIT_ENDPOINT")),
        buyback_burn: Boolean(env("LONGCAT_BUYBACK_BURN_ENDPOINT")),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await logEvent(runId, "ERROR", "failed", "Worker run failed", message);
    await finishRun(runId, "failed", message);
    throw error;
  }
}

async function main() {
  const once = process.argv.includes("--once") || asBool(env("RUN_ONCE"));
  const intervalMs = asNumber(env("CLAIM_INTERVAL_MINUTES"), DEFAULT_INTERVAL_MINUTES) * 60_000;

  if (once) {
    await executeOnce();
    return;
  }

  console.log(`Longcat Railway worker running every ${intervalMs / 60_000} minutes.`);
  await executeOnce().catch((error) => console.error(error));
  setInterval(() => {
    executeOnce().catch((error) => console.error(error));
  }, intervalMs);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
