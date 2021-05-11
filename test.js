const dfd = require("danfojs-node");

dfd
  .read_csv("3.Concat/dec20_to_mar21_call_with_winner.csv")
  .then((df) => {
    // this is the column that I want to analyze
    const col = "emojis";

    // put unique values into an array and add total to the array
    const sf = df[col].unique();
    // console.log(sf.values);

    const dfOutput = new dfd.DataFrame(sf.values);
    // dfOutput.print();

    // const dfOutput = new dfd.DataFrame(outputArr, {
    //   columns: [
    //     "Emoji",
    //     "alerts",
    //     "25",
    //     "50",
    //     "75",
    //     "100",
    //     "avg_high_return",
    //     "winner_avg_days_to_high",
    //     "winner_std_days_to_high",
    //   ],
    // });

    /*
    OUTPUT AS CSV FILE
    */
    dfOutput.to_csv("8.Emoji/emoji_unique.csv").catch((err) => {
      console.log(err);
    });
  })
  .catch((err) => {
    console.log(err);
  });
