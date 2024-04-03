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
const LOW = ethers.parseUnits("10",18); // 5k
const LOW2 = ethers.parseUnits("100000",18); // 50k
const MID = ethers.parseUnits("1000000",18); // 0.5M
const TOP = ethers.parseUnits("1000000000",18); // 0.5
//stable
const SLOW = ethers.parseUnits("100",6); // 10k
const SLOW2 = ethers.parseUnits("100000",6); // 100k
const SMID = ethers.parseUnits("1000000",6); // 1M
const STOP = ethers.parseUnits("1000000000",6); // 1B
const OUT:Pool[] = [];
import fs from 'fs';
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const result = async() =>{
    
    fs.writeFile('./Slippage_univ2.json', JSON.stringify(OUT, null, 2) , 'utf-8', (err)=>{
        if(err){
            console.log(err);
        }
        process.exit();
    })
    // throw console.log('IO');
}

describe('# Slippage LOSS CHECK', () => {

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
        // 상수 K
        const Initreserve = await btc_usdt.getReserves();
        const K = Initreserve[0] * Initreserve[1];
      
        // 잔고 처리
        // await mockBTC.connect(user).transfer(marketUser.address, await mockBTC.balanceOf(user.address));
        // await mockUSDT.connect(user).transfer(marketUser.address, await mockUSDT.balanceOf(user.address));

        
        let initBtcAmount = ethers.formatUnits(LOW,18);
        let initUsdtAmount = ethers.formatUnits(SLOW,6);
        // let btcPrice =  ethers.formatUnits(estimated[1],6)
    

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
        data[0] = {
            price : 0,
            loss : 0
        };
        // 슬리피지 시나리오 
        // 1. 예측 함수 실행
        // 2. 예상 가격 함수 실행
        // 3. 슬리피지 비율 추출, 유동성 추출

        for(let i=1 ; i <= 1 ;i++){ 
            // console.log('BTC RATE -> ', ethers.formatUnits(estimated[0],18),'  USDT RATE -> ',ethers.formatUnits(estimated[1],6))
            const nowReserve = await btc_usdt.getReserves();
            const btc = nowReserve[1]
            const usdt = nowReserve[0] * BigInt(10**12)
            const price = Number(usdt) / Number(btc)
            const tradingAmount = 1; // 10btc : 100usdt == 1btc : 10usdt, 1usdt = 0.1btc
            console.log('now ->', nowReserve);
            console.log('now price ->', price);
            console.log('estated BTC Amounts ->', tradingAmount );

            // 1btc * price = usdtAmounts == 10 usdt  

            // 1btc : 10 = 1usdt : 

            // 예상 수령 토큰 BTC , 상수 K / 거래전 USDT Amounts + 거래에 사용되는 USDT Amounts 
            // 1000000000000000000n
            // 10000000000000000000n

         
            // const estimateAmount = nowReserve[1] - (K / (ethers.parseUnits(String(tradingAmount), 6) + nowReserve[0])); 
            // console.log('estimateAmount -> ',estimateAmount) 

            const preBTCAmounts = await mockBTC.balanceOf(marketUser.address);

            // buy btc
            await v2Router2.connect(marketUser).swapExactTokensForTokens(
                ethers.parseUnits(String(tradingAmount),6),
                0,
                [await mockUSDT.getAddress(), await mockBTC.getAddress()],
                marketUser.address,
                "9999999999"
            );

            // buy btc
            const afterBTCAmounts = await mockBTC.balanceOf(marketUser) - preBTCAmounts 
            // 슬리피지 (%) = (예상 가격 - 실제 체결 가격) / 예상 가격 * 100
            const afterBTCAmountsNumber = ethers.formatUnits(String(afterBTCAmounts),18)
            //const estimateAmountNumber = Number(ethers.formatUnits(estimateAmount,18));
            console.log('afterBTCAmounts -> ', afterBTCAmountsNumber);

            console.log(ethers.formatUnits((await btc_usdt.getReserves())[1],18))
            console.log(ethers.formatUnits((await btc_usdt.getReserves())[0],6))
            // console.log('estimateAmount -> ', estimateAmountNumber);
            // const slippage = ((estimateAmountNumber / afterBTCAmountsNumber ) - 1) * 100
            // console.log('slippage -> ', slippage);
            // const reserve = await btc_usdt.getReserves();
            // const rUsdt =  ethers.formatUnits(reserve[0],6);
            // const rBtc = ethers.formatUnits(reserve[1],18);

            
            // // 유동성에서 넣은 가치
            // const IR1 =  ((Number(rBtc) * Number(afterEstimatedPrice)) +  Number(rUsdt));
            // console.log('#',i,' ORGIN POOL VALUE : ',  (Number(initBtcAmount) * Number(afterEstimatedPrice)) +  Number(initUsdtAmount));
            // // console.log('#',i,' POOL UP (%): ',  IR1); // 초기 pool vaule 보다 현재 pool value % 만큼 올랐는지

            // // 원래 유동성 유지시의 가치
            // initBtcAmount = ethers.formatUnits(LOW,18);
            // initUsdtAmount = ethers.formatUnits(SLOW,6);
            // const IR2 = ((Number(initBtcAmount) * Number(afterEstimatedPrice)) +  Number(initUsdtAmount) );
            // console.log('RESULT IL LOSS %: ', ((IR1 / IR2) - 1) * 100,'\n');
            // data[i] = {
            //     price : Number(afterEstimatedPrice),
            //     loss :  Number(((IR1 / IR2) - 1) * 100)
            // };
            
        }
        OUT.push({
            id : 1,
            data : data
        })

    });


    after(async () => {
        await result();
        
    });
})

