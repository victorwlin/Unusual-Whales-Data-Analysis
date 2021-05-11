const dfd = require("danfojs-node");

dfd
  .read_csv("3.Concat/dec20_to_mar21_put_with_winner.csv")
  .then((df) => {
    // this is the column that I want to analyze
    const col = "sector";

    const winDef = [25, 50, 75, 100];

    // put unique values into an array and add total to the array
    const uniqueVal = df[col].unique().values;
    uniqueVal.push("total");

    // loop over all the unique values of that column
    const outputArr = []; // final output
    uniqueVal.forEach((v) => {
      if (v != "total") {
        // query df for this specific value
        const dfV = df.query({
          column: col,
          is: "==",
          to: v,
        });

        const outputRow = [];
        outputRow[0] = v;
        outputRow[1] = dfV["option_type"].size;
        outputRow[6] = dfV["adj_high_return"].mean();
        outputRow[7] = "Error";
        outputRow[8] = "Error";

        // loop over win definitions
        winDef.forEach((def, i) => {
          try {
            const dfWin = dfV.query({
              column: `winner_${def}`,
              is: "==",
              to: "true",
            });
            i = i + 2;
            outputRow[i] = dfWin["option_type"].size / outputRow[1];

            // add days_to_high average and standard deviation for winners
            if (def === 25) {
              outputRow[7] = dfWin["days_to_high"].mean();
              outputRow[8] = dfWin["days_to_high"].std();
            }
          } catch (err) {
            i = i + 2;
            outputRow[i] = 0 / outputRow[1];

            outputRow[7] = "N/A";
            outputRow[8] = "N/A";
          }
        });

        // push array to final array of outputs
        outputArr.push(outputRow);
      } else if (v == "total") {
        const outputRow = [];
        outputRow[0] = v;
        outputRow[1] = df["option_type"].size;
        outputRow[6] = df["adj_high_return"].mean();
        outputRow[7] = "Error";
        outputRow[8] = "Error";

        winDef.forEach((def, i) => {
          const dfWin = df.query({
            column: `winner_${def}`,
            is: "==",
            to: "true",
          });
          i = i + 2;
          outputRow[i] = dfWin["option_type"].size / outputRow[1];

          // add days_to_high average and standard deviation for winners
          if (def === 25) {
            outputRow[7] = dfWin["days_to_high"].mean();
            outputRow[8] = dfWin["days_to_high"].std();
          }
        });

        outputArr.push(outputRow);
      }
    });
    // console.log(outputArr);
    /*
    CREATE DATAFRAME OUTPUT
    */
    const dfOutput = new dfd.DataFrame(outputArr, {
      columns: [
        "Var",
        "alerts_in_sample",
        "25",
        "50",
        "75",
        "100",
        "avg_high_return",
        "winner_avg_days_to_high",
        "winner_std_days_to_high",
      ],
    });

    /*
    OUTPUT AS CSV FILE
    */
    dfOutput.to_csv("7.Sector/sector_put.csv").catch((err) => {
      console.log(err);
    });
  })
  .catch((err) => {
    console.log(err);
  });
