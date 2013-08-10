module.exports = (function(){
	"use strict"
	var connect = require('connect'),
		http = require('http'),
		url = require('url'),
		path = require('path'),
		fs = require('fs'),
		pkg = JSON.parse(fs.readFileSync('./package.json'));

	function _getType(extname){
		switch(extname){
			case '.json':
				return 'application/json';
			case '.xhtml':
			case '.html':
				return 'text/html';
			default:
				return 'application/json';
		}
	}

	var app = connect()
		.use(connect.logger('dev'))
		.use(pkg.static.path, connect.static(pkg.static.root, {maxAge: pkg.maxAge}))
		.use(pkg.prototype.path + '/static/mockup-data', function(req, res, next){
			if(req.method === 'GET') return next();

			var urlObj = url.parse(pkg.prototype.root + req.originalUrl.replace(pkg.prototype.path, '')),
				filePath = urlObj.protocol + urlObj.pathname,
				contentType = _getType(path.extname(urlObj.pathname)),
				method = urlObj.query.match(/\_method\=([a-z]+)($|\&)/)[1],
				methodFilePath = filePath.replace(/(\.xhtml|\.html|\.json)$/, '.' + method + '$1');

			fs.exists(methodFilePath, function(exist){
				if(exist){
					filePath = methodFilePath;
				}
				fs.readFile(filePath, function(err, data){
					if(err) return next(err);
					res.writeHead(200, {'Content-Type': contentType});
					res.statuCode = 200;
					res.end(data);
				});
			});
		})
		.use(pkg.prototype.path, connect.static(pkg.prototype.root, {maxAge: pkg.maxAge}))
		.use(function(req, res){
			var opts = {
				host: pkg.proxy.host,
				port: pkg.proxy.port,
				path: req.url,
				method: 'GET'
			};
			http.get(opts, function(response){
				response.on('data', function(chunk){
					res.write(chunk);
				});
				response.on('end', function(){
					res.end()
				});
			});
		})
		.listen(pkg.port, function(){console.log('Connect with: http://127.0.0.1:' + pkg.port)});
})();