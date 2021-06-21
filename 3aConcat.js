// the purpose of this file is to concatenate the prepped file to the main file
const dfd = require("danfojs-node");

dfd
  .read_csv("3.Concat/dec20_to_apr21.csv")
  .then((df1) => {
    dfd
      .read_csv("2.AddCol/06.may21_addcol.csv")
      .then((df2) => {
        if (df1.shape[1] === df2.shape[1]) {
          const dfMain = dfd.concat({ df_list: [df1, df2], axis: 0 });

          dfMain.to_csv("3.Concat/dec20_to_may21.csv").catch((err) => {
            console.log(err);
          });

          console.log(`${df1.shape[1]} is compatible with ${df2.shape[1]}`);
        } else {
          console.log(`${df1.shape[1]} is NOT compatible with ${df2.shape[1]}`);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  })
  .catch((err) => {
    console.log(err);
  });
