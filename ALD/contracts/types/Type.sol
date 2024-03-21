// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

interface Type  {
    struct Plan {
        uint time;
        uint percent;
    }

    struct Lockup {
        uint id;
        Option option;
        State state;
        address sender;
        address token;
        uint count;
        uint start;
        uint amount;
        uint claimed;
        Plan[] plan;
    }

    struct Position {
        uint ask;
        uint bid;
    }

    struct TokenInfo {
        bool key;
        address addr;
        string name;
        string symbol;
        uint8 decimals;
        uint locked;
        uint exchange; // 1 token => 1MECA
        uint rate; // 1 MECA => 1token
        uint weight;
        int need;
    }

    struct Liquidity {
        uint amount;
        address token;
    }

    struct Market {
        address orderbook;
        address nft;
        Token base;
        Token quote;
        uint price;
        uint tick;
        uint8 fee;
        uint8 threshold;
        bool lock;
    }

    struct Tick {
        uint price;
        uint balance;
    }

    struct Remove {
        uint queue;
        uint amount;
    }

    struct Removes {
        Remove ask;
        Remove bid;
    }

    struct Orderbook {
        Tick[] asks;
        Tick[] bids;
    }

    struct Farm {
        address farm;
        string name;
        uint id;
        Token stake;
        Token earn;
        uint start;
        uint period;
        uint duration;
        uint goal;
        uint locked;
        uint rewards;
        uint total;
    }

    struct Staking {
        address user;
        uint start;
        uint duration;
        uint amount;
        uint reward;
    }

    //credit 
     enum Category {
        Order,
        Buy,
        Sell,
        Deposit,
        Withdraw,
        Stake,
        Unstake,
        Claim,
        Long,
        Short,
        Futures,
        Perpetual,
        Earn,
        Charge,
        Grant,
        Lockup,
        Vesting,
        Listing
    }

    enum Option {
        General,
        Market,
        Limit,
        Debit,
        Prepaid,
        Postpaid,
        Linear,
        Cliff,
        Rate
    }

    enum State {
        Pending,
        Filled,
        Claimable,
        Complete,
        Cancel,
        Open,
        Close,
        Liquidation,
        Requested,
        Paid,
        Shipping,
        Proceeding,
        Terminated
    }

    struct OrderInfo {
        Category category;
        Option option;
        State state;
        uint time;
    }

    struct OrderPack {
        uint info;
        uint price;
        uint amount;
        uint quantity;
        uint fees;
        address pay;
        address item;
        address market;
        address owner;
        bytes32 key;
    }

    struct Order {
        Category category;
        Option option;
        State state;
        uint time;
        uint price;
        uint amount;
        uint quantity;
        uint fees;
        address pay;
        address item;
        address market;
        address owner;
        bytes32 key;
    }

    struct Profile {
        string name;
        string img;
        address user;
    }

    struct Credit {
        int point;
        int score;
        string app;
        address addr;
    }

    struct User {
        int point;
        int score;
        string name;
        string img;
        string app;
        address user;
    }

    struct UserInfo {
        string name;
        string img;
        address user;
        Credit[] credit;
    }
    //dapp
     struct App {
        string logo;
        string name;
        string symbol;
        string version;
        string url;
        string description;
    }

    struct Service {
        uint id;
        address service;
    }

    struct Token {
        address addr;
        string name;
        string symbol;
        uint8 decimals;
    }
}
