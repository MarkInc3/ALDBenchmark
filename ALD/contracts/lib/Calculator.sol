// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

library Calculator {
    function getDigit(uint p) internal pure returns (uint d) {
        unchecked {
            d = 1;
            if (p >= 1e1) {
                assembly {
                    p := div(p, 10)
                }
                if (p < 1e1) d = 2;
                else if (p < 1e2) d = 3;
                else if (p < 1e3) d = 4;
                else if (p < 1e4) d = 5;
                else if (p < 1e5) d = 6;
                else if (p < 1e6) d = 7;
                else if (p < 1e7) d = 8;
                else if (p < 1e8) d = 9;
                else if (p < 1e9) d = 10;
                else if (p < 1e10) d = 11;
                else if (p < 1e11) d = 12;
                else if (p < 1e12) d = 13;
                else if (p < 1e13) d = 14;
                else if (p < 1e14) d = 15;
                else if (p < 1e15) d = 16;
                else if (p < 1e16) d = 17;
                else if (p < 1e17) d = 18;
                else if (p < 1e18) d = 19;
                else if (p < 1e19) d = 20;
                else if (p < 1e20) d = 21;
                else if (p < 1e21) d = 22;
                else if (p < 1e22) d = 23;
                else if (p < 1e23) d = 24;
                else if (p < 1e24) d = 25;
                else if (p < 1e25) d = 26;
                else if (p < 1e26) d = 27;
                else if (p < 1e27) d = 28;
                else if (p < 1e28) d = 29;
                else if (p < 1e29) d = 30;
                else if (p < 1e30) d = 31;
                else if (p < 1e31) d = 32;
                else if (p < 1e32) d = 33;
                else if (p < 1e33) d = 34;
                else if (p < 1e34) d = 35;
                else if (p < 1e35) d = 36;
                else if (p < 1e36) d = 37;
                else if (p < 1e37) d = 38;
                else if (p < 1e38) d = 39;
                else if (p < 1e39) d = 40;
                else if (p < 1e40) d = 41;
                else if (p < 1e41) d = 42;
                else if (p < 1e42) d = 43;
                else if (p < 1e43) d = 44;
                else if (p < 1e44) d = 45;
                else if (p < 1e45) d = 46;
                else if (p < 1e46) d = 47;
                else if (p < 1e47) d = 48;
                else if (p < 1e48) d = 49;
                else if (p < 1e49) d = 50;
                else if (p < 1e50) d = 51;
                else if (p < 1e51) d = 52;
                else if (p < 1e52) d = 53;
                else if (p < 1e53) d = 54;
                else if (p < 1e54) d = 55;
                else if (p < 1e55) d = 56;
                else if (p < 1e56) d = 57;
                else if (p < 1e57) d = 58;
                else if (p < 1e58) d = 59;
                else if (p < 1e59) d = 60;
                else if (p < 1e60) d = 61;
                else if (p < 1e61) d = 62;
                else if (p < 1e62) d = 63;
                else if (p < 1e63) d = 64;
                else if (p < 1e64) d = 65;
                else if (p < 1e65) d = 66;
                else if (p < 1e66) d = 67;
                else if (p < 1e67) d = 68;
                else if (p < 1e68) d = 69;
                else if (p < 1e69) d = 70;
                else if (p < 1e70) d = 71;
                else if (p < 1e71) d = 72;
                else if (p < 1e72) d = 73;
                else if (p < 1e73) d = 74;
                else if (p < 1e74) d = 75;
                else if (p < 1e75) d = 76;
                else if (p < 1e76) d = 77;
                else {
                    p /= 1e77;
                    d = 78;
                    while (p != 0) {
                        p /= 10;
                        d++;
                    }
                }
            }
        }
    }

    function getTick(uint p) internal pure returns (uint t) {
        t = 10 ** (getDigit(p) > 4 ? getDigit(p) - 4 : getDigit(p));
    }

    function floor(uint p) internal pure returns (uint r) {
        unchecked {
            r = getTick(p);
            r = p < r ? 0 : r < p ? (p / r) * r : r;
        }
    }

    function perTickDown(
        uint l,
        uint p,
        uint t,
        uint i
    ) internal pure returns (uint) {
        unchecked {
            int r = int((p / t) + i);
            int s = (-int(int(l * 1e18) / r) + int(p * 1e18)) / int(p / 2);
            s = s > 1e18 ? int(1e18) : s < -1e18 ? -1e18 : s;

            return
                uint(
                    (((int(l) * ((r * s) - (4 * int(i) * s))) / (r ** 2)) +
                        ((3 * (int(l) * 1e18)) / r)) / (3e18 - s)
                );
        }
    }

    function perTickUp(
        uint l,
        uint p,
        uint t,
        uint i
    ) internal pure returns (uint) {
        unchecked {
            int r = int((p / t) - i);
            int s = (-int(int(l * 1e18) / r) + int(p * 1e18)) / int(p / 2);
            s = s > 1e18 ? int(1e18) : s < -1e18 ? -1e18 : s;

            return
                uint(
                    (((int(l) * ((r * s) - (4 * int(i) * s))) / (r ** 2)) +
                        ((3 * (int(l) * 1e18)) / r)) / (3e18 - s)
                );
        }
    }

    function getMargin(uint s, uint l) internal pure returns (uint) {
        unchecked {
            return s < l ? 0 : s - l;
        }
    }

    function getMargin(
        uint s,
        uint l,
        uint p,
        bool t,
        bool d
    ) internal pure returns (uint m) {
        unchecked {
            m = getMargin(s, l);
            if (!t) convert(m, p, d);
        }
    }

    function getMultiplier(
        uint s,
        uint l,
        uint16 d
    ) internal pure returns (uint16) {
        unchecked {
            return
                s == 0 ? 0 : l == 0 ? d : uint16(s > l ? (s * d) / (s - l) : s);
        }
    }

    function getThreshold(
        uint p,
        uint a,
        uint l,
        uint t,
        bool c
    ) internal pure returns (uint) {
        unchecked {
            l = ratio(a - l, t, 100);
            p = ratio(c ? a - l : a + l, p, a);
            p = p == 0 ? 1 : floor(p);
            if (c) {
                return p + getTick(p);
            } else {
                return p - getTick(p);
            }
        }
    }

    function getPrice(uint a, uint q) internal pure returns (uint r) {
        unchecked {
            if (a > 0 && q > 0) {
                r = a > q ? (a * 1e18) / q : (q * 1e18) / a;
            }
        }
    }

    function getFees(uint q, uint f, uint d) internal pure returns (uint r) {
        unchecked {
            r = (q * f) / d;
            if (r < 1) r = 1;
        }
    }

    function toAmount(uint q, uint p) internal pure returns (uint) {
        unchecked {
            return q > 0 ? (q * p) / 1e18 : 0;
        }
    }

    function toQuantity(uint a, uint p) internal pure returns (uint) {
        unchecked {
            return a > 0 ? (1e18 * a) / p : 0;
        }
    }

    function convert(uint a, uint p, bool t) internal pure returns (uint) {
        unchecked {
            return t ? toQuantity(a, p) : toAmount(a, p);
        }
    }

    function ratio(uint n, uint v, uint t) internal pure returns (uint) {
        unchecked {
            return n == 0 || v == 0 || t == 0 ? 0 : (n * v) / t;
        }
    }

    function format(uint n, uint d) internal pure returns (uint r) {
        unchecked {
            r = 18 - d;
            r = r > 0 ? n / (10 ** (18 - d)) : n;
        }
    }

    function parse(uint n, uint d) internal pure returns (uint r) {
        unchecked {
            r = 18 - d;
            r = r > 0 ? n * (10 ** d) : n;
        }
    }
}
