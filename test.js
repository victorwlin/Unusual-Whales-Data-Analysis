const dfd = require("danfojs-node");

const dfOuptut = new dfd.DataFrame([[0, 0, 0, 0, 0, 0, 0, 0]], {
  columns: ["Var", "Min", "Max", "25", "50", "75", "100", "avg_high_return"],
});

dfOuptut.print();
