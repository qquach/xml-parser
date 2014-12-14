var util = require("util");

/**
 * special tag handling for html dom parser
 */
var specialTags = {
    "#text" : true,
    "#comment" : true
  };
var startRegex = /<([a-zA-Z]\S*?)((\s+.*?=".*?"\s*)*)(>|\/>)/;
var commentRegex = /<!--([\s\S]*?)-->/g;

/**
 * create the xml parser class to issolate the option for each parsing
 */
var XmlParser = function(options){
  if(options && options.html===true){
    this.options = {html:true, wsdl: false, xml: false};
  }
  else if (options && option.wsdl === true){
    this.options = {html:false, wsdl: true, xml: true};
  }
  else{
    this.options = {html:false, wsdl: false, xml: true};
  }

  this.commentCollection = {};
};
XmlParser.prototype = {
  parse: function(xml, obj) {
    var obj = obj || {};
    //get start tag
    if (!xml || typeof(xml)!="string")
      return obj;
    xml = extractComment(this.commentCollection, xml, this.options.html);
    //handle textNode for html dom parser
    var tagName, content, attr = null;
    var index = xml.indexOf("<");
    if (index != 0 && this.options.html) {
      tagName = "#text";
      if (index == -1) {
        content = xml;
        xml = "";
      } else {
        content = xml.substr(0, index);//.replace(/[\s\r\n]+$/,"");
        xml = xml.substr(index);
      }
    } else {
      var match = xml.match(startRegex);
      if (!match)
        return obj;
      tagName = match[1];
      var attrStr = match[2];
      attr = getAttr(attrStr);

      var isEmptyTag = match[match.length - 1] == "/>";
      if(isEmptyTag){
        content = "";
        xml = xml.replace(match[0],"");
      }
      else{
        var nRegexStr = "<" + tagName + "[^>]*>([\\s\\S]*?)<\\/" + tagName + ">";
        var nRegex = new RegExp(nRegexStr);
        var nMatch = xml.match(nRegex);
        if (!nMatch)
          return obj;
        content = nMatch[1];
        xml = xml.replace(nRegex, "");
      }
    }
    if (this.options.xml) {
      obj = this.addXmlElement(obj, attr, content, tagName);
    } else if (this.options.html) {
      //dom parser every tag = object.
      //supported properties: nodeName, textNode, innerHTML, childNodes, attributes
      this.addHtmlElement(obj, attr, content, tagName);
    }
    return this.parse(xml, obj);
  },
  /**
   * need to return the obj, since obj may converted from object to array which point to different address
   */
  addXmlElement: function(obj, attr, content, tagName) {
    //handle CDATA
    //console.log("addExmlElement tag: %s, content: %s", tagName, content);
    var m = content.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
    if(m){
      console.log("cdata matched");
      console.log(m);
      addXmlContent(obj,tagName,m[1]);
      return obj;
    }

    //handle leaf node
    if(content.indexOf("<") == -1){
      var val = getValue(content, attr, this.options);
      addXmlContent(obj,tagName,val);
      return obj;
    }

    //handle for child node
    var val = this.parse(content);
    if (obj[tagName]) {
      var v = obj[tagName];
      var tmp = {};
      tmp[tagName] = v;
      obj = [tmp];
    }
    if (util.isArray(obj)) {
      var tmp = {};
      tmp[tagName] = val;
      obj.push(tmp);
    } else {
      obj[tagName] = val;
    }
    return obj;
  },

  addHtmlElement: function(obj, attr, content, tagName) {
    if (util.isArray(obj)) {
      if (tagName == "#text") {
        //console.log(util.format("this.commentCollection: %j", this.commentCollection));
        processTextNode(this.commentCollection, content, obj);
      } else {
        var tmp = {};
        tmp.nodeName = tagName.toUpperCase();
        tmp.innerHTML = content;
        tmp.childNodes = obj.childNodes || [];
        addAttr(tmp, attr);
        this.parse(content, tmp.childNodes);
        obj.push(tmp);
      }
    } else {
      obj.nodeName = (tagName in specialTags) ? tagName : tagName.toUpperCase();
      obj.innerHTML = content;
      obj.childNodes = obj.childNodes || [];
      addAttr(obj, attr);
      if (content.indexOf("<") == -1) {
        createTextNode(content, obj.childNodes);
      } else {
        this.parse(content, obj.childNodes);
      }
    }
  }
};

//================= share private function for all object ======================
function addXmlContent(obj,tagName,val){
  //check if property already added, then convert it to array.
    if (obj[tagName] && !util.isArray(obj[tagName])) {
      var v = obj[tagName];
      obj[tagName] = [v];
    }
    if (util.isArray(obj[tagName])) {
      obj[tagName].push(val);
    } else {
      obj[tagName] = val;
    }
  }
/**
 * xml: remove comment block
 * html: replace comment with a unique string which will be process later
 */
function extractComment(commentCollection, xml, isHtml) {
  if (isHtml) {
    xml = xml.replace(commentRegex, function(m0, m1) {
      var id = "#comment" + Math.random().toString(36).substr(2, 10);
      commentCollection[id] = {
        nodeName : "#comment",
        textContent : m1,
        data : m1
      };
      return id;
    });
  } else {
    //handle comment: remove it from the xml, for html convert it to comment tag, and trim start and end of ptags
    xml = xml.replace(commentRegex, "");
    xml = xml.replace(/^[^<]+/, "").replace(/[^>]+$/, "");
  }
  return xml;
}

function processTextNode(commentCollection, txt, arr) {
  txt = txt.replace(/([\s\S]*?)(#comment\w{10})/g, function(m0, m1, m2) {
    //console.log("adding comment node m1: %s, m2: %s", m1, m2);
    if (m1) {
      arr.push({
        nodeName : "#text",
        textContent : m1,
        data : txt
      });
    }
    arr.push(commentCollection[m2]);
    return "";
  });
  if (txt) {
    arr.push({
      nodeName : "#text",
      textContent : txt,
      data : txt
    });
  }
}
//simple clone
function clone(obj) {
  var o = {};
  for (var i in obj) {
    if (typeof (obj[i]) == "object") {
      o[i] = clone(obj[i]);
    } else {
      o[i] = obj[i];
    }
  }
  return o;
}
function addAttr(obj, attr) {
  if (!attr || !obj || typeof (obj) != "object")
    return;
  for ( var i in attr) {
    obj[i] = attr[i];
  }
}
function getAttr(str) {
  if (!str)
    return null;
  var attr = {};
  var match = str.match(/(.+?=".+?")/g);
  for (var i = 0; i < match.length; i++) {
    var s = match[i].replace(/^\s*/, "").replace(/\s*?/, "");
    var m = s.match(/(.+)="(.+)"/);
    if (!m)
      throw "attribute is not well formatted" + attrStr;
    attr[m[1]] = m[2];
  }
  return attr;
}
/**
 * helper function to get attribute value for WSDL
 * @param content
 * @param attr
 * @param options
 * @returns
 */
function getValue(content, attr, options) {
  content = decodeXml(content);
  content = decodeURIComponent(content);
  if (!options.wsdl)
    return content;
  if (!attr)
    return content;
  switch (attr.type) {
  case "integer":
    return parseInt(content);
  case "float":
    return parseFloat(content);
  case "boolean":
    return content.toLowerCase() == "true";
  default:
    return content;
  }
}

function encodeXml(str) {
  return str.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&apos;');
}

function decodeXml(str) {
  return str.replace(/&apos;/g, "'")
             .replace(/&quot;/g, '"')
             .replace(/&gt;/g, '>')
             .replace(/&lt;/g, '<')
             .replace(/&amp;/g, '&');
}
///=========== Expose node module function===================
var parser = function(xml,options){
  return new XmlParser(options).parse(xml);
};
module.exports = parser;