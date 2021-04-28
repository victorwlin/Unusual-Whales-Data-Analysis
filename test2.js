// the purpose of this file is to prep the raw analytics file to be merged with the main file
// and to be used for further analysis
const dfd = require("danfojs-node");

dfd
  .read_csv("raw/mar21_raw.csv")
  .then((df) => {
    /*
    SORT THE COLUMNS
    */
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

    const dfColumnsSorted = new dfd.DataFrame({
      alert_time: df["alert_time"].values,
    });

    columnIndex.forEach((val, i) => {
      dfColumnsSorted.addColumn({ column: val, value: df[val].values });
    });
    dfColumnsSorted.print();
    console.log(dfColumnsSorted.shape);
  })
  .catch((err) => {
    console.log(err);
  });
