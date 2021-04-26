const dfd = require("danfojs-node");

dfd
  .read_csv("feb_prepped.csv")
  .then((df) => {
    const optionType = "call";
    const winDefinition = [25];
    const variables = ["ask"];

    // main loop that goes through the different win definitions
    winDefinition.forEach((currentWinDef) => {
      const winner = df["high_return"].ge(currentWinDef);
      df.addColumn({ column: "winner", value: winner });
    });

    const dfOptionType = df.query({
      column: "option_type",
      is: "==",
      to: optionType,
    });

    // console.log(dfOptionType.dtype);

    // dfOptionType["winner"].print();

    const dfOptionTypeWin = dfOptionType.query({
      column: "winner",
      is: "==",
      to: true,
    });

    dfOptionTypeWin.print();

    // df.to_csv("test.csv").catch((err) => {
    //   console.log(err);
    // });
  })
  .catch((err) => {
    console.log(err);
  });
