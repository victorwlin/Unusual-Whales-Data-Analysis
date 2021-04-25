const dfd = require("danfojs-node");

dfd
  .read_csv("test.csv")
  .then((df) => {
    df.print();

    const fillna = df["sector"].fillna({ value: "N/A" });
    df.addColumn({ column: "sector", value: fillna });
    df.print();

    while (df["sector"].str.search(",").max() > -1) {
      const noComma = df["sector"].str.replace(",", "");
      df.addColumn({ column: "sector", value: noComma });
    }

    df.print();
    // let commaCheck = df["sector"].str.search(",");
    // commaCheck.print();

    // console.log(commaCheck.max());

    // let noComma = df["sector"].str.replace(",", "");
    // df.addColumn({ column: "sector", value: noComma });

    // df.print();

    // commaCheck = df["sector"].str.search(",");
    // commaCheck.print();

    // noComma = df["sector"].str.replace(",", "");
    // df.addColumn({ column: "sector", value: noComma });

    // df.print();

    // commaCheck = df["sector"].str.search(",");
    // commaCheck.print();
  })
  .catch((err) => {
    console.log(err);
  });
