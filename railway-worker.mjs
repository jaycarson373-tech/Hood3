import {
  createHyperliquidExecutionClients,
  createHyperliquidPublicClient,
  inspectHyperliquid,
  openSolLong,
  sellUnitSolForUsdc,
  transferSpotUsdcToPerps,
  waitForUnitSolCredit,
} from "./railway/hyperliquid.mjs";
import { transferSolToHyperliquid } from "./railway/solana.mjs";

const DEFAULT_INTERVAL_MINUTES = 15;
const LAMPORTS_PER_SOL = 1_000_000_000;

const required = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SOLANA_RPC_URL",
  "LONGCAT_SOL_WALLET_ADDRESS",
  "LONGCAT_TOKEN_ADDRESS",
  "LONGCAT_HYPERLIQUID_SOL_DEPOSIT_ADDRESS",
  "LONGCAT_HYPERLIQUID_ACCOUNT",
];
const liveRequired = [
  "LONGCAT_SOL_WALLET_PRIVATE_KEY",
  "HYPERLIQUID_API_WALLET_PRIVATE_KEY",
  "HYPERLIQUID_MASTER_WALLET_PRIVATE_KEY",
  "HYPERLIQUID_LONG_LEVERAGE",
  "HYPERLIQUID_MAX_COLLATERAL_USDC_PER_RUN",
  "HYPERLIQUID_MAX_SLIPPAGE_BPS",
];
const legacyVariables = [
  "ROBINHOOD_RPC_URL",
  "LONGCAT_ETH_GAS_BUFFER_ETH",
  "LONGCAT_ETH_WALLET_ADDRESS",
  "LONGCAT_ETH_WALLET_PRIVATE_KEY",
  "LONGCAT_HYPERLIQUID_PERP_ACCOUNT",
];

function env(name, fallback = "") {
  return process.env[name] || fallback;
}

function requireEnv() {
  const missing = required.filter((name) => !env(name));
  if (missing.length) {
    throw new Error(`Missing required env: ${missing.join(", ")}`);
  }

  if (env("LONGCAT_SOL_WALLET_ADDRESS") === env("LONGCAT_TOKEN_ADDRESS")) {
    throw new Error(
      "LONGCAT_SOL_WALLET_ADDRESS is set to the token mint. Use the fee wallet public key instead.",
    );
  }

  if (env("LONGCAT_HYPERLIQUID_SOL_DEPOSIT_ADDRESS").startsWith("0x")) {
    throw new Error(
      "LONGCAT_HYPERLIQUID_SOL_DEPOSIT_ADDRESS must be the unique Solana deposit address from Hyperliquid, not the 0x account.",
    );
  }

  if (!asBool(env("DRY_RUN", "true"))) {
    const missingLive = liveRequired.filter((name) => !env(name));
    if (missingLive.length) {
      throw new Error(`Live mode is missing required env: ${missingLive.join(", ")}`);
    }
    if (!asBool(env("HYPERLIQUID_MANAGED_SPOT_USDC", "false"))) {
      throw new Error(
        "Set HYPERLIQUID_MANAGED_SPOT_USDC=true only after confirming this dedicated account may route available spot USDC.",
      );
    }
    const presentLegacy = legacyVariables.filter((name) => env(name));
    if (presentLegacy.length) {
      throw new Error(`Remove legacy non-Solana envs before live mode: ${presentLegacy.join(", ")}`);
    }

    const leverage = asNumber(env("HYPERLIQUID_LONG_LEVERAGE"), 0);
    const maxCollateral = asNumber(env("HYPERLIQUID_MAX_COLLATERAL_USDC_PER_RUN"), 0);
    const slippageBps = asNumber(env("HYPERLIQUID_MAX_SLIPPAGE_BPS"), 0);
    const utilization = asNumber(env("HYPERLIQUID_COLLATERAL_UTILIZATION"), 0.95);
    const feeBuffer = asNumber(env("LONGCAT_SOL_FEE_BUFFER_SOL"), 0);
    if (leverage < 1 || leverage > 20) {
      throw new Error("HYPERLIQUID_LONG_LEVERAGE must be between 1 and 20.");
    }
    if (maxCollateral <= 0) {
      throw new Error("HYPERLIQUID_MAX_COLLATERAL_USDC_PER_RUN must be greater than zero.");
    }
    if (slippageBps < 1 || slippageBps > 300) {
      throw new Error("HYPERLIQUID_MAX_SLIPPAGE_BPS must be between 1 and 300.");
    }
    if (utilization <= 0 || utilization > 0.98) {
      throw new Error("HYPERLIQUID_COLLATERAL_UTILIZATION must be above 0 and no more than 0.98.");
    }
    if (feeBuffer < 0.05) {
      throw new Error("LONGCAT_SOL_FEE_BUFFER_SOL must keep at least 0.05 SOL.");
    }
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
      to_wallet: env("LONGCAT_SOL_WALLET_ADDRESS") || null,
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
      from_wallet: metadata.from_wallet ?? env("LONGCAT_SOL_WALLET_ADDRESS") ?? null,
      to_wallet: metadata.to_wallet ?? env("LONGCAT_HYPERLIQUID_SOL_DEPOSIT_ADDRESS") ?? null,
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

async function recordSwap(runId, status, metadata = {}) {
  await supabase("longcat_swaps", {
    method: "POST",
    body: JSON.stringify({
      run_id: runId,
      venue: "Hyperliquid",
      from_asset: "USOL",
      to_asset: "USDC",
      from_amount: metadata.from_amount ?? 0,
      to_amount: metadata.to_amount ?? 0,
      price: metadata.price ?? null,
      slippage_bps: metadata.slippage_bps ?? null,
      tx_hash: metadata.tx_hash ?? null,
      scan_url: metadata.scan_url ?? null,
      status,
      metadata,
      executed_at: status === "succeeded" ? new Date().toISOString() : null,
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
      limit_price: metadata.limit_price ?? null,
      exchange_order_id: metadata.exchange_order_id ?? null,
      tx_hash: metadata.tx_hash ?? null,
      scan_url: metadata.scan_url ?? null,
      status,
      metadata,
      opened_at: status === "succeeded" ? new Date().toISOString() : null,
    }),
  });
}

async function recordPosition(runId, inspection) {
  const row = inspection.perpState.assetPositions.find(
    (assetPosition) => assetPosition.position.coin === "SOL",
  );
  const position = row?.position;
  const signedSize = Number(position?.szi ?? 0);
  const side = signedSize > 0 ? "long" : signedSize < 0 ? "short" : "flat";

  await supabase("longcat_positions", {
    method: "POST",
    body: JSON.stringify({
      run_id: runId,
      hyperliquid_account: env("LONGCAT_HYPERLIQUID_ACCOUNT"),
      market: "SOL",
      side,
      size: Math.abs(signedSize),
      notional_usdc: Number(position?.positionValue ?? 0),
      entry_price: position?.entryPx ? Number(position.entryPx) : null,
      mark_price: inspection.perpMarket.mid,
      leverage: Number(position?.leverage?.value ?? 0),
      unrealized_pnl_usdc: Number(position?.unrealizedPnl ?? 0),
      margin_used_usdc: Number(position?.marginUsed ?? 0),
      metadata: {
        source: "hyperliquid_public_api",
        liquidation_price: position?.liquidationPx ? Number(position.liquidationPx) : null,
      },
      recorded_at: new Date().toISOString(),
    }),
  });
}

async function executeOnce() {
  requireEnv();

  const dryRun = asBool(env("DRY_RUN", "true"));
  const solWallet = env("LONGCAT_SOL_WALLET_ADDRESS");
  const hyperliquidAccount = env("LONGCAT_HYPERLIQUID_ACCOUNT");
  const hyperliquidDepositAddress = env("LONGCAT_HYPERLIQUID_SOL_DEPOSIT_ADDRESS");
  const bufferSol = asNumber(env("LONGCAT_SOL_FEE_BUFFER_SOL"), 0.05);
  const minimumUnitDepositSol = asNumber(env("LONGCAT_MIN_ROUTE_SOL"), 0.12);
  const minimumTradeUsdc = asNumber(env("HYPERLIQUID_MIN_TRADE_USDC"), 10);
  const maxCollateralUsdc = asNumber(
    env("HYPERLIQUID_MAX_COLLATERAL_USDC_PER_RUN"),
    0,
  );
  const spotUsdcBuffer = asNumber(env("HYPERLIQUID_SPOT_USDC_BUFFER"), 1);
  const slippageBps = asNumber(env("HYPERLIQUID_MAX_SLIPPAGE_BPS"), 100);
  const leverage = asNumber(env("HYPERLIQUID_LONG_LEVERAGE"), 0);
  const collateralUtilization = asNumber(
    env("HYPERLIQUID_COLLATERAL_UTILIZATION"),
    0.95,
  );
  const depositPollSeconds = asNumber(
    env("HYPERLIQUID_DEPOSIT_POLL_SECONDS"),
    90,
  );
  const hyperliquidApiUrl = env(
    "HYPERLIQUID_API_URL",
    "https://api.hyperliquid.xyz",
  );
  const run = await createRun();
  const runId = run.id;

  try {
    await logEvent(
      runId,
      "START",
      "running",
      "15-minute Longcat worker started",
      dryRun ? "Dry-run mode. No funds will move." : "Live Solana execution mode.",
    );

    const info = createHyperliquidPublicClient(hyperliquidApiUrl);
    let inspection = await inspectHyperliquid(info, hyperliquidAccount);
    const minimumRouteByNotional =
      (minimumTradeUsdc / inspection.spotMarket.mid) * 1.02;
    const minimumRouteSol = Math.max(
      minimumUnitDepositSol,
      minimumRouteByNotional,
    );

    await logEvent(runId, "CLAIM", "running", "Check creator fee wallet", `Checking creator fees while preserving ${bufferSol} SOL.`, {
      wallet_address: solWallet || null,
      asset: "SOL",
    });

    const balanceBeforeClaim = await getSolBalance(solWallet);
    const pumpFunClaim = dryRun
      ? null
      : await optionalPost(env("PUMP_FUN_CLAIM_ENDPOINT"), {
        wallet: solWallet,
        token: env("LONGCAT_TOKEN_ADDRESS", ""),
        run_id: runId,
      }, env("PUMP_FUN_API_KEY") ? { Authorization: `Bearer ${env("PUMP_FUN_API_KEY")}` } : {});
    const claimTx = pumpFunClaim?.tx_hash ?? pumpFunClaim?.signature ?? null;
    const balanceAfterClaim = await getSolBalance(solWallet);
    const claimedSol = Math.max(0, balanceAfterClaim - balanceBeforeClaim);
    const claimStatus = dryRun || !pumpFunClaim
      ? "skipped"
      : claimTx
        ? "succeeded"
        : "pending";

    await recordClaim(runId, claimedSol, claimStatus, claimTx, {
      balance_before_sol: balanceBeforeClaim,
      balance_after_sol: balanceAfterClaim,
      buffer_sol: bufferSol,
      pump_fun_response: pumpFunClaim,
      note: pumpFunClaim
        ? "Pump.fun claim adapter returned a response."
        : "No claim adapter configured; monitoring SOL already routed to the creator wallet.",
    });
    await logEvent(runId, "CLAIM", claimStatus, "Creator fees checked", pumpFunClaim
      ? `${claimedSol.toFixed(6)} SOL received during this claim check.`
      : "Creator wallet checked; no external claim adapter configured.", {
      wallet_address: solWallet || null,
      asset: "SOL",
      amount: claimedSol,
      tx_hash: claimTx,
      scan_url: solScanUrl(claimTx),
      metadata: { dry_run: dryRun, pump_fun_response: pumpFunClaim },
    });

    const routeableSol = Math.max(0, balanceAfterClaim - bufferSol);
    const existingUnitSol = inspection.availableUnitSol;
    let solDeposit = null;

    if (routeableSol >= minimumRouteSol) {
      solDeposit = await transferSolToHyperliquid({
        rpcUrl: env("SOLANA_RPC_URL"),
        expectedSource: solWallet,
        destination: hyperliquidDepositAddress,
        amountSol: routeableSol,
        dryRun,
      });
      const transferStatus = dryRun ? "skipped" : "succeeded";
      await recordTransfer(
        runId,
        "solana_to_hyperliquid_unit",
        "SOL",
        routeableSol,
        transferStatus,
        solDeposit.signature,
        {
          from_wallet: solWallet,
          to_wallet: hyperliquidDepositAddress,
          minimum_route_sol: minimumRouteSol,
          unit_minimum_sol: minimumUnitDepositSol,
          dry_run: dryRun,
        },
      );
      await logEvent(
        runId,
        "BRIDGE",
        transferStatus,
        "Send SOL to Hyperliquid",
        dryRun
          ? `Dry run: ${routeableSol.toFixed(6)} SOL would be sent to the Unit deposit address.`
          : `${routeableSol.toFixed(6)} SOL sent through the dedicated Hyperliquid Solana deposit address.`,
        {
          wallet_address: hyperliquidDepositAddress,
          asset: "SOL",
          amount: routeableSol,
          tx_hash: solDeposit.signature,
          scan_url: solScanUrl(solDeposit.signature),
          metadata: { buffer_sol: bufferSol, minimum_route_sol: minimumRouteSol },
        },
      );

      if (!dryRun && depositPollSeconds > 0) {
        await waitForUnitSolCredit({
          info,
          account: hyperliquidAccount,
          startingBalance: existingUnitSol,
          timeoutSeconds: depositPollSeconds,
        });
      }
    } else {
      await logEvent(
        runId,
        "BRIDGE",
        "skipped",
        "SOL route held",
        `${routeableSol.toFixed(6)} SOL is below the current ${minimumRouteSol.toFixed(6)} SOL safe route threshold.`,
        {
          wallet_address: solWallet,
          asset: "SOL",
          amount: routeableSol,
          metadata: {
            balance_sol: balanceAfterClaim,
            buffer_sol: bufferSol,
            unit_minimum_sol: minimumUnitDepositSol,
            minimum_trade_usdc: minimumTradeUsdc,
          },
        },
      );
    }

    inspection = await inspectHyperliquid(info, hyperliquidAccount);
    let executionClients = null;
    const clients = () => {
      executionClients ??= createHyperliquidExecutionClients({
        apiUrl: hyperliquidApiUrl,
        account: hyperliquidAccount,
        apiWalletPrivateKey: env("HYPERLIQUID_API_WALLET_PRIVATE_KEY"),
        masterWalletPrivateKey: env("HYPERLIQUID_MASTER_WALLET_PRIVATE_KEY"),
      });
      return executionClients;
    };

    const unitSolNotional = inspection.availableUnitSol * inspection.spotMarket.mid;
    let swap = null;
    if (inspection.availableUnitSol > 0 && unitSolNotional >= minimumTradeUsdc) {
      if (dryRun) {
        await recordSwap(runId, "skipped", {
          from_amount: inspection.availableUnitSol,
          to_amount: unitSolNotional,
          price: inspection.spotMarket.mid,
          slippage_bps: slippageBps,
          dry_run: true,
        });
        await logEvent(
          runId,
          "SWAP",
          "skipped",
          "Sell Unit SOL for USDC",
          `Dry run: ${inspection.availableUnitSol.toFixed(6)} USOL would be sold on Hyperliquid spot.`,
          { asset: "USOL", amount: inspection.availableUnitSol },
        );
      } else {
        swap = await sellUnitSolForUsdc({
          exchange: clients().agent,
          market: inspection.spotMarket,
          amountSol: inspection.availableUnitSol,
          slippageBps,
        });
        await recordSwap(runId, "succeeded", {
          from_amount: swap.amountSol,
          to_amount: swap.amountSol * swap.averagePrice,
          price: swap.averagePrice,
          slippage_bps: slippageBps,
          exchange_order_id: swap.orderId,
          hyperliquid_response: swap.raw,
        });
        await logEvent(
          runId,
          "SWAP",
          "succeeded",
          "Sell Unit SOL for USDC",
          `${swap.amountSol.toFixed(6)} USOL sold at an average $${swap.averagePrice.toFixed(4)}.`,
          {
            asset: "USOL",
            amount: swap.amountSol,
            metadata: { exchange_order_id: swap.orderId },
          },
        );
      }
      inspection = await inspectHyperliquid(info, hyperliquidAccount);
    } else {
      await logEvent(
        runId,
        "SWAP",
        "skipped",
        "No executable Unit SOL",
        "No available Unit SOL balance currently meets Hyperliquid's minimum trade notional.",
        {
          asset: "USOL",
          amount: inspection.availableUnitSol,
          metadata: { notional_usdc: unitSolNotional, minimum_trade_usdc: minimumTradeUsdc },
        },
      );
    }

    const availableManagedUsdc = Math.max(
      0,
      inspection.availableSpotUsdc - spotUsdcBuffer,
    );
    const collateralUsdc = Math.min(availableManagedUsdc, maxCollateralUsdc);
    let collateralTransfer = null;
    let longOrder = null;

    if (collateralUsdc >= minimumTradeUsdc && maxCollateralUsdc > 0) {
      if (dryRun) {
        await logEvent(
          runId,
          "PERPS",
          "skipped",
          "Move USDC to perps",
          `Dry run: $${collateralUsdc.toFixed(2)} would move from managed spot USDC to perps.`,
          { asset: "USDC", amount: collateralUsdc },
        );
        await recordOrder(runId, "skipped", {
          collateral_usdc: collateralUsdc,
          notional_usdc: collateralUsdc * leverage * collateralUtilization,
          leverage,
          dry_run: true,
        });
      } else {
        collateralTransfer = await transferSpotUsdcToPerps({
          exchange: clients().master,
          amountUsdc: collateralUsdc,
        });
        await recordTransfer(
          runId,
          "hyperliquid_spot_to_perps",
          "USDC",
          collateralTransfer.amountUsdc,
          "succeeded",
          null,
          {
            from_wallet: hyperliquidAccount,
            to_wallet: hyperliquidAccount,
            hyperliquid_response: collateralTransfer.raw,
          },
        );
        await logEvent(
          runId,
          "PERPS",
          "succeeded",
          "Move USDC to perps",
          `$${collateralTransfer.amountUsdc.toFixed(2)} moved from spot to perps collateral.`,
          { asset: "USDC", amount: collateralTransfer.amountUsdc },
        );

        longOrder = await openSolLong({
          exchange: clients().agent,
          market: inspection.perpMarket,
          collateralUsdc: collateralTransfer.amountUsdc,
          leverage,
          slippageBps,
          collateralUtilization,
        });
        await recordOrder(runId, "succeeded", {
          collateral_usdc: longOrder.collateralUsdc,
          notional_usdc: longOrder.notionalUsdc,
          leverage: longOrder.leverage,
          limit_price: longOrder.limitPrice,
          exchange_order_id: longOrder.orderId,
          amount_sol: longOrder.amountSol,
          average_price: longOrder.averagePrice,
          hyperliquid_response: longOrder.raw,
        });
        await logEvent(
          runId,
          "LONG",
          "succeeded",
          "Add to public SOL long",
          `${longOrder.amountSol.toFixed(2)} SOL added at an average $${longOrder.averagePrice.toFixed(4)}.`,
          {
            asset: "SOL",
            amount: longOrder.amountSol,
            metadata: {
              collateral_usdc: longOrder.collateralUsdc,
              notional_usdc: longOrder.notionalUsdc,
              leverage: longOrder.leverage,
              exchange_order_id: longOrder.orderId,
            },
          },
        );
      }
    } else {
      await logEvent(
        runId,
        "LONG",
        "skipped",
        "No new managed collateral",
        maxCollateralUsdc <= 0
          ? "Set a positive HYPERLIQUID_MAX_COLLATERAL_USDC_PER_RUN before enabling orders."
          : "Available managed spot USDC is below the minimum order threshold.",
        {
          asset: "USDC",
          amount: availableManagedUsdc,
          metadata: { max_collateral_usdc: maxCollateralUsdc },
        },
      );
    }

    const profit = dryRun
      ? null
      : await optionalPost(env("LONGCAT_PROFIT_ENDPOINT"), {
        account: hyperliquidAccount,
        market: "SOL",
        run_id: runId,
      }, env("LONGCAT_PROFIT_API_KEY") ? { Authorization: `Bearer ${env("LONGCAT_PROFIT_API_KEY")}` } : {});
    await logEvent(runId, "PROFIT", dryRun ? "skipped" : profit ? "succeeded" : "pending", "Check realized profit", profit ? "Profit route recorded." : "Profit-taking endpoint not configured.", {
      asset: "USDC",
      amount: profit?.realized_profit_usdc ?? null,
      metadata: { dry_run: dryRun, profit_response: profit },
    });

    const burn = dryRun
      ? null
      : await optionalPost(env("LONGCAT_BUYBACK_BURN_ENDPOINT"), {
        token: env("LONGCAT_TOKEN_ADDRESS", ""),
        run_id: runId,
        profit,
      }, env("LONGCAT_BUYBACK_BURN_API_KEY") ? { Authorization: `Bearer ${env("LONGCAT_BUYBACK_BURN_API_KEY")}` } : {});
    await logEvent(runId, "BURN", dryRun ? "skipped" : burn ? "succeeded" : "pending", "Buy back and burn $LONGCAT", burn ? "Buyback/burn route recorded." : "Buyback/burn endpoint not configured.", {
      asset: "LONGCAT",
      amount: burn?.tokens_burned ?? null,
      tx_hash: burn?.tx_hash ?? burn?.signature ?? null,
      scan_url: solScanUrl(burn?.tx_hash ?? burn?.signature ?? null),
      metadata: { dry_run: dryRun, burn_response: burn },
    });

    inspection = await inspectHyperliquid(info, hyperliquidAccount);
    await recordPosition(runId, inspection);
    await finishRun(runId, dryRun ? "skipped" : "succeeded", null, {
      balance_sol: balanceAfterClaim,
      claimed_sol: claimedSol,
      routeable_sol: routeableSol,
      dry_run: dryRun,
      live_integrations: {
        pump_fun_claim: Boolean(env("PUMP_FUN_CLAIM_ENDPOINT")),
        solana_unit_deposit: Boolean(solDeposit),
        hyperliquid_spot_sale: Boolean(swap),
        hyperliquid_perps_transfer: Boolean(collateralTransfer),
        hyperliquid_sol_long: Boolean(longOrder),
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
  const intervalMinutes = asNumber(
    env("CLAIM_INTERVAL_MINUTES"),
    DEFAULT_INTERVAL_MINUTES,
  );
  if (intervalMinutes < 1 || intervalMinutes > 1_440) {
    throw new Error("CLAIM_INTERVAL_MINUTES must be between 1 and 1440.");
  }
  const intervalMs = intervalMinutes * 60_000;

  if (once) {
    await executeOnce();
    return;
  }

  console.log(`Longcat Railway worker running every ${intervalMs / 60_000} minutes.`);
  let running = false;
  const scheduledRun = async () => {
    if (running) {
      console.warn("Skipping overlapping Longcat worker cycle.");
      return;
    }
    running = true;
    try {
      await executeOnce();
    } catch (error) {
      console.error(error);
    } finally {
      running = false;
    }
  };

  await scheduledRun();
  setInterval(() => {
    void scheduledRun();
  }, intervalMs);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
