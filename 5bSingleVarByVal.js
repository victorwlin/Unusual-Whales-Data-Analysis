// this file isolates a single variable and groups and iterates by a custom value
const dfd = require("danfojs-node");

dfd
  .read_csv("3.Concat/dec20_to_may21_call_with_winner.csv")
  .then((df) => {
    // MAKE SURE THESE VARIABLES ARE CORRECT BEFORE RUNNING
    const winDefinition = [10, 25, 50, 75, 100];
    const variables = ["gamma", "total"];

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
        output[3] = "N/A";
        output[4] = "N/A";
        output[10] = df["adj_high_return"].mean() / 100;

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
            output[11] = dfWin["days_to_high"].mean();
            output[12] = dfWin["days_to_high"].std();
          }
        });

        outputArr.push(output);
      } else {
        /*
        CREATE ROWS FOR EVERYTHING ELSE BESIDES TOTAL
        */
        let i2 = 1;
        // create temporary slices
        for (let i = 0.07; i <= 0.09; i = i + 0.01) {
          // some of these slices don't have any alerts, so we need to try and catch for errors
          try {
            const dfTemp = df.query({
              column: currentVar,
              is: ">",
              to: i,
              inplace: false,
            });
            dfTemp.query({
              column: currentVar,
              is: "<=",
              to: i + 0.01,
              inplace: true,
            });

            // creating array of outputs
            const output = [];
            output[0] = currentVar;
            output[1] = i2;
            output[2] = dfTemp["option_type"].size;
            output[3] = dfTemp[currentVar].min();
            output[4] = dfTemp[currentVar].max();
            output[10] = dfTemp["adj_high_return"].mean() / 100;
            output[11] = dfTemp["days_to_high"].mean();
            output[12] = dfTemp["days_to_high"].std();

            winDefinition.forEach((currentWinDef, i3) => {
              try {
                const subDFwin = dfTemp.query({
                  column: `winner_${currentWinDef}`,
                  is: "==",
                  to: "true",
                });
                const wins = subDFwin["option_type"].size;
                i3 = i3 + 5;
                output[i3] = wins / output[2];

                // add days_to_high average and standard deviation for winners
                if (currentWinDef === 25) {
                  output[11] = subDFwin["days_to_high"].mean();
                  output[12] = subDFwin["days_to_high"].std();
                }
              } catch (err) {
                i3 = i3 + 5;
                output[i3] = 0 / output[2];

                output[11] = "N/A";
                output[12] = "N/A";
              }
            });

            // push array to final array of outputs
            outputArr.push(output);

            i2 = i2 + 1;
          } catch (err) {
            const output = [];
            output[0] = currentVar;
            output[1] = i2;
            output[2] = 0;
            output[3] = i;
            output[4] = i + 0.01;
            output[5] = "N/A";
            output[6] = "N/A";
            output[7] = "N/A";
            output[8] = "N/A";
            output[9] = "N/A";
            output[10] = "N/A";
            output[11] = "N/A";
            output[12] = "N/A";

            // push array to final array of outputs
            outputArr.push(output);

            i2 = i2 + 1;
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
        "Group Number",
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
      ],
    });

    /*
    OUTPUT AS CSV FILE
    */
    dfOutput
      .to_csv("5.WinProb/WinProbCallGamma-dec20-may21v2.csv")
      .catch((err) => {
        console.log(err);
      });
  })
  .catch((err) => {
    console.log(err);
  });
