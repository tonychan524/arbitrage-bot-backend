import { Database } from "bun:sqlite";
const db = new Database("arb_bot.db");

export const init = () => {
  db.run(
    "CREATE TABLE IF NOT EXISTS configs (id INTEGER PRIMARY KEY AUTOINCREMENT, slippage REAL, gas_price INTEGER, gas_limit INTEGER, profit REAL, liquidity INTEGER, time_limit INTEGER, bnb_amount REAL)"
  );
};

export const initializeParameter = () => {
  db.run(
    "INSERT INTO configs (slippage, gas_price, gas_limit, profit, liquidity, time_limit, bnb_amount) VALUES (?, ?, ?, ?, ?, ?, ?)",
    10,
    5,
    200000,
    0.1,
    1000000,
    2,
    0.1
  );
};

export const getParameters = () => {
  return db.query("select * from configs").get();
};

export const setParameter = ({
  slippage,
  gas_price,
  gas_limit,
  profit,
  liquidity,
  time_limit,
  bnb_amount,
}) => {
  db.run(
    "UPDATE configs SET (slippage = '" +
      slippage +
      "', gas_price='" +
      gas_price +
      "', gas_limit='" +
      gas_limit +
      "', profit='" +
      profit +
      "'" +
      "', liquidity='" +
      liquidity +
      "'" +
      "', time_limit='" +
      time_limit +
      "'" +
      "', bnb_amount='" +
      bnb_amount +
      "' WHERE id='1'"
  );
};
