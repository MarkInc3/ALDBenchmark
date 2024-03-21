// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Internals{
    function set(
        uint8 l,
        uint8 f,
        uint8 y,
        uint8 r,
        uint8 t,
        uint16 d,
        uint16 c
    ) internal returns (uint s) {
        assembly {
            s := or(or(or(or(or(or(l, shl(0x08, f)), shl(0x10, y)), shl(0x18, r)), shl(0x20, t)), shl(0x30, d)), shl(0x40, c))
        }
    }

    function get(uint config) internal view returns (uint8 l, uint8 f, uint8 y, uint8 r, uint8 t, uint16 d, uint16 c) {
        uint s = config;
        assembly {
            l := shr(0x00, s)
            f := shr(0x08, s)
            y := shr(0x10, s)
            r := shr(0x18, s)
            t := shr(0x20, s)
            d := shr(0x30, s)
            c := shr(0x40, s)
        }
    }
}