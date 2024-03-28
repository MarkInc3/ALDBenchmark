// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { Type } from "../types/Type.sol";

interface IVault {
    function setValue(address _token, uint _value) external;

    function getValue(address _token) external view returns (uint);

    function exchange(address _token, uint _amount, bool _type) external view returns (uint);

    function deposit(address _spender, address _token, uint _amount) external returns (uint);

    function deposit(address _token, uint _amount) external returns (uint);

    function withdraw(address _spender, address _token, uint _amount) external returns (uint q);

    function withdraw(address _token, uint _amount) external returns (uint q);

    function listing(address _base, uint _quantity, address[] memory _quotes, uint[] memory _amount) external payable;

    function remit(address _to, address _token, uint _amount, bool t, address o, uint p) external;

    function collect(address _from, address _token, uint _amount, bool t, address o, uint p) external;

    function getLiquidity(address _base, address _quote) external view returns (uint l);

    function getNeed(address _token) external view returns (int);

    function addKeyToken(address _token, uint _price) external;

    function getKeyTokens() external view returns (Type.TokenInfo[] memory);

    function getTokens() external view returns (Type.TokenInfo[] memory);

    function getAll() external view returns (Type.TokenInfo[] memory);

    function setFee(uint8 _fee) external;

    function setReward(uint8 _reward) external;

    function setPermission(address _target, bool _permission) external;

    function checkPermission(address _target) external returns (bool);
}
