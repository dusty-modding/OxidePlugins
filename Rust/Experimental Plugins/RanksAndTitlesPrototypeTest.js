var RanksAndTitlesPrototypeTest = function() {
  print("New RanksAndTitles");
};

RanksAndTitlesPrototypeTest.TestProto.prototype.test = function() {
  print("Prototype Caught Success!");
};

var x = new RanksAndTitlesPrototypeTest();
x.test();
