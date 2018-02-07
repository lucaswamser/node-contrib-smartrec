var NodeWebcam = require( "node-webcam" );

module.exports = function(RED) {
    function WebCamNode(config) {
		RED.nodes.createNode(this,config);
		var opts = {
			   width: 1280,
			   height: 720,
			   quality: 100,
			   delay: 0,
			   saveShots: true,
			   output: "jpeg",
			   device: false,
			   callbackReturn: "location",
			   verbose: false	
		   };
		  node.on('input', function(msg) {
					
		  });		
	}
	RED.nodes.registerType("smart-rec",SmartRecNode);
}
