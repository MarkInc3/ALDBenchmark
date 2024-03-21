// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.24;

import { Type } from "../types/Type.sol";

interface ICredit is Type {
    // credit
   function newHistory(Type.Order memory _order) external  returns (bytes32);
}
