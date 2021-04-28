// the purpose of this file is to concatenate the prepped file to the main file
const dfd = require("danfojs-node");

dfd
  .read_csv("main/dec20_to_feb21.csv")
  .then((df1) => {
    dfd
      .read_csv("prepped/mar21_prepped.csv")
      .then((df2) => {
        console.log(df1.shape);
        console.log(df2);

        // const dfMain = dfd.concat({ df_list: [df1, df2], axis: 0 });

        // dfMain.to_csv("main/dec20_to_mar21.csv").catch((err) => {
        //   console.log(err);
        // });
      })
      .catch((err) => {
        console.log(err);
      });
  })
  .catch((err) => {
    console.log(err);
  });
