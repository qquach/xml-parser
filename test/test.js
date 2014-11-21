/**
 * New node file
 */
module.exports1 = {
 test1: function(test){
   console.log("test1");
   test.expect(2);
   test.ok(true,"ok");
   test.ok(!false,"it's not ok");
   test.done();
 },
 setUp:function(callback){
   console.log("setup");
   callback();
 },
 tearDown: function(callback){
   console.log("tearDown");
   callback();
 },
 group1: {
   test2: function(test){
     console.log("test2");
     test.expect(1);
     test.equal("a","A".toLowerCase(),"Sure equal");
     test.done();
   },
   test3: function(test){
     test.expect(1);
     test.notEqual(1,1.1,"not equal");
     test.done();
   },
   test4: function(test){
     test.throws(function(){
       console.log("test throw exception");
       throw "get it";
     },"get it","message get there");
     test.done();
   }
 }
};