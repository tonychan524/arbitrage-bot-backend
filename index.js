"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var wallet_1 = require("@ethersproject/wallet");
var providers_1 = require("@ethersproject/providers");
var units_1 = require("@ethersproject/units");
var ArbFactory_js_1 = require("./lib/ArbFactory.js");
var BscData = require("./data/bsc.json");
var dotenv = require('dotenv');
var fs = require('fs');
dotenv.config();
var config = {
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    DEX_SCREENER_API: process.env.DEX_SCREENER_API,
    TARGET_TOKEN_ADDRESS: process.env.TARGET_TOKEN_ADDRESS,
    TARGET_TOKEN_SYMBOL: process.env.TARGET_TOKEN_SYMBOL,
    BLOCKCHAIN_PROVIDER: process.env.BLOCKCHAIN_PROVIDER,
    TARGET_TOKEN_DECIMAL: process.env.TARGET_TOKEN_DECIMAL,
    WEBSOCKET_PROVIDER: process.env.WEBSOCKET_PROVIDER,
    ARB_CONTRACT: process.env.ArbContract
};
var baseTokenAddress = BscData.baseAssets[0];
var botinterval;
var provider = new providers_1.JsonRpcProvider(config.BLOCKCHAIN_PROVIDER);
var signer = new wallet_1.Wallet(config.PRIVATE_KEY, provider);
var arbContract = ArbFactory_js_1.ArbAggregator.connect(config.ARB_CONTRACT, signer);
var bot_config = {
    slippage: 10,
    gas_price: 10,
    gas_limit: 10,
    profit: 10,
    liquidity: 10,
    time_limit: 10,
    bnb_amount: 10
};
var startBot = function (_config) {
    console.log('Starting bot...');
    botinterval = setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
        var max, min, min_index, max_index, i, amtBack, output, _a, amtBack, output, tx, result, writeStream, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    max = 0;
                    min = Math.pow(10, 5);
                    min_index = 0 // best sell dex
                    ;
                    max_index = 0 // best buy dex
                    ;
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < BscData.routers.length)) return [3 /*break*/, 6];
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, arbContract.getAmountOutMin(BscData.routers[i], baseTokenAddress, config.TARGET_TOKEN_ADDRESS, _config.bnb_amount)];
                case 3:
                    amtBack = _c.sent();
                    output = (0, units_1.formatUnits)(amtBack, config.TARGET_TOKEN_DECIMAL);
                    // find best dexs for buying and selling
                    if (parseFloat(output) > max) {
                        max = parseFloat(output);
                        max_index = i;
                    }
                    if (parseFloat(output) < min) {
                        min = parseFloat(output);
                        min_index = i;
                    }
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    return [3 /*break*/, 5];
                case 5:
                    i++;
                    return [3 /*break*/, 1];
                case 6:
                    if (!(min_index !== max_index)) return [3 /*break*/, 13];
                    _c.label = 7;
                case 7:
                    _c.trys.push([7, 12, , 13]);
                    return [4 /*yield*/, arbContract.estimateDualDexTrade(BscData.routers[max_index], BscData.routers[min_index], baseTokenAddress, config.TARGET_TOKEN_ADDRESS, _config.bnb_amount)
                        // convert output amount into human readable value.
                    ];
                case 8:
                    amtBack = _c.sent();
                    output = (0, units_1.formatEther)(amtBack);
                    if (!(parseFloat(output) - _config.bnb_amount >
                        (_config.bnb_amount * _config.profit) / 100)) return [3 /*break*/, 11];
                    console.log('Starting bot transaction...');
                    return [4 /*yield*/, arbContract
                            .dualTrade(BscData.routers[max_index], BscData.routers[min_index], baseTokenAddress, config.TARGET_TOKEN_ADDRESS, _config.bnb_amount)
                            .send({
                            gasLimit: _config.gas_limit,
                            gasPrice: _config.gas_price
                        })];
                case 9:
                    tx = _c.sent();
                    return [4 /*yield*/, tx.wait()];
                case 10:
                    result = _c.sent();
                    try {
                        writeStream = fs.createWriteStream('bot_history.txt', {
                            flags: 'a'
                        });
                        writeStream.write("\n            ********** BOT TRANSACTION RESULT START **************** \n\n            txHash: ".concat(result.transactionHash, "\n\n            dex_from: ").concat(BscData.routers[max_index].dex, "\n\n            dex_to: ").concat(BscData.routers[min_index].dex, "\n\n            base_token: ").concat(baseTokenAddress.sym, "\n\n            target_token: ").concat(config.TARGET_TOKEN_SYMBOL, "\n\n            amount_in: ").concat(_config.bnb_amount, "\n\n            amount_out: ").concat(parseFloat(output), "\n\n            profit: ").concat((parseFloat(output) / _config.bnb_amount) * 100, "\n\n            gas_used: ").concat(parseInt(result.gasUsed.toString()), "\n\n            datetime: ").concat(new Date('yyyy-mm-dd HH:ii:ss'), "\n\n            ********** BOT TRANSACTION RESULT END **************** \n\n            "));
                        writeStream.end();
                    }
                    catch (_d) {
                        console.log('failed to write file.');
                    }
                    _c.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    _b = _c.sent();
                    console.log('failed to execute transaction.');
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    }); }, parseInt(_config.timelimit) * 1000);
};
startBot(bot_config);
