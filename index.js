import {
  Wallet
} from '@ethersproject/wallet'
import {
  JsonRpcProvider,
} from '@ethersproject/providers'
import {
  formatEther,
  formatUnits
} from '@ethersproject/units'
import {
  ArbAggregator
} from './lib/ArbFactory.js'
import {
  routers,
  baseAssets
} from './data/bsc.js'
import dotenv from 'dotenv'
import fs from 'fs'
import {
  blue,
  green,
  red
} from 'chalk'

dotenv.config()

const config = {
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  DEX_SCREENER_API: process.env.DEX_SCREENER_API,
  TARGET_TOKEN_ADDRESS: process.env.TARGET_TOKEN_ADDRESS,
  TARGET_TOKEN_SYMBOL: process.env.TARGET_TOKEN_SYMBOL,
  BLOCKCHAIN_PROVIDER: process.env.BLOCKCHAIN_PROVIDER,
  TARGET_TOKEN_DECIMAL: process.env.TARGET_TOKEN_DECIMAL,
  WEBSOCKET_PROVIDER: process.env.WEBSOCKET_PROVIDER,
  ARB_CONTRACT: process.env.ArbContract,
}
let baseTokenAddress = baseAssets[0]
const provider = new JsonRpcProvider(config.BLOCKCHAIN_PROVIDER)
const signer = new Wallet(config.PRIVATE_KEY, provider);
const getBalance = async () => {
  const balance = await signer.getBalance()
  console.log(formatEther(balance))
}
getBalance()

const arbContract = ArbAggregator.connect(config.ARB_CONTRACT, signer)

const bot_config = {
  slippage: 10,
  gas_price: 10,
  gas_limit: 21000,
  profit: 4,
  liquidity: 1000000,
  time_limit: 10,
  bnb_amount: 0.1,
}

const startBot = async (_config) => {
  console.log('Starting bot...')
  let max = 0
  let min = Math.pow(10, 5)
  let min_index = 0 // best sell dex
  let max_index = 0 // best buy dex
  for (let i = 0; i < routers.length; i++) {
    try {
      const amtBack = await arbContract.getAmountOutMin(
        routers[i].address,
        baseTokenAddress,
        config.TARGET_TOKEN_ADDRESS,
        _config.bnb_amount,
      )
      const output = formatUnits(amtBack, config.TARGET_TOKEN_DECIMAL)
      console.log(blue("expected amount output: ", output))
      // find best dexs for buying and selling
      if (parseFloat(output) > max) {
        max = parseFloat(output)
        max_index = i
      }
      if (parseFloat(output) < min) {
        min = parseFloat(output)
        min_index = i
      }
    } catch {
      continue
    }
  }
  console.log(red("min router: ", routers[max_index].dex))
  console.log(red("max router: ", routers[min_index].dex))
  // check if the profit is greater than desired amount
  if (min_index !== max_index) {
    try {
      // Estimate actual output amount
      const amtBack = await arbContract.estimateDualDexTrade(
        routers[max_index].address,
        routers[min_index].address,
        baseTokenAddress,
        config.TARGET_TOKEN_ADDRESS,
        _config.bnb_amount,
      )
      // convert output amount into human readable value.
      const output = formatEther(amtBack)
      console.log(green("expected final amount output: ", output))
      if (
        parseFloat(output) - _config.bnb_amount >
        (_config.bnb_amount * _config.profit) / 100
      ) {
        console.log('Starting bot transaction...')
        const tx = await arbContract
          .dualTrade(
            routers[max_index].address,
            routers[min_index].address,
            baseTokenAddress,
            config.TARGET_TOKEN_ADDRESS,
            _config.bnb_amount,
          )
          .send({
            gasLimit: _config.gas_limit,
            gasPrice: _config.gas_price,
          })
        const result = await tx.wait()

        try {
          const writeStream = fs.createWriteStream('bot_history.txt', {
            flags: 'a',
          })
          writeStream.write(`
            ********** BOT TRANSACTION RESULT START **************** \n
            txHash: ${result.transactionHash}\n
            dex_from: ${routers[max_index].dex}\n
            dex_to: ${routers[min_index].dex}\n
            base_token: ${baseTokenAddress.sym}\n
            target_token: ${config.TARGET_TOKEN_SYMBOL}\n
            amount_in: ${_config.bnb_amount}\n
            amount_out: ${parseFloat(output)}\n
            profit: ${(parseFloat(output) / _config.bnb_amount) * 100}\n
            gas_used: ${parseInt(result.gasUsed.toString())}\n
            datetime: ${new Date('yyyy-mm-dd HH:ii:ss')}\n
            ********** BOT TRANSACTION RESULT END **************** \n
            `)
          writeStream.end()
        } catch {
          console.log('failed to write file.')
        }
      }
    } catch {
      console.log('failed to execute transaction.')
    }
  }
}
setInterval(() => {
  startBot(bot_config)
}, bot_config.time_limit * 1000)