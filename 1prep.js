// the purpose of this file is to prep the raw analytics file to be merged with the main file
// and to be used for further analysis
const dfd = require("danfojs-node");

dfd
  .read_csv("feb_raw.csv")
  .then((df) => {
    /*
    CHECK FOR COMMAS
    one of the sectors in the sector column is "Mining, Quarrying, and Oil and Gas Extraction"
    we have to get rid of the commas in order for the exported csv file to work as intended
    */
    // before we use the search function to check for commas, we need to fill all of the NANs
    const fillna = df["sector"].fillna({ value: "N/A" });
    df.addColumn({ column: "sector", value: fillna });

    // This while loop searches for commas in the sector column. If it finds something, it will
    // continue to get rid of the commas and replace the column until it finds nothing.
    while (df["sector"].str.search(",").max() > -1) {
      const noComma = df["sector"].str.replace(",", "");
      df.addColumn({ column: "sector", value: noComma });
    }

    /*
    CREATE vol_oi COLUMN
    */
    const vol_oi = df["volume"].div(df["open_interest"]);
    df.addColumn({ column: "vol_oi", value: vol_oi });

    /*
    CREATE expires_in and high_date COLUMNS
    */
    // convert expires_at and alert_time columns to datetime format
    // it looks like only series can be converted and not the whole dataframe
    const dt_expires_at = dfd.to_datetime({ data: df["expires_at"] });
    const dt_alert_time = dfd.to_datetime({ data: df["alert_time"] });
    const dt_high_date_time = dfd.to_datetime({ data: df["high_date_time"] });

    // for each element in our datetime series, calculate the difference
    // the difference is in milliseconds, so first we push it into a temporary array
    const expires_inInMilliseconds = [];
    const high_dateInMilliseconds = [];
    dt_expires_at.date_list.forEach((value, index) => {
      expires_inInMilliseconds.push(value - dt_alert_time.date_list[index]);
    });
    dt_high_date_time.date_list.forEach((value, index) => {
      high_dateInMilliseconds.push(value - dt_alert_time.date_list[index]);
    });

    // now we convert milliseconds to days and push into our final array
    // for some reason when expires_at is converted to datetime, it becomes one day earlier
    // that is why we have to add one
    const expires_in = [];
    const high_date = [];
    expires_inInMilliseconds.forEach((value) => {
      expires_in.push(value / (1000 * 60 * 60 * 24) + 1);
    });
    high_dateInMilliseconds.forEach((value) => {
      high_date.push(value / (1000 * 60 * 60 * 24));
    });

    // finally we add the expires_in column to our main dataframe
    df.addColumn({ column: "expires_in", value: expires_in });
    df.addColumn({ column: "high_date", value: high_date });

    /*
    OUTPUT AS CSV FILE
    */
    df.to_csv("feb_prepped.csv").catch((err) => {
      console.log(err);
    });
  })
  .catch((err) => {
    console.log(err);
  });
