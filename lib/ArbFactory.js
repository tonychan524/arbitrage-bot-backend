"use strict";
exports.__esModule = true;
exports.ArbAggregator = void 0;
var ethers_1 = require("ethers");
var _abi = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address"
            },
        ],
        name: "OwnershipTransferred",
        type: "event"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_router1",
                type: "address"
            },
            {
                internalType: "address",
                name: "_router2",
                type: "address"
            },
            {
                internalType: "address",
                name: "_token1",
                type: "address"
            },
            {
                internalType: "address",
                name: "_token2",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256"
            },
        ],
        name: "dualDexTrade",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_router1",
                type: "address"
            },
            {
                internalType: "address",
                name: "_router2",
                type: "address"
            },
            {
                internalType: "address",
                name: "_token1",
                type: "address"
            },
            {
                internalType: "address",
                name: "_token2",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256"
            },
        ],
        name: "estimateDualDexTrade",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_router1",
                type: "address"
            },
            {
                internalType: "address",
                name: "_router2",
                type: "address"
            },
            {
                internalType: "address",
                name: "_router3",
                type: "address"
            },
            {
                internalType: "address",
                name: "_token1",
                type: "address"
            },
            {
                internalType: "address",
                name: "_token2",
                type: "address"
            },
            {
                internalType: "address",
                name: "_token3",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256"
            },
        ],
        name: "estimateTriDexTrade",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "router",
                type: "address"
            },
            {
                internalType: "address",
                name: "_tokenIn",
                type: "address"
            },
            {
                internalType: "address",
                name: "_tokenOut",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256"
            },
        ],
        name: "getAmountOutMin",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_tokenContractAddress",
                type: "address"
            },
        ],
        name: "getBalance",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "recoverEth",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "tokenAddress",
                type: "address"
            },
        ],
        name: "recoverTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newOwner",
                type: "address"
            },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
];
var ArbAggregator = /** @class */ (function () {
    function ArbAggregator() {
    }
    ArbAggregator.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    ArbAggregator.abi = _abi;
    return ArbAggregator;
}());
exports.ArbAggregator = ArbAggregator;
