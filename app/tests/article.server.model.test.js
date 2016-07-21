'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Article = mongoose.model('Article');

/**
 * Globals
 */
var user, article;

/**
 * Unit tests
 */
describe('Comercios Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() {
			article = new Article({
				nombre: 'Article Title',
				direccion: 'Article Content',
				lat:43.642040,
				lon:-79.388300,
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('Debe guardar un comercio sin ningun problema', function(done) {
			return article.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('Debe mostrar un error si se intenta guardar sin nombre', function(done) {
			article.nombre = '';

			return article.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) {
		Article.remove().exec();
		User.remove().exec();
		done();
	});
});