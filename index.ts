import { Wallet } from '@ethersproject/wallet'
import {
  TransactionReceipt,
  TransactionResponse,
  JsonRpcProvider,
} from '@ethersproject/providers'
import { formatEther, formatUnits, parseEther } from '@ethersproject/units'
import { ArbAggregator } from './lib/ArbFactory.js'
import * as BscData from './data/bsc.json'
const dotenv = require('dotenv')
const fs = require('fs')

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
let baseTokenAddress = BscData.baseAssets[0]
let botinterval
const provider = new JsonRpcProvider(config.BLOCKCHAIN_PROVIDER)
const signer = new Wallet(config.PRIVATE_KEY, provider)

const arbContract = ArbAggregator.connect(config.ARB_CONTRACT, signer)

const bot_config = {
  slippage: 10,
  gas_price: 10,
  gas_limit: 10,
  profit: 10,
  liquidity: 10,
  time_limit: 10,
  bnb_amount: 10,
}

const startBot = (_config) => {
  console.log('Starting bot...')
  botinterval = setInterval(async () => {
    let max = 0
    let min = Math.pow(10, 5)
    let min_index = 0 // best sell dex
    let max_index = 0 // best buy dex
    for (let i = 0; i < BscData.routers.length; i++) {
      try {
        const amtBack = await arbContract.getAmountOutMin(
          BscData.routers[i],
          baseTokenAddress,
          config.TARGET_TOKEN_ADDRESS,
          _config.bnb_amount,
        )
        const output = formatUnits(amtBack, config.TARGET_TOKEN_DECIMAL)
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

    // check if the profit is greater than desired amount
    if (min_index !== max_index) {
      try {
        // Estimate actual output amount
        const amtBack = await arbContract.estimateDualDexTrade(
          BscData.routers[max_index],
          BscData.routers[min_index],
          baseTokenAddress,
          config.TARGET_TOKEN_ADDRESS,
          _config.bnb_amount,
        )
        // convert output amount into human readable value.
        const output = formatEther(amtBack)
        if (
          parseFloat(output) - _config.bnb_amount >
          (_config.bnb_amount * _config.profit) / 100
        ) {
          console.log('Starting bot transaction...')
          const tx: TransactionResponse = await arbContract
            .dualTrade(
              BscData.routers[max_index],
              BscData.routers[min_index],
              baseTokenAddress,
              config.TARGET_TOKEN_ADDRESS,
              _config.bnb_amount,
            )
            .send({
              gasLimit: _config.gas_limit,
              gasPrice: _config.gas_price,
            })
          const result: TransactionReceipt = await tx.wait()

          try {
            const writeStream = fs.createWriteStream('bot_history.txt', {
              flags: 'a',
            })
            writeStream.write(`
            ********** BOT TRANSACTION RESULT START **************** \n
            txHash: ${result.transactionHash}\n
            dex_from: ${BscData.routers[max_index].dex}\n
            dex_to: ${BscData.routers[min_index].dex}\n
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
  }, parseInt(_config.timelimit) * 1000)
}

startBot(bot_config)
