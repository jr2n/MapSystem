'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Article = mongoose.model('Article'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, article;

/**
 * Article routes tests
 */
describe('Comercios CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new article
		user.save(function() {
			article = {
				nombre: 'Article Title',
				direccion: 'Article Content',
				lat:43.642040,
				lon:-79.388300
			};

			done();
		});
	});

	it('Debe guardar un negocio si se hace login', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new article
				agent.post('/articles')
					.send(article)
					.expect(200)
					.end(function(articleSaveErr, articleSaveRes) {
						// Handle article save error
						if (articleSaveErr) done(articleSaveErr);

						// Get a list of articles
						agent.get('/articles')
							.end(function(articlesGetErr, articlesGetRes) {
								// Handle article save error
								if (articlesGetErr) done(articlesGetErr);

								// Get articles list
								var articles = articlesGetRes.body;

								// Set assertions
								(articles[0].user._id).should.equal(userId);
								(articles[0].nombre).should.match('Article Title');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('No deberia guardarse un negocio si no se hace login', function(done) {
		agent.post('/articles')
			.send(article)
			.expect(401)
			.end(function(articleSaveErr, articleSaveRes) {
				// Call the assertion callback
				done(articleSaveErr);
			});
	});

	it('No debe guardar un negocio si no se provee el nombre', function(done) {
		// Invalidate nombre field
		article.nombre = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new article
				agent.post('/articles')
					.send(article)
					.expect(400)
					.end(function(articleSaveErr, articleSaveRes) {
						// Set message assertion
						(articleSaveRes.body.message).should.match('Nombre no puede estar vacio');
						
						// Handle article save error
						done(articleSaveErr);
					});
			});
	});

	it('Debe ser capaz de editar un comercio si se esta conectado', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new article
				agent.post('/articles')
					.send(article)
					.expect(200)
					.end(function(articleSaveErr, articleSaveRes) {
						// Handle article save error
						if (articleSaveErr) done(articleSaveErr);

						// Update article nombre
						article.nombre = 'WHY YOU GOTTA BE SO MEAN?';

						// Update an existing article
						agent.put('/articles/' + articleSaveRes.body._id)
							.send(article)
							.expect(200)
							.end(function(articleUpdateErr, articleUpdateRes) {
								// Handle article update error
								if (articleUpdateErr) done(articleUpdateErr);

								// Set assertions
								(articleUpdateRes.body._id).should.equal(articleSaveRes.body._id);
								(articleUpdateRes.body.nombre).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('Debe ser capaz de obtener una lista de negocios aunque no este conectado', function(done) {
		// Create new article model instance
		var articleObj = new Article(article);

		// Save the article
		articleObj.save(function() {
			// Request articles
			request(app).get('/articles')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});

	it('Debe ser capaz de borrar un comercio al tener la sesion iniciada', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new article
				agent.post('/articles')
					.send(article)
					.expect(200)
					.end(function(articleSaveErr, articleSaveRes) {
						// Handle article save error
						if (articleSaveErr) done(articleSaveErr);

						// Delete an existing article
						agent.delete('/articles/' + articleSaveRes.body._id)
							.send(article)
							.expect(200)
							.end(function(articleDeleteErr, articleDeleteRes) {
								// Handle article error error
								if (articleDeleteErr) done(articleDeleteErr);

								// Set assertions
								(articleDeleteRes.body._id).should.equal(articleSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('No debe ser capaz de borrar un comercio si no se ha iniciado sesion', function(done) {
		// Set article user 
		article.user = user;

		// Create new article model instance
		var articleObj = new Article(article);

		// Save the article
		articleObj.save(function() {
			// Try deleting article
			request(app).delete('/articles/' + articleObj._id)
			.expect(401)
			.end(function(articleDeleteErr, articleDeleteRes) {
				// Set message assertion
				(articleDeleteRes.body.message).should.match('User is not logged in');

				// Handle article error error
				done(articleDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Article.remove().exec();
		done();
	});
});