import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import { formatEther, formatUnits } from "@ethersproject/units";
import Sever from "bunrest";

import { ArbAggregator } from "lib/ArbFactory";
import {
  init,
  getParameters,
  setParameter,
  initializeParameter,
} from "./lib/database";

init();
initializeParameter();

const config = {
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  DEX_SCREENER_API: process.env.DEX_SCREENER_API,
  TARGET_TOKEN_ADDRESS: process.env.TARGET_TOKEN_ADDRESS,
  TARGET_TOKEN_SYMBOL: process.env.TARGET_TOKEN_SYMBOL,
  BLOCKCHAIN_PROVIDER: process.env.BLOCKCHAIN_PROVIDER,
  TARGET_TOKEN_DECIMAL: process.env.TARGET_TOKEN_DECIMAL,
  ARB_CONTRACT: process.env.ArbContract,
};

const provider = new JsonRpcProvider(config.BLOCKCHAIN_PROVIDER);

const signer = new Wallet(config.PRIVATE_KEY, provider);

const arbContract = ArbAggregator.connect(config.ARB_CONTRACT, signer);

const getMarketData = async () => {
  console.log("starting to get market data...");
  const result = await fetch(
    `${config.DEX_SCREENER_API}/token/${config.TARGET_TOKEN_ADDRESS}`
  );
  console.log("finished to get market data...");
  console.log(result);
  return result;
};
const run = async () => {
  // await getMarketData()
};
// API Endpoints
const app = Sever();

// get bot parameters
app.get("/api/get_config", (req, res) => {
  const result = getParameters();
  res.status(200).json(result);
});

app.get("/api/get_market_data", async (req, res) => {
  const result = await getMarketData();
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

app.get("/api/get_balance", async (req, res) => {
  const balance = await provider.getBalance(config.ARB_CONTRACT);
  const tokenBalance = await arbContract.getBalance(
    config.TARGET_TOKEN_ADDRESS
  );
  res.status(200).json({
    bnb: formatEther(balance),
    token: formatUnits(tokenBalance, config.TARGET_TOKEN_DECIMAL),
  });
});
app.post("/api/save_config", (req, res) => {
  console.log(req);
  // setParameter(req.body);
  res.status(200).json({ message: "succeed" });
});

app.listen(3001, () => {
  console.log("App is listening on port 3001");
});

console.log("Hello via Bun!");

run();
