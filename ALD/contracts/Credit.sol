// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import { Type } from "./types/Type.sol";

contract Credit {
        //credit
        mapping(address => mapping(address => bytes32[])) keys;
        mapping(address => mapping(bytes32 => Type.OrderPack)) history;

        //address history;
        mapping(address => Type.Profile) user;        
        mapping(address => string) app;        
        mapping(address => address[]) apps;        
        mapping(address => mapping(address => int)) point;        
        mapping(address => mapping(address => int)) score;
        mapping(address => mapping(address => bool)) ban;

        constructor() {}

        function newHistory(Type.Order memory _order) public virtual returns (bytes32) {
            return push(_order);
        }

        function push(Type.Order memory _order) internal returns (bytes32 _key) {
            unchecked {
                _key = keygen(_order.owner, keys[msg.sender][_order.owner].length);
                _order.key = _key;
                history[msg.sender][_key] = pack(_order);
                pushKey(_order.owner, _key);
            }
        }

       function pack(Type.Order memory o) internal pure returns (Type.OrderPack memory) {
            unchecked {
                return
                    Type.OrderPack(
                        pack(Type.OrderInfo(o.category, o.option, o.state, o.time)),
                        o.price,
                        o.amount,
                        o.quantity,
                        o.fees,
                        o.pay,
                        o.item,
                        o.market,
                        o.owner,
                        o.key
                    );
            }
        }
 
        function pack(Type.OrderInfo memory i) internal pure returns (uint) {
            return (uint(uint8(i.state)) << 80) | (uint(uint8(i.option)) << 72) | (uint(uint8(i.category)) << 64) | uint(i.time);
        }

        function keygen(address o, uint i) internal view returns (bytes32) {
            return keccak256(abi.encodePacked(o, block.timestamp, i));
        }

        function pushKey(address _owner, bytes32 _key) internal {
            assembly {
                mstore(0x00, caller())
                mstore(0x20, 0)
                let outerSlot := keccak256(0x00, 0x40)
                mstore(0x00, _owner)
                mstore(0x20, outerSlot)
                let innerSlot := keccak256(0x00, 0x40)

                let size := sload(innerSlot)
                mstore(0x00, innerSlot)
                let dataSlot := keccak256(0x00, 0x20)

                sstore(add(dataSlot, size), _key)
                sstore(innerSlot, add(size, 1))
            }
        }

        // function popKey(address _owner, bytes32 _key) internal {
        //     bytes32[] memory keys = keys[msg.sender][_owner];
        //     assembly {
        //         function findIndex(key, data, size) -> index {
        //             for {
        //                 let i := 0
        //             } lt(i, size) {
        //                 i := add(i, 1)
        //             } {
        //                 let x := mload(add(data, mul(add(i, 1), 0x20)))
        //                 if eq(key, x) {
        //                     index := i
        //                     break
        //                 }
        //                 index := size
        //             }
        //         }
        //         let size := mload(keys)
        //         let idx := findIndex(_key, keys, size)
        //         if eq(idx, size) {
        //             revert(0x20, size)
        //         }
        //         mstore(0x00, caller())
        //         mstore(0x20, slot)
        //         let outerSlot := keccak256(0x00, 0x40)
        //         mstore(0x00, _owner)
        //         mstore(0x20, outerSlot)
        //         let innerSlot := keccak256(0x00, 0x40)

        //         switch eq(sub(size, 1), idx)
        //         case 0 {
        //             // index < size
        //             let last := mload(add(keys, mul(size, 0x20))) // last item to replace
        //             mstore(0x00, innerSlot)
        //             let dataSlot := keccak256(0x00, 0x20)
        //             sstore(add(dataSlot, idx), last)
        //         }
        //         default {
        //             // last index
        //             // not need to do, just decrease length
        //         }
        //         sstore(innerSlot, sub(size, 1))
        //     }
        // }
}



