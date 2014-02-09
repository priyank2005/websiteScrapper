var request = require('request')
  , cheerio = require('cheerio')
  , utilObj=require('./utils.js')
  , urlObj=require('url')
  , path=require('path')
  , fsExtended=require('node-fs')
  , fs=require('fs')
  , mimeObj = require('mime-of')
  , hashMap=require("./HashMap.js");




function Scrapper(url,config){
	this.hashMapInstance=new hashMap();
	config=config;
	this.basePathObj=urlObj.parse(url);
	this.downloadedInSession=new Array();
	this.getURL=function (url){
		if (this.downloadedInSession.indexOf(url)!=-1){
			return;
		}
		this.downloadedInSession.push(url);
		var reqObj=new Object();
			reqObj.url=url;
			reqObj.callbackFunc=callbackFunc;
		this.hashMapInstance.put(url,reqObj);
		requestExecutor();
	}
	this.requestExecutor=function(){
		var sizeOfMap=this.hashMapInstance.size();
		if (sizeOfMap<=config.requestThreshold && sizeOfMap>0){
			var reqObj=this.hashMapInstance.myPop();
			console.log("Downloading URL : "+reqObj.url)
			request(reqObj.url,function(err, resp, body){
				var callback=reqObj.callbackFunc;
				callback(err, resp, body);
				requestExecutor();
			})
		}
	}
	this.getElementsBasedOnSelector=function (body,selector){
		$ = cheerio.load(body);
		srcs = $(selector);
	  	return $(srcs);
	}
	this.saveLinkToDisk=function(url,baseUrl){
		if (url.indexOf("//")==0){
			var parseBaseURL=urlObj.parse(baseUrl);
			url=parseBaseURL.protocol+url;
		}
		var finalURL=urlObj.resolve(baseUrl,url);
		//Checking If Already Downloaded in Sesssion
		if (downloadedInSession.indexOf(finalURL)!=-1){
			return;
		}
		downloadedInSession.push(finalURL);
		var parsedURL=urlObj.parse(finalURL);
		if (parsedURL.protocol!='http:')
		{
			console.log("Downloading only http requests. Skipping "+finalURL);
			return;
		}
		var finalDir=this.getSaveFileNameFromUrl(finalURL);
		try{
	       		fsExtended.mkdir(path.dirname(finalDir),0777,true,function(){
					request(finalURL).on('response',  function (res) {
						if (res && res.statusCode==200)
							res.pipe(fs.createWriteStream(finalDir));
					});
				});
	           		
	        }catch(e){
	        	console.log(e);
		}
	}
	this.getSaveFileNameFromUrl=function(url){
		var urlObjLocal=urlObj.parse(url);
		if (urlObjLocal.pathname.substr(-1) == '/')
			urlObjLocal.pathname="index.html";
		var baseUrl=urlObjLocal.hostname;
		if (urlObjLocal.query!=null)
			var queryAddon=urlObjLocal.query.replace(/[^a-z0-9]/gi, '_');
		else
			var queryAddon="";
		var baseName=path.dirname(urlObjLocal.pathname);
		var finalDir=path.join("output",path.normalize(baseUrl).replace(/[^a-z0-9]/gi, '_'),baseName+queryAddon);
		var saveFileName=path.join(finalDir,path.basename(urlObjLocal.pathname));
		return saveFileName;
	}
		
	this.saveContentToDisk=function(content,url,baseUrl){

		var saveFileName=this.getSaveFileNameFromUrl(url);
		fsExtended.mkdir(path.dirname(saveFileName),0777,true,function(err){
			if(err){
				console.log("Error Occured while creating directory : "+err);
				return;
			}
			fs.writeFile(saveFileName, content, function(err) {
			    if(err) {
			        console.log(err);
			    }
			}); 
			
		});
	}
	this.processBody=function(srcs,url,forceDownload){
		srcs.each(function (i, link) {
	     		var srcAttrib=$(link).attr('src');
	            var hrefAttrib=$(link).attr('href');
	            if (srcAttrib!=undefined){
	                var pathDownloaded=srcAttrib;
	           	}else if (hrefAttrib!=undefined){
	                var pathDownloaded=hrefAttrib;
	            }else{
	            	console.log("Unable to get Src or Href in link. Returning");
	            	return;
	            }
	            pathDownloaded=urlObj.resolve(url,pathDownloaded);
	            var linkObj=urlObj.parse(pathDownloaded);
	            if (linkObj==undefined || linkObj==null){
	            	console.log("Skipping "+pathDownloaded+" as this looks like a bad link");
	            	return;
	            }
				if (forceDownload){
					saveLinkToDisk(pathDownloaded,url);
					return;
	            }
				var mimeType = mimeObj(pathDownloaded);
	            if (mimeType!=undefined)
	            	var splittedMime=mimeType.split("/");
	            if (mimeType == "text/css"){
	            	getURL(pathDownloaded, function (err, resp, body) {
	                    if (!err && resp.statusCode==200){
	                        var externalCSS = body.match(/url\((.+?)\)/g);
	                        if (externalCSS != null)
	                            for (i = 0; i < externalCSS.length; i++) {
	                                var externalBody = externalCSS[i].replace(/[url(]/g, "").replace(/[)]/g, "").replace(/'/g, "").replace(/"/g, "");
	                                var finalCSSDownload = urlObj.resolve(externalBody,url);
	                                saveLinkToDisk(finalCSSDownload, url);
	                            }   
	                    }
	                });
	            }else{
	            	if (mimeType==undefined || splittedMime[0]=="text"){
	            		if (linkObj.hostname==basePathObj.hostname || false==config.stayOnDomain)
	            			getURL(pathDownloaded);
	            	}else{
	            		getURL(pathDownloaded);
	            	}
	            	
	           	}
	            
	        });
	}
	this.callbackFunc = function (err, resp, body) {
		if (err){
	        console.log("Got an error while getting webpage : "+err);
	        return;
	    }
	    if (!err && resp.statusCode == 200) {
	    	var type=resp.headers["content-type"].split("/");
	    	var mimeTypes=resp.headers["content-type"].split(";");
	    	var fullUrl=resp.request.uri.protocol+"//"+resp.request.uri.hostname+resp.request.uri.pathname;
		   	var baseUrl=resp.request.uri.protocol+"//"+resp.request.uri.hostname
			if (type[0]=="text"){
		    	saveContentToDisk(body, fullUrl, baseUrl);
		        console.log("Downloaded : "+fullUrl);
		        var srcs = getElementsBasedOnSelector(body, "[src]");
		        //Force Downloading SRC since they are resources.
		        processBody(srcs,fullUrl,true);
		        if (false==config.parseEntireWebsite)
		       		var srcs = getElementsBasedOnSelector(body, "[href]:not(a)");
		       	else
		       		var srcs = getElementsBasedOnSelector(body, "[href]");
		        processBody(srcs,fullUrl,false);
	    	}else{
	    		saveLinkToDisk(fullUrl,baseUrl,false);
	    	}
	    } else {
	        console.log("Unable to download, received status code as " + resp.statusCode + ", Error received: " + err);
	    }
	}
	return this;
}
module.exports=Scrapper;