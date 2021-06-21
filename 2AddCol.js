// the purpose of this file is to add the columns necessary for my analysis
const dfd = require("danfojs-node");

dfd
  .read_csv("1.SortCol/06.may21_colsort.csv")
  .then((df) => {
    /*
    CREATE vol_oi COLUMN
    */
    const vol_oi = df["volume"].div(df["open_interest"]);
    df.addColumn({ column: "vol_oi", value: vol_oi });

    /*
    CREATE expires_in, high_date, and days_to_high COLUMNS
    */
    // create new columns with just the date portion of alert_time and high_date_time
    let tempDate = df["alert_time"].str.substr(0, 10);
    df.addColumn({ column: "alert_date", value: tempDate });
    tempDate = df["high_date_time"].str.substr(0, 10);
    df.addColumn({ column: "high_date", value: tempDate });

    // convert expires_at and alert_time columns to datetime format
    // it looks like only series can be converted and not the whole dataframe
    const dt_expires_at = dfd.to_datetime({
      data: df["expires_at"],
    });
    const dt_alert_date = dfd.to_datetime({
      data: df["alert_date"],
    });
    const dt_high_date = dfd.to_datetime({
      data: df["high_date"],
    });

    // for each element in our datetime series, calculate the difference
    // the difference is in milliseconds, so first we push it into a temporary array
    const expires_inInMilliseconds = [];
    dt_expires_at.date_list.forEach((value, index) => {
      expires_inInMilliseconds.push(value - dt_alert_date.date_list[index]);
    });

    const days_to_highInMilliseconds = [];
    dt_high_date.date_list.forEach((value, index) => {
      days_to_highInMilliseconds.push(value - dt_alert_date.date_list[index]);
    });

    // now we convert milliseconds to days and push into our final array
    const expires_in = [];
    expires_inInMilliseconds.forEach((value) => {
      expires_in.push(value / (1000 * 60 * 60 * 24));
    });

    const days_to_high = [];
    days_to_highInMilliseconds.forEach((value) => {
      days_to_high.push(value / (1000 * 60 * 60 * 24));
    });

    // finally we add the expires_in column to our main dataframe
    df.addColumn({ column: "expires_in", value: expires_in });
    df.addColumn({ column: "days_to_high", value: days_to_high });

    /*
    CALCULATE AND ADD adj_high_return COLUMN
    */
    const highLessCom = df["high"].sub(0.0065);
    const askPlusCom = df["ask"].add(0.0065);
    const totalRet = highLessCom.div(askPlusCom);
    const ret = totalRet.sub(1);
    const adj_high_return = ret.mul(100);
    df.addColumn({
      column: "adj_high_return",
      value: adj_high_return,
    });

    /*
    OUTPUT AS CSV FILE
    */
    df.to_csv("2.AddCol/06.may21_addcol.csv").catch((err) => {
      console.log(err);
    });
  })
  .catch((err) => {
    console.log(err);
  });
