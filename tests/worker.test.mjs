import assert from "node:assert/strict";
import test from "node:test";

import {
  floorDecimal,
  formatPrice,
  formatSize,
} from "../railway/hyperliquid.mjs";
import { solToLamports } from "../railway/solana.mjs";

test("SOL amounts convert to integer lamports without exceeding the requested amount", () => {
  assert.equal(solToLamports(0.12), 120_000_000n);
  assert.equal(solToLamports(1.2345678919), 1_234_567_891n);
  assert.throws(() => solToLamports(0), /greater than zero/);
});

test("Hyperliquid sizes round down to market lot precision", () => {
  assert.equal(floorDecimal(1.2399, 2), 1.23);
  assert.equal(formatSize(100, 6), "100");
  assert.equal(formatSize(25.279, 2), "25.27");
  assert.throws(() => formatSize(0.001, 2), /below/);
});

test("Hyperliquid prices respect significant-figure and decimal limits", () => {
  assert.equal(formatPrice(76.123456, 4), "76.123");
  assert.equal(formatPrice(0.00123456, 4), "0.0012");
  assert.throws(() => formatPrice(0, 4), /greater than zero/);
});
