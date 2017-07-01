var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({

	title: {
		type: String,
		required: true
	},

	link: {
		type: String,
		required: true
	},

	summary: {
		type: String,
		required: true
	},

	updated: {
		type: String,
		default: moment().format("MM-DD-YYYY")
	},

	comments: [{
		type: Schema.Types.ObjectId,
		ref: 'Comment'
	}]
});

var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;