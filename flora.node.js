/*flora.node.js*/
/* only example from tutorial*/
module.exports = function(RED) {
    function FloraNode(config) {
        RED.nodes.createNode(this,config);
        this.name = config.name;
        this.repeat = config.repeat;
        this.timerepeat = config.timerepeat;
        this.interval = config.interval;
        var node = this;
        this.on('input', function(msg) {
            msg.payload = msg.payload.toLowerCase()+' '+this.name+'  '+this.repeat+' '+this.timerepeat+' '+this.interval;
            node.send(msg);
            this.status({fill:"red",shape:"ring",text:"try connect"});
        });
    }
    RED.nodes.registerType("flora",FloraNode);
}
