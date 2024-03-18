require('dotenv').config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {

  networks: {
    'arb.sepo': {
      url: `https://sepolia-rollup.arbitrum.io/rpc`,
      chainId: 421614,
      accounts: [process.env.PRIVATE_KEY || '',] // local 
    }
  },

  solidity: {
    compilers: [
      {
        version: '0.6.6',
        settings: {
          evmVersion : 'istanbul' ,
            optimizer: {
                enabled: true,
                runs: 999999,
            }
        },
      },
      {
        version: '0.5.16',
        settings: {
          evmVersion : 'istanbul' ,
            optimizer: {
                enabled: true,
                runs: 999999,
            }
        },
      },
      {
        version: '0.8.24',
        settings: {
          evmVersion : 'shanghai' ,
            optimizer: {
                enabled: true,
                runs: 999999,
            }
        },
      },
    ],
      overrides: {
        "contracts/UniswapV2Rounter2.sol": {
          version: "0.6.6", 
          settings: { 
            optimizer: {
              enabled: true,
              runs: 999999,
            }
          }
        },
        "contracts/libraries/UniswapV2Library.sol": {
          version: "0.6.6", 
          settings: { 
            optimizer: {
              enabled: true,
              runs: 999999,
            }
          }
        },
        "contracts/libraries/SafeMath.sol": {
          version: "0.5.16", 
          settings: { 
            optimizer: {
              enabled: true,
              runs: 999999,
            }
          }
        },
        "contracts/mocks/MockBTC.sol": {
          version: "0.8.24", 
          settings: { 
            optimizer: {
              enabled: true,
              runs: 999999,
            }
          }
        },
        "contracts/mocks/MockUSDT.sol ": {
          version: "0.8.24", 
          settings: { 
            optimizer: {
              enabled: true,
              runs: 999999,
            }
          }
        },
      },
  },

  // gasReporter: {
  //     enabled: true,
  //     currency: 'USD',
  //     gasPrice: 21
  // }
};

export default config;
 