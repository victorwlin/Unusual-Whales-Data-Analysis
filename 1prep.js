// the purpose of this file is to prep the raw analytics file to be merged with the main file
// and to be used for further analysis
const dfd = require("danfojs-node");

dfd
  .read_csv("raw/mar21_raw.csv")
  .then((df) => {
    /*
    SORT THE COLUMNS
    */
    // comprehensive array of all 79 columns in the raw file
    const columnIndex = [
      "amount_of_time_above_fifty_percent",
      "amount_of_time_above_hundred_percent",
      "amount_of_time_above_itm_percent",
      "amount_of_time_above_ten_percent",
      "amount_of_time_above_thirty_percent",
      "amount_of_time_above_zero_percent",
      "amount_of_time_below_zero_percent",
      "ask",
      "avg_ask",
      "avg_fourteen_day_return",
      "avg_one_day_return",
      "avg_return",
      "avg_seven_day_return",
      "avg_three_day_return",
      "avg_twentyone_day_return",
      "bid",
      "buy_amount",
      "company_name",
      "current_return",
      "days_to_expiry",
      "delta",
      "diff",
      "emojis",
      "ever_itm",
      "expires_at",
      "gamma",
      "high",
      "high_date_time",
      "high_diff_time",
      "high_return",
      "id",
      "implied_volatility",
      "industry_type",
      "itm_time",
      "low",
      "low_date_time",
      "low_diff_time",
      "low_return",
      "open_interest",
      "option_symbol",
      "option_type",
      "rho",
      "sector",
      "strike_price",
      "tags",
      "theo",
      "theta",
      "ticker_symbol",
      "tier",
      "time_spent_above_fifty_in_hours",
      "time_spent_above_hundred_in_hours",
      "time_spent_above_thirty_in_hours",
      "time_spent_below_zero_in_hours",
      "time_to_first_minus_fifty",
      "time_to_first_minus_fifty_timestamp",
      "time_to_first_minus_fourty",
      "time_to_first_minus_fourty_timestamp",
      "time_to_first_minus_ten",
      "time_to_first_minus_ten_timestamp",
      "time_to_first_minus_thirty",
      "time_to_first_minus_thirty_timestamp",
      "time_to_first_minus_twenty",
      "time_to_first_minus_twenty_timestamp",
      "time_to_first_plus_fifty",
      "time_to_first_plus_fifty_timestamp",
      "time_to_first_plus_fourty",
      "time_to_first_plus_fourty_timestamp",
      "time_to_first_plus_hundred",
      "time_to_first_plus_hundred_timestamp",
      "time_to_first_plus_ten",
      "time_to_first_plus_ten_timestamp",
      "time_to_first_plus_thirty",
      "time_to_first_plus_thirty_timestamp",
      "time_to_first_plus_twenty",
      "time_to_first_plus_twenty_timestamp",
      "underlying_purchase_price",
      "vega",
      "volume",
    ];

    // create new df
    const dfColumnsSorted = new dfd.DataFrame({
      alert_time: df["alert_time"].values,
    });

    // fill df with values
    columnIndex.forEach((val, i) => {
      dfColumnsSorted.addColumn({ column: val, value: df[val].values });
    });
    dfColumnsSorted.print();

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
    // only keep the date portion of alert_time and high_date_time
    let tempDate = df["alert_time"].str.substr(0, 10);
    df.addColumn({ column: "alert_date", value: tempDate });
    tempDate = df["high_date_time"].str.substr(0, 10);
    df.addColumn({ column: "high_date", value: tempDate });

    // convert expires_at and alert_time columns to datetime format
    // it looks like only series can be converted and not the whole dataframe
    const dt_expires_at = dfd.to_datetime({ data: df["expires_at"] });
    const dt_alert_date = dfd.to_datetime({ data: df["alert_date"] });
    const dt_high_date = dfd.to_datetime({ data: df["high_date"] });

    // for each element in our datetime series, calculate the difference
    // the difference is in milliseconds, so first we push it into a temporary array
    const expires_inInMilliseconds = [];
    const days_to_highInMilliseconds = [];
    dt_expires_at.date_list.forEach((value, index) => {
      expires_inInMilliseconds.push(value - dt_alert_date.date_list[index]);
    });
    dt_high_date.date_list.forEach((value, index) => {
      days_to_highInMilliseconds.push(value - dt_alert_date.date_list[index]);
    });

    // now we convert milliseconds to days and push into our final array
    // for some reason when expires_at is converted to datetime, it becomes one day earlier
    // that is why we have to add one
    const expires_in = [];
    const days_to_high = [];
    expires_inInMilliseconds.forEach((value) => {
      expires_in.push(value / (1000 * 60 * 60 * 24));
    });
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
    df.addColumn({ column: "adj_high_return", value: adj_high_return });

    /*
    OUTPUT AS CSV FILE
    */
    df.to_csv("prepped/mar21_prepped.csv").catch((err) => {
      console.log(err);
    });
  })
  .catch((err) => {
    console.log(err);
  });
