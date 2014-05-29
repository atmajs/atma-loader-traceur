var _traceur;

module.exports	= {
	compile: function(source, path, options){
		if (_traceur == null)
			_traceur = require('traceur');
		
		var uri = new net.Uri(path),
			filename = uri.toLocalFile();
		
		options.filename = filename;
		
		if (options.sourceMap == null) 
			options.sourceMap = true;
			
		var errors = null,
			compiled = _traceur.compile(source, options),
	
		errors = compiled.errors.length
			? 'throw Error("Traceur Error: '
				+ filename
				+ '\n'
				+ compiled.errors.join('\n').replace(/"/g, '\\"')
				+ '");'
			: null
		;
		
		if (errors) {
			return {
				content: errors,
				sourceMap: errors
			};
		}
		
		return {
			content: compiled.js
				+ '\n//# sourceMappingURL='
				+ uri.file
				+ '.map',
			sourceMap: compiled.sourceMap
		};
	}
};
	