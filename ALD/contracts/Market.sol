// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Type } from "./types/Type.sol";
import { Error } from "./types/Error.sol";
import { IVault } from "./interfaces/IVault.sol";
import { ICredit } from "./interfaces/ICredit.sol";
import { Internals } from "./lib/Internals.sol";
import { Currency } from "./lib/Currency.sol";
import { Calculator } from "./lib/Calculator.sol";

// orderbook
contract Market {
    bool process;
    uint tick;
    uint price;
    uint config;
    address credit;
    address vault;
    address app;
    address nft;
    address base;
    address quote;
    mapping(uint => uint) time;
    mapping(uint => Type.Position) orders;
    mapping(uint => Type.Position) queues;
    mapping(uint => Type.Removes) removes;
    mapping(bytes32 => uint) queue;
    mapping(bytes32 => address) lender;
    /* nft storage */
    uint total;
    uint[] burns;
    string name;
    string symbol;
    mapping(uint => address) approval;
    mapping(uint => bytes32) key;
    mapping(bytes32 => uint) index;
    mapping(address => uint[]) tokens;
    mapping(address => mapping(address => bool)) approvals;

    using Currency for *;
    using Calculator for *;

    // market = address(new Market(_base, _quote, _price, t ? address(0) : _nft, _app, address(this)));
    constructor(address _base, address _quote, uint _price, address _vault, address _credit) {
        nft = address(0);
        vault = _vault;
        credit = _credit;
        // init base

        // IApp app = IApp(_app);
        // $.app = payable(_app);
        base = _base;
        quote = _quote;

        // app.service(0).approve(vault, type(uint).max);
        _base.approve(vault, type(uint).max);
        _quote.approve(vault, type(uint).max);

        price = _price.floor();
        tick = _price.getTick();
        // config = Internals.set(0, 1e2, 3, 3, 85, 1e4, 1e3);
    }

    // 시장가 주문
    function order(address _sell, uint _amount) public payable {
        _order(Type.Option.Market, msg.sender, _sell, _amount, price);
    }

    function _order(Type.Option _option, address _owner, address _sell, uint _amount, uint _price) internal {
        unchecked {
            bool t = _sell == quote;
            Type.Category c = t ? Type.Category.Buy : Type.Category.Sell;

            if ((_option == Type.Option.Market) || (t ? _price >= price : _price <= price)) {
                execute(t, 0, _owner, c, _option, _sell, _price, _amount, 0);
            }
        }
    }

    function execute(
        bool _t,
        bytes32 _k,
        address _w,
        Type.Category _c,
        Type.Option _o,
        address _s,
        uint _p,
        uint _a,
        uint _m
    ) internal returns (uint p, uint a, uint va, uint q, uint bq, uint vq) {
        unchecked {
            (uint p, uint a, uint va, uint q, uint bq, uint vq) = _t ? matchBid(_o, _p, _a) : matchAsk(_o, _p, _a);
            fill(_t, _k, _w, _c, _o, _s, p, _a - a, a, va, q, bq, vq, _m);
        }
    }

    // 매칭 bid
    function matchBid(Type.Option _o, uint _p, uint _a) internal returns (uint p, uint a, uint va, uint q, uint bq, uint vq) {
        unchecked {
            a = _a;
            p = price;
            uint i;
            uint tl;
            uint bb;
            uint vb;
            uint t = tick;

            // 사용할수있는 유동성 총 계산 , 멀티 페어 X, quote 발란스
            uint l = IVault(vault).getLiquidity(quote, base);
            // if (p < t) revert ERROR.LOW_PRICE(p);

            while (true) {
                bb = orders[p].ask;
                tl = queues[p].ask + removes[p].ask.amount;
                bb = (bb > tl ? bb - tl : 0);

                if (bb > 0) {
                    tl = bb.convert(p, false);
                    if (a < tl) {
                        a = a.convert(p, true);
                        queues[p].ask += a;
                        bq += a;
                        a = 0;
                        break;
                    } else {
                        queues[p].ask += bb;
                        bq += bb;
                        a -= tl;
                    }
                }
                vb = (l - vb).perTickUp(p, t, i);
                if (vq + vb >= l) break;
                if (vb > 0) {
                    tl = vb.convert(p, false);
                    if (a < tl) {
                        vq += a.convert(p, true);
                        va += a;
                        a = 0;
                        break;
                    } else {
                        vq += vb;
                        va += tl;
                        a -= tl;
                    }
                }
                if (time[p] != 0) time[p] = 0;
                if ((gasleft() < 300000) || (_o == Type.Option.Limit && _p == p)) break;
                t = p.getTick();
                if (p <= t) break;
                p += t;
                ++i;
            }
            tick = t;
            price = p;
            q = bq + vq;
        }
    }

    // 매칭 ask
    function matchAsk(Type.Option _o, uint _p, uint _a) internal returns (uint p, uint a, uint va, uint q, uint bq, uint vq) {
        unchecked {
            a = _a;
            p = price;

            uint i;
            uint tl;
            uint bb;
            uint vb;
            uint t = tick;

            // base 발란스
            uint l = IVault(vault).getLiquidity(base, quote);
            // if (p < t) revert ERROR.LOW_PRICE(p);

            while (true) {
                bb = orders[p].bid;
                tl = queues[p].bid + removes[p].bid.amount;
                bb = (bb > tl ? bb - tl : 0);
                if (bb > 0) {
                    tl = bb.convert(p, true);
                    if (a < tl) {
                        a = a.convert(p, false);
                        queues[p].bid += a;
                        bq += a;
                        a = 0;
                        break;
                    } else {
                        queues[p].bid += bb;
                        bq += bb;
                        a -= tl;
                    }
                }
                vb = (l - vb).perTickDown(p, t, i);
                if (vq + vb >= l) break;
                if (vb > 0) {
                    tl = vb.convert(p, true);
                    if (a < tl) {
                        vq += a.convert(p, false);
                        va += a;
                        a = 0;
                        break;
                    } else {
                        vq += vb;
                        va += tl;
                        a -= tl;
                    }
                }
                if (time[p] != 0) time[p] = 0;
                if ((gasleft() < 300000) || (_o == Type.Option.Limit && _p == p)) break;
                t = p.getTick();
                if (p <= t) break;
                p -= t;

                ++i;
            }
            tick = t;
            price = p;
            q = bq + vq;
        }
    }

    // 정산
    function fill(
        bool _t,
        bytes32 _k,
        address _w,
        Type.Category _c,
        Type.Option _o,
        address _s,
        uint _p,
        uint _a,
        uint a,
        uint _va,
        uint _q,
        uint _bq,
        uint _vq,
        uint _l
    ) internal {
        unchecked {
            // IApp app = IApp($.app);
            IVault v = IVault(vault);
            (, uint8 f, uint8 y, uint8 r, uint8 h, uint16 d, ) = Internals.get(config);

            // if (_q < (d / f)) revert ERROR.LOW_AMOUNT(_q.convert(_p, _t));
            if (_q > 0) {
                bool c = (_c == Type.Category.Long) || (_c == Type.Category.Short);
                bool t = (_c == Type.Category.Long && _s == base) || (_c == Type.Category.Short && _s == quote);
                Type.Order memory o;
                if (_k == 0) {
                    // 영수증 발행
                    o = Type.Order(
                        _c,
                        _o,
                        !c ? Type.State.Complete : Type.State.Open,
                        block.timestamp,
                        t ? _p : _q.getPrice(_a),
                        _a,
                        _q,
                        0, // _q.getFees(f, d), // fee zero
                        _s, // _type ? $.quote : $.base,
                        t ? _s : _t ? base : quote, // _type ? $.base : $.quote,
                        address(this),
                        _w,
                        0
                    );

                    if (_a == 0) revert Error.LOW_AMOUNT(_a);
                    o.pay.transferFrom(o.owner, address(this), _a);

                    if (_va > 0) v.collect(address(this), o.pay, _va, _t, o.item, o.price);

                    bytes32 _k = ICredit(credit).newHistory(o);
                }
                if (o.state == Type.State.Complete || o.state == Type.State.Close) {
                    if (_vq > 0) {
                        if (_bq > 0) o.item.transfer(vault, _bq);
                        v.remit(o.owner, o.item, o.quantity, _t, o.pay, o.price);
                    } else {
                        // if (c) { // position
                        //     // add interest rate later
                        //     o.pay.transfer($.lender[o.key], _l);
                        //     o.item.transfer(o.owner, o.quantity - o.fees - _l);
                        // } else {
                        //     o.item.transfer(o.owner, o.quantity - o.fees);
                        // }
                    }
                }
            }
        }
    }
}
