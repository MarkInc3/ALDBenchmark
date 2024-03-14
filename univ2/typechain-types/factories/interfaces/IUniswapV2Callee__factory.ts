/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IUniswapV2Callee,
  IUniswapV2CalleeInterface,
} from "../../interfaces/IUniswapV2Callee";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "uniswapV2Call",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IUniswapV2Callee__factory {
  static readonly abi = _abi;
  static createInterface(): IUniswapV2CalleeInterface {
    return new Interface(_abi) as IUniswapV2CalleeInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IUniswapV2Callee {
    return new Contract(address, _abi, runner) as unknown as IUniswapV2Callee;
  }
}
