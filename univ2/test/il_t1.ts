import { MaxUint256 } from 'ethers';
import {ethers} from 'hardhat';
import { mock } from 'node:test';

type Pool = {
    id : number;
    data : IL[];
}
type IL = {
    price : number;
    loss : number;
}
let DEPLOYER = process.env.DEPLOYER
const FEE = "0xd0B495b27BF00f2739C94e2de4405489951a2B6E"; // #2 account
const LOW = ethers.parseUnits("10000",18); // 5k
const LOW2 = ethers.parseUnits("50000",18); // 50k
const MID = ethers.parseUnits("1000000",18); // 0.5M
const TOP = ethers.parseUnits("1000000000",18); // 0.5B
//stable
const SLOW = ethers.parseUnits("10000",6); // 10k
const SLOW2 = ethers.parseUnits("100000",6); // 100k
const SMID = ethers.parseUnits("1000000",6); // 1M
const STOP = ethers.parseUnits("1000000000",6); // 1B
const OUT:Pool[] = [];
import fs from 'fs';

describe('# IL LOSS CHECK', () => {
 

    it('LOW POOL', async () => {
        const ac = await ethers.getSigners();   
        const deployer = ac[0];
        const user = ac[1];
        const marketUser = ac[2];
        
        const mockUSDT = await (await ethers.getContractFactory("MockUSDT")).deploy();
        const mockBTC = await (await ethers.getContractFactory("MockBTC")).deploy();
        // 1000조 달러
        await mockUSDT.faucet(user.address, ethers.parseUnits('1000000000000000',6)); 
        await mockBTC.faucet(user.address, ethers.parseUnits("1000000000000000",18));
        await mockUSDT.faucet(marketUser.address, ethers.parseUnits('1000000000000000',6)); 
        await mockBTC.faucet(marketUser.address, ethers.parseUnits("1000000000000000",18));

   
        
        const v2Factory = await (await ethers.getContractFactory("UniswapV2Factory")).deploy(FEE);
        // console.log("UniswapV2Factory : ", await v2Factory.getAddress());
        // fee zero 
        const v2Router2 = await (await ethers.getContractFactory("UniswapV2Router2")).deploy(await v2Factory.getAddress(),ethers.ZeroAddress);
        // console.log("UniswapV2Router02 : ", await v2Router2.getAddress());

        await v2Factory.createPair(await mockBTC.getAddress(), await mockUSDT.getAddress());


        const pairAddress = await v2Factory.getPair(await mockBTC.getAddress(), await mockUSDT.getAddress());
        const btc_usdt = await ethers.getContractAt("IUniswapV2Pair", pairAddress);


        // addliquidity == User
        await mockBTC.connect(user).approve(await v2Router2.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(user).approve(await v2Router2.getAddress(), ethers.MaxUint256);
        await mockBTC.connect(user).approve(await btc_usdt.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(user).approve(await btc_usdt.getAddress(), ethers.MaxUint256);

        // console.log('#1 PRE BTC BAL -> ', ethers.formatUnits( await mockBTC.balanceOf(user.address), 18),);
        // console.log('#1 PRE USDT BAL -> ', ethers.formatUnits( await mockUSDT.balanceOf(user.address), 6));
       
        console.log('#1 PRE BTC BAL -> ', ethers.formatUnits( LOW, 18),);
        console.log('#1 PRE USDT BAL -> ', ethers.formatUnits( SLOW, 6));
       
        // 5K : 10k == btc : dai 
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
        console.log(await btc_usdt.getReserves())
        // 잔고 처리
        await mockBTC.connect(user).transfer(marketUser.address, await mockBTC.balanceOf(user.address));
        await mockUSDT.connect(user).transfer(marketUser.address, await mockUSDT.balanceOf(user.address));

        let estimated = await v2Router2.getAmountsOut(
            ethers.parseUnits("1",18),
            [await mockBTC.getAddress(), await mockUSDT.getAddress()]
        );

        // console.log('BTC RATE -> ', ethers.formatUnits(estimated[0],18),'  USDT RATE -> ',ethers.formatUnits(estimated[1],6))
        let btcAmount = ethers.formatUnits(LOW,18);
        let usdtAmount = ethers.formatUnits(SLOW,6);
        let btcPrice =  ethers.formatUnits(estimated[1],6)
        const initPoolVaule = (Number(btcAmount) * Number(btcPrice)) +  Number(usdtAmount);
        console.log('#1 PRE POOL [INIT] VALUE : ',  initPoolVaule);

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

        console.log('\n swap #1 - MarketUser \n');
        await mockBTC.connect(marketUser).approve(await v2Router2.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(marketUser).approve(await v2Router2.getAddress(), ethers.MaxUint256);
        await mockBTC.connect(marketUser).approve(await btc_usdt.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(marketUser).approve(await btc_usdt.getAddress(), ethers.MaxUint256);
        let afterEstimatedPrice; 
 
        let data:IL[] = [];
        for(let i=0 ; i < 22 ;i++){ 
            // buy btc
            await v2Router2.connect(marketUser).swapExactTokensForTokens(
                ethers.parseUnits("1000",6),
                0,
                [await mockUSDT.getAddress(), await mockBTC.getAddress()],
                marketUser.address,
                "9999999999"
            );
            const reserve = await btc_usdt.getReserves();
            const rUsdt =  ethers.formatUnits(reserve[0],6);
            const rBtc = ethers.formatUnits(reserve[1],18);

            estimated = await v2Router2.getAmountsOut(
                ethers.parseUnits("1",18),
                [await mockBTC.getAddress(), await mockUSDT.getAddress()]
            );
            console.log('BTC RATE -> ', ethers.formatUnits(estimated[0],18),'  USDT RATE -> ',ethers.formatUnits(estimated[1],6))
            afterEstimatedPrice = ethers.formatUnits(estimated[1],6);
            const IR1 =  ((Number(rBtc) * Number(afterEstimatedPrice)) +  Number(rUsdt) - initPoolVaule) / initPoolVaule * 100;
            console.log('#',i,' POOL VALUE : ',  (Number(btcAmount) * Number(afterEstimatedPrice)) +  Number(usdtAmount));
            console.log('#',i,' POOL UP (%): ',  IR1); // 초기 pool vaule 보다 현재 pool value % 만큼 올랐는지

            // 원금 유지시 이득
            btcAmount = ethers.formatUnits(LOW,18);
            usdtAmount = ethers.formatUnits(SLOW,6);
            const IR2 = ((Number(btcAmount) * Number(afterEstimatedPrice)) +  Number(usdtAmount) - initPoolVaule) / initPoolVaule * 100;
            console.log('#',i ,' Estimated INIT POOL VALUE : ', (Number(btcAmount) * Number(afterEstimatedPrice)) +  Number(usdtAmount));
            console.log('#',i, ' Estimated INIT POOL UP% : ', IR2);
            console.log('RESULT IL LOSS %: ', -(IR2-IR1),'\n');
            data[i] = {
                price : Number(afterEstimatedPrice),
                loss :  Number(-(IR2-IR1))
            };
        }
        OUT.push({
            id : 1,
            data : data
        })
        // 1 달러씩 1000번 -> USDT RATE ->  1.0   BTC RATE ->  0.412138748129609379
        // 1000달러 한번 -> USDT RATE ->  1.0   BTC RATE ->  0.412058513369356037, 0.412133337701793289 -> 유의미하다고 해야하나..? 
       // 0.009,999,999,999,999,000 ?? 

       // remove
        // await btc_usdt.connect(user).approve(await v2Router2.getAddress(), MaxUint256);
        // await v2Router2.connect(user).removeLiquidity(
        //     await mockBTC.getAddress(),
        //     await mockUSDT.getAddress(),
        //     await btc_usdt.balanceOf(user.address),
        //     0,
        //     0,
        //     user.address,
        //     99999999999
        // );

        // console.log('#1 AFTER BTC BAL -> ', ethers.formatUnits( await mockBTC.balanceOf(user.address), 18));
        // console.log('#1 AFTER USDT BAL -> ', ethers.formatUnits( await mockUSDT.balanceOf(user.address), 6));


        // // console.log('BTC RATE -> ', ethers.formatUnits(estimated[0],18),'  USDT RATE -> ',ethers.formatUnits(estimated[1],6))
        // btcAmount = ethers.formatUnits( await mockBTC.balanceOf(user.address), 18)
        // usdtAmount = ethers.formatUnits( await mockUSDT.balanceOf(user.address), 6)
        // const IR1 =  ((Number(btcAmount) * Number(afterEstimatedPrice)) +  Number(usdtAmount) - initPoolVaule) / initPoolVaule * 100;
        // console.log('#1 AFTER POOL VALUE : ',  (Number(btcAmount) * Number(afterEstimatedPrice)) +  Number(usdtAmount));
        // console.log('#1 AFTER POOL UP%: ',  IR1);

        // // 그대로 가지고있는 경우
        // btcAmount = ethers.formatUnits(LOW,18);
        // usdtAmount = ethers.formatUnits(SLOW,6);
        // const IR2 = ((Number(btcAmount) * Number(afterEstimatedPrice)) +  Number(usdtAmount) - initPoolVaule) / initPoolVaule * 100;
        // console.log('#1 AFTER Estimated POOL VALUE, PRICE : ', afterEstimatedPrice ,' VALUE : ',  (Number(btcAmount) * Number(afterEstimatedPrice)) +  Number(usdtAmount));
        // console.log('#1 AFTER Estimated POOL UP% : ', IR2);
        // console.log('RESULT IL LOSS %: ', IR2-IR1);
       
        
        // console.log('#1 AFTER BTC BAL -> ', ethers.formatUnits( await mockBTC.balanceOf(user.address), 18));
        // console.log('#1 AFTER USDT BAL -> ', ethers.formatUnits( await mockUSDT.balanceOf(user.address), 6));
        
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

    
    it('MID POOL', async () => {
        const ac = await ethers.getSigners();   
        const deployer = ac[0];
        const user = ac[3];
        const marketUser = ac[4];
        
        const mockUSDT = await (await ethers.getContractFactory("MockUSDT")).deploy();
        const mockBTC = await (await ethers.getContractFactory("MockBTC")).deploy();
        // 1000조 달러
        await mockUSDT.faucet(user.address, ethers.parseUnits('1000000000000000',6)); 
        await mockBTC.faucet(user.address, ethers.parseUnits("1000000000000000",18));
        await mockUSDT.faucet(marketUser.address, ethers.parseUnits('1000000000000000',6)); 
        await mockBTC.faucet(marketUser.address, ethers.parseUnits("1000000000000000",18));


        const v2Factory = await (await ethers.getContractFactory("UniswapV2Factory")).deploy(FEE);
        const v2Router2 = await (await ethers.getContractFactory("UniswapV2Router2")).deploy(await v2Factory.getAddress(),ethers.ZeroAddress);
        await v2Factory.createPair(await mockBTC.getAddress(), await mockUSDT.getAddress());


        const pairAddress = await v2Factory.getPair(await mockBTC.getAddress(), await mockUSDT.getAddress());
        const btc_usdt = await ethers.getContractAt("IUniswapV2Pair", pairAddress);
    

        // addliquidity == User
        await mockBTC.connect(user).approve(await v2Router2.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(user).approve(await v2Router2.getAddress(), ethers.MaxUint256);
        await mockBTC.connect(user).approve(await btc_usdt.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(user).approve(await btc_usdt.getAddress(), ethers.MaxUint256);
        console.log('#1 PRE BTC BAL -> ', ethers.formatUnits( MID, 18),);
        console.log('#1 PRE USDT BAL -> ', ethers.formatUnits( SMID, 6));
       
        // 5K : 10k == btc : dai 
        const addLiq = await v2Router2.connect(user).addLiquidity(
            await mockBTC.getAddress(), // token 1 
            await mockUSDT.getAddress(), // token 0 
            MID, 
            SMID,
            MID, //ethers.parseUnits("10000",18), 
            SMID, //ethers.parseUnits("10000",6),
            user.address, 
            "9999999999"
        );
        console.log(await btc_usdt.getReserves())
        // 잔고 처리
        await mockBTC.connect(user).transfer(marketUser.address, await mockBTC.balanceOf(user.address));
        await mockUSDT.connect(user).transfer(marketUser.address, await mockUSDT.balanceOf(user.address));

        let estimated = await v2Router2.getAmountsOut(
            ethers.parseUnits("1",18),
            [await mockBTC.getAddress(), await mockUSDT.getAddress()]
        );

        // console.log('BTC RATE -> ', ethers.formatUnits(estimated[0],18),'  USDT RATE -> ',ethers.formatUnits(estimated[1],6))
        let btcAmount = ethers.formatUnits(MID,18);
        let usdtAmount = ethers.formatUnits(SMID,6);
        let btcPrice =  ethers.formatUnits(estimated[1],6)
        const initPoolVaule = (Number(btcAmount) * Number(btcPrice)) +  Number(usdtAmount);
        console.log('#1 PRE POOL [INIT] VALUE : ',  initPoolVaule);

        console.log('\n swap #1 - MarketUser \n');
        await mockBTC.connect(marketUser).approve(await v2Router2.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(marketUser).approve(await v2Router2.getAddress(), ethers.MaxUint256);
        await mockBTC.connect(marketUser).approve(await btc_usdt.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(marketUser).approve(await btc_usdt.getAddress(), ethers.MaxUint256);
        let afterEstimatedPrice; 

        let data:IL[] = [];
        for(let i=0 ; i < 22 ;i++)
        { 
            // buy btc
            await v2Router2.connect(marketUser).swapExactTokensForTokens(
                ethers.parseUnits("100000",6),
                0,
                [await mockUSDT.getAddress(), await mockBTC.getAddress()],
                marketUser.address,
                "9999999999"
            );
            const reserve = await btc_usdt.getReserves();
            const rUsdt =  ethers.formatUnits(reserve[1],6);
            const rBtc = ethers.formatUnits(reserve[0],18);

            estimated = await v2Router2.getAmountsOut(
                ethers.parseUnits("1",18),
                [await mockBTC.getAddress(), await mockUSDT.getAddress()]
            );
            console.log('BTC RATE -> ', ethers.formatUnits(estimated[0],18),'  USDT RATE -> ',ethers.formatUnits(estimated[1],6))
            afterEstimatedPrice = ethers.formatUnits(estimated[1],6);
            const IR1 =  ((Number(rBtc) * Number(afterEstimatedPrice)) +  Number(rUsdt) - initPoolVaule) / initPoolVaule * 100;
            console.log('#',i,' POOL VALUE : ',  (Number(btcAmount) * Number(afterEstimatedPrice)) +  Number(usdtAmount));
            console.log('#',i,' POOL UP (%): ',  IR1); // 초기 pool vaule 보다 현재 pool value % 만큼 올랐는지

            // 원금 유지시 이득
            btcAmount = ethers.formatUnits(MID,18);
            usdtAmount = ethers.formatUnits(SMID,6);
            const IR2 = ((Number(btcAmount) * Number(afterEstimatedPrice)) +  Number(usdtAmount) - initPoolVaule) / initPoolVaule * 100;
            console.log('#',i ,' Estimated INIT POOL VALUE : ', (Number(btcAmount) * Number(afterEstimatedPrice)) +  Number(usdtAmount));
            console.log('#',i, ' Estimated INIT POOL UP% : ', IR2);
            console.log('RESULT IL LOSS %: ', -(IR2-IR1),'\n');
            data[i] = {
                price : Number(afterEstimatedPrice),
                loss :  Number(-(IR2-IR1))
            };
        }
        OUT.push({
            id : 2,
            data : data
        })
      
    });

    it('TOP POOL', async () => {
        const ac = await ethers.getSigners();   
        const deployer = ac[0];
        const user = ac[5];
        const marketUser = ac[6];
        
        const mockUSDT = await (await ethers.getContractFactory("MockUSDT")).deploy();
        const mockBTC = await (await ethers.getContractFactory("MockBTC")).deploy();
        // 1000조 달러
        await mockUSDT.faucet(user.address, ethers.parseUnits('1000000000000000',6)); 
        await mockBTC.faucet(user.address, ethers.parseUnits("1000000000000000",18));
        await mockUSDT.faucet(marketUser.address, ethers.parseUnits('1000000000000000',6)); 
        await mockBTC.faucet(marketUser.address, ethers.parseUnits("1000000000000000",18));


        const v2Factory = await (await ethers.getContractFactory("UniswapV2Factory")).deploy(FEE);
        const v2Router2 = await (await ethers.getContractFactory("UniswapV2Router2")).deploy(await v2Factory.getAddress(),ethers.ZeroAddress);
        await v2Factory.createPair(await mockBTC.getAddress(), await mockUSDT.getAddress());


        const pairAddress = await v2Factory.getPair(await mockBTC.getAddress(), await mockUSDT.getAddress());
        const btc_usdt = await ethers.getContractAt("IUniswapV2Pair", pairAddress);
    

        // addliquidity == User
        await mockBTC.connect(user).approve(await v2Router2.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(user).approve(await v2Router2.getAddress(), ethers.MaxUint256);
        await mockBTC.connect(user).approve(await btc_usdt.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(user).approve(await btc_usdt.getAddress(), ethers.MaxUint256);
        console.log('#1 PRE BTC BAL -> ', ethers.formatUnits( TOP, 18),);
        console.log('#1 PRE USDT BAL -> ', ethers.formatUnits( STOP, 6));
       
        // 5K : 10k == btc : dai 
        const addLiq = await v2Router2.connect(user).addLiquidity(
            await mockBTC.getAddress(), // token 1 
            await mockUSDT.getAddress(), // token 0 
            TOP, 
            STOP,
            TOP, //ethers.parseUnits("10000",18), 
            STOP, //ethers.parseUnits("10000",6),
            user.address, 
            "9999999999"
        );
        console.log(await btc_usdt.getReserves())
        // 잔고 처리
        await mockBTC.connect(user).transfer(marketUser.address, await mockBTC.balanceOf(user.address));
        await mockUSDT.connect(user).transfer(marketUser.address, await mockUSDT.balanceOf(user.address));

        let estimated = await v2Router2.getAmountsOut(
            ethers.parseUnits("1",18),
            [await mockBTC.getAddress(), await mockUSDT.getAddress()]
        );

        // console.log('BTC RATE -> ', ethers.formatUnits(estimated[0],18),'  USDT RATE -> ',ethers.formatUnits(estimated[1],6))
        let btcAmount = ethers.formatUnits(TOP,18);
        let usdtAmount = ethers.formatUnits(STOP,6);
        let btcPrice =  ethers.formatUnits(estimated[1],6)
        const initPoolVaule = (Number(btcAmount) * Number(btcPrice)) +  Number(usdtAmount);
        console.log('#1 PRE POOL [INIT] VALUE : ',  initPoolVaule);

        console.log('\n swap #1 - MarketUser \n');
        await mockBTC.connect(marketUser).approve(await v2Router2.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(marketUser).approve(await v2Router2.getAddress(), ethers.MaxUint256);
        await mockBTC.connect(marketUser).approve(await btc_usdt.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(marketUser).approve(await btc_usdt.getAddress(), ethers.MaxUint256);
        let afterEstimatedPrice; 

        let data:IL[] = [];
        for(let i=0 ; i < 22 ;i++)
        { 
            // buy btc
            await v2Router2.connect(marketUser).swapExactTokensForTokens(
                ethers.parseUnits("100000000",6),
                0,
                [await mockUSDT.getAddress(), await mockBTC.getAddress()],
                marketUser.address,
                "9999999999"
            );
            const reserve = await btc_usdt.getReserves();
            const rUsdt =  ethers.formatUnits(reserve[1],6);
            const rBtc = ethers.formatUnits(reserve[0],18);

            estimated = await v2Router2.getAmountsOut(
                ethers.parseUnits("1",18),
                [await mockBTC.getAddress(), await mockUSDT.getAddress()]
            );
            console.log('BTC RATE -> ', ethers.formatUnits(estimated[0],18),'  USDT RATE -> ',ethers.formatUnits(estimated[1],6))
            afterEstimatedPrice = ethers.formatUnits(estimated[1],6);
            const IR1 =  ((Number(rBtc) * Number(afterEstimatedPrice)) +  Number(rUsdt) - initPoolVaule) / initPoolVaule * 100;
            console.log('#',i,' POOL VALUE : ',  (Number(btcAmount) * Number(afterEstimatedPrice)) +  Number(usdtAmount));
            console.log('#',i,' POOL UP (%): ',  IR1); // 초기 pool vaule 보다 현재 pool value % 만큼 올랐는지

            // 원금 유지시 이득
            btcAmount = ethers.formatUnits(TOP,18);
            usdtAmount = ethers.formatUnits(STOP,6);
            const IR2 = ((Number(btcAmount) * Number(afterEstimatedPrice)) +  Number(usdtAmount) - initPoolVaule) / initPoolVaule * 100;
            console.log('#',i ,' Estimated INIT POOL VALUE : ', (Number(btcAmount) * Number(afterEstimatedPrice)) +  Number(usdtAmount));
            console.log('#',i, ' Estimated INIT POOL UP% : ', IR2);
            console.log('RESULT IL LOSS %: ', -(IR2-IR1),'\n');
            data[i] = {
                price : Number(afterEstimatedPrice),
                loss :  Number(-(IR2-IR1))
            };
        }
        OUT.push({
            id : 3,
            data : data
        })
      
    });

    it('RESULT', async () => {
        const jsonString = JSON.stringify(OUT, null, 2);
        fs.writeFile('../ILUNI.json', jsonString, 'utf-8', (err:any) => {
            if (err) {
                console.error('파일 저장 중 오류가 발생했습니다:', err);
            } else {
                console.log('JSON 데이터가 dataAsync.json 파일에 비동기적으로 저장되었습니다.');
            }
        });
      
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
