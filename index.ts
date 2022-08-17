import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider, WebSocketProvider } from "@ethersproject/providers";
import { formatEther, formatUnits } from "@ethersproject/units";
import Sever from "bunrest";
import axios from "axios";
import { ArbAggregator } from "lib/ArbFactory";
import BscData from 'data/bsc.json'

import {
  init,
  getParameters,
  setParameter,
  initializeParameter,
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
console.log(config.BLOCKCHAIN_PROVIDER);

const provider = new WebSocketProvider(config.WEBSOCKET_PROVIDER);
const signer = new Wallet(config.PRIVATE_KEY, provider);
const arbContract = ArbAggregator.connect(config.ARB_CONTRACT, signer);

// API Endpoints
const app = Sever();

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
  res.status(200).json({ message: "succeed" });
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
