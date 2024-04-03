require('dotenv').config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {

  networks: {
    // hardhat:{
    //   forking:{
    //     url:`https://arbitrum-sepolia.infura.io/v3/${process.env.INFURA}`
    //   },
    //   chainId: 421614
    // },
    'arb.sepo': {
      url: `https://sepolia-rollup.arbitrum.io/rpc`,
      chainId: 421614,
      accounts: [process.env.PRIVATE_KEY || '',] // local 
    }
  },
  solidity: {
    version: '0.8.24',
    settings: {
        viaIR: true,
        optimizer: {
            enabled: true,
            // runs: (2 ** 32) - 1,
            runs: 200,
        }
    }
},
  // gasReporter: {
  //     enabled: true,
  //     currency: 'USD',
  //     gasPrice: 21
  // }
};

export default config;
 