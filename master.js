module.exports = (function(){
	"use strict"
	var cluster = require('cluster'),
		fs = require('fs');
		
	if(cluster.isMaster){
		cluster.fork();

		cluster.on('exit', function(worker){
			console.log('Worker ' + worker.id + ' died :(');
			process.nextTick(function(){
				cluster.fork();
			});
		});
	}else{
		require('./static.js');
	}
})();