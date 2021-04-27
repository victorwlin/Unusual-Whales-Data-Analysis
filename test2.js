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

const dfOutput = new dfd.DataFrame(placeholderData);
dfOutput.print();

const phData = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

// const phData = [
//   { A: 1 },
//   { A: 1 },
//   { A: 1 },
//   { A: 1 },
//   { A: 1 },
//   { A: 1 },
//   { A: 1 },
//   { A: 1 },
//   { A: 1 },
//   { A: 1 },
//   { A: 1 },
//   { A: 1 },
// ];

dfOutput.addColumn({
  column: "B",
  value: phData,
});
dfOutput.print();
