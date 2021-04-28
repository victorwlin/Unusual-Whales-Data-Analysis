const dfd = require("danfojs-node");

const x = "25";

const placeholderData = [[0, 0, 0, 0, 0, 0]];

// const placeholderData = {
//   Var: [0],
//   Min: [0],
//   Max: [0],
//   25: [0],
//   50: [0],
//   75: [0],
//   100: [0],
//   avg_high_return: [0],
// };

// const placeholderData = [{ Var: 0, 25: 0 }];

const df = new dfd.DataFrame(placeholderData);
df.print();
// df.to_csv("test2.csv").catch((err) => {
//   console.log(err);
// });
