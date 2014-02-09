websiteScrapper
===============

This node js project can be used to download any website using node js command line.

Usage :
node index.js http://www.mywebsitetodownload.com

Output will be saved in a folder named "output".

Limitations:
1. This does not follow robot rules.
2. This cannot be used to download https websites and resources.
3. Excessive pipe download can give memory leak warnings for large website.
4. No HTML/CSS links are changed post download to change absolute to relative paths.
5. Only background CSS images would be downloaded which have syntax as defined by W3C.
6. Inline CSS not parsed.
7. No other resource that are path of external CSS downloaded (eg : @import(...<CSS>)).

Config:
Basic configurations added as initial commit. These can be modified in config.js.
config.requestThreshold=2;        // Number of webpages to be parsed simultaneously
config.parseEntireWebsite=true;   // Download all the webpages following the links (this can move outisde your domain
config.stayOnDomain=true;         // Downloads webpages inside domain only.
