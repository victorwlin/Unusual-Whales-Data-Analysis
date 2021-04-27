const dfd = require("danfojs-node");

const placeholderData = { A: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
const variables = [
  "ask",
  "bid",
  "delta",
  "buy_amount",
  "expires_in",
  "gamma",
  "implied_volatility",
  "open_interest",
  "theta",
  "vega",
  "vol_oi",
  "volume",
];

const dfOutput = new dfd.DataFrame(placeholderData, { index: variables });
dfOutput.print();

const dfNew = dfOutput.query({ column: index, is: "==", to: "ask" });
