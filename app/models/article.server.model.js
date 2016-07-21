'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Article Schema
 */
var ArticleSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	nombre: {
		type: String,
		default: '',
		trim: true,
		required: 'Nombre no puede estar vacio'
	},
	direccion: {
		type: String,
		default: '',
		trim: true
	},
	//////
	lat:{
		type: Number,
		default: 0,
		trim: true
	},
	lon:{
		type: Number,
		default: 0,
		trim: true
	},
	///////
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Article', ArticleSchema);