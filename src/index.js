(function(){
	
	var Loader;
	(function(module){
		//import /node_modules/atma-loader/index.js
	}(Loader = {}));
	
	var Compiler;
	(function(module){
		// import compiler.js
	}(Compiler = {}));
	
	(function(){
		
		include.exports = Loader.exports.create({
			name: 'atma-loader-traceur',
			options: {
				mimeType: 'text/javascript',
				extensions: [ 'es6' ]
			},
		}, Compiler.exports)
		
	}());
	
	// stacktraces
	require('atma-loader-stacktrace')();
}());