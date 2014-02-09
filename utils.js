var fs = require('fs');
function isValidURL(s) {    
      var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
      return regexp.test(s);    
}
exports.isValidURL=isValidURL;