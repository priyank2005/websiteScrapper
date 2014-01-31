var scrapper = require("./scrapper.js"),
    utils = require("./utils.js"),
    path = require('path'),
    mimeObj = require('mime-of');
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
var receivedResponseCallback = function (err, resp, body) {
    if (!err && resp.statusCode == 200) {


        scrapper.saveContentToDisk(body, "index.html", url);
        console.log("Got Webpage Processing");
        var srcs = scrapper.getElementsBasedOnSelector(body, "[src]");
        srcs.each(function (i, link) {
            console.log("Downloading : " + $(link).attr('src').trim());
            scrapper.saveLinkToDisk($(link).attr('src').trim(), url);
        });
        //Skipping Hyperlinks as not parsing entire website
        var hrefs = scrapper.getElementsBasedOnSelector(body, "[href]:not(a)");
        hrefs.each(function (i, link) {
            console.log("Downloading : " + $(link).attr('href').trim());
            var pathDownloaded = $(link).attr('href').trim();
            var mimeType = mimeObj(pathDownloaded);
            if (mimeType == "text/css") {
                scrapper.getURLBody(pathDownloaded, function (err, resp, body) {
                    var externalCSS = body.match(/url\((.+?)\)/g);
                    if (externalCSS != null)
                        for (i = 0; i < externalCSS.length; i++) {
                            var externalBody = externalCSS[i].replace("url(", "").replace(")", "").replace("'", "").replace("\"", "");
                            var baseName = path.dirname(pathDownloaded);
                            var finalCSSDownload = utils.concatAndResolveUrl(baseName, externalBody);
                            scrapper.saveLinkToDisk(finalCSSDownload, url);
                        }
                });
            }
            scrapper.saveLinkToDisk(pathDownloaded, url);
        });
    } else {
        console.log("Unaable to download, received status code as " + resp.statusCode + ", Error received: " + err);
    }
}
var body = scrapper.getURLBody(url, receivedResponseCallback);