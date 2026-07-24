import {
  address,
  createSolanaClient,
  createTransaction,
} from "gill";
import {
  loadKeypairSignerFromEnvironment,
  loadKeypairSignerFromEnvironmentBase58,
} from "gill/node";
import { getTransferSolInstruction } from "gill/programs";

const LAMPORTS_PER_SOL = 1_000_000_000;

export function solToLamports(amountSol) {
  if (!Number.isFinite(amountSol) || amountSol <= 0) {
    throw new Error("SOL transfer amount must be greater than zero.");
  }
  return BigInt(Math.floor(amountSol * LAMPORTS_PER_SOL));
}

async function loadSolanaSigner() {
  const secret = process.env.LONGCAT_SOL_WALLET_PRIVATE_KEY?.trim();
  if (!secret) {
    throw new Error("Missing required env: LONGCAT_SOL_WALLET_PRIVATE_KEY");
  }

  return secret.startsWith("[")
    ? loadKeypairSignerFromEnvironment("LONGCAT_SOL_WALLET_PRIVATE_KEY")
    : loadKeypairSignerFromEnvironmentBase58("LONGCAT_SOL_WALLET_PRIVATE_KEY");
}

export async function transferSolToHyperliquid({
  rpcUrl,
  expectedSource,
  destination,
  amountSol,
  dryRun,
}) {
  const amountLamports = solToLamports(amountSol);

  if (dryRun) {
    return {
      signature: null,
      source: expectedSource,
      destination,
      amountSol,
      simulated: false,
      dryRun: true,
    };
  }

  const signer = await loadSolanaSigner();
  if (signer.address !== expectedSource) {
    throw new Error(
      `LONGCAT_SOL_WALLET_ADDRESS does not match the configured Solana private key (derived ${signer.address}).`,
    );
  }

  const client = createSolanaClient({ urlOrMoniker: rpcUrl });
  const transaction = createTransaction({
    version: "legacy",
    feePayer: signer,
    instructions: [
      getTransferSolInstruction({
        source: signer,
        destination: address(destination),
        amount: amountLamports,
      }),
    ],
  });

  const simulation = await client.simulateTransaction(transaction, {
    commitment: "confirmed",
  });
  if (simulation.value.err) {
    throw new Error(`Solana deposit simulation failed: ${JSON.stringify(simulation.value.err)}`);
  }

  const signature = await client.sendAndConfirmTransaction(transaction, {
    commitment: "confirmed",
    maxRetries: 5n,
    skipPreflight: false,
  });

  return {
    signature,
    source: signer.address,
    destination,
    amountSol,
    simulated: true,
    dryRun: false,
  };
}
