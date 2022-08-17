import { Wallet } from "@ethersproject/wallet";
import {  TransactionReceipt, TransactionResponse, WebSocketProvider } from "@ethersproject/providers";
import { formatEther, formatUnits, parseEther } from "@ethersproject/units";
import Sever from "bunrest";
import { ArbAggregator } from "lib/ArbFactory";
import BscData from "data/bsc.json";

import {
  init,
  getParameters,
  setParameter,
  getBotHistories,
  addBotHistory
} from "./lib/database";

init();
// initializeParameter();

const config = {
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  DEX_SCREENER_API: process.env.DEX_SCREENER_API,
  TARGET_TOKEN_ADDRESS: process.env.TARGET_TOKEN_ADDRESS,
  TARGET_TOKEN_SYMBOL: process.env.TARGET_TOKEN_SYMBOL,
  BLOCKCHAIN_PROVIDER: process.env.BLOCKCHAIN_PROVIDER,
  TARGET_TOKEN_DECIMAL: process.env.TARGET_TOKEN_DECIMAL,
  WEBSOCKET_PROVIDER: process.env.WEBSOCKET_PROVIDER,
  ARB_CONTRACT: process.env.ArbContract,
};
let baseTokenAddress = BscData.baseAssets[0];
let botinterval;
const provider = new WebSocketProvider(config.WEBSOCKET_PROVIDER);
const signer = new Wallet(config.PRIVATE_KEY, provider);

const arbContract = ArbAggregator.connect(config.ARB_CONTRACT, signer);

// API Endpoints
const app = Sever();

const startBot = (_config) => {
  console.log("Starting bot...")
  botinterval = setInterval(async () => {
    for (let i = 0; i < BscData.routers.length; i++) {
      for (let j = i + 1; j < BscData.routers.length; j++) {
        try {
          const amtBack = await ArbAggregator.estimateDualDexTrade(
            BscData.routers[i],
            BscData.routers[j],
            baseTokenAddress,
            config.TARGET_TOKEN_ADDRESS,
            _config.bnb_amount
          );
          const output = formatUnits(amtBack, config.TARGET_TOKEN_DECIMAL);
          if (
            parseFloat(output) - _config.bnb_amount >
            (_config.bnb_amount * _config.profit) / 100
          ) {
            console.log("Starting bot transaction...")
            const tx:TransactionResponse = await ArbAggregator.dualTrade(
              BscData.routers[i],
              BscData.routers[j],
              baseTokenAddress,
              config.TARGET_TOKEN_ADDRESS,
              _config.bnb_amount
            ).send({
              gasLimit: _config.gas_limit,
              gasPrice: _config.gas_price,
            });
            const result: TransactionReceipt =  await tx.wait()

            addBotHistory({
              txHash: result.transactionHash,
              dex_from:BscData.routers[i].dex,
              dex_to:BscData.routers[j].dex,
              base_token: baseTokenAddress.sym,
              target_token: config.TARGET_TOKEN_SYMBOL,
              amount_in: _config.bnb_amount,
              amount_out: parseFloat(output),
              profit:(parseFloat(output) /_config.bnb_amount) * 100, 
              gas_used: parseInt(result.gasUsed.toString()),
              datetime: new Date("yyyy-mm-dd HH:ii:ss")
            })
          } else {
            continue;
          }
        } catch {
          continue;
        }
      }
    }
  }, _config.timelimit);
};

// get bot parameters
app.get("/api/get_config", (req, res) => {
  const result = getParameters();
  res.status(200).json(result);
});

app.get("/api/get_target_token", (req, res) => {
  console.log("requested to get target token info");
  res.status(200).json({
    address: config.TARGET_TOKEN_ADDRESS,
    symbol: config.TARGET_TOKEN_SYMBOL,
    decimal: config.TARGET_TOKEN_DECIMAL,
  });
});

app.get("/api/get_base_token", (req, res) => {
  console.log("requested to get target token info");
  res.status(200).json(BscData.baseAssets);
});

app.post("/api/save_config", (req, res) => {
  console.log(req);
  // setParameter(req.body);
  if (botinterval) clearInterval(botinterval);
  const config = getParameters();
  startBot(config);
  res.status(200).json({ message: "succeed" });
});

app.post("/api/change_base_token", (req, res) => {
  console.log(req);
  if (botinterval) clearInterval(botinterval);
  const config = getParameters();
  baseTokenAddress = BscData.baseAssets.filter(basetoken => (basetoken.sym == req.body.token))[0];
  startBot(config);
  res.status(200).json({ message: "succeed" });
});
app.get("/api/get_bot_histories", (req, res) => {
  const histories = getBotHistories();
  // setParameter(req.body);
  if (histories.length > 0) {
    res.status(200).json(histories);
  } else {
  res.status(200).json({});
  }
});
app.listen(3001, () => {
  console.log("App is listening on port 3001");
});

console.log("Hello via Bun!");

if (botinterval) clearInterval(botinterval);
const botConfig = getParameters();
startBot(botConfig);