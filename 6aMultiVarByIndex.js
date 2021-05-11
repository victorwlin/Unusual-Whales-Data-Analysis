// this file divides the alerts into deciles and calculates the probablility of winning
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
  .read_csv("3.Concat/dec20_to_mar21_call_with_winner.csv")
  .then((df) => {
    // MAKE SURE THESE VARIABLES ARE CORRECT BEFORE RUNNING
    const testingSlice = { var: "buy_amount", istart: 0, iend: 1364 };

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
      "total",
    ];

    /*
    CREATE SLICE OF SPECIFIC BUCKET
    */
    df.sort_values({ by: testingSlice.var, inplace: true });
    df.reset_index(true);
    const subDF = df.iloc({
      rows: [`${testingSlice.istart}:${testingSlice.iend}`],
      columns: ["0:"],
    });
    subDF.to_csv("6.MultiVar/test2.csv").catch((err) => {
      console.log(err);
    });
    /*
    CALCULATE BUCKETS
    */
    const numOfAlerts = subDF["option_type"].size;
    const bucketIndices = returnBucketIndices(numOfAlerts, 10);

    /*
    MAIN LOOP FOR VARIABLES
    */
    const outputArr = []; // final output
    variables.forEach((currentVar) => {
      // create total row
      if (currentVar == "total") {
        const output = [];
        output[0] = currentVar;
        output[1] = "N/A";
        output[2] = numOfAlerts;
        output[3] = subDF[testingSlice.var].min();
        output[4] = subDF[testingSlice.var].max();
        output[10] = subDF["adj_high_return"].mean();
        output[11] = subDF["days_to_high"].mean();
        output[12] = subDF["days_to_high"].std();
        output[13] = testingSlice.istart;
        output[14] = testingSlice.iend;

        winDefinition.forEach((currentWinDef, i) => {
          const dfWin = subDF.query({
            column: `winner_${currentWinDef}`,
            is: "==",
            to: "true",
          });
          const wins = dfWin["option_type"].size;
          i = i + 5;
          output[i] = wins / numOfAlerts;
        });

        outputArr.push(output);
      } else {
        /*
        CREATE ROWS FOR EVERYTHING ELSE BESIDES TOTAL
        */
        // sort by currentVar
        subDF.sort_values({ by: currentVar, inplace: true });
        subDF.reset_index(true);

        // run for each bucket
        let prevBucketIndex = 0;
        bucketIndices.forEach((v, i) => {
          // creating bucket
          const subSubDF = subDF.iloc({
            rows: [`${prevBucketIndex}:${v}`],
            columns: ["0:"],
          });

          // creating array of outputs
          const output = [];
          output[0] = currentVar;
          output[1] = i + 1;
          output[2] = subSubDF["option_type"].size;
          output[3] = subSubDF[currentVar].min();
          output[4] = subSubDF[currentVar].max();
          output[10] = subSubDF["adj_high_return"].mean();
          output[11] = subSubDF["days_to_high"].mean();
          output[12] = subSubDF["days_to_high"].std();
          output[13] = prevBucketIndex;
          output[14] = v;

          winDefinition.forEach((currentWinDef, i) => {
            const subDFwin = subSubDF.query({
              column: `winner_${currentWinDef}`,
              is: "==",
              to: "true",
            });
            const wins = subDFwin["option_type"].size;
            i = i + 5;
            output[i] = wins / output[2];
          });

          // push array to final array of outputs
          outputArr.push(output);

          prevBucketIndex = v;
        });
      }
    });

    /*
    CREATE DATAFRAME OUTPUT
    */
    const dfOutput = new dfd.DataFrame(outputArr, {
      columns: [
        "Var",
        "Decile",
        "alerts_in_sample",
        "Min",
        "Max",
        "10",
        "25",
        "50",
        "75",
        "100",
        "avg_high_return",
        "avg_days_to_high",
        "std_days_to_high",
        "index_start",
        "index_end",
      ],
    });

    /*
    OUTPUT AS CSV FILE
    */
    dfOutput
      .to_csv("6.MultiVar/buy_amount_13284-29860_call.csv")
      .catch((err) => {
        console.log(err);
      });
  })
  .catch((err) => {
    console.log(err);
  });
