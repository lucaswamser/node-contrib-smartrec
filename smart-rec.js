const WebSocket = require('ws');
var isBuffer = require('is-buffer')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
module.exports = function(RED) {
    function SmartRecNode(config) {
        RED.nodes.createNode(this,config);
				var node = this;
				if (config.uid && config.key){
					node.connect = () =>{
						node.wss = null;
					        node.status({fill:"yellow",shape:"dot",text:"connecting"});
						node.wss = new WebSocket('wss://s1.smartrec.pressagio.net/websocket/'+config.uid, {
							perMessageDeflate: false
						});

						node.wss.addEventListener('error', (err) => {
							node.error(err)
							this.status({fill:"red",shape:"dot",text:"error"});
						});

						node.wss.on('open', function open() {
							node.isConnected = true
							node.wss.on('message', function incoming(data) {
								var r = JSON.parse(data);
								if (r.type == "predict"){
									msg = {payload:r.data}
									node.send(msg);
								}
								else if (r.type == "status"){
									node.status({fill:"green",shape:"dot",text:r.status});
								}
							});

						});
						node.wss.on('close', function close() {
						  node.status({fill:"red",shape:"dot",text:"disconnected"});
						  node.isConnected = false;
						  setTimeout(node.connect,10000);
						});
					}
				   node.connect();
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
					}else
						node.error("Type not supported!");

				});		
				}
				RED.nodes.registerType("smart-rec",SmartRecNode);
}
