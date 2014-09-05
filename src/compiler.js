var _traceur;

module.exports	= {
	compile: function(source, path, config){
		if (_traceur == null)
			_traceur = require('traceur');
		
		var uri = new net.Uri(path),
			filename = uri.toLocalFile();
		
		if (config.sourceMap == null) 
			config.sourceMap = true;

		var options = config.traceur || {};
		options.sourceMaps = config.sourceMap;
		options.filename = filename;
		
		var errors = null,
			compiled = compile(source, options),	
			errors = compiled.errors == null || compiled.errors.length === 0
				? null
				: 'throw Error("Traceur Error: '
					+ compiled.errors.join('\\\n').replace(/"/g, '\\"')
					+ '");'
			;
		
		if (errors) {
			return {
				content: errors,
				sourceMap: errors
			};
		}
		if (options.sourceMap === false) {
			return {
				content: compiled.js,
				sourceMap: null
			};
		}
		return {
			content: compiled.js
				+ '\n//# sourceMappingURL='
				+ uri.file
				+ '.map',
			sourceMap: compiled.sourceMap || compiled.generatedSourceMap
		};
	}
};

function compile(source, options) {
	try {
		return _traceur.moduleToCommonJS(source, options);
	} catch(errors) {
		if (errors.length == null) 
			errors = [errors];
		return {
			errors: errors
		};
	}
}