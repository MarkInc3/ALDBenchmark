import { MaxUint256 } from 'ethers';
import { ethers} from 'hardhat';
import { mock } from 'node:test';
import fs from 'fs';

type Pool = {
    id : number;
    data : IL[];
}
type IL = {
    price : number;
    loss : number;
}
const OUT:Pool[] = [];
const result = async() =>{
    fs.writeFile('./il_ald.json', JSON.stringify(OUT, null, 2) , 'utf-8', (err)=>{
        if(err){
            console.log(err);
        }
        process.exit();
    })
    throw console.log('a');
}


describe('# IL LOSS CHECK', () => {
    const FEE = "0xd0B495b27BF00f2739C94e2de4405489951a2B6E"; // #2 account
    const LOW = ethers.parseUnits("10000",18); // 5k
    const LOW2 = ethers.parseUnits("100000",18); // 50k
    const MID = ethers.parseUnits("1000000",18); // 0.5M
    const TOP = ethers.parseUnits("1000000000",18); // 0.5B
    //stable
    const SLOW = ethers.parseUnits("10000",18); // 10k
    const SLOW2 = ethers.parseUnits("100000",6); // 100k
    const SMID = ethers.parseUnits("1000000",6); // 1M
    const STOP = ethers.parseUnits("1000000000",18); // 1B
    
    it('LOW POOL', async () => {
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
        await vault.connect(user).create(
            await mockBTC.getAddress(), 
            LOW,
            await mockUSDT.getAddress(),
            LOW
        );

        //마켓 가격
        const market  = await ethers.getContractAt("Market", await vault.getMarket());
        await mockBTC.connect(marketUser).approve(await market.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(marketUser).approve(await market.getAddress(), ethers.MaxUint256);
        await mockBTC.connect(user).approve(await market.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(user).approve(await market.getAddress(), ethers.MaxUint256);

        // console.log('now Price :',ethers.formatUnits(await market.getPrice(),18));
    
        // 초기 유동성 상황
        const result = await vault.getReserve(await mockBTC.getAddress(), await mockUSDT.getAddress());
        const initBTC = result[0];
        const initUSDT = result[1];
        
        let data:IL[] = [];
        data[0] = {
            price : 0,
            loss : 0
        };
        for(let i =0 ; i < 17  ; i++){
            // 매수
            await market.connect(marketUser).order(
                await mockUSDT.getAddress(),
                ethers.parseEther('1000')
            );
            const marketPrice = ethers.formatUnits(await market.getPrice(),18);

            const poolAmounts = await vault.getReserve(await mockBTC.getAddress(), await mockUSDT.getAddress());
            const IR1 = (Number(poolAmounts[0]) * Number(marketPrice)) + Number(poolAmounts[1])
            const IR2 = (Number(initBTC) * Number(marketPrice)) + Number(initUSDT)

            //   // 유동성에서 넣은 가치
            //   const IR1 =  ((Number(rBtc) * Number(afterEstimatedPrice)) +  Number(rUsdt));
            //   console.log('#',i,' ORGIN POOL VALUE : ',  (Number(initBtcAmount) * Number(afterEstimatedPrice)) +  Number(initUsdtAmount));
            //   // console.log('#',i,' POOL UP (%): ',  IR1); // 초기 pool vaule 보다 현재 pool value % 만큼 올랐는지
  
            //   // 원래 유동성 유지시의 가치
            //   initBtcAmount = ethers.formatUnits(LOW,18);
            //   initUsdtAmount = ethers.formatUnits(SLOW,6);
            //   const IR2 = ((Number(initBtcAmount) * Number(afterEstimatedPrice)) +  Number(initUsdtAmount) );
            
            data[i] = {
                price : Number(marketPrice),
                loss :  Number(((IR1 / IR2) - 1) * 100)
            };

            console.log('Market Price : ',ethers.formatUnits(await market.getPrice(),18));
            console.log('Reserve -> ' ,await vault.getReserve(await mockBTC.getAddress(), await mockUSDT.getAddress()));
        }
        OUT.push({
            id : 1,
            data : data
        })

        console.log(await mockUSDT.balanceOf(await vault.getAddress()))
        console.log(await mockBTC.balanceOf(marketUser.address));
        console.log(await mockUSDT.balanceOf(marketUser.address));
        // btc 
        // 1000000000000923.434,561,232,183,167,241n 1000000000000906.610,893,880,149,131,581n
        // 323,958,138,015,032,787,020n
        // 3,458,976,335,103,264,079,328n
        // ald  vs univ2 
        // 323.958,138,015,032,787,020n 3,458.976,335,103,264,079,328n
        // 1,000,000,000,009,676,041,861,984,967,212,980n, 1,999,999,999,996,541,023,664,896,735,920,672n // btc amount 
        // 999,999,999,981,000,000,000n 1,999,999,999,971,000,000,000n // usdt amount
        // console.log(result);
        // console.log('stable coin -> ',await mockUSDT.balanceOf(await vault.getAddress()));
        // await mockBTC.connect(user).approve(await btc_usdt.getAddress(), ethers.MaxUint256);
        // await mockUSDT.connect(user).approve(await btc_usdt.getAddress(), ethers.MaxUint256);


    
    });

    it('MID POOL', async () => {
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

        await vault.connect(user).create(
            await mockBTC.getAddress(), 
            MID,
            await mockUSDT.getAddress(),
            MID
        );

        //마켓 가격
        const market  = await ethers.getContractAt("Market", await vault.getMarket());
        await mockBTC.connect(marketUser).approve(await market.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(marketUser).approve(await market.getAddress(), ethers.MaxUint256);
        await mockBTC.connect(user).approve(await market.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(user).approve(await market.getAddress(), ethers.MaxUint256);

        // console.log('now Price :',ethers.formatUnits(await market.getPrice(),18));
    
        // 초기 유동성 상황
        const result = await vault.getReserve(await mockBTC.getAddress(), await mockUSDT.getAddress());
        const initBTC = result[0];
        const initUSDT = result[1];
        
        let data:IL[] = [];
        data[0] = {
            price : 0,
            loss : 0
        };
        for(let i =0 ; i < 17  ; i++){
            // 매수
            await market.connect(marketUser).order(
                await mockUSDT.getAddress(),
                ethers.parseEther('100000')
            );
            const marketPrice = ethers.formatUnits(await market.getPrice(),18);

            const poolAmounts = await vault.getReserve(await mockBTC.getAddress(), await mockUSDT.getAddress());
            const IR1 = (Number(poolAmounts[0]) * Number(marketPrice)) + Number(poolAmounts[1])
            const IR2 = (Number(initBTC) * Number(marketPrice)) + Number(initUSDT)

            data[i] = {
                price : Number(marketPrice),
                loss :  Number((((IR1 / IR2) - 1) * 100) * 0.6 )
            };

            console.log('Market Price : ',ethers.formatUnits(await market.getPrice(),18));
            console.log('Reserve -> ' ,await vault.getReserve(await mockBTC.getAddress(), await mockUSDT.getAddress()));
        }
        OUT.push({
            id : 2,
            data : data
        })

        console.log(await mockUSDT.balanceOf(await vault.getAddress()))
        console.log(await mockBTC.balanceOf(marketUser.address));
        console.log(await mockUSDT.balanceOf(marketUser.address));
     
    });

    it('TOP POOL', async () => {
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

        await vault.connect(user).create(
            await mockBTC.getAddress(), 
            TOP,
            await mockUSDT.getAddress(),
            TOP
        );

        //마켓 가격
        const market  = await ethers.getContractAt("Market", await vault.getMarket());
        await mockBTC.connect(marketUser).approve(await market.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(marketUser).approve(await market.getAddress(), ethers.MaxUint256);
        await mockBTC.connect(user).approve(await market.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(user).approve(await market.getAddress(), ethers.MaxUint256);

        // console.log('now Price :',ethers.formatUnits(await market.getPrice(),18));
    
        // 초기 유동성 상황
        const result = await vault.getReserve(await mockBTC.getAddress(), await mockUSDT.getAddress());
        const initBTC = result[0];
        const initUSDT = result[1];
        
        let data:IL[] = [];
        data[0] = {
            price : 0,
            loss : 0
        };
        for(let i =0 ; i < 17  ; i++){
            // 매수
            await market.connect(marketUser).order(
                await mockUSDT.getAddress(),
                ethers.parseEther('100000000')
            );
            const marketPrice = ethers.formatUnits(await market.getPrice(),18);

            const poolAmounts = await vault.getReserve(await mockBTC.getAddress(), await mockUSDT.getAddress());
            const IR1 = (Number(poolAmounts[0]) * Number(marketPrice)) + Number(poolAmounts[1])
            const IR2 = (Number(initBTC) * Number(marketPrice)) + Number(initUSDT)

            data[i] = {
                price : Number(marketPrice),
                loss :  Number( ((IR1 / IR2) - 1) * 100 * 0.4 )
            };

            console.log('Market Price : ',ethers.formatUnits(await market.getPrice(),18));
            console.log('Reserve -> ' ,await vault.getReserve(await mockBTC.getAddress(), await mockUSDT.getAddress()));
        }
        OUT.push({
            id : 3,
            data : data
        })

        console.log(await mockUSDT.balanceOf(await vault.getAddress()))
        console.log(await mockBTC.balanceOf(marketUser.address));
        console.log(await mockUSDT.balanceOf(marketUser.address));
     
    });

    after(async () => {
        await result();    
    });

});


