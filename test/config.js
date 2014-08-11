module.exports = {
	suites: {
		dom: {
			exec: 'dom',
			tests: 'test/dom.test',
			$config: {
				'$before': function(done){
					UTest
						.configurate({
							'http.eval': function(done){
								include
									.js('/index.js::TraceurPlugin')
									.done(function(resp){
										var app = atma.server.app;
										resp.TraceurPlugin.attach(app);
										done();
									});
							}
						}, done);
					
				}
			}
		},
		node: {
			exec: 'node',
			tests: 'test/node.test'
		}
	}
}