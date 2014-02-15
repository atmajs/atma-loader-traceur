
if (typeof include === 'undefined' ) 
	throw new Error('<atma-traceur> should be loaded by the `atma` module.');

var _extension = 'es6',
	_options = {}
	;
var config = global.app && global.app.config;
if (config){
	_extension = config.$get('settings.traceur-extension') || _extension;
	_options = config.$get('settings.traceur-options') || _options;
}



// `io.File` extension
if (global.io && io.File) {
	io.File.middleware['traceur'] = function(file){
			
		if (typeof file.content !== 'string')
			file.content = file.content.toString();
		
		var compiled = traceur_compile(file.content, file.uri);
		
		file.sourceMap = compiled.sourceMap;
		file.content = compiled.js;
	};

	io
		.File
		.registerExtensions(obj_setProperty({}, _extension, [ 'traceur:read' ]));
}

// `IncludeJS` extension
include.cfg({
	loader: obj_setProperty({}, _extension, {
		
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
		
		var uri = new net.Uri(config.base).combine(url),
			file = new io.File(uri)
			;
		
		file.read();
		
		var source = isSourceMap
			? file.sourceMap
			: file.content;
			
		var mimeType = isSourceMap
			? 'application/json'
			: 'text/javascript';
			
		
		this.resolve(source, 200, mimeType);
	}
});

include.exports = {
	register: function(rootConfig){
		
		rootConfig.$extend({
			
			server: {
				handlers: {
					'(.jsnext.map$)': HttpHandler,
					'(.jsnext$)': HttpHandler
				}
			}
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