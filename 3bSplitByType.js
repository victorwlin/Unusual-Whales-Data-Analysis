// this file divides the alerts into deciles and calculates the probablility of winning
const dfd = require("danfojs-node");

dfd
  .read_csv("3.Concat/dec20_to_mar21.csv")
  .then((df) => {
    // MAKE SURE THESE VARIABLES ARE CORRECT BEFORE RUNNING
    const optionType = "put";
    const winDefinition = [10, 25, 50, 75, 100];

    /*
    MAKE QUERY FOR JUST optionType
    */
    const dfOptionType = df.query({
      column: "option_type",
      is: "==",
      to: optionType,
    });

    /*
    MAKE winner COLUMN FOR EACH WIN DEFINITION
    */
    winDefinition.forEach((currentWinDef) => {
      // these winner columns are necessary for queries we have to make in the future
      const winner = dfOptionType["adj_high_return"].ge(currentWinDef);
      dfOptionType.addColumn({
        column: `winner_${currentWinDef}`,
        value: winner,
      });
    });

    /*
    OUTPUT AS CSV FILE
    */
    dfOptionType
      .to_csv("3.Concat/dec20_to_mar21_put_with_winner.csv")
      .catch((err) => {
        console.log(err);
      });
  })
  .catch((err) => {
    console.log(err);
  });
