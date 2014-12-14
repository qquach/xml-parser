/**
 * New node file
 */
var xmlParser = require("../xml_parser.js"),
  fs = require("fs");
module.exports = {
 simple: function(test){
   var xmlStr = fs.readFileSync("./test/confirm/simple.xml",{encoding:"utf8"});
   var dom = xmlParser(xmlStr);
   console.log(JSON.stringify(dom));
   var check = {
       user:{
         name:"some name",
         age:20
       }
     };
   test.deepEqual(dom,check);
   test.done();
 },
 users: function(test){
   var xmlStr = fs.readFileSync("./test/confirm/users.xml",{encoding:"utf8"});
   var dom = xmlParser(xmlStr);
   var check = {
       users:[
              {array:{
                name:"some name",
                age: 20
              }},
              {array:{
                name:"other name",
                age: 10
              }}
             ]
          };
   test.deepEqual(dom,check);
   test.done();
 },
 string: function(test){
   var xmlStr = fs.readFileSync("./test/confirm/string.xml",{encoding:"utf8"});
   var dom = xmlParser(xmlStr);
   var check = {string: {array: ["test","something","here"]}};
   test.deepEqual(dom,check);
   test.done();
 }
};