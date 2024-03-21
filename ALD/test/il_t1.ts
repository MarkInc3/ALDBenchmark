import { MaxUint256 } from 'ethers';
import { ethers} from 'hardhat';
import { mock } from 'node:test';

describe('# IL LOSS CHECK', () => {
    const FEE = "0xd0B495b27BF00f2739C94e2de4405489951a2B6E"; // #2 account
    const LOW = ethers.parseUnits("10000",18); // 5k
    const LOW2 = ethers.parseUnits("100000",18); // 50k
    const MID = ethers.parseUnits("1000000",18); // 0.5M
    const TOP = ethers.parseUnits("1000000000",18); // 0.5B
    //stable
    const SLOW = ethers.parseUnits("10000",6); // 10k
    const SLOW2 = ethers.parseUnits("100000",6); // 100k
    const SMID = ethers.parseUnits("1000000",6); // 1M
    const STOP = ethers.parseUnits("1000000000",6); // 1B
    
    it('deployed', async () => {
        const ac = await ethers.getSigners();   
        const deployer = ac[0];
        const user = ac[1];
        const marketUser = ac[2];

        const credit = await (await ethers.getContractFactory("Credit")).deploy();
        const vault = await (await ethers.getContractFactory("Vault")).deploy(await credit.getAddress());

        const mockUSDT = await (await ethers.getContractFactory("MockUSDT")).deploy();
        const mockBTC = await (await ethers.getContractFactory("MockBTC")).deploy();

        await mockUSDT.faucet(user.address, ethers.parseUnits('1000000000000000',6)); 
        await mockBTC.faucet(user.address, ethers.parseUnits("1000000000000000",18));
        await mockUSDT.faucet(marketUser.address, ethers.parseUnits('1000000000000000',6)); 
        await mockBTC.faucet(marketUser.address, ethers.parseUnits("1000000000000000",18));

        await mockBTC.connect(marketUser).approve(await vault.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(marketUser).approve(await vault.getAddress(), ethers.MaxUint256);
        await mockBTC.connect(user).approve(await vault.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(user).approve(await vault.getAddress(), ethers.MaxUint256);


        // address _base,
        // uint _quantity,
        // address _quotes,
        // uint _amounts
        await vault.connect(marketUser).create(
            await mockBTC.getAddress(), 
            LOW,
            await mockUSDT.getAddress(),
            LOW
        );

        const market  = await ethers.getContractAt("Market", await vault.getMarket());
        console.log(await market.getAddress());

        const result = await vault.getReserve(await mockBTC.getAddress(), await mockUSDT.getAddress());
        console.log(result);
        console.log('stable coin -> ',await mockUSDT.balanceOf(await vault.getAddress()));
    

        // await mockBTC.connect(user).approve(await btc_usdt.getAddress(), ethers.MaxUint256);
        // await mockUSDT.connect(user).approve(await btc_usdt.getAddress(), ethers.MaxUint256);


        
        

      
    });

});


