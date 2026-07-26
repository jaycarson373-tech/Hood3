import assert from "node:assert/strict";
import test from "node:test";

import { floorToStep } from "../railway/aster.mjs";
import { solToLamports } from "../railway/solana.mjs";

test("SOL amounts convert to integer lamports without exceeding the requested amount", () => {
  assert.equal(solToLamports(0.12), 120_000_000n);
  assert.equal(solToLamports(1.2345678919), 1_234_567_891n);
  assert.throws(() => solToLamports(0), /greater than zero/);
});

test("Aster quantities round down to market lot precision", () => {
  assert.equal(floorToStep(1.2399, "0.01"), 1.23);
  assert.equal(floorToStep(100, "0.001"), 100);
  assert.equal(floorToStep(25.279, "0.01"), 25.27);
  assert.throws(() => floorToStep(0, "0.01"), /greater than zero/);
  assert.throws(() => floorToStep(1, "0"), /step size is invalid/);
});
