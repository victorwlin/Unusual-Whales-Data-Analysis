const dfd = require("danfojs-node");

dfd
  .read_csv("3.Concat/dec20_to_mar21_call_with_winner.csv")
  .then((df) => {
    const emos = [
      "✈️",
      "💨",
      "🌟",
      "🛌🏼",
      "🦄",
      "📈",
      "🐢",
      "🎁",
      "🦚",
      "🧞‍♂️",
      "🤠",
      "👩‍🚀",
      "🔋",
      "🌿",
      "🦔",
      "🦴",
      "🇨🇳",
      "⚠️",
      "⏱️",
      "🧰",
      "🏃",
      "🥇",
      "🎰",
      "⚡",
      "🐂",
      "🤡",
      "⛰️",
      "🎈",
      "🗓️",
      "⌛",
      "💉",
      "🛍️",
      "🐻",
      "📉",
      "🙃",
      "🚨",
      "🇬🇷",
      "🦕",
      "🚀",
      NaN,
      "total",
    ];
    const winDef = [25, 50, 75, 100];

    /*
    MAIN LOOP FOR EMOJIS
    */
    const outputArr = []; // final output
    emos.forEach((v) => {
      if (v != "total" && v != NaN) {
        try {
          // search for emojis and add column denoting their existence
          const sfSearchEmo = df["emojis"].str.search(v);
          df.addColumn({ column: "tempEmo", value: sfSearchEmo });

          // create df of just alerts with that emoji
          const dfEmo = df.query({
            column: "tempEmo",
            is: ">",
            to: -1,
          });

          const outputRow = [];
          outputRow[0] = v;
          outputRow[1] = dfEmo["option_type"].size;
          outputRow[6] = dfEmo["adj_high_return"].mean();
          outputRow[7] = "Error";
          outputRow[8] = "Error";

          // loop over win definitions
          winDef.forEach((def, i) => {
            try {
              const dfWin = dfEmo.query({
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
              outputRow[i] = 0;

              outputRow[7] = "N/A";
              outputRow[8] = "N/A";
            }
          });

          outputArr.push(outputRow);
        } catch (err) {
          const outputRow = [];
          outputRow[0] = v;
          outputRow[1] = 0;
          outputRow[2] = "N/A";
          outputRow[3] = "N/A";
          outputRow[4] = "N/A";
          outputRow[5] = "N/A";
          outputRow[6] = "N/A";
          outputRow[7] = "N/A";
          outputRow[8] = "N/A";

          outputArr.push(outputRow);
        }
      } else if (v === "total") {
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
      } else if (v === NaN) {
        // search for blanks and add column denoting their existence
        const sfSearchEmo = df["emojis"].isna();
        df.addColumn({ column: "tempEmo", value: sfSearchEmo });

        // create df of just alerts without emoji
        const dfEmo = df.query({
          column: "tempEmo",
          is: "==",
          to: true,
        });

        const outputRow = [];
        outputRow[0] = v;
        outputRow[1] = dfEmo["option_type"].size;
        outputRow[6] = dfEmo["adj_high_return"].mean();
        outputRow[7] = "Error";
        outputRow[8] = "Error";

        // loop over win definitions
        winDef.forEach((def, i) => {
          try {
            const dfWin = dfEmo.query({
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
            outputRow[i] = 0;

            outputRow[7] = "N/A";
            outputRow[8] = "N/A";
          }
        });

        outputArr.push(outputRow);
      }

      /*
      CREATE DATAFRAME OUTPUT
      */
      const dfOutput = new dfd.DataFrame(outputArr, {
        columns: [
          "Emoji",
          "alerts",
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
      dfOutput.to_csv("8.Emoji/emoji_call.csv").catch((err) => {
        console.log(err);
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
