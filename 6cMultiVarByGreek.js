const dfd = require("danfojs-node");

dfd
  .read_csv("3.Concat/dec20_to_mar21_put_with_winner.csv")
  .then((df) => {
    // MAKE SURE THESE VARIABLES ARE CORRECT BEFORE RUNNING
    const testingSlice = { var: "expires_in", lower: 23, upper: 31 };

    const winDefinition = [25, 50, 75, 100];
    // const variables = ["total"]; // only use for determining if I should include or exclude lower and upper bounds in my slice
    const variables = ["delta", "total"];

    /*
    CREATE SLICE OF SPECIFIC BUCKET
    */
    df.query({
      column: testingSlice.var,
      is: ">=",
      to: testingSlice.lower,
      inplace: true,
    });
    df.query({
      column: testingSlice.var,
      is: "<",
      to: testingSlice.upper,
      inplace: true,
    });

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
        output[2] = df["option_type"].size;
        output[3] = df[testingSlice.var].min();
        output[4] = df[testingSlice.var].max();
        output[9] = df["adj_high_return"].mean();
        output[10] = "Error";
        output[11] = "Error";

        winDefinition.forEach((currentWinDef, i) => {
          const dfWin = df.query({
            column: `winner_${currentWinDef}`,
            is: "==",
            to: "true",
          });
          const wins = dfWin["option_type"].size;
          i = i + 5;
          output[i] = wins / output[2];

          // add days_to_high average and standard deviation for winners
          if (currentWinDef === 25) {
            output[10] = dfWin["days_to_high"].mean();
            output[11] = dfWin["days_to_high"].std();
          }
        });

        outputArr.push(output);
      } else {
        /*
        CREATE ROWS FOR EVERYTHING ELSE BESIDES TOTAL
        */

        // run for each bucket
        let rank = 1;
        // THIS ITERATOR HAS TO BE CHANGED FOR EACH GREEK
        for (let bucketi = -0.3; bucketi < -0.26; bucketi = bucketi + 0.04) {
          // some of these slices don't have any alerts, so we need to try and catch for errors
          try {
            const dfTemp = df.query({
              column: currentVar,
              is: ">=",
              to: bucketi,
              inplace: false,
            });
            dfTemp.query({
              column: currentVar,
              is: "<=",
              to: bucketi + 0.04,
              inplace: true,
            });

            // creating array of outputs
            const output = [];
            output[0] = currentVar;
            output[1] = rank;
            output[2] = dfTemp["option_type"].size;
            output[3] = dfTemp[currentVar].min();
            output[4] = dfTemp[currentVar].max();
            output[9] = dfTemp["adj_high_return"].mean();
            output[10] = "Error";
            output[11] = "Error";

            winDefinition.forEach((currentWinDef, wini) => {
              try {
                const subDFwin = dfTemp.query({
                  column: `winner_${currentWinDef}`,
                  is: "==",
                  to: "true",
                });
                const wins = subDFwin["option_type"].size;
                wini = wini + 5;
                output[wini] = wins / output[2];

                // add days_to_high average and standard deviation for winners
                if (currentWinDef === 25) {
                  output[10] = subDFwin["days_to_high"].mean();
                  output[11] = subDFwin["days_to_high"].std();
                }
              } catch (err) {
                wini = wini + 5;
                output[wini] = 0;

                output[10] = "N/A";
                output[11] = "N/A";
              }
            });

            // push array to final array of outputs
            outputArr.push(output);

            rank = rank + 1;
          } catch (err) {
            const output = [];
            output[0] = currentVar;
            output[1] = rank;
            output[2] = 0;
            output[3] = bucketi;
            output[4] = bucketi + 0.01;
            output[5] = "N/A";
            output[6] = "N/A";
            output[7] = "N/A";
            output[8] = "N/A";
            output[9] = "N/A";
            output[10] = "N/A";
            output[11] = "N/A";

            // push array to final array of outputs
            outputArr.push(output);

            rank = rank + 1;
          }
        }
      }
    });

    /*
    CREATE DATAFRAME OUTPUT
    */
    const dfOutput = new dfd.DataFrame(outputArr, {
      columns: [
        "Var",
        "Rank",
        "alerts_in_sample",
        "Min",
        "Max",
        "25",
        "50",
        "75",
        "100",
        "avg_high_return",
        "avg_days_to_high",
        "std_days_to_high",
      ],
    });
    dfOutput["25"].print();
    /*
    OUTPUT AS CSV FILE
    */
    // dfOutput
    //   .to_csv("6.MultiVar/expires_in_23-31_put_by_delta2.csv")
    //   .catch((err) => {
    //     console.log(err);
    //   });
  })
  .catch((err) => {
    console.log(err);
  });
