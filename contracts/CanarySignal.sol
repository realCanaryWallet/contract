// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
}

contract CanarySignal {

    address public immutable canaryEOA;
    uint256 public lastPing;
    uint256 public immutable ethThreshold;
    uint256 public immutable erc20Threshold;

    constructor(uint256 _ethThreshold, uint256 _erc20Threshold, address _canaryEOA) {
        ethThreshold = _ethThreshold;
        erc20Threshold = _erc20Threshold;
        canaryEOA = _canaryEOA;
        lastPing = block.timestamp;
    }

    function ping() external {
        // only canaryEOA can ping
        require(msg.sender == canaryEOA, "Not authorized");
        lastPing = block.timestamp;
    }

    function isExpired() external view returns (bool) {
        return block.timestamp - lastPing > 7 days;
    }
}
