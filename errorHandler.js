var handleRequestError=function(err){
	switch(err.Error){
		case  "DEPTH_ZERO_SELF_SIGNED_CERT":{
			return "Looks like certificate is self signed. Please have a valid SSL certificate to continue";
		}
		default:{
			return "Error: "+err;
		}
	}
}
exports.handleRequestError=handleRequestError;