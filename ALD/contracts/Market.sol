// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// orderbook
contract Market {
    address nft;

    // market = address(new Market(_base, _quote, _price, t ? address(0) : _nft, _app, address(this)));
    // constructor(address _base, address _quote, uint _price, address _nft, address _app, address _diamond) {
    constructor(address _base, address _quote, uint _price) {
        nft = address(0);
    }
}
