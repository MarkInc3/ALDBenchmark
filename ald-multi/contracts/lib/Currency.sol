// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.24;

import 'hardhat/console.sol';

library Currency {
    using Currency for address;

    // ERC20
    bytes4 private constant $symbol = 0x95d89b41; // symbol()
    bytes4 private constant $name = 0x06fdde03; // name()
    bytes4 private constant $decimals = 0x313ce567; // decimals()
    bytes4 private constant $balanceOf = 0x70a08231; // balanceOf(add ress)
    bytes4 private constant $transfer = 0xa9059cbb; // transfer(address,uint)
    bytes4 private constant $transferFrom = 0x23b872dd; // transferFrom(address,address,uint)
    bytes4 private constant $approve = 0x095ea7b3; // approve(address,uint256)
    bytes4 private constant $totalSupply = 0x18160ddd; // totalSupply() 18160ddd

    error TOKEN_INVALID_VALUE(address);
    error TOKEN_APPROVE_FAIL(address, address, uint);
    error TOKEN_TRANSFER_FAIL(address, address, uint);
    error TOKEN_TRANSFERFROM_FAIL(address, address, uint);

    function _symbol() internal view returns (string memory) {
        uint chainId = block.chainid;
        if (chainId == 1) return "ETH"; // Ethereum Mainnet
        if (chainId == 3) return "ETH"; // Ropsten
        if (chainId == 4) return "ETH"; // Rinkeby
        if (chainId == 5) return "ETH"; // Goerli
        if (chainId == 10) return "ETH"; // OP Mainnet
        if (chainId == 25) return "CRO"; // Cronos Mainnet
        if (chainId == 56) return "BNB"; // BNB Chain Mainnet
        if (chainId == 100) return "XDAI"; // Gnosis Mainnet
        if (chainId == 137) return "MATIC"; // Polygon Mainnet
        if (chainId == 248) return "OAS"; // Oasis Mainnet
        if (chainId == 250) return "FTM"; // Fantom Opera
        if (chainId == 300) return "ETH"; // zkSync Sepolia Testnet
        if (chainId == 314) return "FIL"; // File Coin Mainnet
        if (chainId == 361) return "TFUEL"; // Theta Mainnet
        if (chainId == 369) return "PLS"; // Pulse Chain
        if (chainId == 592) return "ASTR"; // Astar Mainnet
        if (chainId == 2222) return "KAVA"; // Kava
        if (chainId == 5000) return "MNT"; // Mantle Mainnet
        if (chainId == 8453) return "ETH"; // Base
        if (chainId == 9997) return "ETH"; // AltLayer Testnet
        if (chainId == 42161) return "ETH"; // Arbitrum One
        if (chainId == 42170) return "ETH"; // Arbitrum Nova
        if (chainId == 42220) return "CELO"; // Celo Mainnet
        if (chainId == 42262) return "ROSE"; // Oasis Emerald
        if (chainId == 43114) return "AVAX"; // Avalanche C-Chain
        if (chainId == 59144) return "ETH"; // Linea Mainnet
        if (chainId == 80085) return "BERA"; // Berachain Artio
        if (chainId == 84532) return "ETH"; // Base Sepolia Testnet
        if (chainId == 421611) return "ETH"; // Arbitrum Rinkeby
        if (chainId == 421613) return "ETH"; // Arbitrum Goerli
        if (chainId == 421614) return "ETH"; // Arbitrum Sepolia
        if (chainId == 4000003) return "ZERO"; // AltLayer Zero Gas Network
        if (chainId == 11155111) return "ETH"; // Sepolia
        if (chainId == 11155420) return "ETH"; // OP Sepolia Testnet
        if (chainId == 1313161554) return "ETH"; // Aurora Mainnet
        if (chainId == 1313161556) return "ETH";
        // Aurora Betanet
        else return "???";
    }

    function _name() internal view returns (string memory) {
        uint chainId = block.chainid;
        if (chainId == 1) return "Ethereum"; // Ethereum Mainnet
        if (chainId == 3) return "Ethereum"; // Ropsten
        if (chainId == 4) return "Ethereum"; // Rinkeby
        if (chainId == 5) return "Ethereum"; // Goerli
        if (chainId == 10) return "Ethereum"; // OP Mainnet
        if (chainId == 25) return "Cronos"; // Cronos Mainnet
        if (chainId == 56) return "Binance Coin"; // BNB Chain Mainnet
        if (chainId == 100) return "xDAI"; // Gnosis Mainnet
        if (chainId == 137) return "Polygon"; // Polygon Mainnet
        if (chainId == 248) return "Oasis"; // Oasis Mainnet
        if (chainId == 250) return "Fantom"; // Fantom Opera
        if (chainId == 300) return "Ethereum"; // zkSync Sepolia Testnet
        if (chainId == 314) return "File Coin"; // File Coin Mainnet
        if (chainId == 361) return "Theta Fuel"; // Theta Mainnet
        if (chainId == 369) return "Pulse"; // Pulse Chain
        if (chainId == 592) return "Astar"; // Astar Mainnet
        if (chainId == 2222) return "Kava"; // Kava
        if (chainId == 5000) return "Mantle"; // Mantle Mainnet
        if (chainId == 8453) return "Ethereum"; // Base
        if (chainId == 9997) return "Ethereum"; // AltLayer Testnet
        if (chainId == 42161) return "Ethereum"; // Arbitrum One
        if (chainId == 42170) return "Ethereum"; // Arbitrum Nova
        if (chainId == 42220) return "Celo"; // Celo Mainnet
        if (chainId == 42262) return "ROSE"; // Oasis Emerald
        if (chainId == 43114) return "Avalanche"; // Avalanche C-Chain
        if (chainId == 59144) return "Ethereum"; // Linea Mainnet
        if (chainId == 80085) return "Bera"; // Berachain Artio
        if (chainId == 84532) return "Ethereum"; // Base Sepolia Testnet
        if (chainId == 421611) return "Ethereum"; // Arbitrum Rinkeby
        if (chainId == 421613) return "Ethereum"; // Arbitrum Goerli
        if (chainId == 421614) return "Ethereum"; // Arbitrum Sepolia
        if (chainId == 4000003) return "ZERO"; // AltLayer Zero Gas Network
        if (chainId == 11155111) return "Ethereum"; // Sepolia
        if (chainId == 11155420) return "Ethereum"; // OP Sepolia Testnet
        if (chainId == 1313161554) return "Ethereum"; // Aurora Mainnet
        if (chainId == 1313161556) return "Ethereum";
        // Aurora Betanet
        else return "Unknown";
    }

    function returnDataToString(
        bytes memory data
    ) internal pure returns (string memory) {
        if (data.length >= 64) {
            return abi.decode(data, (string));
        } else if (data.length == 32) {
            uint8 i = 0;
            while (i < 32 && data[i] != 0) {
                i++;
            }
            bytes memory bytesArray = new bytes(i);
            for (i = 0; i < 32 && data[i] != 0; i++) {
                bytesArray[i] = data[i];
            }
            return string(bytesArray);
        } else {
            return "Unknown";
        }
    }

    function symbol(address token) internal view returns (string memory) {
        if (token == address(0)) return _symbol();
        else {
            (bool success, bytes memory data) = token.staticcall(
                abi.encodeWithSelector($symbol)
            );
            return success ? returnDataToString(data) : "";
        }
    }

    function name(address token) internal view returns (string memory) {
        if (token == address(0)) return _name();
        else {
            (bool success, bytes memory data) = token.staticcall(
                abi.encodeWithSelector($name)
            );
            return success ? returnDataToString(data) : "";
        }
    }

    function decimals(address token) internal view returns (uint8) {
        if (token == address(0)) return 18;
        else {
            (bool success, bytes memory data) = token.staticcall(
                abi.encodeWithSelector($decimals)
            );
            return success && data.length == 32 ? abi.decode(data, (uint8)) : 0; // need to think about it return 0 or 18
        }
    }

    function approve(address token, address from, uint amount) internal {
        if (token != address(0)) {
            (bool success, bytes memory data) = token.staticcall(
                abi.encodeWithSelector($decimals)
            );
            (success, data) = address(token).call(
                abi.encodeWithSelector(
                    $approve,
                    from,
                    success
                        ? format(
                            amount,
                            data.length == 32 ? abi.decode(data, (uint8)) : 0
                        )
                        : amount
                )
            );
            if (!success && (data.length != 0 || !abi.decode(data, (bool))))
                revert TOKEN_APPROVE_FAIL(token, from, amount);
        }
    }

    function transfer(address token, address to, uint amount) internal {
        if (token == address(0)) {
            (bool success, ) = payable(to).call{value: amount}("");
            require(success, "Native Currency Transfer Fail");
        } else {
            (bool success, bytes memory data) = address(token).staticcall(
                abi.encodeWithSelector($decimals)
            );
            
            (success, data) = address(token).call(
                abi.encodeWithSelector(
                    $transfer,
                    to,
                    success
                        ? format(
                            amount,
                            data.length == 32 ? abi.decode(data, (uint8)) : 0
                        )
                        : amount
                )
            );
            if (!success && (data.length != 0 || !abi.decode(data, (bool))))
                revert TOKEN_TRANSFER_FAIL(token, to, amount);
        }
    }

    function transferFrom(
        address token,
        address from,
        address to,
        uint amount
    ) internal {
        if (token == address(0) && amount <= msg.value && address(this) != to) {
            (bool success, ) = payable(to).call{value: amount}("");
            require(success, "Native Currency Transfer Fail");
        } else {
            (bool success, bytes memory data) = token.staticcall(
                abi.encodeWithSelector($decimals)
            );
              
            (success, data) = address(token).call(
                abi.encodeWithSelector(
                    $transferFrom,
                    from,
                    to,
                    success
                        ? format(
                            amount,
                            data.length == 32 ? abi.decode(data, (uint8)) : 0
                        )
                        : amount
                )
       
            );
   
                // console.log(format(data.length == 32 ? abi.decode(data, (uint8)) : 0));

            if (!success && (data.length != 0 || !abi.decode(data, (bool))))
                revert TOKEN_TRANSFERFROM_FAIL(token, from, amount);
        }
    }

    function balanceOf(
        address token,
        address to
    ) internal view returns (uint amount) {
        if (token == address(0)) amount = to.balance;
        else {
            (bool success, bytes memory data) = token.staticcall(
                abi.encodeWithSelector($balanceOf, to)
            );
            require(
                success && data.length >= 32,
                "Currency ERC20: BalanceOf failed"
            );
            amount = abi.decode(data, (uint));
            (success, data) = address(token).staticcall(
                abi.encodeWithSelector($decimals)
            );
            if (!success) revert TOKEN_INVALID_VALUE(token);
            amount = parse(
                amount,
                data.length == 32 ? abi.decode(data, (uint8)) : 0
            );
        }
    }

    function getBalance(address token) internal view returns (uint) {
        return balanceOf(token, address(this));
    }

    function totalSupply(address token) internal view returns (uint amount) {
        if (token == address(0)) amount = type(uint256).max;
        else {
            (bool success, bytes memory data) = token.staticcall(
                abi.encodeWithSelector($totalSupply)
            );
            require(
                success && data.length >= 32,
                "Currency ERC20: TotalSupply failed"
            );
            amount = abi.decode(data, (uint));
            (success, data) = address(token).staticcall(
                abi.encodeWithSelector($decimals)
            );
            if (!success) revert TOKEN_INVALID_VALUE(token);
            amount = parse(
                amount,
                data.length == 32 ? abi.decode(data, (uint8)) : 0
            );
        }
    }

    // in -> 18
    function parse(uint amount, uint decimals) internal pure returns (uint) {
        unchecked {
            return
                decimals == 18 ? amount : decimals < 18
                    ? amount *= (10 ** (18 - decimals))
                    : amount /= (10 ** (decimals - 18));
        }
    }

    function parse(address token, uint amount) internal view returns (uint) {
        return parse(amount, token.decimals());
    }

    // 18 -> out
    function format(uint amount, uint decimals) internal pure returns (uint) {
        unchecked {
            return
                decimals == 18 ? amount : decimals < 18
                    ? amount /= (10 ** (18 - decimals))
                    : amount *= (10 ** (decimals - 18));
        }
    }

    function format(address token, uint amount) internal view returns (uint) {
        return format(amount, token.decimals());
    }
}
