var xmlParser = require("../xml_parser.js"),
  fs = require("fs");
var sampleData = "";
module.exports = {
    simpleXML: function(test){
      var xmlStr = fs.readFileSync("./test/samples/simple.xml",{encoding:"utf8"});
      var dom = xmlParser(xmlStr);
      console.log(JSON.stringify(dom));
      test.done();
    },
    simpleHTML: function(test){
      var xmlStr = fs.readFileSync("./test/samples/simple.xml",{encoding:"utf8"});
      var dom = xmlParser(xmlStr,{html:true});
      console.log(dom);
      test.done();
    },
    autoMerge: function(test){
      var xmlStr = fs.readFileSync("./test/samples/collapse.xml",{encoding:"utf8"});
      var dom = xmlParser(xmlStr);
      console.log(JSON.stringify(dom));
      test.done();
    }
};