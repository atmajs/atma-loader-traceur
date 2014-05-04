// should be used in DEV environment only. Compile es6 scripts for production afterwards.

if (typeof include === 'undefined' ) 
	throw new Error('<atma-traceur> should be loaded by the `atma` toolkit.');

var _extensions = [ 'es6' ],
	_options = {}
	;
var config = global.app && global.app.config;
if (config){
	
	var ext = config.$get('settings.traceur-extension');
	if (ext) {
		_extensions = Array.isArray(ext)
			? ext
			: [ ext ]
			;
	}
	_options = config.$get('settings.traceur-options') || _options;
}



// `io.File` extension
var net = global.net;
(function(File){
	if (File == null)
		return;

	File.middleware['atma-loader-traceur'] = function(file){
			
		if (typeof file.content !== 'string')
			file.content = file.content.toString();
		
		var compiled = traceur_compile(file.content, file.uri);
		
		file.sourceMap = compiled.sourceMap;
		file.content = compiled.js;
	};
	File
		.registerExtensions(obj_createMany(_extensions, [ 'atma-loader-traceur:read' ]));
		
}(global.io && global.io.File))

// `IncludeJS` extension
include.cfg({
	loader: obj_createMany(_extensions, {
		
		process: function(source, resource){
			
			return traceur_compile(source, new net.Uri(resource.url)).js;
		}
	})
});

// Http
var HttpHandler = Class({
	Base: Class.Deferred,
	process: function(req, res, config){
		
		var url = req.url,
			isSourceMap = url.substr(-4) === '.map';
		if (isSourceMap) 
			url = url.substring(0, url.length - 4);
			
		if (url[0] === '/') 
			url = url.substring(1);
		
		var file, path;
		if (config['static']) {
			path =  net.Uri.combine(config.static, url);
			if (File.exists(path))
				file = new File(path);
		}
		
		if (file == null && config['base']) {
			path =  net.Uri.combine(config.base, url);
			if (File.exists(path))
				file = new File(path);
		}
		
		if (file == null) {
			path =  net.Uri.combine(process.cwd(), url);
			if (File.exists(path))
				file = new File(path);
		}
		
		if (file == null) {
			this.resolve('Not Found - ' + url, 404, 'plain/text');
			return;
		}
		
		
		file.read();
		
		var source = isSourceMap
			? file.sourceMap
			: file.content;
			
		var mimeType = isSourceMap
			? 'application/json'
			: 'text/javascript'
			;
			
		this.resolve(source, 200, mimeType);
	}
});

include.exports = {
	
	/* >>> Atma.Toolkit (registered via server)*/
	register: function(rootConfig){},
	
	/* >>> Atma.Server */
	attach: function(app){
		_extensions.forEach(function(ext){
			var rgx = '(\\.EXT$)|(\\.EXT\\?)'.replace(/EXT/g, ext),
				rgx_map = '(\\.EXT\\.map$)|(\\.EXT\\.map\\?)'.replace(/EXT/g, ext);
			
			app.handlers.registerHandler(rgx, HttpHandler);
			app.handlers.registerHandler(rgx_map, HttpHandler);
		});
	}
};



var traceur_compile;
(function(){
	var _traceur;
	
	traceur_compile = function(source, uri){
		if (_traceur == null)
			_traceur = require('traceur');
			
		var filename = uri.toLocalFile(),
			compiled = _traceur.compile(source, obj_extend({}, _options, {
				
				filename: filename,
				sourceMap: true
			})),
	
		errors = compiled.errors.length
			? 'Compilation error:\n'
				+ filename
				+ '\n'
				+ compiled.errors.join('\n')
			: null
		;
		
		if (errors) {
			return {
				js: errors,
				sourceMap: errors
			};
		}
		
		return {
			js: compiled.js
				+ '\n//# sourceMappingURL='
				+ uri.file
				+ '.map',
			sourceMap: errors || compiled.sourceMap
		};
	};
	
}());

function obj_createMany(properties, value){
	var obj = {};
	properties.forEach(function(prop){
		obj[prop] = value;
	});
	
	return obj;
}

function obj_setProperty(obj, prop, value){
	obj[prop] = value;
	return obj;
}

function obj_extend(target){
	var imax = arguments.length,
		i = 1,
		obj;
	for(; i < imax; i++){
		obj = arguments[0];
		
		for(var key in obj)
			target[key] = obj[key]
	}

	return target;
}