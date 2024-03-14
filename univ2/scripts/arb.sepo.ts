require('dotenv').config();
import {ethers} from "hardhat";

let DEPLOYER = process.env.DEPLOYER
const FEE = "0xd0B495b27BF00f2739C94e2de4405489951a2B6E"; // #2 account

const deploy = async ()=> {
    const v2Factory = await (await ethers.getContractFactory("UniswapV2Factory")).deploy(FEE);
    console.log("UniswapV2Factory : ", await v2Factory.getAddress());
    const v2Router2 = await (await ethers.getContractFactory("UniswapV2Router02")).deploy(await v2Factory.getAddress(),ethers.ZeroAddress);
    console.log("UniswapV2Router02 : ", await v2Router2.getAddress());
}

deploy()