import {ethers} from 'hardhat';
import { mock } from 'node:test';


export default describe('# IL LOSS CHECK', () => {
    let DEPLOYER = process.env.DEPLOYER
    const FEE = "0xd0B495b27BF00f2739C94e2de4405489951a2B6E"; // #2 account
    const LOW = ethers.parseUnits("10000",18); // 10k
    const LOW2 = ethers.parseUnits("100000",18); // 100k
    const LOW3 = ethers.parseUnits("500000",18); // 500k
    const MIF = ethers.parseUnits("1000000",18); // 1M
    const TOP = ethers.parseUnits("0.1",18); // 1B

    it('LOW POOL', async () => {
        const ac = await ethers.getSigners();
        const deployer = ac[0];
        const user = ac[1];
        const mockUSDT = await (await ethers.getContractFactory("MockUSDT")).deploy();
        const mockBTC = await (await ethers.getContractFactory("MockBTC")).deploy();
        // 1000조 달러 
        await mockUSDT.faucet(user.address, ethers.parseUnits('1000000000000000',6)); 
        // 1000조 달러
        await mockBTC.faucet(user.address, ethers.parseUnits("1000000000000000",18));
        

        const v2Factory = await (await ethers.getContractFactory("UniswapV2Factory")).deploy(FEE);
        console.log("UniswapV2Factory : ", await v2Factory.getAddress());
        const v2Router2 = await (await ethers.getContractFactory("UniswapV2Router2")).deploy(await v2Factory.getAddress(),ethers.ZeroAddress);
        console.log("UniswapV2Router02 : ", await v2Router2.getAddress());

        await v2Factory.createPair(await mockBTC.getAddress(), await mockUSDT.getAddress());
        const pairAddress = await v2Factory.getPair(await mockBTC.getAddress(), await mockUSDT.getAddress());
        const btc_usdt = await ethers.getContractAt("IUniswapV2Pair", pairAddress);

        // addliquidity
        console.log('sc pair -> ',pairAddress);
        mockBTC.connect(user).approve(await v2Router2.getAddress(), ethers.MaxUint256);
        mockUSDT.connect(user).approve(await v2Router2.getAddress(), ethers.MaxUint256);
        
        const addLiq = await v2Router2.connect(user).addLiquidity(
            await mockBTC.getAddress(),
            await mockUSDT.getAddress(), 
            LOW, 
            LOW2,
            ethers.parseUnits("1",18), 
            ethers.parseUnits("1",6),
            user.address, 
            "9999999999"
        );


        console.log(Number(LOW)/2);
        console.log(Number(LOW) * 0.5);
        // console.log(addLiq);

        console.log(await btc_usdt.getReserves());

    

        // fee zero getReserves



        

        
      
    });
});