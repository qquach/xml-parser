var xmlParser = require("../xml_parser.js"),
  fs = require("fs");
var sampleData = "";
module.exports = {
    setUp: function(callback){
      var xmlStr = fs.readFileSync("./test/samples/simple.xml",{encoding:"utf8"});
      //console.log("xmlStr: %s", xmlStr);
      sampleData = xmlStr;
      callback();
    },
    simpleXML: function(test){
      var dom = xmlParser(sampleData);
      console.log(dom);
      test.done();
    },
    simpleHTML: function(test){
      var dom = xmlParser(sampleData,{html:true});
      console.log(dom);
      test.done();
    }
};