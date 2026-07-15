# LONGCAT Contract

`LongcatToken.sol` is a minimal fixed-fee ERC-20 for an EVM launch.

## Launch Settings

- Name: `Longcat`
- Symbol: `LONGCAT`
- Decimals: `18`
- Creator fee: `2%`
- Fee receiver: the public Longcat mechanism wallet
- Mutability: fee is fixed, receiver is immutable, no owner controls

## Deploy Notes

Constructor:

```text
LongcatToken(uint256 initialSupplyWholeTokens, address initialSupplyReceiver, address feeReceiver)
```

Example for a 1B token supply:

```text
initialSupplyWholeTokens = 1000000000
initialSupplyReceiver = <launch/liquidity wallet>
feeReceiver = <public Longcat mechanism wallet>
```

The contract only routes the 2% fee to `feeReceiver`. It does not automatically swap tokens, enter Cashcat perps, or burn tokens. Those actions should remain in the audited server-side automation/operations layer and be published as terminal receipts.

If Flap deploys its own generated token contract, use the same public settings there instead: `2%` creator fee, no extra hidden taxes, and the public mechanism wallet as the fee receiver.

Do not deploy mainnet value through this contract until it has been reviewed and tested for the exact launch venue, router, liquidity flow, and chain.
