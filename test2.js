// this file divides the alerts into deciles and calculates the probablility of winning
const dfd = require("danfojs-node");

dfd
  .read_csv("3.Concat/dec20_to_mar21_call_with_winner.csv")
  .then((df) => {
    for (let i = 0.07; i <= 0.09; i + 0.01) {
      const dfTemp = df.query({
        column: "gamma",
        is: ">=",
        to: i,
        inplace: false,
      });
      dfTemp.query({
        column: "gamma",
        is: "<",
        to: i + 0.01,
        inplace: true,
      });
      console.log(i);
    }
  })
  .catch((err) => {
    console.log(err);
  });
