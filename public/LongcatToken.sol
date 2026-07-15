// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Longcat fixed-fee ERC20
/// @notice $LONGCAT with a locked 2% creator fee routed to one public mechanism wallet.
/// @dev No owner, blacklist, pause, hidden mint, or mutable tax controls.
contract LongcatToken {
    string public constant name = "Longcat";
    string public constant symbol = "LONGCAT";
    uint8 public constant decimals = 18;

    uint16 public constant FEE_BPS = 200;
    uint16 public constant BPS_DENOMINATOR = 10_000;

    address public immutable feeReceiver;
    uint256 public totalSupply;

    mapping(address account => uint256) public balanceOf;
    mapping(address tokenHolder => mapping(address spender => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed tokenHolder, address indexed spender, uint256 value);
    event FeeCollected(address indexed from, address indexed receiver, uint256 value);

    error ZeroAddress();
    error InsufficientBalance();
    error InsufficientAllowance();

    constructor(uint256 initialSupplyWholeTokens, address initialSupplyReceiver, address feeReceiver_) {
        if (initialSupplyReceiver == address(0) || feeReceiver_ == address(0)) revert ZeroAddress();

        feeReceiver = feeReceiver_;

        uint256 initialSupply = initialSupplyWholeTokens * (10 ** uint256(decimals));
        totalSupply = initialSupply;
        balanceOf[initialSupplyReceiver] = initialSupply;

        emit Transfer(address(0), initialSupplyReceiver, initialSupply);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        if (spender == address(0)) revert ZeroAddress();

        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed < amount) revert InsufficientAllowance();

        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - amount;
            emit Approval(from, msg.sender, allowance[from][msg.sender]);
        }

        _transfer(from, to, amount);
        return true;
    }

    function burn(uint256 amount) external returns (bool) {
        uint256 balance = balanceOf[msg.sender];
        if (balance < amount) revert InsufficientBalance();

        balanceOf[msg.sender] = balance - amount;
        totalSupply -= amount;

        emit Transfer(msg.sender, address(0), amount);
        return true;
    }

    function feeFor(uint256 amount, address from, address to) public view returns (uint256) {
        if (_isFeeExempt(from, to)) return 0;
        return (amount * FEE_BPS) / BPS_DENOMINATOR;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        if (from == address(0) || to == address(0)) revert ZeroAddress();

        uint256 balance = balanceOf[from];
        if (balance < amount) revert InsufficientBalance();

        uint256 fee = feeFor(amount, from, to);
        uint256 received = amount - fee;

        balanceOf[from] = balance - amount;
        balanceOf[to] += received;

        if (fee > 0) {
            balanceOf[feeReceiver] += fee;
            emit Transfer(from, feeReceiver, fee);
            emit FeeCollected(from, feeReceiver, fee);
        }

        emit Transfer(from, to, received);
    }

    function _isFeeExempt(address from, address to) internal view returns (bool) {
        return from == feeReceiver || to == feeReceiver;
    }
}
