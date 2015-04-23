var xmlParser = require("../xml_parser.js"),
  fs = require("fs");
var sampleData = "";
module.exports = {
    simpleXML: function(test){
      var xmlStr = fs.readFileSync("./test/samples/simple.xml",{encoding:"utf8"});
      var dom = xmlParser(xmlStr);
      var check = { root: {
            name:"test",
            age: '12',
            empty: "",
            items:{
              item:['1','2','3']
            }
          }
        };
      test.deepEqual(dom,check);
      test.done();
    },
    simpleHTML: function(test){
      var xmlStr = fs.readFileSync("./test/samples/simple.xml",{encoding:"utf8"});
      var dom = xmlParser(xmlStr,{html:true});
      //console.log(dom);
      test.done();
    },
    autoMerge: function(test){
      var xmlStr = fs.readFileSync("./test/samples/collapse.xml",{encoding:"utf8"});
      var dom = xmlParser(xmlStr);
      console.log(JSON.stringify(dom));
      test.done();
    },
    encoding: function(test){
      var xmlStr = fs.readFileSync("./test/samples/encoding.xml",{encoding:"utf8"});
      var dom = xmlParser(xmlStr);
      console.log(JSON.stringify(dom));
      test.done();
    },
    type: function(test){
      var xmlStr = fs.readFileSync("./test/samples/type.xml",{encoding:"utf8"});
      var dom = xmlParser(xmlStr,{swagger: true, excludeRoot:true});
      console.log(JSON.stringify(dom));
      test.done();
    }
};