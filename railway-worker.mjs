import {
  getHyperliquidShortBook,
  parseDexs,
} from "./railway/hyperliquid.mjs";

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

function csv(value) {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

function transactionHash(payload) {
  return (
    payload?.tx_hash ||
    payload?.signature ||
    payload?.transaction_hash ||
    null
  );
}

function scanUrl(payload) {
  return payload?.scan_url || payload?.explorer_url || null;
}

function requireEnvironment() {
  const required = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SOLANA_RPC_URL",
    "HEDGE_SOL_WALLET_ADDRESS",
    "HEDGE_TOKEN_ADDRESS",
    "HEDGE_HYPERLIQUID_ACCOUNT",
  ];
  const missing = required.filter((name) => !env(name));
  if (missing.length) {
    throw new Error(`Missing required env: ${missing.join(", ")}`);
  }

  if (env("HEDGE_SOL_WALLET_ADDRESS") === env("HEDGE_TOKEN_ADDRESS")) {
    throw new Error(
      "HEDGE_SOL_WALLET_ADDRESS must be the creator-fee wallet, not the token mint.",
    );
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(env("HEDGE_HYPERLIQUID_ACCOUNT"))) {
    throw new Error(
      "HEDGE_HYPERLIQUID_ACCOUNT must be a valid public master or subaccount address.",
    );
  }

  const maxLeverage = asNumber(env("HEDGE_MAX_LEVERAGE"), 1);
  if (!(maxLeverage >= 1 && maxLeverage <= 5)) {
    throw new Error("HEDGE_MAX_LEVERAGE must be between 1 and 5.");
  }

  if (asBool(env("DRY_RUN", "true"))) return;

  const liveRequired = [
    "HEDGE_SOL_EXIT_WALLET_ADDRESS",
    "CREATOR_FEE_CLAIM_ENDPOINT",
    "CREATOR_FEE_CLAIM_API_KEY",
    "HEDGE_HYPERLIQUID_FUND_ENDPOINT",
    "HEDGE_HYPERLIQUID_FUND_API_KEY",
    "HEDGE_HYPERLIQUID_EXECUTION_ENDPOINT",
    "HEDGE_HYPERLIQUID_EXECUTION_API_KEY",
    "HEDGE_PROFIT_REALIZATION_ENDPOINT",
    "HEDGE_PROFIT_REALIZATION_API_KEY",
    "HEDGE_BUYBACK_BURN_ENDPOINT",
    "HEDGE_BUYBACK_BURN_API_KEY",
    "HEDGE_SHORT_MARKETS",
  ];
  const missingLive = liveRequired.filter((name) => !env(name));
  if (missingLive.length) {
    throw new Error(`Live mode is missing required env: ${missingLive.join(", ")}`);
  }

  if (!asBool(env("HEDGE_LIVE_EXECUTION_CONFIRMED", "false"))) {
    throw new Error(
      "HEDGE_LIVE_EXECUTION_CONFIRMED must be true before funds or orders can move.",
    );
  }

  if (asNumber(env("HEDGE_MAX_SOL_PER_RUN")) <= 0) {
    throw new Error("HEDGE_MAX_SOL_PER_RUN must be greater than zero.");
  }

  if (asNumber(env("HEDGE_MAX_SHORT_NOTIONAL_USD")) <= 0) {
    throw new Error("HEDGE_MAX_SHORT_NOTIONAL_USD must be greater than zero.");
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
    throw new Error(
      `Supabase ${path} failed: ${response.status} ${await response.text()}`,
    );
  }

  return response.status === 204 ? null : response.json();
}

async function logEvent(runId, stage, status, action, message, extra = {}) {
  await supabase("hedge_terminal_events", {
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
  const rows = await supabase("hedge_automation_runs", {
    method: "POST",
    body: JSON.stringify({
      run_type: "claim_bridge_short_buyback_burn",
      status: "running",
      started_at: new Date().toISOString(),
      metadata: {
        venue: "Hyperliquid",
        side: "short",
        dexs: parseDexs(env("HEDGE_HYPERLIQUID_DEXS")),
        markets: csv(env("HEDGE_SHORT_MARKETS")),
        max_leverage: asNumber(env("HEDGE_MAX_LEVERAGE"), 1),
        dry_run: asBool(env("DRY_RUN", "true")),
      },
    }),
  });

  return rows[0];
}

async function finishRun(runId, status, errorMessage = null, metadata = {}) {
  await supabase(`hedge_automation_runs?id=eq.${runId}`, {
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

  if (!response.ok || payload.error) {
    throw new Error(
      payload.error?.message || `Solana balance request failed: ${response.status}`,
    );
  }

  return Number(payload.result?.value ?? 0) / LAMPORTS_PER_SOL;
}

async function postAdapter(url, body, apiKey) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Execution adapter failed: ${response.status} ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Execution adapter returned a non-JSON response.");
  }
}

async function recordClaim(runId, payload, amountSol, wallet) {
  const txHash = transactionHash(payload);
  if (!(amountSol > 0) || !txHash) return;

  await supabase("hedge_claims", {
    method: "POST",
    body: JSON.stringify({
      run_id: runId,
      source: "creator_fees",
      asset: "SOL",
      amount: amountSol,
      wallet_address: wallet,
      tx_hash: txHash,
      scan_url: scanUrl(payload),
      status: "succeeded",
      claimed_at: new Date().toISOString(),
    }),
  });
}

async function recordBridge(runId, payload, amountSol, source, destination) {
  const txHash = transactionHash(payload);
  if (!(amountSol > 0) || !txHash) return;

  await supabase("hedge_bridges", {
    method: "POST",
    body: JSON.stringify({
      run_id: runId,
      source_chain: "Solana",
      destination: "Hyperliquid",
      asset: "SOL",
      amount: amountSol,
      from_wallet: source,
      to_account: destination,
      tx_hash: txHash,
      scan_url: scanUrl(payload),
      status: "succeeded",
      bridged_at: new Date().toISOString(),
    }),
  });
}

async function recordOrders(
  runId,
  execution,
  account,
  allowedMarkets,
  maxNotionalUsd,
  maxLeverage,
) {
  const orders = Array.isArray(execution?.orders) ? execution.orders : [];
  const approvedOrders = orders.flatMap((order) => {
    if (String(order.side ?? "").toLowerCase() !== "short") return [];
    const market = String(order.market ?? "").trim();
    const dex = String(order.dex ?? "").trim();
    const marketKey = dex && market ? `${dex}:${market}` : market;
    if (!allowedMarkets.includes(market) && !allowedMarkets.includes(marketKey)) {
      throw new Error(`Execution adapter returned unapproved market: ${marketKey}`);
    }

    const notionalUsd = asNumber(order.notional_usd);
    const leverage = asNumber(order.leverage);
    const orderId = order.order_id || order.exchange_order_id;
    if (!(notionalUsd > 0) || !orderId) return [];
    if (!(leverage >= 1 && leverage <= maxLeverage)) {
      throw new Error(
        `Execution adapter returned invalid leverage for ${marketKey}.`,
      );
    }

    return [{ order, market, dex, notionalUsd, leverage, orderId }];
  });
  const totalNotionalUsd = approvedOrders.reduce(
    (sum, order) => sum + order.notionalUsd,
    0,
  );
  if (totalNotionalUsd > maxNotionalUsd) {
    throw new Error("Execution adapter exceeded the per-run short notional cap.");
  }

  for (const approved of approvedOrders) {
    const { order, market, dex, notionalUsd, leverage, orderId } = approved;
    await supabase("hedge_short_orders", {
      method: "POST",
      body: JSON.stringify({
        run_id: runId,
        hyperliquid_account: account,
        dex,
        market,
        side: "short",
        order_type: order.order_type || "market",
        collateral_usd: asNumber(order.collateral_usd) || null,
        notional_usd: notionalUsd,
        leverage,
        exchange_order_id: String(orderId),
        tx_hash: transactionHash(order),
        scan_url: scanUrl(order),
        status: "succeeded",
        opened_at: new Date().toISOString(),
      }),
    });
  }

  return approvedOrders.length;
}

async function recordPositions(runId, shortBook) {
  for (const position of shortBook.positions) {
    await supabase("hedge_position_snapshots", {
      method: "POST",
      body: JSON.stringify({
        run_id: runId,
        hyperliquid_account: shortBook.account,
        dex: position.dex,
        market: position.market,
        side: "short",
        size: position.size,
        notional_usd: position.notionalUsd,
        entry_price: position.entryPrice,
        mark_price: position.markPrice,
        leverage: position.leverage,
        unrealized_pnl_usd: position.unrealizedPnlUsd,
        margin_used_usd: position.marginUsedUsd,
        liquidation_price: position.liquidationPrice,
        metadata: { source: "hyperliquid_clearinghouse_state" },
        recorded_at: new Date().toISOString(),
      }),
    });
  }
}

async function recordBuybackAndBurn(runId, payload, realizedProfitUsd) {
  const tokenMint = env("HEDGE_TOKEN_ADDRESS");
  const tokensBought = asNumber(payload?.tokens_bought);
  const tokensBurned = asNumber(payload?.tokens_burned);
  const spendAmount = asNumber(payload?.spend_amount_usdc, realizedProfitUsd);
  const buybackHash =
    payload?.buyback_tx_hash || payload?.buyback_signature || null;
  const burnHash = payload?.burn_tx_hash || payload?.burn_signature || null;

  if (spendAmount > realizedProfitUsd + Number.EPSILON) {
    throw new Error(
      "Buyback adapter spend exceeds the verified realized profit.",
    );
  }
  if (tokensBurned > tokensBought + Number.EPSILON) {
    throw new Error(
      "Buyback adapter cannot burn more tokens than the verified purchase.",
    );
  }

  if (tokensBought > 0 && spendAmount > 0 && buybackHash) {
    await supabase("hedge_buybacks", {
      method: "POST",
      body: JSON.stringify({
        run_id: runId,
        source_profit_usd: realizedProfitUsd,
        spend_asset: "USDC",
        spend_amount: spendAmount,
        token_mint: tokenMint,
        tokens_bought: tokensBought,
        tx_hash: buybackHash,
        scan_url: payload?.buyback_scan_url || null,
        status: "succeeded",
        executed_at: new Date().toISOString(),
      }),
    });
  }

  if (tokensBurned > 0 && burnHash) {
    await supabase("hedge_burns", {
      method: "POST",
      body: JSON.stringify({
        run_id: runId,
        token_mint: tokenMint,
        token_symbol: "HEDGE",
        amount: tokensBurned,
        tx_hash: burnHash,
        scan_url: payload?.burn_scan_url || null,
        status: "succeeded",
        burned_at: new Date().toISOString(),
      }),
    });
  }

  return { buybackHash, burnHash, tokensBought, tokensBurned };
}

async function executeOnce() {
  requireEnvironment();
  const dryRun = asBool(env("DRY_RUN", "true"));
  const solWallet = env("HEDGE_SOL_WALLET_ADDRESS");
  const hyperliquidAccount = env("HEDGE_HYPERLIQUID_ACCOUNT");
  const exitWallet = env("HEDGE_SOL_EXIT_WALLET_ADDRESS");
  const bufferSol = asNumber(env("HEDGE_SOL_FEE_BUFFER_SOL"), 0.05);
  const maxSolPerRun = asNumber(env("HEDGE_MAX_SOL_PER_RUN"));
  const maxShortNotionalUsd = asNumber(
    env("HEDGE_MAX_SHORT_NOTIONAL_USD"),
  );
  const maxLeverage = asNumber(env("HEDGE_MAX_LEVERAGE"), 1);
  const minRouteSol = asNumber(env("HEDGE_MIN_ROUTE_SOL"), 0.01);
  const dexs = parseDexs(env("HEDGE_HYPERLIQUID_DEXS"));
  const shortMarkets = csv(env("HEDGE_SHORT_MARKETS"));
  const run = await createRun();
  const runId = run.id;

  try {
    await logEvent(
      runId,
      "START",
      "running",
      "Hedge Hyperliquid cycle started",
      dryRun
        ? "Dry run: monitoring only; no funds or orders will move."
        : "Live adapter orchestration enabled.",
    );

    const before = await solanaBalance(solWallet);
    const claim = dryRun
      ? null
      : await postAdapter(
          env("CREATOR_FEE_CLAIM_ENDPOINT"),
          {
            wallet: solWallet,
            token: env("HEDGE_TOKEN_ADDRESS"),
            run_id: runId,
          },
          env("CREATOR_FEE_CLAIM_API_KEY"),
        );
    const after = await solanaBalance(solWallet);
    const claimedSol =
      asNumber(claim?.amount_sol) || Math.max(0, after - before);
    const claimHash = transactionHash(claim);

    await recordClaim(runId, claim, claimedSol, solWallet);
    await logEvent(
      runId,
      "CLAIM",
      claimHash && claimedSol > 0 ? "succeeded" : "skipped",
      "Claim creator fees",
      claimHash && claimedSol > 0
        ? `${claimedSol.toFixed(6)} SOL claimed with a verified receipt.`
        : dryRun
          ? "Dry run: creator-fee claim adapter not called."
          : "No claimable creator-fee receipt was returned.",
      {
        wallet_address: solWallet,
        asset: "SOL",
        amount: claimHash ? claimedSol : null,
        tx_hash: claimHash,
        scan_url: scanUrl(claim),
      },
    );

    const routeableSol = Math.min(
      Math.max(0, after - bufferSol),
      maxSolPerRun,
    );
    let bridge = null;

    if (!dryRun && routeableSol >= minRouteSol) {
      bridge = await postAdapter(
        env("HEDGE_HYPERLIQUID_FUND_ENDPOINT"),
        {
          source_wallet: solWallet,
          hyperliquid_account: hyperliquidAccount,
          amount_sol: routeableSol,
          run_id: runId,
        },
        env("HEDGE_HYPERLIQUID_FUND_API_KEY"),
      );
      if (!transactionHash(bridge)) {
        throw new Error(
          "Hyperliquid funding adapter must return a verified transaction hash.",
        );
      }
      await recordBridge(
        runId,
        bridge,
        asNumber(bridge.amount_sol, routeableSol),
        solWallet,
        hyperliquidAccount,
      );
    }

    await logEvent(
      runId,
      "BRIDGE",
      transactionHash(bridge) ? "succeeded" : "skipped",
      "Fund Hyperliquid account",
      transactionHash(bridge)
        ? `${asNumber(bridge.amount_sol, routeableSol).toFixed(6)} SOL funding receipt verified.`
        : dryRun
          ? "Dry run: Hyperliquid funding adapter not called."
          : "Route threshold not met; no funds moved.",
      {
        wallet_address: hyperliquidAccount,
        asset: "SOL",
        amount: transactionHash(bridge)
          ? asNumber(bridge.amount_sol, routeableSol)
          : null,
        tx_hash: transactionHash(bridge),
        scan_url: scanUrl(bridge),
      },
    );

    const execution = dryRun
      ? null
      : await postAdapter(
          env("HEDGE_HYPERLIQUID_EXECUTION_ENDPOINT"),
          {
            account: hyperliquidAccount,
            side: "short",
            markets: shortMarkets,
            max_notional_usd: asNumber(
              env("HEDGE_MAX_SHORT_NOTIONAL_USD"),
            ),
            max_leverage: asNumber(env("HEDGE_MAX_LEVERAGE"), 1),
            run_id: runId,
          },
          env("HEDGE_HYPERLIQUID_EXECUTION_API_KEY"),
        );
    const orderCount = execution
      ? await recordOrders(
          runId,
          execution,
          hyperliquidAccount,
          shortMarkets,
          maxShortNotionalUsd,
          maxLeverage,
        )
      : 0;

    await logEvent(
      runId,
      "OPEN",
      orderCount > 0 ? "succeeded" : "skipped",
      "Maintain approved Hyperliquid shorts",
      orderCount > 0
        ? `${orderCount} verified short-order receipt${orderCount === 1 ? "" : "s"} recorded.`
        : dryRun
          ? "Dry run: Hyperliquid execution adapter not called."
          : "Execution adapter returned no completed short orders.",
      { wallet_address: hyperliquidAccount },
    );

    const profit = dryRun
      ? null
      : await postAdapter(
          env("HEDGE_PROFIT_REALIZATION_ENDPOINT"),
          {
            account: hyperliquidAccount,
            sol_exit_wallet: exitWallet,
            run_id: runId,
          },
          env("HEDGE_PROFIT_REALIZATION_API_KEY"),
        );
    const realizedProfitUsd = asNumber(profit?.realized_profit_usd);

    await logEvent(
      runId,
      "PROFIT",
      realizedProfitUsd > 0 && transactionHash(profit)
        ? "succeeded"
        : "skipped",
      "Realize qualifying short profit",
      realizedProfitUsd > 0 && transactionHash(profit)
        ? `$${realizedProfitUsd.toFixed(2)} qualifying profit receipt verified.`
        : dryRun
          ? "Dry run: profit realization adapter not called."
          : "No qualifying realized profit was returned.",
      {
        wallet_address: exitWallet,
        asset: "USD",
        amount: realizedProfitUsd > 0 ? realizedProfitUsd : null,
        tx_hash: transactionHash(profit),
        scan_url: scanUrl(profit),
      },
    );

    let buyback = null;
    if (!dryRun && realizedProfitUsd > 0 && transactionHash(profit)) {
      buyback = await postAdapter(
        env("HEDGE_BUYBACK_BURN_ENDPOINT"),
        {
          token: env("HEDGE_TOKEN_ADDRESS"),
          sol_exit_wallet: exitWallet,
          realized_profit_usd: realizedProfitUsd,
          profit_receipt: transactionHash(profit),
          run_id: runId,
        },
        env("HEDGE_BUYBACK_BURN_API_KEY"),
      );
    }
    const buybackResult = buyback
      ? await recordBuybackAndBurn(runId, buyback, realizedProfitUsd)
      : null;

    await logEvent(
      runId,
      "BUYBACK",
      buybackResult?.buybackHash ? "succeeded" : "skipped",
      "Buy back $HEDGE",
      buybackResult?.buybackHash
        ? `${buybackResult.tokensBought.toLocaleString("en-US")} $HEDGE purchased.`
        : "No qualifying verified buyback executed.",
      {
        asset: "USD",
        amount: buybackResult?.buybackHash ? realizedProfitUsd : null,
        tx_hash: buybackResult?.buybackHash,
        scan_url: buyback?.buyback_scan_url || null,
      },
    );
    await logEvent(
      runId,
      "BURN",
      buybackResult?.burnHash ? "succeeded" : "skipped",
      "Permanently burn $HEDGE",
      buybackResult?.burnHash
        ? `${buybackResult.tokensBurned.toLocaleString("en-US")} $HEDGE burned.`
        : "No qualifying verified burn executed.",
      {
        asset: "HEDGE",
        amount: buybackResult?.burnHash
          ? buybackResult.tokensBurned
          : null,
        tx_hash: buybackResult?.burnHash,
        scan_url: buyback?.burn_scan_url || null,
      },
    );

    const shortBook = await getHyperliquidShortBook({
      account: hyperliquidAccount,
      dexs,
    });
    await recordPositions(runId, shortBook);
    await logEvent(
      runId,
      "POSITION",
      "succeeded",
      "Publish Hyperliquid short book",
      `${shortBook.positions.length} open short position${shortBook.positions.length === 1 ? "" : "s"} verified.`,
      { wallet_address: hyperliquidAccount },
    );

    await finishRun(runId, dryRun ? "skipped" : "succeeded", null, {
      venue: "Hyperliquid",
      side: "short",
      open_shorts: shortBook.positions.length,
      account_value_usd: shortBook.accountValueUsd,
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

  console.log(
    `Hedge Hyperliquid worker running every ${intervalMinutes} minutes.`,
  );
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
