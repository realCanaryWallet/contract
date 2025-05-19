// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
    function transfer(address, uint256) external returns (bool);
}

interface ICanary {
    function isExpired() external view returns (bool);
}

contract EscapeWallet {
    address public immutable owner;
    address public immutable escapeTo;
    address public canary;
    bool public escaped;

    event EscapeExecuted(address indexed to, uint256 ethAmount);
    event EscapeERC20(address indexed token, uint256 amount);
    event CanaryUpdated(address oldCanary, address newCanary);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier notEscaped() {
        require(!escaped, "Already escaped");
        _;
    }

    constructor(address _owner, address _escapeTo, address _canary) {
        require(_owner != address(0) && _escapeTo != address(0), "Invalid address");
        owner = _owner;
        escapeTo = _escapeTo;
        canary = _canary;
    }

    /// @notice 手动触发逃逸
    function escape() external onlyOwner notEscaped {
        require(ICanary(canary).isExpired(), "Canary not expired");
        escaped = true;

        // Transfer ETH
        uint256 ethBalance = address(this).balance;
        if (ethBalance > 0) {
            (bool sent, ) = escapeTo.call{value: ethBalance}("");
            require(sent, "ETH escape failed");
            emit EscapeExecuted(escapeTo, ethBalance);
        }
    }

    /// @notice 转移指定 ERC20 token
    function escapeERC20(address token) external onlyOwner notEscaped {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No token balance");
        bool success = IERC20(token).transfer(escapeTo, balance);
        require(success, "ERC20 escape failed");
        emit EscapeERC20(token, balance);
    }

    /// @notice 可选：允许变更 Canary 地址（通过 DAO 或链下服务管理）
    function updateCanary(address newCanary) external onlyOwner {
        require(newCanary != address(0), "Zero address");
        emit CanaryUpdated(canary, newCanary);
        canary = newCanary;
    }

    /// 接收 ETH
    receive() external payable {}
}
