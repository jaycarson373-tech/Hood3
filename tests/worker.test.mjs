import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeShortPositions,
  parseDexs,
} from "../railway/hyperliquid.mjs";

test("Hyperliquid DEX configuration is trimmed and deduplicated", () => {
  assert.deepEqual(parseDexs("xyz, vntl,xyz, cash"), [
    "xyz",
    "vntl",
    "cash",
  ]);
  assert.ok(parseDexs("").includes("xyz"));
});

test("only negative-size Hyperliquid positions enter the public short book", () => {
  const positions = normalizeShortPositions(
    {
      assetPositions: [
        {
          position: {
            coin: "xyz:NVDA",
            szi: "-2",
            positionValue: "360",
            entryPx: "190",
            unrealizedPnl: "20",
            marginUsed: "120",
            liquidationPx: "240",
            leverage: { value: "3" },
          },
        },
        {
          position: {
            coin: "xyz:MSFT",
            szi: "1",
            positionValue: "500",
          },
        },
      ],
    },
    "xyz",
  );

  assert.equal(positions.length, 1);
  assert.equal(positions[0].market, "xyz:NVDA");
  assert.equal(positions[0].side, "short");
  assert.equal(positions[0].notionalUsd, 360);
  assert.equal(positions[0].markPrice, 180);
});
