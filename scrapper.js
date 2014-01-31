var request = require('request')
	,http= require('http')
  , cheerio = require('cheerio')
  , utilObj=require('./utils.js')
  , urlObj=require('url')
  , path=require('path')
  , fsExtended=require('node-fs')
  , fs=require('fs');

function getURLBody(url,receivedResponseCallback){
	request(url,receivedResponseCallback);
}

function getElementsBasedOnSelector(body,selector){
	$ = cheerio.load(body);
  	srcs = $(selector); //use your CSS selector here
  	return $(srcs);
}
saveLinkToDisk=function(url,baseUrl){
	if (!utilObj.isValidURL(url)){
		var finalURL=baseUrl.replace(/^\/|\/$/g, '')+"/"+url.replace(/^\/|\/$/g, '');
	}else{
		var finalURL=url;
	}
	var parsedURL=urlObj.parse(finalURL);
	if (parsedURL.protocol!='http:')
	{
		console.log("Downloading only http requests. Skipping "+finalURL);
		return;
	}
	var baseName=path.dirname(parsedURL.pathname);
	if (path.basename(parsedURL.pathname)=="")
		return;
	var finalDir=path.join(path.normalize(baseUrl).replace(/[^a-z0-9]/gi, '_'),baseName);
		var saveFileName=path.join(finalDir,path.basename(parsedURL.pathname));
		fsExtended.mkdir(finalDir,0777,true,function(){
				var file = fs.createWriteStream(saveFileName);
				var request = http.get(finalURL, function(response) {
					response.pipe(file);
					file.on('finish', function() {
				      file.close();
				    });
				});
		});
}
saveContentToDisk=function(content,url,baseUrl){
	if (!utilObj.isValidURL(url)){
		var finalURL=baseUrl.replace(/^\/|\/$/g, '')+"/"+url.replace(/^\/|\/$/g, '');
	}else{
		var finalURL=url;
	}
	var parsedURL=urlObj.parse(finalURL);
	if (parsedURL.protocol!='http:')
	{
		console.log("Downloading only http requests. Skipping "+finalURL);
		return;
	}
	var baseName=path.dirname(parsedURL.pathname);
	var finalDir=path.join(path.normalize(baseUrl).replace(/[^a-z0-9]/gi, '_'),baseName);
	var saveFileName=path.join(finalDir,path.basename(parsedURL.pathname));
	fsExtended.mkdir(finalDir,0777,true,function(){
		fs.writeFile(saveFileName, content, function(err) {
		    if(err) {
		        console.log(err);
		    }
		}); 
		
	});
}
exports.getURLBody=getURLBody;
exports.saveLinkToDisk=saveLinkToDisk;
exports.saveContentToDisk=saveContentToDisk;
exports.getElementsBasedOnSelector=getElementsBasedOnSelector;