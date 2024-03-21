// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Market} from "./Market.sol";
import {Calculator} from "./lib/Calculator.sol";
import {Currency} from "./lib/Currency.sol";

contract Vault {
    using Calculator for *;
    using Currency for *;

    address app;
    address[] tokens;
    address[] keyTokens;
    uint fee;
    uint reward;
    uint divider;
    uint totalWeight;
    mapping(address => uint) tokenId;
    mapping(address => uint) keyTokenId;
    mapping(address => uint) value;
    mapping(address => uint) balance;
    mapping(address => uint) weight;
    mapping(address => uint) requires;
    mapping(address => int) need;
    mapping(address => address[]) vault;
    mapping(address => mapping(address => uint)) id;
    mapping(address => mapping(address => uint)) liquidity;

    constructor() {}

    // 마켓 생성 + 입금
    function create(
        address _base,
        uint _quantity,
        address _quotes,
        uint _amounts
    ) external {
        uint q;
        uint f;
        uint proof;
        uint fees;
        address market;

        // market create
        market = address(
            new Market(_base, _quotes, _amounts.getPrice(_quantity))
        );
        // quote tokrn transfer
        _quotes.transferFrom(msg.sender, address(this), _amounts);
        // base tokrn transfer
        _base.transferFrom(msg.sender, address(this), _quantity);

        setVault(_base, _quotes, true);
        setVault(_quotes, _base, true);
        setToken(_base, true);
        // market.givePermission();

        // 리스팅 정보 저장
        // app.newHistory(
        //     Type.Order(
        //         Type.Category.Listing,
        //         Type.Option.General,
        //         Type.State.Complete,
        //         block.timestamp,
        //         proof.getPrice(_quantity),
        //         _quantity,
        //         proof,
        //         fees,
        //         _base, //issue
        //         app.service(0),
        //         address(this),
        //         msg.sender,
        //         0
        //     )
        // );
    }

    // 출금
    function withdraw(address _base, address _quote) external {
        _base.transfer(msg.sender, _base.balanceOf(address(this)));
        _quote.transfer(msg.sender, _quote.balanceOf(address(this)));
        // $.app.newHistory(
        //     Type.Order(
        //         Type.Category.Withdraw,
        //         Type.Option.General,
        //         Type.State.Complete,
        //         block.timestamp,
        //         _amount.getPrice(q),
        //         _amount,
        //         q,
        //         f,
        //         IApp($.app).service(0),
        //         _token,
        //         address(this),
        //         _spender,
        //         0
        //     )
        // );
    }

    function getReserve(
        address _base,
        address _quote
    ) external view returns (uint, uint) {
        return (
            _base.balanceOf(address(this)),
            _quote.balanceOf(address(this))
        );
    }

    function setToken(address _token, bool _set) internal {
        unchecked {
            if (_set && tokenId[_token] == 0) {
                tokens.push(_token);
                tokenId[_token] = tokens.length;
            } else if (!_set && tokenId[_token] != 0) {
                uint length = tokens.length;
                if (length > 1) {
                    tokenId[tokens[length - 1]] = tokenId[_token];
                    tokens[tokenId[_token] - 1] = tokens[tokens.length - 1];
                }
                tokens.pop();
                tokenId[_token] = 0;
            }
        }
    }

    function setVault(address _base, address _quote, bool _set) internal {
        unchecked {
            if (_set && id[_base][_quote] == 0) {
                vault[_base].push(_quote);
                id[_base][_quote] = vault[_base].length;
            } else if (!_set && id[_base][_quote] != 0) {
                uint length = vault[_base].length;
                if (length > 1) {
                    id[_base][vault[_base][length - 1]] = id[_base][_quote];
                    vault[_base][id[_base][_quote] - 1] = vault[_base][
                        vault[_base].length - 1
                    ];
                }
                vault[_base].pop();
                id[_base][_quote] = 0;
            }
        }
    }
}
