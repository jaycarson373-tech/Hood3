import {
  buyAnsemSpot,
  createHyperliquidExecutionClients,
  createHyperliquidPublicClient,
  inspectHyperliquid,
  sellUnitSolForUsdc,
  waitForUnitSolCredit,
} from "./railway/hyperliquid.mjs";
import { transferSolToHyperliquid } from "./railway/solana.mjs";

const DEFAULT_INTERVAL_MINUTES = 15;
const LAMPORTS_PER_SOL = 1_000_000_000;

const required = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SOLANA_RPC_URL",
  "BBL_SOL_WALLET_ADDRESS",
  "BBL_TOKEN_ADDRESS",
  "BBL_HYPERLIQUID_SOL_DEPOSIT_ADDRESS",
  "BBL_HYPERLIQUID_ACCOUNT",
];
const liveRequired = [
  "BBL_SOL_WALLET_PRIVATE_KEY",
  "HYPERLIQUID_API_WALLET_PRIVATE_KEY",
  "BBL_MAX_SPOT_USDC_PER_RUN",
  "HYPERLIQUID_MAX_SLIPPAGE_BPS",
];
const legacyVariables = [
  "ROBINHOOD_RPC_URL",
  "BBL_ETH_GAS_BUFFER_ETH",
  "BBL_ETH_WALLET_ADDRESS",
  "BBL_ETH_WALLET_PRIVATE_KEY",
  "BBL_HYPERLIQUID_PERP_ACCOUNT",
  "HYPERLIQUID_MASTER_WALLET_PRIVATE_KEY",
  "HYPERLIQUID_LONG_LEVERAGE",
  "HYPERLIQUID_MAX_COLLATERAL_USDC_PER_RUN",
];

function env(name, fallback = "") {
  return process.env[name] || fallback;
}

function requireEnv() {
  const missing = required.filter((name) => !env(name));
  if (missing.length) {
    throw new Error(`Missing required env: ${missing.join(", ")}`);
  }

  if (env("BBL_SOL_WALLET_ADDRESS") === env("BBL_TOKEN_ADDRESS")) {
    throw new Error(
      "BBL_SOL_WALLET_ADDRESS is set to the token mint. Use the fee wallet public key instead.",
    );
  }

  if (env("BBL_HYPERLIQUID_SOL_DEPOSIT_ADDRESS").startsWith("0x")) {
    throw new Error(
      "BBL_HYPERLIQUID_SOL_DEPOSIT_ADDRESS must be the unique Solana deposit address from Hyperliquid, not the 0x account.",
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
    if (!asBool(env("BBL_ANSEM_SPOT_EXECUTION_CONFIRMED", "false"))) {
      throw new Error(
        "Set BBL_ANSEM_SPOT_EXECUTION_CONFIRMED=true only after approving the dedicated ANSEM spot account and limits.",
      );
    }
    const presentLegacy = legacyVariables.filter((name) => env(name));
    if (presentLegacy.length) {
      throw new Error(`Remove legacy non-Solana envs before live mode: ${presentLegacy.join(", ")}`);
    }

    const maxSpotUsdc = asNumber(env("BBL_MAX_SPOT_USDC_PER_RUN"), 0);
    const slippageBps = asNumber(env("HYPERLIQUID_MAX_SLIPPAGE_BPS"), 0);
    const feeBuffer = asNumber(env("BBL_SOL_FEE_BUFFER_SOL"), 0);
    if (maxSpotUsdc <= 0) {
      throw new Error("BBL_MAX_SPOT_USDC_PER_RUN must be greater than zero.");
    }
    if (slippageBps < 1 || slippageBps > 300) {
      throw new Error("HYPERLIQUID_MAX_SLIPPAGE_BPS must be between 1 and 300.");
    }
    if (feeBuffer < 0.05) {
      throw new Error("BBL_SOL_FEE_BUFFER_SOL must keep at least 0.05 SOL.");
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
  const rows = await supabase("bbl_automation_runs", {
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

async function logEvent(runId, stage, status, action, message, extra = {}) {
  await supabase("bbl_terminal_events", {
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
  await supabase("bbl_claims", {
    method: "POST",
    body: JSON.stringify({
      run_id: runId,
      source: "creator_fees",
      token_symbol: "SOL",
      amount,
      from_wallet: env("BBL_SOL_WALLET_ADDRESS") || null,
      to_wallet: env("BBL_SOL_WALLET_ADDRESS") || null,
      tx_hash: txHash,
      scan_url: solScanUrl(txHash),
      status,
      metadata,
      claimed_at: status === "succeeded" ? new Date().toISOString() : null,
    }),
  });
}

async function recordTransfer(runId, type, asset, amount, status, txHash = null, metadata = {}) {
  await supabase("bbl_transfers", {
    method: "POST",
    body: JSON.stringify({
      run_id: runId,
      transfer_type: type,
      from_wallet: metadata.from_wallet ?? env("BBL_SOL_WALLET_ADDRESS") ?? null,
      to_wallet: metadata.to_wallet ?? env("BBL_HYPERLIQUID_SOL_DEPOSIT_ADDRESS") ?? null,
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
  await supabase("bbl_swaps", {
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
  await supabase("bbl_long_orders", {
    method: "POST",
    body: JSON.stringify({
      run_id: runId,
      hyperliquid_account: env("BBL_HYPERLIQUID_ACCOUNT") || null,
      market: "ANSEM",
      side: "long",
      order_type: "spot_ioc",
      collateral_usdc: metadata.amount_usdc ?? 0,
      notional_usdc: metadata.notional_usdc ?? 0,
      leverage: 1,
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
  const size = Number(inspection.availableUnitAnsem ?? 0);
  const markPrice = Number(inspection.ansemSpotMarket.mid ?? 0);

  await supabase("bbl_positions", {
    method: "POST",
    body: JSON.stringify({
      run_id: runId,
      hyperliquid_account: env("BBL_HYPERLIQUID_ACCOUNT"),
      market: "ANSEM",
      side: size > 0 ? "long" : "flat",
      size,
      notional_usdc: size * markPrice,
      entry_price: null,
      mark_price: markPrice,
      leverage: 1,
      unrealized_pnl_usdc: 0,
      margin_used_usdc: 0,
      metadata: {
        source: "hyperliquid_spot_public_api",
        asset: "UANSEM",
        note: "Spot balance has no liquidation price. Cost basis is only published when execution receipts provide it.",
      },
      recorded_at: new Date().toISOString(),
    }),
  });
}

async function executeOnce() {
  requireEnv();

  const dryRun = asBool(env("DRY_RUN", "true"));
  const solWallet = env("BBL_SOL_WALLET_ADDRESS");
  const hyperliquidAccount = env("BBL_HYPERLIQUID_ACCOUNT");
  const hyperliquidDepositAddress = env("BBL_HYPERLIQUID_SOL_DEPOSIT_ADDRESS");
  const bufferSol = asNumber(env("BBL_SOL_FEE_BUFFER_SOL"), 0.05);
  const minimumUnitDepositSol = asNumber(env("BBL_MIN_ROUTE_SOL"), 0.12);
  const minimumTradeUsdc = asNumber(env("HYPERLIQUID_MIN_TRADE_USDC"), 10);
  const maxSpotUsdc = asNumber(env("BBL_MAX_SPOT_USDC_PER_RUN"), 0);
  const spotUsdcBuffer = asNumber(env("HYPERLIQUID_SPOT_USDC_BUFFER"), 1);
  const slippageBps = asNumber(env("HYPERLIQUID_MAX_SLIPPAGE_BPS"), 100);
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
      "15-minute BBL worker started",
      dryRun ? "Dry-run mode. No funds will move." : "Live Solana execution mode.",
    );

    const info = createHyperliquidPublicClient(hyperliquidApiUrl);
    let inspection = await inspectHyperliquid(info, hyperliquidAccount);
    const minimumRouteByNotional =
      (minimumTradeUsdc / inspection.solSpotMarket.mid) * 1.02;
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
        token: env("BBL_TOKEN_ADDRESS", ""),
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
        apiWalletPrivateKey: env("HYPERLIQUID_API_WALLET_PRIVATE_KEY"),
      });
      return executionClients;
    };

    const unitSolNotional = inspection.availableUnitSol * inspection.solSpotMarket.mid;
    let swap = null;
    if (inspection.availableUnitSol > 0 && unitSolNotional >= minimumTradeUsdc) {
      if (dryRun) {
        await recordSwap(runId, "skipped", {
          from_amount: inspection.availableUnitSol,
          to_amount: unitSolNotional,
          price: inspection.solSpotMarket.mid,
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
          market: inspection.solSpotMarket,
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
    const spotBudgetUsdc = Math.min(availableManagedUsdc, maxSpotUsdc);
    let ansemOrder = null;

    if (spotBudgetUsdc >= minimumTradeUsdc && maxSpotUsdc > 0) {
      if (dryRun) {
        await logEvent(
          runId,
          "LONG",
          "skipped",
          "Buy ANSEM spot",
          `Dry run: $${spotBudgetUsdc.toFixed(2)} of managed USDC would buy ANSEM spot.`,
          { asset: "USDC", amount: spotBudgetUsdc },
        );
        await recordOrder(runId, "skipped", {
          amount_usdc: spotBudgetUsdc,
          notional_usdc: spotBudgetUsdc,
          dry_run: true,
        });
      } else {
        ansemOrder = await buyAnsemSpot({
          exchange: clients().agent,
          market: inspection.ansemSpotMarket,
          amountUsdc: spotBudgetUsdc,
          slippageBps,
        });
        await recordOrder(runId, "succeeded", {
          amount_usdc: ansemOrder.amountUsdc,
          notional_usdc: ansemOrder.amountUsdc,
          limit_price: ansemOrder.limitPrice,
          exchange_order_id: ansemOrder.orderId,
          amount_ansem: ansemOrder.amountAnsem,
          average_price: ansemOrder.averagePrice,
          hyperliquid_response: ansemOrder.raw,
        });
        await logEvent(
          runId,
          "LONG",
          "succeeded",
          "Add to public ANSEM spot position",
          `${ansemOrder.amountAnsem.toFixed(0)} ANSEM bought at an average $${ansemOrder.averagePrice.toFixed(6)}.`,
          {
            asset: "ANSEM",
            amount: ansemOrder.amountAnsem,
            metadata: {
              amount_usdc: ansemOrder.amountUsdc,
              exchange_order_id: ansemOrder.orderId,
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
        maxSpotUsdc <= 0
          ? "Set a positive BBL_MAX_SPOT_USDC_PER_RUN before enabling ANSEM spot orders."
          : "Available managed spot USDC is below the minimum order threshold.",
        {
          asset: "USDC",
          amount: availableManagedUsdc,
          metadata: { max_spot_usdc_per_run: maxSpotUsdc },
        },
      );
    }

    const profit = dryRun
      ? null
      : await optionalPost(env("BBL_PROFIT_ENDPOINT"), {
        account: hyperliquidAccount,
        market: "ANSEM",
        run_id: runId,
      }, env("BBL_PROFIT_API_KEY") ? { Authorization: `Bearer ${env("BBL_PROFIT_API_KEY")}` } : {});
    await logEvent(runId, "PROFIT", dryRun ? "skipped" : profit ? "succeeded" : "pending", "Check realized profit", profit ? "Profit route recorded." : "Profit-taking endpoint not configured.", {
      asset: "USDC",
      amount: profit?.realized_profit_usdc ?? null,
      metadata: { dry_run: dryRun, profit_response: profit },
    });

    const burn = dryRun
      ? null
      : await optionalPost(env("BBL_BUYBACK_BURN_ENDPOINT"), {
        token: env("BBL_TOKEN_ADDRESS", ""),
        run_id: runId,
        profit,
      }, env("BBL_BUYBACK_BURN_API_KEY") ? { Authorization: `Bearer ${env("BBL_BUYBACK_BURN_API_KEY")}` } : {});
    await logEvent(runId, "BURN", dryRun ? "skipped" : burn ? "succeeded" : "pending", "Buy back and burn $BBL", burn ? "Buyback/burn route recorded." : "Buyback/burn endpoint not configured.", {
      asset: "BBL",
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
        hyperliquid_ansem_spot_buy: Boolean(ansemOrder),
        profit: Boolean(env("BBL_PROFIT_ENDPOINT")),
        buyback_burn: Boolean(env("BBL_BUYBACK_BURN_ENDPOINT")),
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

  console.log(`BBL Railway worker running every ${intervalMs / 60_000} minutes.`);
  let running = false;
  const scheduledRun = async () => {
    if (running) {
      console.warn("Skipping overlapping BBL worker cycle.");
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
