// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockBTC is ERC20 {
    constructor() ERC20("MockBTC", "BTC") {
        // _mint(msg.sender, type(uint224).max);
    }

    function faucet(address to, uint _amount) external {
        _mint(to, _amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
}
