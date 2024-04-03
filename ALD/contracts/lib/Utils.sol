// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { Math } from "./Math.sol";

library Utils {
    using Math for int;
    bytes16 private constant HEX = "0123456789abcdef";

    struct Number {
        bool t;
        int n;
        uint u;
        uint8 d;
        uint8 x;
        bool s;
        bool m;
    }

    function toString(uint v) internal pure returns (string memory) {
        unchecked {
            uint l = Math.log10(v) + 1;
            string memory b = new string(l);
            uint ptr;
            assembly ("memory-safe") {
                ptr := add(b, add(32, l))
            }
            while (true) {
                ptr--;
                assembly ("memory-safe") {
                    mstore8(ptr, byte(mod(v, 10), HEX))
                }
                v /= 10;
                if (v == 0) break;
            }
            return b;
        }
    }

    function toFix(uint n, uint8 d, uint8 x, bool s, bool m) internal pure returns (string memory r) {
        unchecked {
            r = toString(n);
            bytes memory t = bytes(r);
            if (t[0] == "0") return r;
            bytes1 u;
            uint l = t.length;
            uint num;
            uint o;
            if (l > d) {
                num = l - d;
                // l = num > 1 ? num : l;
                if (m) {
                    if (num > 12) {
                        num -= 12;
                        u = "T";
                    } else if (num > 9) {
                        num -= 9;
                        u = "B";
                    } else if (num > 6) {
                        num -= 6;
                        u = "M";
                    }
                    if (num > x) l = num;
                    // l = num + 2;
                }
            } else {
                o = d - l;
            }
            bytes memory v;
            uint i;
            uint c;
            while (i <= l) {
                if (num == i) {
                    if (num == 0) v = abi.encodePacked(v, "0");
                    if (num == i && i == x) break;
                } else if (num > i) {
                    v = abi.encodePacked(v, t[i]);
                    if (s && i + 1 < num && i + 1 >= (num % 3) && (num - (i + 1)) % 3 == 0) v = abi.encodePacked(v, ",");
                } else {
                    if (num + 1 == i) {
                        v = abi.encodePacked(v, ".");
                        c = num == 0 ? 1 : num;
                    }
                    if (o > 0) {
                        while (o != 0) {
                            v = abi.encodePacked(v, "0");
                            o--;
                        }
                    }
                    v = abi.encodePacked(v, t[i - 1]);
                    if (t[i - 1] != "0") c = i;
                    if (
                        (i < l && ((num != 0 && c > num) || (num == 0 && c > 1)) && t[i] == "0") || x <= i + (d > l ? d - l : 0)
                    ) break;
                }
                i++;
            }
            c = i - (c == num && c > 1 ? c - 1 : c);
            if (c > 0)
                assembly ("memory-safe") {
                    mstore(v, sub(mload(v), c))
                }
            r = s && u != "" ? string(abi.encodePacked(v, u)) : string(v);
        }
    }

    function toFix(int n, uint8 d, uint8 x, bool s, bool m) internal pure returns (string memory r) {
        return string.concat(n < 0 ? "-" : "", toFix(uint(n.abs()), d, x, s, m));
    }

    function toFix(Number[] memory __) internal pure returns (string[] memory) {
        string[] memory r = new string[](__.length);
        uint i;
        while (i < __.length) {
            r[i] = __[i].t
                ? toFix(__[i].n, __[i].d, __[i].x, __[i].s, __[i].m)
                : toFix(__[i].u, __[i].d, __[i].x, __[i].s, __[i].m);
            i++;
        }
        return r;
    }

    function toHex(uint v, uint l) internal pure returns (string memory) {
        bytes memory b = new bytes(2 * l);
        for (uint i = b.length; i > 0; i--) {
            b[i - 1] = HEX[v & 0xf];
            v >>= 4;
        }
        return string(b);
    }

    function toHex(address v, uint l) internal pure returns (string memory) {
        bytes memory b = new bytes(2 * l);
        uint160 vv = uint160(v);
        for (uint i = b.length; i > 0; i--) {
            b[i - 1] = HEX[vv & 0xf];
            vv >>= 4;
        }
        return string(abi.encodePacked("0x", b));
    }

    function toHex(bytes32 v, uint l) internal pure returns (string memory) {
        bytes memory b = new bytes(2 * l);
        uint256 vv = uint256(v);
        for (uint i = b.length; i > 0; i--) {
            b[i - 1] = HEX[vv & 0xf];
            vv >>= 4;
        }
        return string(abi.encodePacked("0x", b));
    }

    function color(uint t, uint o) internal pure returns (string memory str) {
        return string(toHex((t >> o), 3));
    }
}
