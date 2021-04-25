const dfd = require("danfojs-node");

const data = ["Mining, Quarrying, and Oil and Gas Extration"];

const s = new dfd.Series(data);
// s.print();

const sNew = s.replace({ replace: ",", with: " " });
sNew.print();
