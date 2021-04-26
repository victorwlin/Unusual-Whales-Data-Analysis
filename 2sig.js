const dfd = require("danfojs-node");
const ttest = require("ttest");

dfd
  .read_csv("feb_prepped.csv")
  .then((df) => {
    const optionType = "call";
    const winDefinition = [25];
    const variables = ["delta"];
    // const variables = [
    //   "ask",
    //   "bid",
    //   "delta",
    //   "buy_amount",
    //   "expires_in",
    //   "gamma",
    //   "implied_volatility",
    //   "open_interest",
    //   "theta",
    //   "vega",
    //   "vol_oi",
    //   "volume",
    // ];

    // main loop that goes through the different win definitions
    winDefinition.forEach((currentWinDef) => {
      /*
      CREATE winner COLUMN 
      */
      // this winner column is necessary for queries we have to make in the future
      const winner = df["high_return"].ge(currentWinDef);
      df.addColumn({ column: "winner", value: winner });

      /*
      create three dataframes: one for optionType, one for winners, and one for losers
      */
      const dfOptionType = df.query({
        column: "option_type",
        is: "==",
        to: optionType,
      });
      const dfOptionTypeWin = dfOptionType.query({
        column: "winner",
        is: "==",
        to: true,
      });
      const dfOptionTypeLose = dfOptionType.query({
        column: "winner",
        is: "==",
        to: false,
      });

      /*
      loop through the variables and calculate & store p-values
      */
      variables.forEach((currentVar) => {
        // create win and lose arrays
        const winArray = dfOptionTypeWin[currentVar].values;
        const loseArray = dfOptionTypeLose[currentVar].values;
        console.log(ttest(winArray, loseArray).testValue());
      });
    });

    // const buy_amountTtest = ttest(
    //   buy_amountCallWinArray,
    //   buy_amountCallLoseArray,
    //   {
    //     alternative: "less",
    //   }
    // );
    // const buy_amountTtestResult = {
    //   tvalue: buy_amountTtest.testValue(),
    //   pvalue: buy_amountTtest.pValue(),
    //   confidence: buy_amountTtest.confidence(),
    //   valid: buy_amountTtest.valid(),
    //   df: buy_amountTtest.freedom(),
    // };
    // console.log(buy_amountTtestResult);
  })
  .catch((err) => {
    console.log(err);
  });
