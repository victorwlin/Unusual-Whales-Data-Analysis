const dfd = require("danfojs-node");

const returnBucketIndices = (numOfAlerts, numOfBuckets) => {
  const bucketSize = Math.ceil(numOfAlerts / numOfBuckets);

  // create array of uniform buckets
  const bucketSizes = [];
  for (let i = 0; i < 10; i++) {
    bucketSizes.push(bucketSize);
  }

  // iterate from the back of the array by subtracting one from each bucket
  // until the appropriate numOfAlerts is reached
  let i = 9;
  while (bucketSizes.reduce((a, b) => a + b, 0) > numOfAlerts) {
    bucketSizes[i] = bucketSizes[i] - 1;
    i = i - 1;
  }

  // create index points for the buckets
  const bucketIndices = [];
  i = 0;
  bucketSizes.forEach((size) => {
    bucketIndices.push(i + size);
    i = i + size;
  });

  return bucketIndices;
};

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
    const bucketIndices = returnBucketIndices(numOfAlerts, 10);

    /*
    MAIN LOOP FOR VARIABLES
    */
    const outputArr = []; // final output
    variables.forEach((currentVar) => {
      // sort by currentVar
      dfOptionType.sort_values({ by: currentVar, inplace: true });
      dfOptionType.reset_index(true);

      // run for each bucket
      let prevBucketIndex = 0;
      bucketIndices.forEach((i) => {
        // creating bucket
        const subDFOptionType = dfOptionType.iloc({
          rows: [`${prevBucketIndex}:${i}`],
          columns: ["0:"],
        });

        // creating array of outputs
        const output = [];
        output[0] = currentVar;
        output[1] = subDFOptionType[currentVar].min();
        output[2] = subDFOptionType[currentVar].max();
        output[7] = subDFOptionType["high_return"].mean();

        const totalAlerts = subDFOptionType["option_type"].size;
        winDefinition.forEach((currentWinDef, i) => {
          const subDFwin = subDFOptionType.query({
            column: `winner_${currentWinDef}`,
            is: "==",
            to: true,
          });
          const wins = subDFwin["option_type"].size;
          i = i + 3;
          output[i] = wins / totalAlerts;
        });

        // push array to final array of outputs
        outputArr.push(output);

        prevBucketIndex = i;
      });
    });

    /*
    CREATE DATAFRAME OUTPUT
    */
    const dfOutput = new dfd.DataFrame(outputArr, {
      columns: [
        "Var",
        "Min",
        "Max",
        "25",
        "50",
        "75",
        "100",
        "avg_high_return",
      ],
    });

    /*
    OUTPUT AS CSV FILE
    */
    dfOutput.to_csv("backtestCall.csv").catch((err) => {
      console.log(err);
    });
  })
  .catch((err) => {
    console.log(err);
  });
