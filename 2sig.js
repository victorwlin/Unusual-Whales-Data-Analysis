const dfd = require("danfojs-node");
const ttest = require("ttest");

dfd
  .read_csv("feb_raw_prepped.csv")
  .then((df) => {
    const type = "call";
    const winDefinition = [25];

    winDefinition.forEach((currentWinDef, index) => {
      // everything goes in here
    });

    /*
    CREATE call DATAFRAME
    */
    const callDF = df.query({ column: "option_type", is: "==", to: "call" });

    /*
    CREATE call win DATAFRAME
    */
    const callWinDF = callDF.query({ column: "winner", is: "==", to: "true" });

    /*
    CREATE buy_amount call win ARRAY
    */
    const buy_amountCallWinArray = callWinDF["buy_amount"].values;

    /*
    CREATE call lose DATAFRAME
    */
    const callLoseDF = callDF.query({
      column: "winner",
      is: "==",
      to: "false",
    });

    /*
    CREATE buy_amount call lose ARRAY
    */
    const buy_amountCallLoseArray = callLoseDF["buy_amount"].values;

    const buy_amountTtest = ttest(
      buy_amountCallWinArray,
      buy_amountCallLoseArray,
      {
        alternative: "less",
      }
    );
    const buy_amountTtestResult = {
      tvalue: buy_amountTtest.testValue(),
      pvalue: buy_amountTtest.pValue(),
      confidence: buy_amountTtest.confidence(),
      valid: buy_amountTtest.valid(),
      df: buy_amountTtest.freedom(),
    };
    console.log(buy_amountTtestResult);
  })
  .catch((err) => {
    console.log(err);
  });
