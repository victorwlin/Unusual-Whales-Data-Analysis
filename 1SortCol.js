// this file sorts the columns so that all of the files can be concatenated later
const dfd = require("danfojs-node");

dfd
  .read_csv("0.Raw/mar21_raw.csv")
  .then((df) => {
    let temp = {};

    /*
    SORT THE COLUMNS
    */
    // comprehensive array of all 79 columns in the raw file
    const columnIndex = [
      "alert_time",
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

    // recreate raw file as an object then use it to replace df
    columnIndex.forEach((v) => {
      temp[v] = df[v].values;
    });
    df = new dfd.DataFrame(temp);

    /*
    CHECK FOR COMMAS
    one of the sectors in the sector column is "Mining, Quarrying, and Oil and Gas Extraction"
    we have to get rid of the commas in order for the exported csv file to work as intended
    */
    // before we use the search function to check for commas, we need to fill all of the NANs
    temp = df["sector"].fillna({ value: "N/A" });
    df.addColumn({ column: "sector", value: temp });

    // This while loop searches for commas in the sector column. If it finds something, it will
    // continue to get rid of the commas and replace the column until it finds nothing.
    while (df["sector"].str.search(",").max() > -1) {
      temp = df["sector"].str.replace(",", "");
      df.addColumn({ column: "sector", value: temp });
    }

    /*
    OUTPUT AS CSV FILE
    */
    df.to_csv("1.SortCol/mar21_colsort.csv").catch((err) => {
      console.log(err);
    });
  })
  .catch((err) => {
    console.log(err);
  });
