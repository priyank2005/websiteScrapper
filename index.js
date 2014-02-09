var scrap = require("./scrapper.js")
    , config=require("./config.js")
    , utils = require("./utils.js");
if (process.argv.length != 3) {
    console.log("Please provide input in format node commandline.js http://www.google.com");
    return;
}
var url = process.argv[2];
if (utils.isValidURL(url) == false) {
    console.log("URL entered " + url + " is not a valid URL, please enter as http://google.com");
    return;
}
console.log("Getting Page : " + url);
var scrapperInstance=scrap(url,config);
scrapperInstance.getURL(url);