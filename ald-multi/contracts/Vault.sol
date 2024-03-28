// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Market } from "./Market.sol";
import { Calculator } from "./lib/Calculator.sol";
import { Currency } from "./lib/Currency.sol";
import { ICredit } from './interfaces/ICredit.sol';
import { Type } from './types/Type.sol';
import 'hardhat/console.sol';

contract Vault {
    using Calculator for *;
    using Currency for *;

    address app;
    address credit;
    address market;
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

    using Currency for *;
    using Calculator for *;

    constructor(address _credit) {
        credit = _credit;
    }

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

        // market create 
        // constructor(address _base, address _quote, uint _price, address _vault, address _credit) {
        market = address(
            new Market(_base, _quotes, _amounts.getPrice(_quantity), address(this), credit)
        );
        
        // quote tokrn transfer
        _quotes.transferFrom(msg.sender, address(this), _amounts);
        // base tokrn transfer
        _base.transferFrom(msg.sender, address(this), _quantity);
        
        console.log(_amounts);
        
        
        setVault(_base, _quotes, true);
        setVault(_quotes, _base, true);
        setToken(_base, true);
        // market.givePermission();

        // 리스팅 정보 저장
        ICredit(credit).newHistory(
            Type.Order(
                Type.Category.Listing,
                Type.Option.General,
                Type.State.Complete,
                block.timestamp,
                proof.getPrice(_quantity),
                _quantity,
                proof,
                fees,
                _base, //issue
                address(this),
                address(this),
                msg.sender,
                0
            )
        );
    }

    function getMarket() public view returns(address){
        return market;
    }

    // 출금
    function withdraw(address _base, address _quote) external {
        _base.transfer(msg.sender, _base.balanceOf(address(this)));
        _quote.transfer(msg.sender, _quote.balanceOf(address(this)));
        // ICredit(credit).newHistory(
        //     Type.Order(
        //         Type.Category.Withdraw,
        //         Type.Option.General,
        //         Type.State.Complete,
        //         block.timestamp,
        //         _amounts.getPrice(q),
        //         _amounts,
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

    // 리스팅된 base가 사용할수있는 l 유동성
    // 멀티페어 사용x 그냥 이용
   function getLiquidity(address _base, address _quote) public view returns (uint l) {
        return _base.getBalance(); // 싱글 페어 유동성
        // unchecked {
        //     int h = int(_quote.getBalance());
        //     uint b = getWeight(_base);
        //     l = getWeight(_quote);
        //     return (h == 0 || b == 0 || l == 0) ? 0 : (uint(h + need[_quote]) * b) / l / 1;
        // }
    }

    function remit(address _to, address _token, uint _amount, bool t, address o, uint p) external  {
        unchecked {
            _token.transfer(_to, _amount);
            // $.balance[_token] -= _amount;
        }
    }

    // 유동성 회수
    function collect(address _from, address _token, uint _amount, bool t, address o, uint p) external  {
        unchecked {
            _token.transferFrom(_from, address(this), _amount);
            // $.balance[_token] += _amount;
        }
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
