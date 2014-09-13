var _traceur;

module.exports	= {
	compile: function(source, path, config){
		if (_traceur == null)
			_traceur = require('traceur');
		
		var uri = new net.Uri(path),
			filename = uri.toLocalFile();
		
		if (config.sourceMap == null) 
			config.sourceMap = true;

		var options = _defaults(config.traceur, {
			script: true,
			sourceMaps: config.sourceMap
		});
		
		var compiled = _compile(source, options, filename),	
			errors = compiled.errors == null || compiled.errors.length === 0
				? null
				: 'throw Error("Traceur '
					+ compiled.errors.join('\\\n').replace(/"/g, '\\"')
					+ '");'
			;
		
		if (errors) {
			return {
				content: errors,
				sourceMap: errors
			};
		}
		if (options.sourceMaps === false) {
			return {
				content: compiled.js,
				sourceMap: null
			};
		}
		var js = compiled.js,
			sourceMap = compiled.sourceMap || compiled.generatedSourceMap;
		if (sourceMap) 
			js += '\n//# sourceMappingURL=' + uri.file + '.map';
		
		return {
			content: js,
			sourceMap: sourceMap
		};
	}
};

function _defaults(target, source){
	if (target == null) 
		return source;
	for(var key in source){
		if (key in target === false) 
			target[key] = source[key];
	}
	return target;
}
function _compile(source, options, filename) {
	try {
		options.script = true;
		var compiler = new _traceur.NodeCompiler(options);
		var compiled = compiler.compile(source, filename); 

		var sourceMap;
		if (options.sourceMaps)
			sourceMap = compiler.getSourceMap();
		return {
			js: compiled,
			sourceMap: sourceMap
		};
	} catch(errors) {
		if (errors.length == null) 
			errors = [errors];
		return {
			errors: errors
		};
	}
}