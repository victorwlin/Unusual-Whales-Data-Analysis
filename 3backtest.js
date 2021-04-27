const dfd = require("danfojs-node");

dfd
  .read_csv("feb_prepped.csv")
  .then((df) => {
    // MAKE SURE THESE VARIABLES ARE CORRECT BEFORE RUNNING
    const optionType = "call";
    const winDefinition = [25, 50, 75, 100];
    const variables = ["ask"];
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
      const winner = dfOptionType["high_return"].ge(currentWinDef);
      dfOptionType.addColumn({
        column: `winner_${currentWinDef}`,
        value: winner,
      });
    });

    /*
    CALCULATE BUCKETS
    */
    const numOfAlerts = dfOptionType["option_type"].size;
    const bucketSize = Math.ceil(numOfAlerts / 10);
    const bucketArr = [];
    for (let i = 1; i < 11; i++) {
      bucketArr.push(bucketSize);
    }

    let i = 9;
    while (bucketArr.reduce((a, b) => a + b, 0) > numOfAlerts) {
      bucketArr[i] = bucketArr[i] - 1;
      i = i - 1;
    }
    console.log(bucketArr);

    /*
    MAIN LOOP FOR VARIABLES
    */
    variables.forEach((currentVar) => {
      // sort by currentVar
      dfOptionType.sort_values({ by: currentVar, inplace: true });

      // split into buckets

      const buckets = [151, 303, 455, 607, 759, 911, 1063, 1214, 1365, 1516];
    });

    /*
    OUTPUT AS CSV FILE
    */
    // dfOptionType.to_csv("test.csv").catch((err) => {
    //   console.log(err);
    // });
  })
  .catch((err) => {
    console.log(err);
  });
