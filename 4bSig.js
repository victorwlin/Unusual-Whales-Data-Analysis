// this file tests whether winners differ significantly from the overall pool
const dfd = require("danfojs-node");
const ttest = require("ttest");

dfd
  .read_csv("3.Concat/dec20_to_mar21.csv")
  .then((df) => {
    // MAKE SURE THESE VARIABLES ARE CORRECT BEFORE RUNNING
    const optionType = "call";
    const winDefinition = [10, 25, 50, 75, 100];
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

    // create an output df to store our results
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
      const winner = df["adj_high_return"].ge(currentWinDef);
      df.addColumn({ column: "winner", value: winner });

      /*
      create two dataframes: one for optionType and one for winners
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

      /*
      loop through the variables and calculate & store p-values
      */
      const pValues = [];

      variables.forEach((currentVar) => {
        // determine whether we should test if win mean is greater than or less than overall mean
        let whichTail = "not equal";
        if (
          dfOptionTypeWin[currentVar].mean() > dfOptionType[currentVar].mean()
        ) {
          whichTail = "greater";
        } else if (
          dfOptionTypeWin[currentVar].mean() < dfOptionType[currentVar].mean()
        ) {
          whichTail = "less";
        }

        // create win and overall arrays
        const winArray = dfOptionTypeWin[currentVar].values;
        const overallArray = dfOptionType[currentVar].values;

        // add p-value to array
        pValues.push(
          ttest(winArray, overallArray, { alternative: whichTail }).pValue() // choose pValue or testValue
        );
      });

      dfOutput.addColumn({ column: `${currentWinDef}%`, value: pValues });
    });

    /*
    OUTPUT AS CSV FILE
    */
    // change file name
    dfOutput
      .to_csv("4.Sig/pVal-call-dec20-to-mar21-against-overall.csv")
      .catch((err) => {
        console.log(err);
      });
  })
  .catch((err) => {
    console.log(err);
  });
