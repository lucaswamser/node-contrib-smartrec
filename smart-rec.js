const WebSocket = require('ws');
var isBuffer = require('is-buffer')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
module.exports = function(RED) {
    function SmartRecNode(config) {
        RED.nodes.createNode(this,config);
				var node = this;
				node.status({fill:"yellow",shape:"dot",text:"connecting"});
				if (config.uid && config.key){
					node.wss = new WebSocket('wss://s1.smartrec.pressagio.net/websocket/'+config.uid, {
						perMessageDeflate: false
					});

					node.wss.addEventListener('error', (err) => {
						node.error(err)
						this.status({fill:"red",shape:"dot",text:"error"});
					});

					node.wss.on('open', function open() {
						node.status({fill:"yellow",shape:"dot",text:"training"});
						setTimeout(() => node.status({fill:"green",shape:"dot",text:"ready"}),5000)
						node.isConnected = true
						node.wss.on('message', function incoming(data) {
							var r = JSON.parse(data);
							if (r.type == "predict"){
								msg = {payload:r.data}
								node.send(msg);
								node.status({fill:"green",shape:"dot",text:"ready"});
							}
						});

					});

				}else{
				 this.status({fill:"red",shape:"dot",text:"not configured"});
				}
				
				node.on('input', function(msg) {
					var out = {}
					out.type = 'predict'
					if (!node.isConnected)
						node.error("Not connected!");
					else if (isBuffer(msg.payload)){
						out.img = msg.payload.toString('base64')
						node.wss.send(JSON.stringify(out));
						node.status({fill:"green",shape:"dot",text:"processing"});
					}else
						node.error("Type not supported!");

				});		
				}
				RED.nodes.registerType("smart-rec",SmartRecNode);
}
