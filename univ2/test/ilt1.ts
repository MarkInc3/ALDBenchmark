import {ethers} from 'hardhat';
import { mock } from 'node:test';


export default describe('# IL LOSS CHECK', () => {
    let DEPLOYER = process.env.DEPLOYER
    const FEE = "0xd0B495b27BF00f2739C94e2de4405489951a2B6E"; // #2 account
    const LOW = ethers.parseUnits("10000",18); // 10k
    const LOW2 = ethers.parseUnits("100000",18); // 100k
    const LOW3 = ethers.parseUnits("500000",18); // 500k
    const MIF = ethers.parseUnits("1000000",18); // 1M
    const TOP = ethers.parseUnits("1000000000",18); // 1B
    //stable
    const SLOW = ethers.parseUnits("10000",6); // 10k
    const SLOW2 = ethers.parseUnits("100000",6); // 100k
    const SLOW3 = ethers.parseUnits("500000",6); // 500k
    const SMIF = ethers.parseUnits("1000000",6); // 1M
    const STOP = ethers.parseUnits("1000000000",6); // 1B


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
        // console.log("UniswapV2Factory : ", await v2Factory.getAddress());
        // fee zero 
        const v2Router2 = await (await ethers.getContractFactory("UniswapV2Router2")).deploy(await v2Factory.getAddress(),ethers.ZeroAddress);
        // console.log("UniswapV2Router02 : ", await v2Router2.getAddress());

        await v2Factory.createPair(await mockBTC.getAddress(), await mockUSDT.getAddress());
        const pairAddress = await v2Factory.getPair(await mockBTC.getAddress(), await mockUSDT.getAddress());
        const btc_usdt = await ethers.getContractAt("IUniswapV2Pair", pairAddress);

        // addliquidity
        mockBTC.connect(user).approve(await v2Router2.getAddress(), ethers.MaxUint256);
        mockUSDT.connect(user).approve(await v2Router2.getAddress(), ethers.MaxUint256);
        mockBTC.connect(user).approve(await btc_usdt.getAddress(), ethers.MaxUint256);
        mockUSDT.connect(user).approve(await btc_usdt.getAddress(), ethers.MaxUint256);
        
        const addLiq = await v2Router2.connect(user).addLiquidity(
            await mockBTC.getAddress(), // token 1 
            await mockUSDT.getAddress(), // token 0 
            LOW, 
            SLOW,
            LOW, //ethers.parseUnits("10000",18), 
            SLOW, //ethers.parseUnits("10000",6),
            user.address, 
            "9999999999"
        );

        console.log('swap #1');
        const initPool = await btc_usdt.balanceOf(user.address);
        // function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data)
        console.log('#1 PRE BTC BAL -> ', ethers.formatUnits( await mockBTC.balanceOf(user.address), 18));
        console.log('#1 PRE USDT BAL -> ', ethers.formatUnits( await mockUSDT.balanceOf(user.address), 6));
        
        // - amount in, + amount out == (- USDT, + BTC amount) 
        // console.log(await v2Router2.getAmountsOut(
        //     ethers.parseUnits("1",6),
        //     [await mockUSDT.getAddress(), await mockBTC.getAddress()]
        // ));
        
        // Buy BTC 
        // swap ratio 1 : 100 
      
        // Buy BTC 
        // await v2Router2.connect(user).swapExactTokensForTokens(
        //     ethers.parseUnits("1",6),
        //     0,
        //     [await mockUSDT.getAddress(), await mockBTC.getAddress()],
        //     user.address,
        //     "9999999999"
        //  );
    
        for(let i=0 ; i < 2000 ;i++){
            // buy btc
            await v2Router2.connect(user).swapExactTokensForTokens(
                ethers.parseUnits("10",6),
                0,
                [await mockUSDT.getAddress(), await mockBTC.getAddress()],
                user.address,
                "9999999999"
            );
            console.log(await v2Router2.getAmountsOut(
                ethers.parseUnits("1",6),
                [await mockUSDT.getAddress(), await mockBTC.getAddress()]
            ));
        }


         console.log('#1 AFTER BTC BAL -> ', ethers.formatUnits( await mockBTC.balanceOf(user.address), 18));
         console.log('#1 AFTER USDT BAL -> ', ethers.formatUnits( await mockUSDT.balanceOf(user.address), 6));

        console.log('#1 AFTER BTC BAL -> ', ethers.formatUnits( await mockBTC.balanceOf(user.address), 18));
        console.log('#1 AFTER USDT BAL -> ', ethers.formatUnits( await mockUSDT.balanceOf(user.address), 6));
        
        // 시나리오1 
        // 조건1. Low Pool 
        // 조건2. 100 BTC로 스왑하는 경우의 수, 1000 BTC, 10000 BTC...  
        // 조건3. 조건2의 반대로 스왑
        // 1. 1 usdt 스왑 
        // 2. 10 usdt 스왑 
        // 3. ... 
        // 4. 한번에 스왑
        // 이때 생성되는 liquidity 측정
    });
});



    // Sell BTC
    // await v2Router2.connect(user).swapExactTokensForTokens(
    //     ethers.parseUnits("100",18),
    //     0,
    //     [await mockBTC.getAddress(), await mockUSDT.getAddress()],
    //     user.address,
    //     "9999999999"
    // );
