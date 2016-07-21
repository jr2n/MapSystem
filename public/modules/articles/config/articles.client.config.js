'use strict';

// Configuring the Articles module
angular.module('articles').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Negocios', 'articles', 'dropdown', '/articles(/create)?');
		Menus.addSubMenuItem('topbar', 'articles', 'Lista de comercios', 'articles');
		Menus.addSubMenuItem('topbar', 'articles', 'Nuevo comercio', 'articles/create');
	}
]);