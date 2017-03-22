
module.exports = function(RED) {
	"use strict";
	//const fs = require('fs');
	const execSync  = require("child_process").execSync;
	//const exec      = require("child_process").exec;
	
    function FloraNode(config) {
        RED.nodes.createNode(this,config);
        this.name = config.name;
        this.repeat = config.repeat;
        this.timerepeat = config.timerepeat;
        this.interval = config.interval;
        var node = this;
        this.on('input', function(msg) {
//0x038 = 4a 10 32 2e 36 2e 32 = 1bajt = bateria, reszta firmave 
			
			this.status({fill:"red",shape:"ring",text:"Waiting for flora"});
			let that = this;
			let exeData ='gatttool --device='+this.name+' --char-read -a 0x35 --adapter=hci0';
			let exeBatt ='gatttool --device='+this.name+' --char-read -a 0x038 --adapter=hci0';
			let licznik = 1;
			
			
			
			/*-------------*/	
				function readFloraBatt(ex){
					that.status({fill:"red",shape:"ring",text:"Reading battery"});
					let obj ={"batt":0};
					try {
						let o = execSync(ex).toString().trim();
						console.log('#59 bbbbb=',o);//#59 bbbbb= Characteristic value/descriptor: 64 10 32 2e 36 2e 32
						if (o){
							let linia = o.split('descriptor: ')[1].trim();
							var wyniki = linia.split(' ');
							obj.batt   = parseInt(wyniki[0],16) || 101;
							console.log('#64 obj.batt=',obj.batt);
							return obj;
						}
					} catch (e) {return obj;}
				} // -- EOF			
			
			
			/*-------------*/	
				function readFloraData(ex){
					that.status({fill:"red",shape:"ring",text:"Reading flora #"+licznik});
					let obj ={"flora":false};
					try {
						let o = execSync(ex).toString().trim();
						console.log('#25 ooooooooooo=',o);

						if (o){
							that.status({fill:"yellow",shape:"ring",text:"Read flora #"+licznik});
							//o = 'Characteristic value/descriptor: a9 00 00 5a 08 00 00 3e 87 08 00 00 00 00 00 00';
							let linia = o.split('descriptor: ')[1];
							linia = linia.trim();
							//console.log('#15=',linia);
							var wyniki = linia.split(' ');
							for (var a in wyniki) {	wyniki[a] = parseInt(wyniki[a],16);	}
								obj.t   = (wyniki[0] + 256*wyniki[1])/10;
								obj.l   =  wyniki[3] + 256*wyniki[4];
								obj.m   =  wyniki[7];
								obj.c   =  wyniki[8] + 256*wyniki[9];
								obj.flora = true;
							}
						obj.licznik = licznik++;
						return obj;
					} catch (e) {
						obj.flora = false;
						return obj;
					}	
				} // -- EOF




				let batt = readFloraBatt(exeBatt);
				let ret = readFloraData(exeData);
				if (ret.flora === false) ret = readFloraData(exeData);
				if (batt.batt === 0)     batt = readFloraBatt(exeBatt);
				if (ret.flora === false) ret = readFloraData(exeData);
				if (batt.batt === 0)     batt = readFloraBatt(exeBatt);
				if (ret.flora === false) ret = readFloraData(exeData);
				if (batt.batt === 0)     batt = readFloraBatt(exeBatt);
				ret.batt = batt.batt || 101;
				/*-------------*/
				
				if (ret.flora === false) this.status({fill:"yellow",shape:"ring",text:"Fake flora"});
				if (ret.flora === true)  this.status({fill:"blue",shape:"squeare",text:"Success"});
				
				ret = JSON.stringify(ret);
				console.log('#53 ret=',ret);
				msg.payload = ret;
				node.send(msg);
	        
        });
    }
    RED.nodes.registerType("flora",FloraNode);
}
