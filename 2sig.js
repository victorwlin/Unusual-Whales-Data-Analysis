const dfd = require("danfojs-node");
const ttest = require("ttest");

dfd
  .read_csv("feb_prepped.csv")
  .then((df) => {
    // MAKE SURE THESE VARIABLES ARE CORRECT BEFORE RUNNING
    const optionType = "call";
    const winDefinition = [25, 50, 75, 100];
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

    const placeholderData = {
      Variables: variables,
    };
    const dfOutput = new dfd.DataFrame(placeholderData, {
      index: variables,
    });

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
      const pValues = [];

      variables.forEach((currentVar) => {
        // determine whether we should test if win mean is greater than or less than lose mean
        let whichTail = "not equal";
        if (
          dfOptionTypeWin[currentVar].mean() >
          dfOptionTypeLose[currentVar].mean()
        ) {
          whichTail = "greater";
        } else if (
          dfOptionTypeWin[currentVar].mean() <
          dfOptionTypeLose[currentVar].mean()
        ) {
          whichTail = "less";
        }

        // create win and lose arrays
        const winArray = dfOptionTypeWin[currentVar].values;
        const loseArray = dfOptionTypeLose[currentVar].values;

        // add p-value to array
        pValues.push(
          ttest(winArray, loseArray, { alternative: whichTail }).testValue() // choose pValue or testValue
        );
      });

      dfOutput.addColumn({ column: `${currentWinDef}%`, value: pValues });
    });

    /*
    OUTPUT AS CSV FILE
    */
    dfOutput.to_csv("testValuesCall.csv").catch((err) => {
      console.log(err);
    });
  })
  .catch((err) => {
    console.log(err);
  });
