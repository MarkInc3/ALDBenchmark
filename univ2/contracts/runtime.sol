// SPDX-License-Identifier: MIT
pragma solidity =0.5.16;

import {UniswapV2Pair} from "./UniswapV2Pair.sol";

contract runtime {
    function aa() public pure returns (bytes32) {
        return keccak256(type(UniswapV2Pair).runtimeCode);
    }
}
